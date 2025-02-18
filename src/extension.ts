// src/extension.ts
import * as vscode from 'vscode';
import { AudioPlayer } from './services/audioPlayer';
import { NotificationManager } from './services/notificationManager';
import { EventHandler } from './handlers/eventHandler';
import { ExtensionConfig } from './types/types';

export function activate(context: vscode.ExtensionContext) {
    // Initialize core services
    const config = vscode.workspace.getConfiguration('audioNotifications') as unknown as ExtensionConfig;
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