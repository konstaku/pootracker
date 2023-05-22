import { bot } from './../index.js';

export class Dialogue {
    constructor(message) {
        this.chatId = message.chat.id;
        this.currentStage = 'idle';
    }

    processMessage(message) {
        const command = message.text;

        switch(command) {
        case '/go':
            this.currentStage = 'onMainMenu';
            bot.sendMessage(`Chat id #${this.chatId} is on ${this.currentStage} stage`);
            break;
            
        } 
    }
}
