# xbar Music Now Playing (TypeScript/JXA)

A TypeScript-based xbar plugin for the macOS Music app, featuring type-safe JXA (JavaScript for Automation) and modern aesthetics with system icons.

## Features

- 🎵 **Status Bar**: Shows the current track status with sleek icons (▶︎/⏸).
- 🕹️ **Quick Controls**: `⏮ Previous`, `▶︎ Play/Pause`, and `⏭ Next` buttons directly in the dropdown.
- 📋 **Track Details**: Displays Song Title, Artist, Album, and Composer with optimized layouts for English and Japanese text.
- 🔔 **Smart Notifications**: Optional desktop notifications when the track changes (can be toggled in the menu).
- ⚡ **Modern Stack**: Built with Bun and TypeScript for near-instant execution and full type safety.

## Requirements

- **macOS**
- **[xbar](https://xbarapp.com/)**
- **[Bun](https://bun.sh/)** (Runtime for the plugin)

## Setup

### 1. Install Bun

If you haven't installed Bun yet:

```bash
curl -fsSL https://bun.sh/install | bash
```

### 2. Install Dependencies

Clone this repository and install the required JXA packages:

```bash
cd xbar-now-playing
bun install
```

### 3. Add to xbar

Create a symbolic link in your xbar plugins directory (typically `~/Library/Application Support/xbar/plugins`). The suffix `.10s.ts` tells xbar to refresh every 10 seconds.

```bash
# Example command
ln -s "$(pwd)/music-now-playing.ts" "$HOME/Library/Application Support/xbar/plugins/music-now-playing.10s.ts"
```

Then, click **"Refresh all contents"** in your xbar menu.

## Configuration & Usage

- **Notifications**: Click the "Notifications" item in the menu to toggle desktop alerts on/off. Settings are persisted in `~/.xbar-now-playing.json`.
- **Refresh Rate**: To change the refresh interval, simply rename the symbolic link (e.g., `...1s.ts` for 1-second updates).

## Development

Lint and format with Biome:
```bash
bunx @biomejs/biome check --write music-now-playing.ts
```

Type check:
```bash
bunx tsc --noEmit
```
