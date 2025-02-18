import * as vscode from 'vscode';
import { AudioPlayer } from '../services/audioPlayer';
import { NotificationManager } from '../services/notificationManager';

export class EventHandler {
    constructor(
        private readonly _audioPlayer: AudioPlayer,
        private readonly _notificationManager: NotificationManager
    ) {}

    async handleBuildComplete(e: vscode.TaskProcessEndEvent): Promise<void> {
        if (e.execution.task.definition.type === 'npm' && e.exitCode === 0) {
            await this._audioPlayer.playSound('build-complete');
            await this._notificationManager.showBuildNotification();
        }
    }

    async handleDebugComplete(session: vscode.DebugSession): Promise<void> {
        await this._audioPlayer.playSound('debug-complete');
        await this._notificationManager.showDebugNotification(session);
    }

    async handleFileSaved(document: vscode.TextDocument): Promise<void> {
        await this._audioPlayer.playSound('file-saved');
        await this._notificationManager.showSaveNotification(document);
    }

    async handleCustomAlert(): Promise<void> {
        await this._audioPlayer.playSound('custom-alert');
        await vscode.window.showInformationMessage('Custom Alert Triggered');
    }
} 