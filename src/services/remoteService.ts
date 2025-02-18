import * as vscode from 'vscode';
import * as cp from 'child_process';
import * as http from 'http';
import express from 'express';
import cors from 'cors';
import { promisify } from 'util';
import * as crypto from 'crypto';
import { 
    MCPRequest, 
    Middleware,
    MiddlewareNext,
    MCPError,
    MCPTool
} from '../types/mcp-server';
import { Server } from './mcp-server';
import { MobileCommandHandler } from '../handlers/mobileCommandHandler';

const LIST_TOOLS_SCHEMA = 'list_tools';
const CALL_TOOL_SCHEMA = 'call_tool';

type CommandHandler = (request: MCPRequest) => Promise<void>;

interface SchemaProperty {
    type?: string;
    enum?: string[];
    properties?: Record<string, SchemaProperty>;
    required?: string[];
}

interface Schema {
    type: string;
    properties: Record<string, SchemaProperty>;
    required?: string[];
}

function validateInput(schema: Schema) {
    return function (
        _target: unknown,
        _propertyKey: string | symbol,
        descriptor: TypedPropertyDescriptor<CommandHandler>
    ): TypedPropertyDescriptor<CommandHandler> {
        const originalMethod = descriptor.value;
        if (!originalMethod) {
            throw new Error('Method is undefined');
        }

        descriptor.value = async function (request: MCPRequest): Promise<void> {
            const { command, args: commandArgs } = request.params.arguments;
            
            try {
                if (!schema.properties[command]) {
                    throw new MCPError('invalid_input', `Unknown command: ${command}`);
                }
                
                const commandSchema = schema.properties[command];
                const validation = validateAgainstSchema(commandArgs, commandSchema);
                
                if (!validation.valid) {
                    throw new MCPError('invalid_input', validation.errors.join(', '));
                }
                
                return await originalMethod.call(this, request);
            } catch (error) {
                if (error instanceof MCPError) {
                    throw error;
                }
                throw new MCPError('internal_error', 'Validation error');
            }
        };
        return descriptor;
    };
}

interface ValidationResult {
    valid: boolean;
    errors: string[];
}

function validateAgainstSchema(data: unknown, schema: SchemaProperty): ValidationResult {
    const errors: string[] = [];
    let valid = true;

    if (schema.required) {
        for (const field of schema.required) {
            if (!data || typeof data !== 'object' || !(field in data)) {
                errors.push(`Missing required field: ${field}`);
                valid = false;
            }
        }
    }

    if (schema.properties && data && typeof data === 'object') {
        for (const [key, value] of Object.entries(schema.properties)) {
            const dataValue = (data as Record<string, unknown>)[key];
            if (dataValue !== undefined) {
                if (value.type && typeof dataValue !== value.type) {
                    errors.push(`Invalid type for ${key}: expected ${value.type}`);
                    valid = false;
                }
                if (value.enum && !value.enum.includes(dataValue as string)) {
                    errors.push(`Invalid value for ${key}: must be one of ${value.enum.join(', ')}`);
                    valid = false;
                }
            }
        }
    }

    return { valid, errors };
}

// Tool schemas
const cursorControlSchema = {
    type: 'object',
    properties: {
        move: {
            type: 'object',
            properties: {
                direction: { type: 'string', enum: ['up', 'down', 'left', 'right'] }
            },
            required: ['direction']
        },
        insert: {
            type: 'object',
            properties: {
                text: { type: 'string' }
            },
            required: ['text']
        },
        execute: {
            type: 'object',
            properties: {
                commandId: { type: 'string' }
            },
            required: ['commandId']
        },
        scroll: {
            type: 'object',
            properties: {
                direction: { type: 'string', enum: ['up', 'down'] }
            },
            required: ['direction']
        },
        open: {
            type: 'object',
            properties: {
                filePath: { type: 'string' }
            },
            required: ['filePath']
        },
        terminal: {
            type: 'object',
            properties: {
                shellCommand: { type: 'string' }
            },
            required: ['shellCommand']
        }
    },
    required: ['command', 'args']
};

interface RemoteSettings {
    x11Display: string;
    pulseServer: string;
    sshHost: string;
    sshUser: string;
    sshPort: number;
}

interface NetworkServerConfig {
    enabled: boolean;
    port: number;
    host: string;
    authToken: string;
}

export class RemoteService {
    private _config: vscode.WorkspaceConfiguration;
    private _server: http.Server | undefined;
    private _app: express.Express;
    private _lastModifiedFiles: string[] = [];
    private _mcpServer: Server;
    private _apiKey: string;
    private _mobileHandler: MobileCommandHandler;

    constructor() {
        this._config = vscode.workspace.getConfiguration('audioNotifications');
        this._app = express();
        this._apiKey = crypto.randomBytes(32).toString('hex');
        this._mobileHandler = new MobileCommandHandler();
        
        this._mcpServer = new Server({
            name: "cursor-mobile-control",
            version: "1.0.0",
            capabilities: {
                tools: {
                    cursorControl: cursorControlSchema
                }
            }
        });

        this._setupExpress();
        this._setupTools();
        this._setupAuth();
    }

    private _setupExpress(): void {
        this._app.use(cors());
        this._app.use(express.json());
        this._app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
            const token = req.headers.authorization?.split(' ')[1];
            if (token !== this._config.get('networkServer.authToken')) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }
            next();
        });
    }

    @validateInput(cursorControlSchema)
    private async _handleCursorControl(request: MCPRequest): Promise<void> {
        const { command, args } = request.params.arguments;
        
        switch(command) {
            case 'move':
                await this._mobileHandler.moveCursor(args.direction as string);
                break;
            case 'insert':
                await this._mobileHandler.insertText(args.text as string);
                break;
            case 'execute':
                await this._mobileHandler.executeCommand(args.commandId as string);
                break;
            case 'scroll':
                await this._mobileHandler.scrollWindow(args.direction as string);
                break;
            case 'open':
                await this._mobileHandler.openFile(args.filePath as string);
                break;
            case 'terminal':
                await this._mobileHandler.runTerminalCommand(args.shellCommand as string);
                break;
            default:
                throw new MCPError('method_not_found', `Unknown command: ${command}`);
        }
    }

    private _setupTools(): void {
        // Register tools
        const cursorControlTool: MCPTool = {
            name: "cursorControl",
            description: "Control Cursor IDE navigation and editing",
            inputSchema: cursorControlSchema
        };

        this._mcpServer.setRequestHandler(LIST_TOOLS_SCHEMA, async () => ({
            tools: [cursorControlTool]
        }));

        this._mcpServer.setRequestHandler(CALL_TOOL_SCHEMA, async (request: MCPRequest) => {
            try {
                await this._handleCursorControl(request);
                return {
                    content: [{
                        type: "text",
                        text: `Successfully executed ${request.params.arguments.command}`
                    }]
                };
            } catch (error) {
                if (error instanceof MCPError) {
                    throw error;
                }
                throw new MCPError('internal_error', 'Internal server error');
            }
        });
    }

    private _setupAuth(): void {
        const middleware: Middleware = async (request: MCPRequest, next: MiddlewareNext) => {
            if (request.headers['x-api-key'] !== this._apiKey) {
                throw new MCPError('unauthorized', 'Invalid API key');
            }
            return next(request);
        };
        this._mcpServer.use(middleware);
    }

    public async openRemoteComposer(): Promise<void> {
        const remoteSettings = this._config.get<RemoteSettings>('remoteSettings');
        if (!remoteSettings) {
            throw new Error('Remote settings not configured');
        }

        const env = {
            ...process.env,
            display: remoteSettings.x11Display,
            pulseServer: remoteSettings.pulseServer
        };

        const sshCommand = `ssh -X -p ${remoteSettings.sshPort} ${remoteSettings.sshUser}@${remoteSettings.sshHost} "cursor --new-window --goto-composer"`;
        
        try {
            await promisify(cp.exec)(sshCommand, { env });
            vscode.window.showInformationMessage('Remote Composer opened successfully');
        } catch (error) {
            console.error('Failed to open remote composer:', error);
            throw error;
        }
    }

    public async openRemoteChat(): Promise<void> {
        const remoteSettings = this._config.get<RemoteSettings>('remoteSettings');
        if (!remoteSettings) {
            throw new Error('Remote settings not configured');
        }

        const env = {
            ...process.env,
            display: remoteSettings.x11Display,
            pulseServer: remoteSettings.pulseServer
        };

        const sshCommand = `ssh -X -p ${remoteSettings.sshPort} ${remoteSettings.sshUser}@${remoteSettings.sshHost} "cursor --new-window --goto-chat"`;
        
        try {
            await promisify(cp.exec)(sshCommand, { env });
            vscode.window.showInformationMessage('Remote Chat opened successfully');
        } catch (error) {
            console.error('Failed to open remote chat:', error);
            throw error;
        }
    }

    public async startNetworkServer(): Promise<void> {
        const serverConfig = this._config.get<NetworkServerConfig>('networkServer');
        if (!serverConfig?.enabled) {
            throw new Error('Network server not enabled in settings');
        }

        const port = serverConfig.port || 3000;
        await this._mcpServer.listen(port);
        
        // Generate QR code for API key
        const qrData = JSON.stringify({
            server: `http://${serverConfig.host}:${port}`,
            apiKey: this._apiKey
        });

        vscode.window.showInformationMessage(
            'Mobile control server started. Scan QR code to connect.',
            'Show QR Code'
        ).then(selection => {
            if (selection === 'Show QR Code') {
                this._showQRCode(qrData);
            }
        });
    }

    private async _showQRCode(data: string): Promise<void> {
        const panel = vscode.window.createWebviewPanel(
            'mobileConnect',
            'Mobile Connection QR Code',
            vscode.ViewColumn.One,
            {}
        );

        // Generate QR code HTML
        const qrCodeHtml = await this._generateQRCodeHtml(data);
        panel.webview.html = qrCodeHtml;
    }

    private async _generateQRCodeHtml(data: string): Promise<string> {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Mobile Connection QR Code</title>
                <script src="https://cdn.jsdelivr.net/npm/qrcode-generator/qrcode.min.js"></script>
            </head>
            <body>
                <div id="qrcode"></div>
                <script>
                    const qr = qrcode(0, 'L');
                    qr.addData('${data}');
                    qr.make();
                    document.getElementById('qrcode').innerHTML = qr.createImgTag(5);
                </script>
            </body>
            </html>
        `;
    }

    public updateModifiedFiles(files: string[]): void {
        this._lastModifiedFiles = files;
    }

    public getModifiedFiles(): string[] {
        return this._lastModifiedFiles;
    }

    public dispose(): void {
        if (this._server) {
            this._server.close();
            this._server = undefined;
        }
        this._mcpServer?.close();
    }
} 