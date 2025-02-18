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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AudioPlayer = void 0;
// src/audioPlayer.ts
const path = __importStar(require("path"));
const play_sound_1 = __importDefault(require("play-sound"));
const audioPlayer = (0, play_sound_1.default)();
class AudioPlayer {
    constructor() {
        // You may want to define the base directory or get it from a configuration.
        const baseDir = process.cwd();
        this._soundsPath = path.join(baseDir, 'sounds');
    }
    async playSound(soundName) {
        const soundPath = path.join(this._soundsPath, `${soundName}.mp3`);
        return new Promise((resolve, reject) => {
            audioPlayer.play(soundPath, (err) => {
                if (err) {
                    console.error('Error playing sound:', err);
                    reject(err);
                }
                else {
                    resolve();
                }
            });
        });
    }
}
exports.AudioPlayer = AudioPlayer;
//# sourceMappingURL=audioPlayer.js.map