#!/bin/sh
":"; //; export PATH="$PATH:$HOME/.bun/bin:/usr/local/bin:/opt/homebrew/bin"; exec bun "$0" "$@"

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { run } from "@jxa/run";

import type JXAAppBase from "@jxa/types/src/Application";
import type { iTunes } from "@jxa/types/src/core/ITunes";

type JXAApplication = typeof JXAAppBase;

type JXANS_iTunes = iTunes;
interface MusicApp extends JXANS_iTunes {
  running(): boolean;
}

/**
 * Configuration & Cache Management
 */
const CONFIG_PATH = join(process.env.HOME ?? "", ".xbar-now-playing.json");

interface Config {
  notificationsEnabled: boolean;
  lastTrackId?: number;
}

function loadConfig(): Config {
  if (existsSync(CONFIG_PATH)) {
    try {
      return JSON.parse(readFileSync(CONFIG_PATH, "utf-8"));
    } catch (_e) {
      // Ignore parse errors
    }
  }
  return { notificationsEnabled: false };
}

function saveConfig(config: Config) {
  writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
}

/**
 * Music App Actions (Type-Safe JXA)
 */
interface TrackInfo {
  id: number;
  name: string;
  artist: string;
  album: string;
  composer: string;
  duration: number;
}

interface MusicState {
  running: boolean;
  playerState: string;
  track: TrackInfo;
}

const Music = {
  async getState() {
    return await run<MusicState | null>(() => {
      const { Application: app } = globalThis as unknown as {
        Application: JXAApplication;
      };
      const music = app("Music") as unknown as MusicApp;
      if (!music.running()) return null;

      const track = music.currentTrack();
      return {
        running: true,
        playerState: music.playerState(),
        track: {
          id: track.id(),
          name: track.name(),
          artist: track.artist(),
          album: track.album(),
          composer: track.composer(),
          duration: track.duration(),
        },
      };
    });
  },

  async playPause() {
    await run(() => {
      const { Application: app } = globalThis as unknown as {
        Application: JXAApplication;
      };
      const music = app("Music") as unknown as MusicApp;
      if (music.running()) {
        music.playpause();
      }
    });
  },

  async next() {
    await run(() => {
      const { Application: app } = globalThis as unknown as {
        Application: JXAApplication;
      };
      const music = app("Music") as unknown as MusicApp;
      if (music.running()) {
        music.nextTrack();
      }
    });
  },

  async previous() {
    await run(() => {
      const { Application: app } = globalThis as unknown as {
        Application: JXAApplication;
      };
      const music = app("Music") as unknown as MusicApp;
      if (music.running()) {
        music.previousTrack();
      }
    });
  },

  async launch() {
    await run(() => {
      const { Application: app } = globalThis as unknown as {
        Application: JXAApplication;
      };
      const music = app("Music");
      music.activate();
    });
  },

  async notify(trackName: string, artist: string) {
    await run(
      (name: string, artistName: string) => {
        const { Application: app } = globalThis as unknown as {
          Application: JXAApplication;
        };
        const currentApp = app.currentApplication();
        currentApp.includeStandardAdditions = true;
        currentApp.displayNotification(artistName, {
          withTitle: "Now Playing",
          subtitle: name,
        });
      },
      trackName,
      artist,
    );
  },
};

/**
 * CLI Argument Handling
 */
const args = process.argv.slice(2);
const config = loadConfig();

if (args.length > 0) {
  (async () => {
    const command = args[0];
    switch (command) {
      case "playpause":
        await Music.playPause();
        break;
      case "next":
        await Music.next();
        break;
      case "previous":
        await Music.previous();
        break;
      case "launch":
        await Music.launch();
        break;
      case "toggle-notification":
        config.notificationsEnabled = !config.notificationsEnabled;
        saveConfig(config);
        break;
    }
    // Exit after command
    process.exit(0);
  })();
}

/**
 * Main Execution
 */
(async () => {
  const state = await Music.getState();
  const selfPath = process.argv[1] ?? "";

  if (!state?.running || !state.track) {
    console.log("🎵");
    console.log("---");
    console.log("Music is not running");
    console.log(
      `Launch Music | shell=${selfPath} param1=launch terminal=false refresh=true`,
    );
    console.log("---");
    process.exit(0);
  }

  const isPlaying = state.playerState === "playing";
  const { name, artist, album, composer, id } = state.track;

  // Notification Check
  if (config.notificationsEnabled && config.lastTrackId !== id) {
    if (isPlaying) {
      await Music.notify(name, artist);
    }
    config.lastTrackId = id;
    saveConfig(config);
  } else if (config.lastTrackId !== id) {
    config.lastTrackId = id;
    saveConfig(config);
  }

  /**
   * Modern Design Elements
   */
  const statusIcon = isPlaying ? "▶︎" : "⏸";
  const statusColor = "#FFFFFF";

  // Status Bar Output
  console.log(`${statusIcon} | color=${statusColor} dropdown=true`);

  // Dropdown Menu Output
  console.log("---");
  for (const [i, line] of [name, artist, album, composer].entries()) {
    if (!line) continue;
    const isHalfWidth = /^[a-zA-Z0-9\s\-_.,!?]*$/.test(line);
    const length = isHalfWidth ? 30 : 20;
    console.log(`${line} | color=${statusColor} length=${length}`);
    if (i === 0) console.log("---");
  }
  console.log("---");

  // Playback Controls
  const playPauseLabel = isPlaying ? "⏸ Pause" : "▶︎ Play";
  console.log(
    `${playPauseLabel} | shell=${selfPath} param1=playpause terminal=false refresh=true`,
  );
  console.log(
    `⏭ Next Track | shell=${selfPath} param1=next terminal=false refresh=true`,
  );
  console.log(
    `⏮ Previous Track | shell=${selfPath} param1=previous terminal=false refresh=true`,
  );

  console.log("---");

  // Settings
  const notificationLabel = config.notificationsEnabled
    ? "✓ Notifications (Click to Disable)"
    : "Notifications (Click to Enable)";
  console.log(
    `${notificationLabel} | shell=${selfPath} param1=toggle-notification terminal=false refresh=true`,
  );
  console.log(`Open Music | shell=${selfPath} param1=launch terminal=false`);
})();
