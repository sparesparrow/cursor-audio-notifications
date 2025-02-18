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
const assert = __importStar(require("assert"));
const vscode = __importStar(require("vscode"));
const sinon = __importStar(require("sinon"));
const audioPlayer_1 = require("../src/audioPlayer");
const notificationManager_1 = require("../src/notificationManager");
const eventHandler_1 = require("../src/eventHandler");
suite('Extension Test Suite', () => {
    let audioPlayer;
    let notificationManager;
    let eventHandler;
    let sandbox;
    setup(() => {
        sandbox = sinon.createSandbox();
        audioPlayer = new audioPlayer_1.AudioPlayer(__dirname);
        notificationManager = new notificationManager_1.NotificationManager();
        eventHandler = new eventHandler_1.EventHandler(audioPlayer, notificationManager);
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
        const showInfoStub = sandbox.stub(vscode.window, 'showInformationMessage').resolves('Open Logs');
        const executeCommandStub = sandbox.stub(vscode.commands, 'executeCommand').resolves();
        await notificationManager.showBuildNotification();
        assert.strictEqual(showInfoStub.calledOnce, true);
        assert.strictEqual(executeCommandStub.calledOnce, true);
        assert.strictEqual(executeCommandStub.firstCall.args[0], 'workbench.action.output.toggleOutput');
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
        await eventHandler.handleBuildComplete(mockEvent);
        assert.strictEqual(playSoundStub.calledOnce, true);
        assert.strictEqual(showNotificationStub.calledOnce, true);
    });
    test('EventHandler - handleDebugComplete', async () => {
        const playSoundStub = sandbox.stub(audioPlayer, 'playSound').resolves();
        const showNotificationStub = sandbox.stub(notificationManager, 'showDebugNotification').resolves();
        const mockSession = {
            name: 'Test Debug Session'
        };
        await eventHandler.handleDebugComplete(mockSession);
        assert.strictEqual(playSoundStub.calledOnce, true);
        assert.strictEqual(showNotificationStub.calledOnce, true);
    });
    test('EventHandler - handleFileSaved', async () => {
        const playSoundStub = sandbox.stub(audioPlayer, 'playSound').resolves();
        const showNotificationStub = sandbox.stub(notificationManager, 'showSaveNotification').resolves();
        const mockDocument = {
            fileName: 'test.ts'
        };
        await eventHandler.handleFileSaved(mockDocument);
        assert.strictEqual(playSoundStub.calledOnce, true);
        assert.strictEqual(showNotificationStub.calledOnce, true);
    });
});
//# sourceMappingURL=extension.test.js.map