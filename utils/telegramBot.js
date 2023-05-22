import { bot } from './../index.js';

export class Dialogue {
    constructor(message) {
        this.chatId = message.chat.id;
        this.currentStage = 'idle';
    }

    processMessage(command) {
        switch(command) {
        case '/go':
            this.currentStage = 'onMainMenu';
            bot.sendMessage(this.chatId, 'You are on the main menu');
            break;
        } 
    }
}
