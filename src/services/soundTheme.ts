import * as vscode from 'vscode';
import * as path from 'path';

export interface SoundTheme {
    buildSuccess: string;
    buildError: string;
    debugComplete: string;
    fileSaved: string;
    alert: string;
}

export class SoundThemeService {
    private _config: vscode.WorkspaceConfiguration;
    private _extensionPath: string;
    private readonly _themes: Record<string, SoundTheme> = {
        default: {
            buildSuccess: 'build-success.mp3',
            buildError: 'build-error.mp3',
            debugComplete: 'debug-complete.mp3',
            fileSaved: 'file-saved.mp3',
            alert: 'alert.mp3'
        },
        retro: {
            buildSuccess: 'retro-success.mp3',
            buildError: 'retro-error.mp3',
            debugComplete: 'retro-complete.mp3',
            fileSaved: 'retro-saved.mp3',
            alert: 'retro-alert.mp3'
        },
        minimal: {
            buildSuccess: 'minimal-success.mp3',
            buildError: 'minimal-error.mp3',
            debugComplete: 'minimal-complete.mp3',
            fileSaved: 'minimal-saved.mp3',
            alert: 'minimal-alert.mp3'
        },
        nature: {
            buildSuccess: 'nature-success.mp3',
            buildError: 'nature-error.mp3',
            debugComplete: 'nature-complete.mp3',
            fileSaved: 'nature-saved.mp3',
            alert: 'nature-alert.mp3'
        }
    };

    constructor(extensionPath: string) {
        this._config = vscode.workspace.getConfiguration('audioNotifications');
        this._extensionPath = extensionPath;
    }

    public getSoundPath(soundType: keyof SoundTheme): string {
        const currentTheme = this._config.get<string>('customSoundSet') || 'default';
        const theme = this._themes[currentTheme];
        
        if (!theme) {
            return this._getDefaultSoundPath(soundType);
        }

        return path.join(this._extensionPath, 'media', currentTheme, theme[soundType]);
    }

    private _getDefaultSoundPath(soundType: keyof SoundTheme): string {
        const defaultTheme = this._themes.default;
        return path.join(this._extensionPath, 'media', 'default', defaultTheme[soundType]);
    }

    public getAvailableThemes(): string[] {
        return Object.keys(this._themes);
    }

    public getVolume(): number {
        return this._config.get<number>('volume') || 50;
    }
} 