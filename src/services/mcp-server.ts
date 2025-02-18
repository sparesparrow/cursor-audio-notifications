import express, { Request, Response } from 'express';
import { Server as HttpServer } from 'http';
import {
    Server as MCPServer,
    MCPServerConfig,
    RequestHandler,
    Middleware,
    MCPRequest,
    MCPError
} from '../types/mcp-server';

export class Server implements MCPServer {
    private _app: express.Express;
    private _server: HttpServer | undefined;
    private _handlers: Map<string, RequestHandler>;
    private _middlewares: Middleware[];

    constructor(private readonly _config: MCPServerConfig) {
        this._app = express();
        this._app.use(express.json());
        this._handlers = new Map();
        this._middlewares = [];

        // Store configuration for future use in request handling
        this._validateConfig();

        this._setupRoutes();
    }

    private _validateConfig(): void {
        if (!this._config.name || !this._config.version) {
            throw new Error('Invalid MCP server configuration: name and version are required');
        }
    }

    private _setupRoutes(): void {
        this._app.post('/mcp/:schema', async (req: Request, res: Response) => {
            const schema = req.params.schema;
            const handler = this._handlers.get(schema);

            if (!handler) {
                res.status(404).json({
                    isError: true,
                    content: [{ type: 'text', text: `Unknown method: ${schema}` }]
                });
                return;
            }

            try {
                const mcpRequest: MCPRequest = {
                    headers: req.headers,
                    params: req.body
                };

                // Run middleware chain
                let currentRequest = mcpRequest;
                for (const middleware of this._middlewares) {
                    await middleware(currentRequest, async (req) => {
                        currentRequest = req;
                    });
                }

                const response = await handler(currentRequest);
                res.json(response);
            } catch (error) {
                if (error instanceof MCPError) {
                    res.status(400).json({
                        isError: true,
                        content: [{ type: 'text', text: error.message }]
                    });
                } else {
                    res.status(500).json({
                        isError: true,
                        content: [{ type: 'text', text: 'Internal server error' }]
                    });
                }
            }
        });
    }

    public setRequestHandler(schema: string, handler: RequestHandler): void {
        this._handlers.set(schema, handler);
    }

    public use(middleware: Middleware): void {
        this._middlewares.push(middleware);
    }

    public async listen(port: number): Promise<void> {
        return new Promise((resolve) => {
            this._server = this._app.listen(port, () => {
                console.log(`MCP Server listening on port ${port}`);
                resolve();
            });
        });
    }

    public close(): void {
        if (this._server) {
            this._server.close();
            this._server = undefined;
        }
    }
} 