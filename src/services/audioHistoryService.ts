import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

interface AudioHistoryEntry {
    id: string;
    timestamp: number;
    text: string;
    audioPath: string;
    description: string;
    type: 'chat' | 'composer' | 'notification';
}

export class AudioHistoryService {
    private _historyFile: string;
    private _history: AudioHistoryEntry[] = [];

    constructor(storageUri: vscode.Uri) {
        this._historyFile = path.join(storageUri.fsPath, 'audio-history.json');
        this._loadHistory();
    }

    private _loadHistory(): void {
        try {
            if (fs.existsSync(this._historyFile)) {
                const data = fs.readFileSync(this._historyFile, 'utf8');
                this._history = JSON.parse(data);
            }
        } catch (error) {
            console.error('Failed to load audio history:', error);
            this._history = [];
        }
    }

    private _saveHistory(): void {
        try {
            fs.writeFileSync(this._historyFile, JSON.stringify(this._history, null, 2));
        } catch (error) {
            console.error('Failed to save audio history:', error);
        }
    }

    public addEntry(entry: Omit<AudioHistoryEntry, 'id' | 'timestamp'>): void {
        const newEntry: AudioHistoryEntry = {
            ...entry,
            id: Date.now().toString(36) + Math.random().toString(36).substr(2),
            timestamp: Date.now()
        };

        this._history.unshift(newEntry);
        this._saveHistory();
    }

    public async showHistory(): Promise<void> {
        const items = this._history.map(entry => ({
            label: `${new Date(entry.timestamp).toLocaleString()} - ${entry.type}`,
            description: entry.description,
            detail: entry.text.substring(0, 100) + (entry.text.length > 100 ? '...' : ''),
            entry
        }));

        const selected = await vscode.window.showQuickPick(items, {
            placeHolder: 'Select an audio entry to view or play',
            matchOnDescription: true,
            matchOnDetail: true
        });

        if (selected) {
            const actions = [
                'Play Audio',
                'View Text',
                'Copy Text',
                'Delete Entry'
            ];

            const action = await vscode.window.showQuickPick(actions, {
                placeHolder: 'Choose an action'
            });

            let doc: vscode.TextDocument;
            let index: number;

            switch (action) {
                case 'Play Audio':
                    if (fs.existsSync(selected.entry.audioPath)) {
                        // Play the audio file
                        vscode.commands.executeCommand('audio-notifications.playAudioFile', selected.entry.audioPath);
                    } else {
                        vscode.window.showErrorMessage('Audio file not found');
                    }
                    break;

                case 'View Text':
                    doc = await vscode.workspace.openTextDocument({
                        content: selected.entry.text,
                        language: 'markdown'
                    });
                    await vscode.window.showTextDocument(doc);
                    break;

                case 'Copy Text':
                    await vscode.env.clipboard.writeText(selected.entry.text);
                    vscode.window.showInformationMessage('Text copied to clipboard');
                    break;

                case 'Delete Entry':
                    index = this._history.findIndex(e => e.id === selected.entry.id);
                    if (index !== -1) {
                        this._history.splice(index, 1);
                        this._saveHistory();
                        vscode.window.showInformationMessage('Entry deleted');
                    }
                    break;
            }
        }
    }

    public getEntryById(id: string): AudioHistoryEntry | undefined {
        return this._history.find(entry => entry.id === id);
    }

    public dispose(): void {
        this._saveHistory();
    }
} 