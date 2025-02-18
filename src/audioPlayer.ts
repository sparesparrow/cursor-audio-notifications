// src/audioPlayer.ts
import * as path from 'path';
import playSound from 'play-sound';

const audioPlayer = playSound();

export class AudioPlayer {
    private _soundsPath: string;

    constructor() {
        // You may want to define the base directory or get it from a configuration.
        const baseDir = process.cwd();
        this._soundsPath = path.join(baseDir, 'sounds');
    }

    async playSound(soundName: string): Promise<void> {
        const soundPath = path.join(this._soundsPath, `${soundName}.mp3`);
        
        return new Promise((resolve, reject) => {
            audioPlayer.play(soundPath, (err: Error | null) => {
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