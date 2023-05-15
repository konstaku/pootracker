'use strict';
import TelegramBot from 'node-telegram-bot-api';
import networks from './../data/networks.json' assert { type: 'json' };
import {
    addPoolToDatabase,
    removePoolFromDatabase,
    retrievePoolsFromDatabase,
} from './db.js';
import { formatMessage} from './format.js';

const token = '6272930700:AAHwYpqBoXPWpA_apNoBABptdQ-asNfLAQM';
export const bot = new TelegramBot(token, { polling: true });

bot.onText(/\/go/, async msg => {
    const chatId = msg.chat.id;
    console.log('message:', msg);
    console.log('chatId:', chatId);

    bot.sendMessage(chatId, 'What do you want?', {
        reply_markup: {
            keyboard: [['Add pools'], ['Remove pools'], ['View pool stats']],
            one_time_keyboard: true,
        },
    });

    bot.once('message', handleMenuChioce);
});

async function handleMenuChioce(msg) {
    const chatId = msg.chat.id;
    const text = msg.text;
    const pools = networks;

    if (text.toLowerCase() == 'add pools') {
        console.log(networks);

        bot.sendMessage(chatId, 'Pick a chain', {
            reply_markup: {
                keyboard: [pools],
                one_time_keyboard: true,
            },
        });

        bot.once('message', addPool);
    }

    if (text.toLowerCase() == 'remove pools') {
        const userPools = await retrievePoolsFromDatabase(chatId.toString());
        console.log('User pools:', userPools);
        const nonEmptyPools = Object.keys(userPools).filter(
            key => Array.isArray(userPools[key]) && userPools[key].length > 0
        );
        console.log('Pools to remove:', nonEmptyPools);

        bot.sendMessage(chatId, 'Pick a chain', {
            reply_markup: {
                keyboard: [nonEmptyPools],
                one_time_keyboard: true,
            },
        });

        bot.once('message', removePool);
    }

    if (text.toLowerCase() == 'view pool stats') {
        const userPools = await retrievePoolsFromDatabase(chatId.toString());
        const fetchData = Object.entries(userPools).flatMap(([chain, pools]) => {
            return pools.map(pool => ({ chain, pool }));
        });
        console.log('fetchData:', fetchData);

        const promises = fetchData.map(el => fetch(`https://api.dexscreener.com/latest/dex/pairs/${el.chain}/${el.pool}`));
        const responses = await Promise.all(promises);
        const data = await Promise.all(responses.map(el => el.json()));

        for (const entry of data) {
            console.log(entry);
        }

        const message = formatMessage(data);

        bot.sendMessage(chatId, message, {
            parse_mode: 'HTML',
            disable_web_page_preview: true,
        });
    }
}

async function addPool(msg) {
    const chatId = msg.chat.id;
    const chain = msg.text;

    bot.sendMessage(chatId, 'Enter pool address');
    bot.once('message', async msg => {
        const record = {
            id: chatId.toString(),
            chain: chain,
            pool: msg.text,
        };

        await addPoolToDatabase(record);
        bot.sendMessage(chatId, 'Pool added!');
    });
}

async function removePool(msg) {
    const chatId = msg.chat.id;
    const chain = msg.text;

    const poolAddresses = await retrievePoolsFromDatabase(chatId.toString());
    console.log(`Pools to delete on ${chain}`, poolAddresses[chain]);

    bot.sendMessage(chatId, 'Select pool address', {
        reply_markup: {
            keyboard: [poolAddresses[chain]],
            one_time_keyboard: true,
        },
    });

    bot.once('message', async msg => {
        const record = {
            id: chatId.toString(),
            chain: chain,
            pool: msg.text,
        };

        await removePoolFromDatabase(record);
        bot.sendMessage(chatId, `Pool removed!`);
    });
}
