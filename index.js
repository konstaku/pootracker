'use strict';
import express from 'express';

import * as telegramBot from './utils/telegramBot.js';

const PORT = process.env.PORT || 3030;
export const app = express();
app.use(express.json());

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
