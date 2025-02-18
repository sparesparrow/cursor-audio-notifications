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
exports.deactivate = exports.activate = void 0;
// src/extension.ts
const vscode = __importStar(require("vscode"));
const audioPlayer_1 = require("./services/audioPlayer");
const notificationManager_1 = require("./services/notificationManager");
const eventHandler_1 = require("./handlers/eventHandler");
const voiceSynthesis_1 = require("./services/voiceSynthesis");
const chatAudioService_1 = require("./services/chatAudioService");
const audioHistoryService_1 = require("./services/audioHistoryService");
const remoteService_1 = require("./services/remoteService");
const composerService_1 = require("./services/composerService");
const voiceCommandMapper_1 = require("./services/voiceCommandMapper");
let eventHandler;
let chatAudioService;
let audioHistoryService;
let remoteService;
let composerService;
async function activate(context) {
    try {
        // Initialize core services
        const config = vscode.workspace.getConfiguration('audioNotifications');
        const audioPlayer = new audioPlayer_1.AudioPlayer(context.extensionPath);
        const notificationManager = new notificationManager_1.NotificationManager();
        const voiceSynthesis = new voiceSynthesis_1.VoiceSynthesisService();
        // Initialize event handler
        eventHandler = new eventHandler_1.EventHandler(audioPlayer, notificationManager);
        // Initialize chat audio service
        chatAudioService = new chatAudioService_1.ChatAudioService(voiceSynthesis);
        // Initialize new services
        audioHistoryService = new audioHistoryService_1.AudioHistoryService(context.globalStorageUri);
        remoteService = new remoteService_1.RemoteService();
        composerService = new composerService_1.ComposerService(voiceSynthesis, chatAudioService);
        // Register commands with proper error handling
        const disposables = [
            vscode.commands.registerCommand('audio-notifications.showAlert', async () => {
                try {
                    await eventHandler?.handleCustomAlert();
                }
                catch (error) {
                    vscode.window.showErrorMessage('Failed to play alert sound');
                    console.error('Alert error:', error);
                }
            }),
            vscode.commands.registerCommand('audio-notifications.toggleSound', () => {
                try {
                    const newState = !config.soundEnabled;
                    config.update('soundEnabled', newState, true);
                    vscode.window.showInformationMessage(`Sound notifications ${newState ? 'enabled' : 'disabled'}`);
                }
                catch (error) {
                    vscode.window.showErrorMessage('Failed to toggle sound settings');
                    console.error('Toggle error:', error);
                }
            }),
            vscode.commands.registerCommand('audio-notifications.testVoice', async () => {
                try {
                    await voiceSynthesis.speak('This is a test of the voice synthesis system.');
                }
                catch (error) {
                    vscode.window.showErrorMessage('Failed to test voice synthesis');
                    console.error('Voice test error:', error);
                }
            }),
            vscode.commands.registerCommand('audio-notifications.toggleChatAudio', () => {
                try {
                    chatAudioService?.toggleChatAudio();
                }
                catch (error) {
                    vscode.window.showErrorMessage('Failed to toggle chat audio');
                    console.error('Chat audio toggle error:', error);
                }
            }),
            vscode.commands.registerCommand('audio-notifications.playChatResponse', async () => {
                try {
                    await chatAudioService?.handleChatResponse(composerService?.getLastResponse() || '');
                }
                catch (error) {
                    vscode.window.showErrorMessage('Failed to play chat response');
                    console.error('Chat playback error:', error);
                }
            }),
            vscode.commands.registerCommand('audio-notifications.showAudioHistory', async () => {
                try {
                    await audioHistoryService?.showHistory();
                }
                catch (error) {
                    vscode.window.showErrorMessage('Failed to show audio history');
                    console.error('History error:', error);
                }
            }),
            vscode.commands.registerCommand('audio-notifications.openRemoteComposer', async () => {
                try {
                    await remoteService?.openRemoteComposer();
                }
                catch (error) {
                    vscode.window.showErrorMessage('Failed to open remote composer');
                    console.error('Remote composer error:', error);
                }
            }),
            vscode.commands.registerCommand('audio-notifications.openRemoteChat', async () => {
                try {
                    await remoteService?.openRemoteChat();
                }
                catch (error) {
                    vscode.window.showErrorMessage('Failed to open remote chat');
                    console.error('Remote chat error:', error);
                }
            }),
            vscode.commands.registerCommand('audio-notifications.copyLastResponse', async () => {
                try {
                    await composerService?.copyLastResponse();
                }
                catch (error) {
                    vscode.window.showErrorMessage('Failed to copy last response');
                    console.error('Copy response error:', error);
                }
            }),
            vscode.commands.registerCommand('audio-notifications.runComposerSequence', async () => {
                try {
                    await composerService?.runComposerSequence();
                }
                catch (error) {
                    vscode.window.showErrorMessage('Failed to run composer sequence');
                    console.error('Composer sequence error:', error);
                }
            }),
            vscode.commands.registerCommand('audio-notifications.copyModifiedFiles', async () => {
                try {
                    await composerService?.copyModifiedFiles();
                }
                catch (error) {
                    vscode.window.showErrorMessage('Failed to copy modified files');
                    console.error('Copy files error:', error);
                }
            }),
            vscode.commands.registerCommand('audio-notifications.startNetworkServer', async () => {
                try {
                    await remoteService?.startNetworkServer();
                }
                catch (error) {
                    vscode.window.showErrorMessage('Failed to start network server');
                    console.error('Network server error:', error);
                }
            }),
            vscode.commands.registerCommand('audio-notifications.handleVoiceCommand', async (transcript) => {
                const { command, args } = voiceCommandService.mapToCommand(transcript);
                await vscode.commands.executeCommand(command, args);
            })
        ];
        // Register event listeners with proper error handling
        disposables.push(vscode.tasks.onDidEndTaskProcess(async (e) => {
            if (config.notifyOnBuildComplete) {
                try {
                    await eventHandler?.handleBuildComplete(e);
                }
                catch (error) {
                    console.error('Build notification error:', error);
                }
            }
        }), vscode.workspace.onDidSaveTextDocument(async (doc) => {
            if (config.notifyOnSave) {
                try {
                    await eventHandler?.handleFileSaved(doc);
                }
                catch (error) {
                    console.error('Save notification error:', error);
                }
            }
        }), vscode.debug.onDidTerminateDebugSession(async (e) => {
            if (config.notifyOnDebugComplete) {
                try {
                    await eventHandler?.handleDebugComplete(e);
                }
                catch (error) {
                    console.error('Debug notification error:', error);
                }
            }
        }), vscode.workspace.onDidChangeTextDocument(e => {
            if (e.document.uri.scheme === 'file') {
                composerService?.updateModifiedFiles([e.document.uri.fsPath]);
            }
        }));
        // Register all disposables
        context.subscriptions.push(...disposables);
        // Show activation message in development
        if (process.env.NODE_ENV === 'development') {
            vscode.window.showInformationMessage('Audio Notifications extension activated');
        }
        // Add to activation sequence
        const voiceCommandService = new voiceCommandMapper_1.VoiceCommandMapper({
            createFile: (args) => ({
                command: 'workbench.action.files.newUntitledFile',
                args: { language: args.language || 'plaintext' }
            }),
            runBuild: (_args) => ({
                command: 'audio-notifications.runComposerSequence',
                args: { task: 'build' }
            })
        });
        context.subscriptions.push(vscode.commands.registerCommand('audio-notifications.handleVoiceCommand', async (transcript) => {
            const { command, args } = voiceCommandService.mapToCommand(transcript);
            await vscode.commands.executeCommand(command, args);
        }));
    }
    catch (error) {
        vscode.window.showErrorMessage('Failed to activate Audio Notifications extension');
        console.error('Activation error:', error);
        throw error; // Re-throw to mark activation as failed
    }
}
exports.activate = activate;
function deactivate() {
    // Clean up resources
    eventHandler = undefined;
    chatAudioService?.dispose();
    chatAudioService = undefined;
    audioHistoryService?.dispose();
    audioHistoryService = undefined;
    remoteService?.dispose();
    remoteService = undefined;
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map