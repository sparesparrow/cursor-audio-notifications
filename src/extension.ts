// src/extension.ts
import * as vscode from 'vscode';
import { AudioPlayer } from './services/audioPlayer';
import { NotificationManager } from './services/notificationManager';
import { EventHandler } from './handlers/eventHandler';
import { VoiceSynthesisService } from './services/voiceSynthesis';
import { ChatAudioService } from './services/chatAudioService';
import { AudioHistoryService } from './services/audioHistoryService';
import { RemoteService } from './services/remoteService';
import { ComposerService } from './services/composerService';
import { ExtensionConfig } from './types/types';
import { VoiceCommandMapper } from './services/voiceCommandMapper';

let eventHandler: EventHandler | undefined;
let chatAudioService: ChatAudioService | undefined;
let audioHistoryService: AudioHistoryService | undefined;
let remoteService: RemoteService | undefined;
let composerService: ComposerService | undefined;

// Add this type definition
interface CommandArgs {
    language?: string;
    task?: string;
    [key: string]: unknown;
}

export async function activate(context: vscode.ExtensionContext) {
    try {
        // Initialize core services
        const config = vscode.workspace.getConfiguration('audioNotifications') as unknown as ExtensionConfig;
        const audioPlayer = new AudioPlayer(context.extensionPath);
        const notificationManager = new NotificationManager();
        const voiceSynthesis = new VoiceSynthesisService();
        
        // Initialize event handler
        eventHandler = new EventHandler(audioPlayer, notificationManager);
        
        // Initialize chat audio service
        chatAudioService = new ChatAudioService(voiceSynthesis);

        // Initialize new services
        audioHistoryService = new AudioHistoryService(context.globalStorageUri);
        remoteService = new RemoteService();
        composerService = new ComposerService(voiceSynthesis, chatAudioService);

        // Register commands with proper error handling
        const disposables = [
            vscode.commands.registerCommand('audio-notifications.showAlert', async () => {
                try {
                    await eventHandler?.handleCustomAlert();
                } catch (error) {
                    vscode.window.showErrorMessage('Failed to play alert sound');
                    console.error('Alert error:', error);
                }
            }),
            
            vscode.commands.registerCommand('audio-notifications.toggleSound', () => {
                try {
                    const newState = !config.soundEnabled;
                    config.update('soundEnabled', newState, true);
                    vscode.window.showInformationMessage(
                        `Sound notifications ${newState ? 'enabled' : 'disabled'}`
                    );
                } catch (error) {
                    vscode.window.showErrorMessage('Failed to toggle sound settings');
                    console.error('Toggle error:', error);
                }
            }),

            vscode.commands.registerCommand('audio-notifications.testVoice', async () => {
                try {
                    await voiceSynthesis.speak('This is a test of the voice synthesis system.');
                } catch (error) {
                    vscode.window.showErrorMessage('Failed to test voice synthesis');
                    console.error('Voice test error:', error);
                }
            }),

            vscode.commands.registerCommand('audio-notifications.toggleChatAudio', () => {
                try {
                    chatAudioService?.toggleChatAudio();
                } catch (error) {
                    vscode.window.showErrorMessage('Failed to toggle chat audio');
                    console.error('Chat audio toggle error:', error);
                }
            }),

            vscode.commands.registerCommand('audio-notifications.playChatResponse', async () => {
                try {
                    await chatAudioService?.handleChatResponse(composerService?.getLastResponse() || '');
                } catch (error) {
                    vscode.window.showErrorMessage('Failed to play chat response');
                    console.error('Chat playback error:', error);
                }
            }),

            vscode.commands.registerCommand('audio-notifications.showAudioHistory', async () => {
                try {
                    await audioHistoryService?.showHistory();
                } catch (error) {
                    vscode.window.showErrorMessage('Failed to show audio history');
                    console.error('History error:', error);
                }
            }),

            vscode.commands.registerCommand('audio-notifications.openRemoteComposer', async () => {
                try {
                    await remoteService?.openRemoteComposer();
                } catch (error) {
                    vscode.window.showErrorMessage('Failed to open remote composer');
                    console.error('Remote composer error:', error);
                }
            }),

            vscode.commands.registerCommand('audio-notifications.openRemoteChat', async () => {
                try {
                    await remoteService?.openRemoteChat();
                } catch (error) {
                    vscode.window.showErrorMessage('Failed to open remote chat');
                    console.error('Remote chat error:', error);
                }
            }),

            vscode.commands.registerCommand('audio-notifications.copyLastResponse', async () => {
                try {
                    await composerService?.copyLastResponse();
                } catch (error) {
                    vscode.window.showErrorMessage('Failed to copy last response');
                    console.error('Copy response error:', error);
                }
            }),

            vscode.commands.registerCommand('audio-notifications.runComposerSequence', async () => {
                try {
                    await composerService?.runComposerSequence();
                } catch (error) {
                    vscode.window.showErrorMessage('Failed to run composer sequence');
                    console.error('Composer sequence error:', error);
                }
            }),

            vscode.commands.registerCommand('audio-notifications.copyModifiedFiles', async () => {
                try {
                    await composerService?.copyModifiedFiles();
                } catch (error) {
                    vscode.window.showErrorMessage('Failed to copy modified files');
                    console.error('Copy files error:', error);
                }
            }),

            vscode.commands.registerCommand('audio-notifications.startNetworkServer', async () => {
                try {
                    await remoteService?.startNetworkServer();
                } catch (error) {
                    vscode.window.showErrorMessage('Failed to start network server');
                    console.error('Network server error:', error);
                }
            }),

            vscode.commands.registerCommand('audio-notifications.handleVoiceCommand', 
                async (transcript: string) => {
                    const { command, args } = voiceCommandService.mapToCommand(transcript);
                    await vscode.commands.executeCommand(command, args);
                }
            )
        ];

        // Register event listeners with proper error handling
        disposables.push(
            vscode.tasks.onDidEndTaskProcess(async e => {
                if (config.notifyOnBuildComplete) {
                    try {
                        await eventHandler?.handleBuildComplete(e);
                    } catch (error) {
                        console.error('Build notification error:', error);
                    }
                }
            }),

            vscode.workspace.onDidSaveTextDocument(async doc => {
                if (config.notifyOnSave) {
                    try {
                        await eventHandler?.handleFileSaved(doc);
                    } catch (error) {
                        console.error('Save notification error:', error);
                    }
                }
            }),

            vscode.debug.onDidTerminateDebugSession(async e => {
                if (config.notifyOnDebugComplete) {
                    try {
                        await eventHandler?.handleDebugComplete(e);
                    } catch (error) {
                        console.error('Debug notification error:', error);
                    }
                }
            }),

            vscode.workspace.onDidChangeTextDocument(e => {
                if (e.document.uri.scheme === 'file') {
                    composerService?.updateModifiedFiles([e.document.uri.fsPath]);
                }
            })
        );

        // Register all disposables
        context.subscriptions.push(...disposables);

        // Show activation message in development
        if (process.env.NODE_ENV === 'development') {
            vscode.window.showInformationMessage('Audio Notifications extension activated');
        }

        // Add to activation sequence
        const voiceCommandService = new VoiceCommandMapper({
            createFile: (args: CommandArgs) => ({
                command: 'workbench.action.files.newUntitledFile',
                args: { language: args.language || 'plaintext' }
            }),
            runBuild: (_args: CommandArgs) => ({
                command: 'audio-notifications.runComposerSequence',
                args: { task: 'build', ..._args }
            })
        });

        context.subscriptions.push(
            vscode.commands.registerCommand('audio-notifications.handleVoiceCommand', 
                async (transcript: string) => {
                    const { command, args } = voiceCommandService.mapToCommand(transcript);
                    await vscode.commands.executeCommand(command, args);
                }
            )
        );
    } catch (error) {
        vscode.window.showErrorMessage('Failed to activate Audio Notifications extension');
        console.error('Activation error:', error);
        throw error; // Re-throw to mark activation as failed
    }
}

export function deactivate() {
    // Clean up resources
    eventHandler = undefined;
    chatAudioService?.dispose();
    chatAudioService = undefined;
    audioHistoryService?.dispose();
    audioHistoryService = undefined;
    remoteService?.dispose();
    remoteService = undefined;
}