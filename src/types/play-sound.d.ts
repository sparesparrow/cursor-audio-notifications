declare module 'play-sound' {
    interface PlayOptions {
        filename?: string;
        volume?: number;
    }

    interface Player {
        play: (filename: string, callback?: (err: Error | null) => void) => void;
    }

    function playSound(opts?: { player?: string }): Player;
    export = playSound;
} 