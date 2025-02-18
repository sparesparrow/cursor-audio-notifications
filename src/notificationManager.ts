// src/notificationManager.ts
import * as vscode from 'vscode';
import * as path from 'path';

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