"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const path = __importStar(require("path"));
const cp = __importStar(require("child_process"));
const vscode_test_1 = require("vscode-test");
async function main() {
    try {
        // The folder containing the Extension Manifest package.json
        const extensionDevelopmentPath = path.resolve(__dirname, '../../');
        // The path to the extension test script
        const extensionTestsPath = path.resolve(__dirname, './suite/index');
        // Download VS Code, unzip it and run the integration test
        const vscodeExecutablePath = await (0, vscode_test_1.downloadAndUnzipVSCode)();
        const [cliPath, ...args] = (0, vscode_test_1.resolveCliArgsFromVSCodeExecutablePath)(vscodeExecutablePath);
        // Use cp.spawn to launch VS Code with extension
        cp.spawnSync(cliPath, [...args, '--install-extension', extensionDevelopmentPath], {
            encoding: 'utf-8',
            stdio: 'inherit'
        });
        // Run the integration tests
        await (0, vscode_test_1.runTests)({
            vscodeExecutablePath,
            extensionDevelopmentPath,
            extensionTestsPath,
            launchArgs: [
                '--disable-extensions' // Disable other extensions for clean testing environment
            ]
        });
    }
    catch (err) {
        console.error('Failed to run tests:', err);
        process.exit(1);
    }
}
main();
//# sourceMappingURL=runTest.js.map