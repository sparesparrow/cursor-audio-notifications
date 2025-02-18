# Cursor Audio Notifications

A VS Code/Cursor extension that provides interactive audio notifications for various IDE events.

## Features

- 🔊 Audio notifications for build completion
- 💾 Optional sound alerts on file save
- 🐛 Notifications when debug sessions end
- ⚙️ Fully configurable notification settings
- 🎵 Clean, non-intrusive sound effects

## Installation

1. Install the extension from the VS Code/Cursor marketplace
2. Reload your editor
3. Configure the settings to your preference

## Configuration

This extension contributes the following settings:

* `audioNotifications.soundEnabled`: Enable/disable all sound notifications
* `audioNotifications.notifyOnBuildComplete`: Play sound when build completes
* `audioNotifications.notifyOnSave`: Play sound when files are saved
* `audioNotifications.notifyOnDebugComplete`: Play sound when debug session ends

## Commands

* `Audio Notifications: Show Alert` - Trigger a test notification sound
* `Audio Notifications: Toggle Sound` - Quickly enable/disable all audio notifications

## Requirements

- VS Code ^1.75.0 or Cursor IDE
- Node.js audio playback support

## Known Issues

Please report any issues on the [GitHub repository](https://github.com/yourusername/cursor-audio-notifications/issues).

## Release Notes

### 1.0.0

Initial release of Cursor Audio Notifications:
- Basic audio notification system
- Build completion notifications
- Debug session notifications
- File save notifications
- Configuration options

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

## Support

- File issues on GitHub
- Contact: your.email@example.com

## Acknowledgments

- Cursor IDE team
- VSCode extension API
- play-sound package 