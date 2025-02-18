import * as assert from 'assert';
import * as vscode from 'vscode';
import * as sinon from 'sinon';
import { AudioPlayer } from '../../src/services/audioPlayer';
import { NotificationManager } from '../../src/services/notificationManager';
import { EventHandler } from '../../src/handlers/eventHandler';
import * as path from 'path';

// Mock modules before imports
const mockPlay = sinon.stub().callsFake((_filepath: string, _opts: any, cb: any) => {
    if (cb) cb(null);
    return null;
});

const mockPlayer = {
    play: mockPlay
};

// Mock the entire play-sound module
require.cache[require.resolve('play-sound')] = {
    exports: () => mockPlayer
} as NodeModule;

suite('Extension Test Suite', () => {
    let audioPlayer: AudioPlayer;
    let notificationManager: NotificationManager;
    let eventHandler: EventHandler;
    let sandbox: sinon.SinonSandbox;

    setup(() => {
        sandbox = sinon.createSandbox();
        const extensionPath = path.resolve(__dirname, '../../');
        audioPlayer = new AudioPlayer(extensionPath);
        notificationManager = new NotificationManager();
        eventHandler = new EventHandler(audioPlayer, notificationManager);

        // Mock the playSound method to avoid actual sound playback
        sandbox.stub(audioPlayer, 'playSound').resolves();
    });

    teardown(() => {
        sandbox.restore();
    });

    test('AudioPlayer initialization', () => {
        assert.ok(audioPlayer, 'AudioPlayer should be initialized');
    });

    test('NotificationManager initialization', () => {
        assert.ok(notificationManager, 'NotificationManager should be initialized');
    });

    test('EventHandler initialization', () => {
        assert.ok(eventHandler, 'EventHandler should be initialized');
    });

    test('handleBuildComplete plays sound on successful build', async () => {
        const playSpy = sandbox.spy(audioPlayer, 'playSound');
        const mockTask: vscode.Task = {
            name: 'build',
            definition: { type: 'shell' },
            scope: vscode.TaskScope.Workspace,
            isBackground: false,
            source: 'test',
            presentationOptions: {},
            problemMatchers: [],
            runOptions: {},
            group: vscode.TaskGroup.Build
        };
        const mockTaskEvent = {
            execution: {
                task: mockTask,
                terminate: () => Promise.resolve()
            },
            exitCode: 0
        } as unknown as vscode.TaskProcessEndEvent;
        await eventHandler.handleBuildComplete(mockTaskEvent);
        assert.strictEqual(playSpy.calledOnce, true, 'Sound should play on successful build');
    });

    test('handleBuildComplete does not play sound on failed build', async () => {
        const playSpy = sandbox.spy(audioPlayer, 'playSound');
        const mockTask: vscode.Task = {
            name: 'build',
            definition: { type: 'shell' },
            scope: vscode.TaskScope.Workspace,
            isBackground: false,
            source: 'test',
            presentationOptions: {},
            problemMatchers: [],
            runOptions: {},
            group: vscode.TaskGroup.Build
        };
        const mockTaskEvent = {
            execution: {
                task: mockTask,
                terminate: () => Promise.resolve()
            },
            exitCode: 1
        } as unknown as vscode.TaskProcessEndEvent;
        await eventHandler.handleBuildComplete(mockTaskEvent);
        assert.strictEqual(playSpy.called, false, 'Sound should not play on failed build');
    });

    test('handleFileSaved plays sound', async () => {
        const playSpy = sandbox.spy(audioPlayer, 'playSound');
        const mockDocument = { fileName: 'test.ts' };
        await eventHandler.handleFileSaved(mockDocument as vscode.TextDocument);
        assert.strictEqual(playSpy.calledOnce, true, 'Sound should play on file save');
    });

    test('handleDebugComplete plays sound', async () => {
        const playSpy = sandbox.spy(audioPlayer, 'playSound');
        await eventHandler.handleDebugComplete({} as vscode.DebugSession);
        assert.strictEqual(playSpy.calledOnce, true, 'Sound should play on debug complete');
    });

    test('handleCustomAlert plays sound', async () => {
        const playSpy = sandbox.spy(audioPlayer, 'playSound');
        await eventHandler.handleCustomAlert();
        assert.strictEqual(playSpy.calledOnce, true, 'Sound should play on custom alert');
    });
}); 