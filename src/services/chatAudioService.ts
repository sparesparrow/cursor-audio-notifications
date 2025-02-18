import * as vscode from 'vscode';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';
import { MCPFetchServer } from '@modelcontextprotocol/server-fetch';
import { VoiceSynthesisService } from './voiceSynthesis';
import fetch from 'node-fetch';

export class ChatAudioService {
    private _config: vscode.WorkspaceConfiguration;
    private _mcpServer!: MCPFetchServer;
    private _voiceSynthesis: VoiceSynthesisService;
    private _cacheDir: string;
    private _elevenLabsCharLimit = 5000;

    constructor(voiceSynthesis: VoiceSynthesisService) {
        this._config = vscode.workspace.getConfiguration('audioNotifications');
        this._voiceSynthesis = voiceSynthesis;
        this._cacheDir = path.join(os.tmpdir(), 'cursor-audio-cache');
        this._ensureCacheDir();
        this._initializeMCPServer();
    }

    private _ensureCacheDir() {
        if (!fs.existsSync(this._cacheDir)) {
            fs.mkdirSync(this._cacheDir, { recursive: true });
        }
    }

    private _initializeMCPServer() {
        this._mcpServer = new MCPFetchServer({
            fetch: fetch,
            baseUrl: 'http://localhost:3000'
        });
    }

    public async handleWebContent(content: string) {
        try {
            // Use say.js for notification
            await this._voiceSynthesis.speakWithSay('Web content received');

            // Process and speak the content
            await this._processAndSpeakContent(content);
        } catch (error) {
            console.error('Failed to handle web content:', error);
            vscode.window.showErrorMessage('Failed to process web content');
        }
    }

    private async _processAndSpeakContent(content: string) {
        try {
            // Get summarized content if it's too long
            let textToSpeak = content;
            if (content.length > this._elevenLabsCharLimit) {
                // Request summarization from Cursor Composer
                const summarized = await this._mcpServer.getLastResponse();
                if (summarized && summarized.length > 0) {
                    textToSpeak = summarized;
                    // Notify using say.js that content was summarized
                    await this._voiceSynthesis.speakWithSay('Content summarized');
                }
            }

            // Ensure we don't exceed ElevenLabs limit
            textToSpeak = textToSpeak.substring(0, this._elevenLabsCharLimit);

            // Cache and play the content
            const language = this._config.get<string>('chatAudioLanguage') || 'en';
            const cacheKey = this._generateCacheKey(textToSpeak, language);
            const cachePath = path.join(this._cacheDir, `${cacheKey}.mp3`);

            if (fs.existsSync(cachePath)) {
                await this._voiceSynthesis.playAudioFile(cachePath);
                await this._voiceSynthesis.speakWithSay('Playing cached audio');
                return;
            }

            // Convert to speech using ElevenLabs
            const audioBuffer = await this._voiceSynthesis.synthesizeWithElevenLabs(textToSpeak);
            fs.writeFileSync(cachePath, audioBuffer);
            
            // Notify using say.js that synthesis is complete
            await this._voiceSynthesis.speakWithSay('Speech synthesized and stored');
            
            // Play the audio
            await this._voiceSynthesis.playAudioFile(cachePath);
        } catch (error) {
            console.error('Failed to process content:', error);
            vscode.window.showErrorMessage('Failed to process content');
            await this._voiceSynthesis.speakWithSay('Failed to process content');
        }
    }

    public async handleChatResponse(response: string) {
        await this._processAndSpeakContent(response);
    }

    private _generateCacheKey(text: string, language: string): string {
        const hash = Buffer.from(text).toString('base64')
            .replace(/[/+=]/g, '_')
            .substring(0, 32);
        return `${language}_${hash}`;
    }

    public toggleChatAudio() {
        const currentValue = this._config.get<boolean>('chatAudioEnabled');
        this._config.update('chatAudioEnabled', !currentValue, true);
        vscode.window.showInformationMessage(
            `Chat audio responses ${!currentValue ? 'enabled' : 'disabled'}`
        );
    }

    public dispose() {
        // Clean up cache older than 24 hours
        const files = fs.readdirSync(this._cacheDir);
        const now = Date.now();
        
        for (const file of files) {
            const filePath = path.join(this._cacheDir, file);
            const stats = fs.statSync(filePath);
            const age = now - stats.mtimeMs;
            
            if (age > 24 * 60 * 60 * 1000) { // 24 hours
                fs.unlinkSync(filePath);
            }
        }
    }
} 