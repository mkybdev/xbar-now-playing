# xbar Music Now Playing (TypeScript/JXA)

A TypeScript-based xbar plugin for macOS Music app, featuring type-safe JXA (JavaScript for Automation) and modern aesthetics.

## Features

- 🎵 **Live Status**: Shows current track and artist in the menu bar. Highlights in pink (#FF2D55) when playing.
- 🕹️ **Playback Controls**: Play/Pause, Next, and Previous track controls directly from the menu.
- 🔔 **Desktop Notifications**: Automatic notifications on track changes (can be toggled in settings).
- 📝 **Modern Tech Stack**: Powered by Bun and TypeScript for high performance and reliability.

## Requirements

- **macOS**
- **[xbar](https://xbarapp.com/)**
- **[Bun](https://bun.sh/)** (Runtime for the plugin)

## Setup

### 1. Install Bun (If not installed)

```bash
curl -fsSL https://bun.sh/install | bash
```

### 2. Install Dependencies

Run the following in the project directory:

```bash
bun install
```

### 3. Register with xbar

Create a symbolic link to the script in your xbar plugins directory (typically `~/Library/Application Support/xbar/plugins`):

```bash
# Move to xbar plugins directory
cd "$HOME/Library/Application Support/xbar/plugins"

# Create symbolic link (The filename determines the refresh interval, e.g., .10s.ts)
ln -s "/path/to/your/project/music-now-playing.ts" "music-now-playing.10s.ts"
```

After creating the link, select "Refresh all contents" from the xbar menu.

## Configuration

The plugin automatically creates a configuration file at `~/.xbar-now-playing.json` on its first run.
You can toggle desktop notifications via the "Notifications Disabled/Enabled" menu item.

## Development

This project uses Biome for linting and formatting:

```bash
bunx @biomejs/biome check music-now-playing.ts
```

To run a type check:

```bash
bunx tsc --noEmit
```
