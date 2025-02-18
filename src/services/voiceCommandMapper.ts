interface CommandMapping {
    command: string;
    args: Record<string, unknown>;
}

type CommandHandler = (args: Record<string, unknown>) => CommandMapping;
type CommandMap = Record<string, CommandHandler>;

export class VoiceCommandMapper {
    private _commandMap: CommandMap;

    constructor(commandMap: CommandMap) {
        this._commandMap = this._normalizePhrases(commandMap);
    }

    private _normalizePhrases(commandMap: CommandMap): CommandMap {
        const normalized: CommandMap = {};
        for (const [phrase, handler] of Object.entries(commandMap)) {
            const normalizedPhrase = phrase.toLowerCase().replace(/\s+/g, '');
            normalized[normalizedPhrase] = handler;
        }
        return normalized;
    }

    private _normalizeInput(input: string): string {
        return input.toLowerCase().replace(/\s+/g, '');
    }

    public mapToCommand(transcript: string): CommandMapping {
        const normalizedInput = this._normalizeInput(transcript);
        
        for (const [phrase, handler] of Object.entries(this._commandMap)) {
            if (normalizedInput.includes(phrase)) {
                // Extract any arguments from the transcript
                const args = this._extractArgs(transcript);
                return handler(args);
            }
        }

        // Default to a no-op command if no match is found
        return {
            command: 'noop',
            args: {}
        };
    }

    private _extractArgs(transcript: string): Record<string, unknown> {
        // Simple argument extraction based on common patterns
        const args: Record<string, unknown> = {};
        
        // Extract language for file creation
        const langMatch = transcript.match(/in\s+(\w+)/i);
        if (langMatch) {
            args.language = langMatch[1].toLowerCase();
        }

        // Extract file path for open command
        const pathMatch = transcript.match(/open\s+([^\s]+)/i);
        if (pathMatch) {
            args.filePath = pathMatch[1];
        }

        // Extract text for insert command
        const textMatch = transcript.match(/type\s+(.+)/i);
        if (textMatch) {
            args.text = textMatch[1];
        }

        // Extract direction for movement commands
        const dirMatch = transcript.match(/(up|down|left|right)/i);
        if (dirMatch) {
            args.direction = dirMatch[1].toLowerCase();
        }

        return args;
    }
} 