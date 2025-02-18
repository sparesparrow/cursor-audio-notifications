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
// src/eventHandler.ts
const vscode = __importStar(require("vscode"));
class EventHandler {
    constructor(_audioPlayer, _notificationManager) {
        this._audioPlayer = _audioPlayer;
        this._notificationManager = _notificationManager;
    }
    async handleBuildComplete(e) {
        if (e.execution.task.definition.type === 'npm' && e.exitCode === 0) {
            await this._audioPlayer.playSound('build-complete');
            await this._notificationManager.showBuildNotification();
        }
    }
    async handleDebugComplete(session) {
        await this._audioPlayer.playSound('debug-complete');
        await this._notificationManager.showDebugNotification(session);
    }
    async handleFileSaved(document) {
        await this._audioPlayer.playSound('file-saved');
        await this._notificationManager.showSaveNotification(document);
    }
    async handleCustomAlert() {
        await this._audioPlayer.playSound('custom-alert');
        await vscode.window.showInformationMessage('Custom Alert Triggered');
    }
}
exports.EventHandler = EventHandler;
//# sourceMappingURL=eventHandler.js.map