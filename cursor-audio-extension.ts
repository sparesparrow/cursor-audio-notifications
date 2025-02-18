// src/extension.ts
import * as vscode from 'vscode';
import { AudioPlayer } from './audioPlayer';
import { NotificationManager } from './notificationManager';
import { EventHandler } from './eventHandler';
import { ExtensionConfig } from './types';

export function activate(context: vscode.ExtensionContext) {
    // Initialize core services
    const config = vscode.workspace.getConfiguration('audioNotifications') as ExtensionConfig;
    const audioPlayer = new AudioPlayer(context.extensionPath);
    const notificationManager = new NotificationManager();
    const eventHandler = new EventHandler(audioPlayer, notificationManager);

    // Register commands
    const disposables = [
        vscode.commands.registerCommand('audio-notifications.showAlert', async () => {
            await eventHandler.handleCustomAlert();
        }),
        
        vscode.commands.registerCommand('audio-notifications.toggleSound', () => {
            const newState = !config.soundEnabled;
            config.update('soundEnabled', newState, true);
            vscode.window.showInformationMessage(
                `Sound notifications ${newState ? 'enabled' : 'disabled'}`
            );
        })
    ];

    // Register event listeners
    disposables.push(
        vscode.tasks.onDidEndTaskProcess(async e => {
            if (config.notifyOnBuildComplete) {
                await eventHandler.handleBuildComplete(e);
            }
        }),

        vscode.workspace.onDidSaveTextDocument(async doc => {
            if (config.notifyOnSave) {
                await eventHandler.handleFileSaved(doc);
            }
        }),

        vscode.debug.onDidTerminateDebugSession(async e => {
            if (config.notifyOnDebugComplete) {
                await eventHandler.handleDebugComplete(e);
            }
        })
    );

    context.subscriptions.push(...disposables);
}

export function deactivate() {
    // Cleanup if needed
}

// src/audioPlayer.ts
import * as path from 'path';
const play = require('play-sound')({});

export class AudioPlayer {
    private readonly soundsPath: string;

    constructor(extensionPath: string) {
        this.soundsPath = path.join(extensionPath, 'sounds');
    }

    async playSound(soundName: string): Promise<void> {
        const soundPath = path.join(this.soundsPath, `${soundName}.mp3`);
        
        return new Promise((resolve, reject) => {
            play.play(soundPath, (err: Error) => {
                if (err) {
                    console.error('Error playing sound:', err);
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }
}

// src/notificationManager.ts
import * as vscode from 'vscode';

export class NotificationManager {
    async showBuildNotification(): Promise<void> {
        const selection = await vscode.window.showInformationMessage(
            'Build Complete!',
            'Open Logs',
            'Run Tests',
            'Dismiss'
        );

        switch (selection) {
            case 'Open Logs':
                await vscode.commands.executeCommand('workbench.action.output.toggleOutput');
                break;
            case 'Run Tests':
                await vscode.commands.executeCommand('workbench.action.tasks.test');
                break;
        }
    }

    async showDebugNotification(session: vscode.DebugSession): Promise<void> {
        const selection = await vscode.window.showInformationMessage(
            `Debug Session "${session.name}" Completed`,
            'Show Call Stack',
            'Restart Debug',
            'Dismiss'
        );

        switch (selection) {
            case 'Show Call Stack':
                await vscode.commands.executeCommand('workbench.debug.action.toggleRepl');
                break;
            case 'Restart Debug':
                await vscode.commands.executeCommand('workbench.action.debug.restart');
                break;
        }
    }

    async showSaveNotification(document: vscode.TextDocument): Promise<void> {
        const selection = await vscode.window.showInformationMessage(
            `Saved ${path.basename(document.fileName)}`,
            'Run Formatter',
            'Commit Changes',
            'Dismiss'
        );

        switch (selection) {
            case 'Run Formatter':
                await vscode.commands.executeCommand('editor.action.formatDocument');
                break;
            case 'Commit Changes':
                await vscode.commands.executeCommand('workbench.view.scm');
                break;
        }
    }
}

// src/eventHandler.ts
import * as vscode from 'vscode';
import { AudioPlayer } from './audioPlayer';
import { NotificationManager } from './notificationManager';

export class EventHandler {
    constructor(
        private readonly audioPlayer: AudioPlayer,
        private readonly notificationManager: NotificationManager
    ) {}

    async handleBuildComplete(e: vscode.TaskProcessEndEvent): Promise<void> {
        if (e.execution.task.definition.type === 'npm' && e.exitCode === 0) {
            await this.audioPlayer.playSound('build-complete');
            await this.notificationManager.showBuildNotification();
        }
    }

    async handleDebugComplete(session: vscode.DebugSession): Promise<void> {
        await this.audioPlayer.playSound('debug-complete');
        await this.notificationManager.showDebugNotification(session);
    }

    async handleFileSaved(document: vscode.TextDocument): Promise<void> {
        await this.audioPlayer.playSound('file-saved');
        await this.notificationManager.showSaveNotification(document);
    }

    async handleCustomAlert(): Promise<void> {
        await this.audioPlayer.playSound('custom-alert');
        await vscode.window.showInformationMessage('Custom Alert Triggered');
    }
}

// src/types.ts
export interface ExtensionConfig {
    soundEnabled: boolean;
    notifyOnBuildComplete: boolean;
    notifyOnSave: boolean;
    notifyOnDebugComplete: boolean;
    update(section: string, value: any, global: boolean): Thenable<void>;
}

// package.json
{
    "name": "cursor-audio-notifications",
    "displayName": "Cursor Audio Notifications",
    "description": "Interactive audio notifications for Cursor IDE",
    "version": "1.0.0",
    "engines": {
        "vscode": "^1.60.0"
    },
    "categories": [
        "Other"
    ],
    "activationEvents": [
        "onCommand:audio-notifications.showAlert",
        "onCommand:audio-notifications.toggleSound"
    ],
    "main": "./out/extension.js",
    "contributes": {
        "commands": [
            {
                "command": "audio-notifications.showAlert",
                "title": "Show Audio Notification"
            },
            {
                "command": "audio-notifications.toggleSound",
                "title": "Toggle Audio Notifications"
            }
        ],
        "configuration": {
            "title": "Audio Notifications",
            "properties": {
                "audioNotifications.soundEnabled": {
                    "type": "boolean",
                    "default": true,
                    "description": "Enable or disable sound notifications"
                },
                "audioNotifications.notifyOnBuildComplete": {
                    "type": "boolean",
                    "default": true,
                    "description": "Play sound when build completes"
                },
                "audioNotifications.notifyOnSave": {
                    "type": "boolean",
                    "default": false,
                    "description": "Play sound when files are saved"
                },
                "audioNotifications.notifyOnDebugComplete": {
                    "type": "boolean",
                    "default": true,
                    "description": "Play sound when debug session ends"
                }
            }
        }
    },
    "scripts": {
        "vscode:prepublish": "npm run compile",
        "compile": "tsc -p ./",
        "watch": "tsc -watch -p ./",
        "pretest": "npm run compile",
        "test": "node ./out/test/runTest.js"
    },
    "devDependencies": {
        "@types/node": "^16.11.7",
        "@types/vscode": "^1.60.0",
        "@typescript-eslint/eslint-plugin": "^5.30.0",
        "@typescript-eslint/parser": "^5.30.0",
        "eslint": "^8.13.0",
        "typescript": "^4.7.2"
    },
    "dependencies": {
        "play-sound": "^1.1.5"
    }
}