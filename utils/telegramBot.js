import TelegramBot from "node-telegram-bot-api";
import { app } from "./../main.js";

const token = '6227440710:AAHX6WL8iob8IhCeL-7IiUJKS5GVl2Muow4';
export const bot = new TelegramBot(token);

await bot.setWebHook('https://poo-tracker-test.onrender.com:443/webhook');

app.use(express.json());
app.post('/webhook', (req, res) => {
    const { body } = req;
    bot.sendMessage(body.chat.id, body);
    res.sendStatus(200);
});
