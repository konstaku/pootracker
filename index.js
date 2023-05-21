'use strict';
import express from 'express';
import { bot } from './utils/telegramBot.js';

export const app = express();
const PORT = process.env.PORT || 3030;

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
