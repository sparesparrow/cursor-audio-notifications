// src/audioPlayer.ts
import * as path from 'path';
const play = require('play-sound')({});

export class AudioPlayer {
    private readonly soundsPath: string;

    constructor(extensionPath: string) {
        this.soundsPath = path.join(extensionPath, 'sounds');
    }

    async playSound(soundName: string): Promise<void> {
        const soundPath = path.join(this.soundsPath, `${soundName}.mp3`);
        
        return new Promise((resolve, reject) => {
            play.play(soundPath, (err: Error) => {
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