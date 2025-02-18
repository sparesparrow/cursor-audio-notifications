declare module 'play-sound' {
    interface PlayOptions {
        volume?: number;
    }

    interface Player {
        play(
            filename: string,
            options: PlayOptions,
            callback: (err: Error | null) => void
        ): void;
    }

    interface PlayerConstructor {
        (): Player;
    }

    const player: PlayerConstructor;
    export default player;
} 