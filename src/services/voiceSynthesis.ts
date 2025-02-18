import * as vscode from 'vscode';
import { ElevenLabsClient } from 'elevenlabs';
import player from 'play-sound';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { speak, stop, getInstalledVoices } from 'say';

export class VoiceSynthesisService {
    private _elevenLabs: ElevenLabsClient | undefined;
    private _config: vscode.WorkspaceConfiguration;
    private _player = player();
    private _tempDir: string;
    private readonly _defaultVoiceId = 'EXAVITQu4vr4xnSDxMaL';
    private readonly _defaultModel = 'eleven_multilingual_v2';

    constructor() {
        this._config = vscode.workspace.getConfiguration('audioNotifications');
        this._tempDir = path.join(os.tmpdir(), 'cursor-voice-temp');
        this._ensureTempDir();
        this._initializeProviders();
    }

    private _ensureTempDir() {
        if (!fs.existsSync(this._tempDir)) {
            fs.mkdirSync(this._tempDir, { recursive: true });
        }
    }

    private _initializeProviders() {
        const apiKey = this._config.get<string>('elevenLabsApiKey');
        if (apiKey) {
            this._elevenLabs = new ElevenLabsClient({
                apiKey
            });
        }
    }

    public async speak(text: string): Promise<void> {
        const provider = this._config.get<string>('voiceSynthesis');
        
        switch (provider) {
            case 'elevenlabs':
                await this._speakWithElevenLabs(text);
                break;
            case 'say':
                await this.speakWithSay(text);
                break;
            default:
                throw new Error('No voice synthesis provider configured');
        }
    }

    public async speakWithSay(text: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            speak(text, undefined, 1, (err?: Error) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    public async getAvailableVoices(): Promise<string[]> {
        if (!this._elevenLabs) {
            return new Promise<string[]>((resolve) => {
                getInstalledVoices((err?: Error, voices?: string[]) => {
                    if (err) {
                        console.error('Failed to get system voices:', err);
                        resolve([]);
                    } else {
                        resolve(voices || []);
                    }
                });
            });
        }

        try {
            const voices = await this._elevenLabs.voices.getAll();
            return voices.map(voice => voice.name);
        } catch (error) {
            console.error('Failed to get ElevenLabs voices:', error);
            return [];
        }
    }

    public async synthesizeWithElevenLabs(text: string, options: {
        voiceId?: string;
        modelId?: string;
        stability?: number;
        similarityBoost?: number;
        style?: number;
        useSpeakerBoost?: boolean;
    } = {}): Promise<Buffer> {
        if (!this._elevenLabs) {
            throw new Error('ElevenLabs not configured. Please add your API key in settings.');
        }

        try {
            const audio = await this._elevenLabs.generate({
                text,
                voice: options.voiceId || this._defaultVoiceId,
                modelId: options.modelId || this._defaultModel,
                voiceSettings: {
                    stability: options.stability ?? 0.5,
                    similarityBoost: options.similarityBoost ?? 0.75,
                    style: options.style ?? 0.0,
                    useSpeakerBoost: options.useSpeakerBoost ?? true
                }
            });

            return Buffer.from(await audio.arrayBuffer());
        } catch (error) {
            console.error('ElevenLabs synthesis failed:', error);
            throw error;
        }
    }

    private async _speakWithElevenLabs(text: string): Promise<void> {
        const buffer = await this.synthesizeWithElevenLabs(text);
        const tempFile = path.join(this._tempDir, `${Date.now()}.mp3`);
        
        try {
            fs.writeFileSync(tempFile, buffer);
            await this.playAudioFile(tempFile);
            fs.unlinkSync(tempFile);
        } catch (error) {
            if (fs.existsSync(tempFile)) {
                fs.unlinkSync(tempFile);
            }
            throw error;
        }
    }

    public async playAudioFile(filePath: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const volume = this._config.get<number>('volume') || 50;
            this._player.play(filePath, { volume: volume / 100 }, (err: Error | null) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    public dispose() {
        // Stop any ongoing speech
        stop();
        
        // Clean up resources
        this._elevenLabs = undefined;
        
        // Clean up temp directory
        if (fs.existsSync(this._tempDir)) {
            const files = fs.readdirSync(this._tempDir);
            for (const file of files) {
                fs.unlinkSync(path.join(this._tempDir, file));
            }
            fs.rmdirSync(this._tempDir);
        }
    }
} 