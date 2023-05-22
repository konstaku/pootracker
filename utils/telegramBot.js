import { bot } from './../index.js';

export class Dialogue {
    constructor(message) {
        this.chatId = message.chat.id;
        this.state = 'idle';
    }

    processMessage(message) {
        try {
            const command = message.text;

            switch(this.state) {
            case 'idle':
                this.showMainMenu(message);
                break;
            case 'onMainMenu':
                this.handleMainMenuChoice(message);
                break;
            default:
                bot.sendMessage(this.chatId, 'Nothing here yet...');
            } 
        } catch (error) {
            console.log('Error processing message!', error);
        }
    }

    showMainMenu(idleMessage) {
        if (idleMessage.text !== '/go') {
            bot.sendMessage(this.chatId, 'Type /go to see main menu');
            return;
        }

        bot.sendMessage(this.chatId, 'What do you want?', {
            reply_markup: {
                keyboard: [['Add pools'], ['Remove pools'], ['View pool stats']],
                one_time_keyboard: true,
            },
        });

        this.state = 'onMainMenu';
    }

    handleMainMenuChoice(mainMenuChoice) {
        switch (mainMenuChoice.text.toLowerCase()) {
        case '/go':
            backToMainMenu(mainMenuChoice);
            break;
        case 'add pools':
            bot.sendMessage(this.chatId, 'You selected to add pools');
            break;
        case 'remove pools':
            bot.sendMessage(this.chatId, 'You selected to remove pools');
            break;
        case 'view pool stats':
            bot.sendMessage(this.chatId, 'You selected to view pool stats');
            break;
        default:
            bot.sendMessage(this.chatId, 'Select something normal');
        }
    }

    backtoMainMenu(backToMenuMessage) {
        this.state = 'idle';
        bot.sendMessage(this.chatId, 'Going bsck to main menu...');
        this.showMainMenu();
    }
}
