'use strict';
import express from 'express';
import { client } from './utils/db.js';
import { bot } from './utils/telegramUserBot.js';

export const app = express();
const PORT = process.env.PORT || 3030;

app.use(express.json());

app.post('/webhook', (req, res) => {
    const { message } = req;
    // handleRequest(message);
    console.log('Message:', message);
    res.sendStatus(200);
});

async function main() {
    try {
        // Start server
        app.listen(PORT, () => {
            console.log(`Server started on port ${PORT}`);
        });
    } catch (err) {
        console.log('Error in main:', err);
    } finally {
        //    await client.close();
    }
}

main().catch(err => console.log(err));
