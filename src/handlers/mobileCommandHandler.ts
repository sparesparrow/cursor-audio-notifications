import * as vscode from 'vscode';

export class MobileCommandHandler {
    private _activeEditor: vscode.TextEditor | undefined;

    constructor() {
        this._activeEditor = vscode.window.activeTextEditor;
        vscode.window.onDidChangeActiveTextEditor(editor => {
            this._activeEditor = editor;
        });
    }

    public async moveCursor(direction: string): Promise<void> {
        if (!this._activeEditor) {
            throw new Error('No active text editor');
        }

        const currentPosition = this._activeEditor.selection.active;
        let newPosition: vscode.Position;

        switch (direction) {
            case 'up':
                newPosition = currentPosition.translate(-1, 0);
                break;
            case 'down':
                newPosition = currentPosition.translate(1, 0);
                break;
            case 'left':
                newPosition = currentPosition.translate(0, -1);
                break;
            case 'right':
                newPosition = currentPosition.translate(0, 1);
                break;
            default:
                throw new Error('Invalid direction');
        }

        this._activeEditor.selection = new vscode.Selection(newPosition, newPosition);
        await this._activeEditor.revealRange(
            new vscode.Range(newPosition, newPosition),
            vscode.TextEditorRevealType.InCenter
        );
    }

    public async insertText(text: string): Promise<void> {
        if (!this._activeEditor) {
            throw new Error('No active text editor');
        }

        await this._activeEditor.edit(editBuilder => {
            if (!this._activeEditor) {
                return;
            }
            editBuilder.insert(this._activeEditor.selection.active, text);
        });
    }

    public async executeCommand(commandId: string): Promise<void> {
        await vscode.commands.executeCommand(commandId);
    }

    public async scrollWindow(direction: string): Promise<void> {
        if (!this._activeEditor) {
            throw new Error('No active text editor');
        }

        const visibleRange = this._activeEditor.visibleRanges[0];
        const lineCount = direction === 'up' ? -1 : 1;
        const newPosition = new vscode.Position(
            visibleRange.start.line + lineCount,
            0
        );

        await this._activeEditor.revealRange(
            new vscode.Range(newPosition, newPosition),
            vscode.TextEditorRevealType.Default
        );
    }

    public async openFile(filePath: string): Promise<void> {
        const document = await vscode.workspace.openTextDocument(filePath);
        await vscode.window.showTextDocument(document);
    }

    public async runTerminalCommand(command: string): Promise<void> {
        const terminal = vscode.window.createTerminal('Mobile Control');
        terminal.sendText(command);
        terminal.show();
    }
} 