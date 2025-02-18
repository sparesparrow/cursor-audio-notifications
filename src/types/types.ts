import * as vscode from 'vscode';

export interface ExtensionConfig {
    soundEnabled: boolean;
    notifyOnBuildComplete: boolean;
    notifyOnSave: boolean;
    notifyOnDebugComplete: boolean;
    update(section: string, value: any, global: boolean): Thenable<void>;
} 