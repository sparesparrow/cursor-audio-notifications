declare module 'node-espeak' {
    export function speak(text: string, callback: (error?: Error) => void): void;
    export function listVoices(): string[];
} 