import * as path from 'path';
import * as cp from 'child_process';
import {
    downloadAndUnzipVSCode,
    runTests,
    resolveCliArgsFromVSCodeExecutablePath
} from 'vscode-test';

async function main() {
    try {
        // The folder containing the Extension Manifest package.json
        const extensionDevelopmentPath = path.resolve(__dirname, '../../');

        // The path to the extension test script
        const extensionTestsPath = path.resolve(__dirname, './suite/index');

        // Download VS Code, unzip it and run the integration test
        const vscodeExecutablePath = await downloadAndUnzipVSCode();
        const [cliPath, ...args] = resolveCliArgsFromVSCodeExecutablePath(vscodeExecutablePath);

        // Use cp.spawn to launch VS Code with extension
        cp.spawnSync(cliPath, [...args, '--install-extension', extensionDevelopmentPath], {
            encoding: 'utf-8',
            stdio: 'inherit'
        });

        // Run the integration tests
        await runTests({
            vscodeExecutablePath,
            extensionDevelopmentPath,
            extensionTestsPath,
            launchArgs: [
                '--disable-extensions' // Disable other extensions for clean testing environment
            ]
        });
    } catch (err) {
        console.error('Failed to run tests:', err);
        process.exit(1);
    }
}

main(); 