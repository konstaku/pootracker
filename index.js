'use strict';
import express from 'express';
import TelegramBot from "node-telegram-bot-api";
import { Dialogue } from './utils/telegramBot.js';

const token = '6227440710:AAHX6WL8iob8IhCeL-7IiUJKS5GVl2Muow4';
export const bot = new TelegramBot(token);

const PORT = process.env.PORT || 3030;
const app = express();
app.use(express.json());

const dialogues = [];

async function main() {
    try {
        // Start server
        app.listen(PORT, () => {
            console.log(`Server started on port ${PORT}`);
        });
        // Run a bot
        await bot.setWebHook('https://poo-tracker-test.onrender.com:443/webhook');
        // Handle webhook
        app.post('/webhook', (req, res) => {
            // const { body } = req;
            const message = req.body.message;
            let dialogue;

            if (!dialogues.some(dialogue => dialogue.id === message.chat.id)) {
                dialogue = new Dialogue(message);
                dialogues.push(dialogue);
                bot.sendMessage(dialogue.chatId, 'New dialogue created!');
            } else {
                dialogue = dialogues.find(dialogue => dialogue.id === message.chat.id);
                bot.sendMessage(dialogue.chatId, 'Dialogue found!');
            }

            bot.sendMessage(message.chat.id, `Dialogue: ${dialogue.chatId}\nStage: ${dialogue.currentStage}`);
            res.sendStatus(200);
        });
    } catch (err) {
        console.log('Error in main:', err);
    } finally {
        //    await client.close();
    }
}

main().catch(err => console.log(err));
