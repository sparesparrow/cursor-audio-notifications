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
exports.NotificationManager = void 0;
// src/notificationManager.ts
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
class NotificationManager {
    async showBuildNotification() {
        const selection = await vscode.window.showInformationMessage('Build Complete!', 'Open Logs', 'Run Tests', 'Dismiss');
        switch (selection) {
            case 'Open Logs':
                await vscode.commands.executeCommand('workbench.action.output.toggleOutput');
                break;
            case 'Run Tests':
                await vscode.commands.executeCommand('workbench.action.tasks.test');
                break;
        }
    }
    async showDebugNotification(session) {
        const selection = await vscode.window.showInformationMessage(`Debug Session "${session.name}" Completed`, 'Show Call Stack', 'Restart Debug', 'Dismiss');
        switch (selection) {
            case 'Show Call Stack':
                await vscode.commands.executeCommand('workbench.debug.action.toggleRepl');
                break;
            case 'Restart Debug':
                await vscode.commands.executeCommand('workbench.action.debug.restart');
                break;
        }
    }
    async showSaveNotification(document) {
        const selection = await vscode.window.showInformationMessage(`Saved ${path.basename(document.fileName)}`, 'Run Formatter', 'Commit Changes', 'Dismiss');
        switch (selection) {
            case 'Run Formatter':
                await vscode.commands.executeCommand('editor.action.formatDocument');
                break;
            case 'Commit Changes':
                await vscode.commands.executeCommand('workbench.view.scm');
                break;
        }
    }
}
exports.NotificationManager = NotificationManager;
//# sourceMappingURL=notificationManager.js.map