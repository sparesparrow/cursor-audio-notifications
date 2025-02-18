import * as assert from 'assert';
import * as vscode from 'vscode';
import * as sinon from 'sinon';
import { AudioPlayer } from '../src/services/audioPlayer';
import { NotificationManager } from '../src/services/notificationManager';
import { EventHandler } from '../src/handlers/eventHandler';
import * as path from 'path';

interface PlayOptions {
    volume?: number;
}

interface Player {
    play(filepath: string, opts: PlayOptions, cb: (err: Error | null) => void): void | null;
}

// Mock modules before imports
const mockPlay = sinon.stub().callsFake((_filepath: string, _opts: PlayOptions, cb: (err: Error | null) => void) => {
    if (cb) cb(null);
    return null;
});

const mockPlayer: Player = {
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
        const extensionPath = path.resolve(__dirname, '../');
        audioPlayer = new AudioPlayer(extensionPath);
        notificationManager = new NotificationManager();
        eventHandler = new EventHandler(audioPlayer, notificationManager);
    });

    teardown(() => {
        sandbox.restore();
    });

    test('AudioPlayer - playSound', async () => {
        const playSoundStub = sandbox.stub(audioPlayer, 'playSound').resolves();
        await audioPlayer.playSound('build-complete');
        assert.strictEqual(playSoundStub.calledOnce, true);
        assert.strictEqual(playSoundStub.firstCall.args[0], 'build-complete');
    });

    test('NotificationManager - showBuildNotification', async () => {
        const showInfoStub = sandbox.stub(vscode.window, 'showInformationMessage').resolves({ title: 'Open Logs' });
        const executeCommandStub = sandbox.stub(vscode.commands, 'executeCommand').resolves();

        await notificationManager.showBuildNotification();

        assert.strictEqual(showInfoStub.calledOnce, true);
        assert.strictEqual(executeCommandStub.calledOnce, true);
        assert.strictEqual(
            executeCommandStub.firstCall.args[0],
            'workbench.action.output.toggleOutput'
        );
    });

    test('EventHandler - handleBuildComplete', async () => {
        const playSoundStub = sandbox.stub(audioPlayer, 'playSound').resolves();
        const showNotificationStub = sandbox.stub(notificationManager, 'showBuildNotification').resolves();

        const mockEvent = {
            execution: {
                task: {
                    definition: {
                        type: 'npm'
                    }
                }
            },
            exitCode: 0
        };

        await eventHandler.handleBuildComplete(mockEvent as any);

        assert.strictEqual(playSoundStub.calledOnce, true);
        assert.strictEqual(showNotificationStub.calledOnce, true);
    });

    test('EventHandler - handleDebugComplete', async () => {
        const playSoundStub = sandbox.stub(audioPlayer, 'playSound').resolves();
        const showNotificationStub = sandbox.stub(notificationManager, 'showDebugNotification').resolves();

        const mockSession = {
            name: 'Test Debug Session'
        };

        await eventHandler.handleDebugComplete(mockSession as any);

        assert.strictEqual(playSoundStub.calledOnce, true);
        assert.strictEqual(showNotificationStub.calledOnce, true);
    });

    test('EventHandler - handleFileSaved', async () => {
        const playSoundStub = sandbox.stub(audioPlayer, 'playSound').resolves();
        const showNotificationStub = sandbox.stub(notificationManager, 'showSaveNotification').resolves();

        const mockDocument = {
            fileName: 'test.ts'
        };

        await eventHandler.handleFileSaved(mockDocument as any);

        assert.strictEqual(playSoundStub.calledOnce, true);
        assert.strictEqual(showNotificationStub.calledOnce, true);
    });
}); 