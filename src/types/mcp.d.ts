declare module '@modelcontextprotocol/server-fetch' {
    interface MCPFetchServerOptions {
        fetch: any;
        baseUrl: string;
    }

    export class MCPFetchServer {
        constructor(options: MCPFetchServerOptions);
        getLastResponse(): Promise<string>;
    }
} 