// import * as vscode from 'vscode';

export interface ExtensionConfig {
    soundEnabled: boolean;
    notifyOnBuildComplete: boolean;
    notifyOnSave: boolean;
    notifyOnDebugComplete: boolean;
    update(section: string, value: boolean | number | string, global: boolean): Thenable<void>;
}

export interface AudioConfig {
    play: (opts?: PlayOptions) => void;
}

interface PlayOptions {
    filename?: string;
    volume?: number;
} 