import * as path from 'path';
import { runTests } from 'vscode-test';

async function main() {
    try {
        // The folder containing your extension's package.json
        const extensionDevelopmentPath = path.resolve(__dirname, '../../');

        // The folder containing your test suite
        const extensionTestsPath = path.resolve(__dirname, './suite/index');

        // Use Cursor AppImage for tests
        const cursorExecutablePath = process.env.CURSOR_EXECUTABLE || '/usr/local/bin/cursor';

        // Run tests with Cursor AppImage
        await runTests({ 
            extensionDevelopmentPath, 
            extensionTestsPath,
            vscodeExecutablePath: cursorExecutablePath,
            version: 'stable'
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