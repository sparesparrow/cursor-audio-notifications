import * as path from 'path';
import playSound from 'play-sound';

const audioPlayer = playSound();

export class AudioPlayer {
    private _soundsPath: string;
    private _player: ReturnType<typeof playSound>;

    constructor(extensionPath: string) {
        this._soundsPath = path.join(extensionPath, 'sounds');
        this._player = audioPlayer;
    }

    public async playSound(soundName: string): Promise<void> {
        const soundPath = path.join(this._soundsPath, `${soundName}.mp3`);
        
        return new Promise<void>((resolve, reject) => {
            this._player.play(soundPath, { volume: 1.0 }, (err: Error | null) => {
                if (err) {
                    console.error('Failed to play sound:', err);
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }
} 