declare module 'say' {
    type ErrorCallback = (err?: Error) => void;
    type VoicesCallback = (err?: Error, voices?: string[]) => void;

    export function speak(
        text: string,
        voice?: string,
        speed?: number,
        callback?: ErrorCallback
    ): void;

    export function stop(): void;

    export function getInstalledVoices(callback: VoicesCallback): void;
} 