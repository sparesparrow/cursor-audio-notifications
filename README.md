# Cursor Audio Notifications

Interactive audio notifications for Cursor IDE (VSCode fork) that provide context-aware sound feedback and interactive responses.

## Features

- 🔊 Audio feedback for common IDE events
- 🛠️ Build completion notifications
- 🐛 Debug session notifications
- 💾 File save notifications
- 🔧 Customizable sound settings
- 🎯 Interactive notification responses

## Installation

1. Download the VSIX package from the releases page
2. Install in Cursor IDE:
   - Windows: Copy to `%USERPROFILE%\.cursor\extensions`
   - Mac/Linux: Copy to `~/.cursor/extensions`

Or build from source:
```bash
git clone https://github.com/yourusername/cursor-audio-notifications
cd cursor-audio-notifications
npm install
npm run compile
```

## Usage

The extension provides several notification types:

1. Build Completion
   - Plays sound when build tasks complete
   - Shows interactive buttons for logs/tests

2. Debug Sessions
   - Notifies when debug sessions end
   - Quick actions for call stack/restart

3. File Saves
   - Optional sound on file save
   - Format/commit quick actions

4. Custom Alerts
   - Trigger via command palette
   - Configurable sound/actions

## Configuration

Configure in VSCode settings:

```json
{
  "audioNotifications.soundEnabled": true,
  "audioNotifications.notifyOnBuildComplete": true,
  "audioNotifications.notifyOnSave": false,
  "audioNotifications.notifyOnDebugComplete": true
}
```

## System Requirements

- Cursor IDE v1.0.0 or higher
- Node.js v14 or higher
- System audio support

Linux users may need:
```bash
sudo apt-get install alsa-utils
```

## Development

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run tests:
   ```bash
   npm test
   ```
4. Build:
   ```bash
   npm run compile
   ```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License - see LICENSE file for details

## Support

- File issues on GitHub
- Contact: your.email@example.com

## Acknowledgments

- Cursor IDE team
- VSCode extension API
- play-sound package 