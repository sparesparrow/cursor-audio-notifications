import * as vscode from 'vscode';
import { VoiceSynthesisService } from './voiceSynthesis';
import { ChatAudioService } from './chatAudioService';

export class ComposerService {
    private _lastModifiedFiles: string[] = [];
    private _lastResponse: string | undefined;

    constructor(
        private readonly _voiceSynthesis: VoiceSynthesisService,
        private readonly _chatAudio: ChatAudioService
    ) {}

    public async runComposerSequence(): Promise<void> {
        try {
            // Focus composer view
            await vscode.commands.executeCommand('workbench.action.focusPanel');
            await vscode.commands.executeCommand('cursor.focusComposer');

            // Set Agent mode
            await vscode.commands.executeCommand('cursor.setAgentMode');

            // Set model to Claude 3.5 Sonnet
            await vscode.commands.executeCommand('cursor.setModel', 'claude-3-sonnet');

            // Write prompt and submit
            const prompt = await vscode.window.showInputBox({
                prompt: 'Enter your prompt for the composer',
                placeHolder: 'Type your prompt here...'
            });

            if (!prompt) {
                return;
            }

            await vscode.commands.executeCommand('cursor.insertText', prompt);
            await vscode.commands.executeCommand('cursor.submit');

            // Play notification when composer finishes
            await this._voiceSynthesis.speakWithSay('Composer finished tasks');

            // Focus chat view
            await vscode.commands.executeCommand('workbench.action.focusPanel');
            await vscode.commands.executeCommand('cursor.focusChat');

            // Write chat prompt and submit
            const chatPrompt = await vscode.window.showInputBox({
                prompt: 'Enter your chat prompt',
                placeHolder: 'Type your chat prompt here...'
            });

            if (!chatPrompt) {
                return;
            }

            await vscode.commands.executeCommand('cursor.insertText', chatPrompt);
            await vscode.commands.executeCommand('cursor.submit');

            // Wait for response and trigger TTS
            await this._waitForChatResponse();

        } catch (error) {
            console.error('Failed to run composer sequence:', error);
            vscode.window.showErrorMessage('Failed to run composer sequence');
        }
    }

    private async _waitForChatResponse(): Promise<void> {
        return new Promise((resolve) => {
            const disposable = vscode.workspace.onDidChangeTextDocument(async (e) => {
                if (e.document.uri.scheme === 'chat') {
                    this._lastResponse = e.document.getText();
                    await this._chatAudio.handleChatResponse(this._lastResponse);
                    disposable.dispose();
                    resolve();
                }
            });

            // Add timeout to prevent infinite waiting
            setTimeout(() => {
                disposable.dispose();
                resolve();
            }, 30000);
        });
    }

    public getLastResponse(): string | undefined {
        return this._lastResponse;
    }

    public updateModifiedFiles(files: string[]): void {
        this._lastModifiedFiles = files;
    }

    public getModifiedFiles(): string[] {
        return this._lastModifiedFiles;
    }

    public async copyModifiedFiles(): Promise<void> {
        if (this._lastModifiedFiles.length === 0) {
            vscode.window.showInformationMessage('No files were modified in the last composer operation');
            return;
        }

        const fileList = this._lastModifiedFiles.join(' ');
        await vscode.env.clipboard.writeText(fileList);
        vscode.window.showInformationMessage('Modified files copied to clipboard');
    }

    public async copyLastResponse(): Promise<void> {
        if (!this._lastResponse) {
            vscode.window.showInformationMessage('No chat response available');
            return;
        }

        await vscode.env.clipboard.writeText(this._lastResponse);
        vscode.window.showInformationMessage('Last response copied to clipboard');
    }
} 