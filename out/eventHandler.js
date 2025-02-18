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
exports.EventHandler = void 0;
const vscode = __importStar(require("vscode"));
class EventHandler {
    constructor(audioPlayer, notificationManager) {
        this.audioPlayer = audioPlayer;
        this.notificationManager = notificationManager;
    }
    async handleBuildComplete(e) {
        if (e.execution.task.definition.type === 'npm' && e.exitCode === 0) {
            await this.audioPlayer.playSound('build-complete');
            await this.notificationManager.showBuildNotification();
        }
    }
    async handleDebugComplete(session) {
        await this.audioPlayer.playSound('debug-complete');
        await this.notificationManager.showDebugNotification(session);
    }
    async handleFileSaved(document) {
        await this.audioPlayer.playSound('file-saved');
        await this.notificationManager.showSaveNotification(document);
    }
    async handleCustomAlert() {
        await this.audioPlayer.playSound('custom-alert');
        await vscode.window.showInformationMessage('Custom Alert Triggered');
    }
}
exports.EventHandler = EventHandler;
//# sourceMappingURL=eventHandler.js.map