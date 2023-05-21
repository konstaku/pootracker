'use strict';
import express from 'express';
import TelegramBot from "node-telegram-bot-api";

const token = '6227440710:AAHX6WL8iob8IhCeL-7IiUJKS5GVl2Muow4';
const bot = new TelegramBot(token);

const PORT = process.env.PORT || 3030;
export const app = express();
app.use(express.json());

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
            const { body } = req;
            console.log('BODY:', body);
            // bot.sendMessage(body.chat.id, body);
            res.sendStatus(200);
        });
    } catch (err) {
        console.log('Error in main:', err);
    } finally {
        //    await client.close();
    }
}

main().catch(err => console.log(err));
