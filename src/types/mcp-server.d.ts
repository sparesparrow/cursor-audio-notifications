import { IncomingHttpHeaders } from 'http';

export class MCPError extends Error {
    constructor(
        public code: string,
        message: string
    ) {
        super(message);
        this.name = 'MCPError';
    }
}

export interface MCPServerConfig {
    name: string;
    version: string;
    capabilities?: {
        tools?: Record<string, unknown>;
    };
}

export interface MCPRequest {
    headers: IncomingHttpHeaders;
    params: {
        arguments: {
            command: string;
            args: Record<string, unknown>;
        };
    };
}

export interface MCPResponse {
    content: Array<{
        type: string;
        text: string;
    }>;
    isError?: boolean;
}

export interface MCPTool {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: Record<string, unknown>;
        required: string[];
    };
}

export interface MCPToolsResponse {
    tools: MCPTool[];
}

export type RequestHandler = (request: MCPRequest) => Promise<MCPResponse | MCPToolsResponse>;
export type MiddlewareNext = (request: MCPRequest) => Promise<void>;
export type Middleware = (request: MCPRequest, next: MiddlewareNext) => Promise<void>;

export interface Server {
    setRequestHandler(schema: string, handler: RequestHandler): void;
    use(middleware: Middleware): void;
    listen(port: number): Promise<void>;
    close(): void;
}

export const ListToolsRequestSchema = 'list_tools';
export const CallToolRequestSchema = 'call_tool'; 