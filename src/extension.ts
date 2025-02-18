// src/extension.ts
import * as vscode from 'vscode';
import { AudioPlayer } from './services/audioPlayer';
import { NotificationManager } from './services/notificationManager';
import { EventHandler } from './handlers/eventHandler';
import { ExtensionConfig } from './types/types';

let eventHandler: EventHandler | undefined;

export async function activate(context: vscode.ExtensionContext) {
    try {
        // Initialize core services
        const config = vscode.workspace.getConfiguration('audioNotifications') as unknown as ExtensionConfig;
        const audioPlayer = new AudioPlayer(context.extensionPath);
        const notificationManager = new NotificationManager();
        
        // Initialize event handler
        eventHandler = new EventHandler(audioPlayer, notificationManager);

        // Register commands with proper error handling
        const disposables = [
            vscode.commands.registerCommand('audio-notifications.showAlert', async () => {
                try {
                    await eventHandler?.handleCustomAlert();
                } catch (error) {
                    vscode.window.showErrorMessage('Failed to play alert sound');
                    console.error('Alert error:', error);
                }
            }),
            
            vscode.commands.registerCommand('audio-notifications.toggleSound', () => {
                try {
                    const newState = !config.soundEnabled;
                    config.update('soundEnabled', newState, true);
                    vscode.window.showInformationMessage(
                        `Sound notifications ${newState ? 'enabled' : 'disabled'}`
                    );
                } catch (error) {
                    vscode.window.showErrorMessage('Failed to toggle sound settings');
                    console.error('Toggle error:', error);
                }
            })
        ];

        // Register event listeners with proper error handling
        disposables.push(
            vscode.tasks.onDidEndTaskProcess(async e => {
                if (config.notifyOnBuildComplete) {
                    try {
                        await eventHandler?.handleBuildComplete(e);
                    } catch (error) {
                        console.error('Build notification error:', error);
                    }
                }
            }),

            vscode.workspace.onDidSaveTextDocument(async doc => {
                if (config.notifyOnSave) {
                    try {
                        await eventHandler?.handleFileSaved(doc);
                    } catch (error) {
                        console.error('Save notification error:', error);
                    }
                }
            }),

            vscode.debug.onDidTerminateDebugSession(async e => {
                if (config.notifyOnDebugComplete) {
                    try {
                        await eventHandler?.handleDebugComplete(e);
                    } catch (error) {
                        console.error('Debug notification error:', error);
                    }
                }
            })
        );

        // Register all disposables
        context.subscriptions.push(...disposables);

        // Show activation message in development
        if (process.env.NODE_ENV === 'development') {
            vscode.window.showInformationMessage('Audio Notifications extension activated');
        }
    } catch (error) {
        vscode.window.showErrorMessage('Failed to activate Audio Notifications extension');
        console.error('Activation error:', error);
        throw error; // Re-throw to mark activation as failed
    }
}

export function deactivate() {
    // Clean up resources
    eventHandler = undefined;
}