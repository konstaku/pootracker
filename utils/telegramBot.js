import { bot } from './../index.js';

export class Dialogue {
    constructor(message) {
        this.chatId = message.chat.id;
        this.currentStage = 'idle';
    }

    processMessage(message) {
        try {
            const command = message.text;

            switch(this.currentStage) {
            case 'idle':
                if (command === '/go') {
                    this.mainMenuChoice(message);
                } else {
                    bot.sendMessage(this.chatId, 'Type /go to see main menu');
                }
                break;
            default:
                bot.sendMessage(this.chatId, 'Nothing here yet...');
            } 
        } catch (error) {
            console.log('Error processing message!', error);
        }
    }

    mainMenuChoice(mainMenuMessage) {
        bot.sendMessage(this.chatId, 'What do you want?', {
            reply_markup: {
                keyboard: [['Add pools'], ['Remove pools'], ['View pool stats']],
                one_time_keyboard: true,
            },
        });
    }
}
