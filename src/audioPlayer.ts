// src/audioPlayer.ts
import * as path from 'path';
import player from 'play-sound';

export class AudioPlayer {
    private _soundsPath: string;
    private _player = player();

    constructor(extensionPath: string) {
        this._soundsPath = path.join(extensionPath, 'sounds');
    }

    public async playSound(soundName: string): Promise<void> {
        const soundPath = path.join(this._soundsPath, `${soundName}.mp3`);
        
        return new Promise<void>((resolve, reject) => {
            this._player.play(soundPath, { volume: 1.0 }, (err: Error | null) => {
                if (err) {
                    console.error('Error playing sound:', err);
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }
} 