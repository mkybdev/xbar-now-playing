#!/bin/sh
":" //; export PATH="$PATH:$HOME/.bun/bin:/usr/local/bin:/opt/homebrew/bin"; exec bun "$0" "$@"

import "@jxa/global-type";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { run } from "@jxa/run";
import type { iTunes as JXANS } from "@jxa/types";

/**
 * Type Definitions
 */
interface MusicApp extends JXANS.iTunes {
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
      const music = Application("Music") as unknown as MusicApp;
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
          duration: track.duration(),
        },
      };
    });
  },

  async playPause() {
    await run(() => {
      const music = Application("Music") as unknown as MusicApp;
      if (music.running()) {
        music.playpause();
      }
    });
  },

  async next() {
    await run(() => {
      const music = Application("Music") as unknown as MusicApp;
      if (music.running()) {
        music.nextTrack();
      }
    });
  },

  async previous() {
    await run(() => {
      const music = Application("Music") as unknown as MusicApp;
      if (music.running()) {
        music.previousTrack();
      }
    });
  },

  async launch() {
    await run(() => {
      const music = Application("Music");
      music.activate();
    });
  },

  async notify(trackName: string, artist: string) {
    await run(
      (name: string, artistName: string) => {
        // biome-ignore lint/suspicious/noExplicitAny: JXA's StandardAdditions typing is complex
        const app = Application.currentApplication() as any;
        app.includeStandardAdditions = true;
        app.displayNotification(artistName, {
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
  const { name, artist, album, id } = state.track;

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
  const statusColor = isPlaying ? "#FF2D55" : "#888888";

  // Status Bar Output
  console.log(
    `${statusIcon} ${name} - ${artist} | color=${statusColor} dropdown=true`,
  );

  // Dropdown Menu Output
  console.log("---");
  console.log(
    `${name} | size=14 color=${statusColor} font=AppleSystemUIFontBold`,
  );
  console.log(`${artist} | size=12`);
  console.log(`${album} | size=12 color=#666666`);
  console.log("---");

  // Playback Controls
  const playPauseLabel = isPlaying ? "Pause" : "Play";
  console.log(
    `${playPauseLabel} | shell=${selfPath} param1=playpause terminal=false refresh=true`,
  );
  console.log(
    `Next Track | shell=${selfPath} param1=next terminal=false refresh=true`,
  );
  console.log(
    `Previous Track | shell=${selfPath} param1=previous terminal=false refresh=true`,
  );

  console.log("---");

  // Settings
  const notificationLabel = config.notificationsEnabled
    ? "✓ Notifications Enabled"
    : "Notifications Disabled";
  console.log(
    `${notificationLabel} | shell=${selfPath} param1=toggle-notification terminal=false refresh=true`,
  );
  console.log(`Open Music | shell=${selfPath} param1=launch terminal=false`);
})();
