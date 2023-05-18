'use strict';
import TelegramBot from 'node-telegram-bot-api';
import networks from './../data/networks.json' assert { type: 'json' };
import {
    addPoolToDatabase,
    removePoolFromDatabase,
    retrievePoolsFromDatabase,
} from './db.js';
import { formatMessage } from './format.js';
import { Pool } from './pool.js'

import dotenv from 'dotenv';
dotenv.config();

const token = process.env.TELEGRAM_BOT_TOKEN;

export const bot = new TelegramBot(token);

if (bot.isPolling()) {
    console.log('Bot is polling');
    bot.stopPolling();
    console.log('Stopped polling');
} else {
    bot.startPolling();
    console.log('Started polling');
}

bot.onText(/\/go/, async mainMenuChoice => {
    const chatId = mainMenuChoice.chat.id;

    bot.sendMessage(chatId, 'What do you want?', {
        reply_markup: {
            keyboard: [['Add pools'], ['Remove pools'], ['View pool stats']],
            one_time_keyboard: true,
        },
    });

    bot.once('message', handleMenuChoice);
});

async function handleMenuChoice(mainMenuChoice) {
    const chatId = mainMenuChoice.chat.id;
    const userChoice = mainMenuChoice.text.toLowerCase();

    switch (userChoice) {
        case 'add pools':
            addPoolsHandler(mainMenuChoice);
            break;
        case 'remove pools':
            removePoolsHandler(mainMenuChoice);
            break;
        case 'view pool stats':
            viewPoolStatsHandler(mainMenuChoice);
            break;
        default:
            bot.sendMessage(chatId, 'Not a valid choice, try again');
    }
}

async function addPoolsHandler(mainMenuChoice) {
    const chatId = mainMenuChoice.chat.id;

    bot.sendMessage(chatId, 'Pick a chain or /cancel to go to main menu', {
        reply_markup: {
            keyboard: [networks],
            one_time_keyboard: true,
        },
    });

    bot.once('message', selectChainMessage => {
        if (selectChainMessage.text === '/cancel') {
            bot.sendMessage(chatId, 'Operation cancelled!', {
                reply_markup: {
                    remove_keyboard: true,
                }
            });
            return;
        }

        if (networks.includes(selectChainMessage.text)) {
            addPool(selectChainMessage);
        } else {
            bot.sendMessage(chatId, `Not a valid choice: \nYour choice: ${selectChainMessage.text}\nNetworks: ${networks}`);
            handleMenuChoice(mainMenuChoice);
        }
    });
}

async function removePoolsHandler(mainMenuChoice) {
    const chatId = mainMenuChoice.chat.id;

    const userPools = await retrievePoolsFromDatabase(chatId.toString());
    const nonEmptyPools = Object.keys(userPools).filter(
        key => Array.isArray(userPools[key]) && userPools[key].length > 0
    );

    bot.sendMessage(chatId, 'Pick a chain, or type /cancel to go back to main menu', {
        reply_markup: {
            keyboard: [nonEmptyPools],
            one_time_keyboard: true,
        },
    });

    bot.once('message', selectChainMessage => {
        if (selectChainMessage.text === '/cancel') {
            bot.sendMessage(chatId, 'Operation cancelled!', {
                reply_markup: {
                    remove_keyboard: true,
                }
            });

            return;
        }

        if (nonEmptyPools.includes(selectChainMessage.text)) {
            removePool(selectChainMessage);
        } else {
            bot.sendMessage(chatId, `Not a valid choice: \nyour choice: ${selectChainMessage.text}\nNetworks: ${nonEmptyPools}`);
            handleMenuChoice(mainMenuChoice);
        }
    });
}

async function viewPoolStatsHandler(mainMenuChoice) {
    const chatId = mainMenuChoice.chat.id;

    const userPools = await retrievePoolsFromDatabase(chatId.toString());
    const fetchData = Object.entries(userPools).flatMap(
        ([chain, pools]) => {
            return pools.map(pool => ({ chain, pool }));
        }
    );

    const promises = fetchData.map(el =>
        fetch(
            `https://api.dexscreener.com/latest/dex/pairs/${el.chain}/${el.pool}`
        )
    );
    const responses = await Promise.all(promises);
    const data = await Promise.all(responses.map(el => el.json()));

    const message = formatMessage(data);

    bot.sendMessage(chatId, message, {
        parse_mode: 'HTML',
        disable_web_page_preview: true,
    });
}

async function addPool(addPoolMessage) {
    const chatId = addPoolMessage.chat.id;
    const chain = addPoolMessage.text;

    bot.sendMessage(chatId, 'Enter pool address or /cancel to go back to main menu');

    bot.once('message', async selectAddressMessage => {
        if (selectAddressMessage.text === '/cancel') {
            bot.sendMessage(chatId, 'Operation cancelled!', {
                reply_markup: {
                    remove_keyboard: true,
                }
            });
            return;
        }
        if (!isValidEthereumAddress(selectAddressMessage.text)) {
            bot.sendMessage(chatId, 'Not a valid address. Send the hex pool address, i.e. 0x1234...890');
            addPool(addPoolMessage);
        } else {
            const pool = new Pool(chain, selectAddressMessage.text);
            pool.setInfo();
            
            const record = {
                id: chatId.toString(),
                chain: chain,
                pool: selectAddressMessage.text,
            };
    
            await addPoolToDatabase(record);
            bot.sendMessage(chatId, 'Pool added!');
        }
    });
}

async function removePool(removePoolMessage) {
    const chatId = removePoolMessage.chat.id;
    const chain = removePoolMessage.text;

    const poolAddresses = await retrievePoolsFromDatabase(chatId.toString());
    console.log(`Pools to delete on ${chain}`, poolAddresses[chain]);

    bot.sendMessage(chatId, 'Select pool address or type /cancel to go back to main menu', {
        reply_markup: {
            keyboard: [poolAddresses[chain]],
            one_time_keyboard: true,
        },
    });

    bot.once('message', async selectAddressMessage => {
        if (selectAddressMessage.text === '/cancel') {
            bot.sendMessage(chatId, 'Operation cancelled!', {
                reply_markup: {
                    remove_keyboard: true,
                }
            });
            return;
        }

        if (poolAddresses[chain].includes(selectAddressMessage.text)) {
            const record = {
                id: chatId.toString(),
                chain: chain,
                pool: selectAddressMessage.text,
            };
    
            await removePoolFromDatabase(record);
            bot.sendMessage(chatId, `Pool removed!`);
        } else {
            bot.sendMessage(chatId, `Not a valid choice, try again`);
            removePool(removePoolMessage);
        }
    });
}

function isValidEthereumAddress(address) {
    // Remove 0x prefix if present
    if (address.startsWith("0x")) {
      address = address.slice(2);
    }
    // Check if the address is a 40-character hexadecimal string
    const regex = /^[0-9a-fA-F]{40}$/;
    return regex.test(address);
  }
