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