import * as path from 'path';
import { runTests } from 'vscode-test';

async function main() {
    try {
        // The folder containing your extension's package.json
        const extensionDevelopmentPath = path.resolve(__dirname, '../../');

        // The folder containing your test suite
        const extensionTestsPath = path.resolve(__dirname, './suite/index');

        // Get VS Code executable from environment or use system VS Code
        const vscodeExecutablePath = process.env.VSCODE_EXECUTABLE || process.env.CODE_EXECUTABLE;

        // Run tests
        await runTests({ 
            extensionDevelopmentPath,
            extensionTestsPath,
            version: '1.85.0',
            launchArgs: [
                '--disable-extensions', // Disable other extensions that might interfere
                '--disable-gpu', // Disable GPU acceleration in CI
                '--no-sandbox',
                '--disable-updates',
                '--wait'
            ],
            ...(vscodeExecutablePath ? { vscodeExecutablePath } : {})
        });
    } catch (err) {
        console.error('Failed to run tests:', err);
        process.exit(1);
    }
}

main();

// Minimal test runner file

console.log('Running tests...');

// You can add your test logic here, or integrate with a testing framework. 