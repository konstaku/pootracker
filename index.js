'use strict';
import express from 'express';
////////////////////////////////
import TelegramBot from 'node-telegram-bot-api';
////////////////////////////////
// import { client } from './utils/db.js';
// import { bot } from './utils/telegramUserBot.js';

export const app = express();
const PORT = process.env.PORT || 3030;

async function main() {
    try {
        // Start server
        app.listen(PORT, () => {
            console.log(`Server started on port ${PORT}`);
        });
        // Activate bot
        const token = '6227440710:AAHX6WL8iob8IhCeL-7IiUJKS5GVl2Muow4';
        const bot = new TelegramBot(token);
        // Set webhook
        await bot.setWebHook('https://poo-tracker-test.onrender.com:443/webhook');
        // Handle webhook request
        app.use(express.json());
        app.post('/webhook', (req, res) => {
            const { body } = req;
            console.log('Message:', body);
            res.sendStatus(200);
        });
    } catch (err) {
        console.log('Error in main:', err);
    } finally {
        //    await client.close();
    }
}

main().catch(err => console.log(err));
