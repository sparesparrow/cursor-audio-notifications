declare module 'elevenlabs' {
    interface VoiceSettings {
        stability: number;
        similarityBoost: number;
        style: number;
        useSpeakerBoost: boolean;
    }

    interface GenerateOptions {
        text: string;
        voice: string;
        modelId: string;
        voiceSettings: VoiceSettings;
    }

    interface Voice {
        id: string;
        name: string;
        category: string;
        description: string;
        previewUrl: string;
        settings: VoiceSettings;
    }

    interface VoicesAPI {
        getAll(): Promise<Voice[]>;
        get(voiceId: string): Promise<Voice>;
    }

    export class ElevenLabsClient {
        constructor(options: { apiKey: string });
        voices: VoicesAPI;
        generate(options: GenerateOptions): Promise<Response>;
    }
} 