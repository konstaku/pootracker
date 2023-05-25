import { bot } from './../index.js';
import { Pool } from './pool.js';
import networks from './../data/networks.json' assert { type: 'json' };
import { formatMessage } from './format.js';
import {
    addPoolToDatabase,
    removePoolFromDatabase,
    retrievePoolsFromDatabase,
} from './db.js';

export class Dialogue {
    constructor(message) {
        this.chatId = message.chat.id;
        this.state = 'idle';
    }

    processMessage(message) {
        try {
            if (message.text === '/go' || message.text === '/cancel') {
                if (this.pool) {
                    this.pool = null;
                }

                this.backToMainMenu(message);
                return;
            }

            switch (this.state) {
                case 'idle':
                    this.showMainMenu(message);
                    break;
                case 'onMainMenu':
                    this.handleMainMenuChoice(message);
                    break;
                case 'selectChainToAddPool':
                    this.enterAddressToAddPoolForSelectedChain(message);
                    break;
                case 'enterPoolAddressToAdd':
                    this.addPoolForSelectedChain(message);
                    break;
                case 'selectChainToRemovePool':
                    this.pickAddressToRemovePoolForSelectedChain(message);
                    break;
                case 'pickPoolAddressToRemove':
                    this.removePoolForSelectedChain(message);
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
                keyboard: [
                    ['Add pools'],
                    ['Remove pools'],
                    ['View pool stats'],
                ],
                one_time_keyboard: true,
            },
        });

        this.state = 'onMainMenu';
    }

    handleMainMenuChoice(mainMenuChoice) {
        switch (mainMenuChoice.text.toLowerCase()) {
            case 'add pools':
                bot.sendMessage(this.chatId, 'You selected to add pools');
                this.showAddPoolMenu();
                break;
            case 'remove pools':
                bot.sendMessage(this.chatId, 'You selected to remove pools');
                this.showRemovePoolsMenu();
                break;
            case 'view pool stats':
                bot.sendMessage(this.chatId, 'You selected to view pool stats');
                this.viewPools();
                break;
            default:
                bot.sendMessage(this.chatId, 'Select something normal');
        }
    }

    backToMainMenu(backToMenuMessage) {
        this.state = 'idle';
        this.showMainMenu(backToMenuMessage);
    }

    showAddPoolMenu() {
        bot.sendMessage(this.chatId, 'Select a blockchain to add pool', {
            reply_markup: {
                keyboard: [networks],
                one_time_keyboard: true,
            },
        });

        this.state = 'selectChainToAddPool';
    }

    enterAddressToAddPoolForSelectedChain(selectedChainMesage) {
        this.state = 'enterPoolAddressToAdd';
        const selectedChain = selectedChainMesage.text;

        if (!networks.includes(selectedChain)) {
            bot.sendMessage(this.chatId, 'Invalid chain, try again!');
            return;
        }

        this.pool = new Pool(selectedChain, null);

        bot.sendMessage(this.chatId, 'Enter a hex pool address to add or /cancel to abort');
    }

    async addPoolForSelectedChain(addressToAdd) {
        this.state = 'addingPoolToDatabase';

        if (!this.pool) {
            bot.sendMessage(this.chatId, 'Error: pool not created');
        }

        const address = addressToAdd.text;
        this.pool.address = address;

        const record = {
            id: this.chatId.toString(),
            chain: this.pool.chain,
            address: this.pool.address,
        }

        await addPoolToDatabase(record);

        bot.sendMessage(this.chatId, 'Pool added successfully!');

        this.state = 'idle';
        this.pool = null;
    }

    async showRemovePoolsMenu() {
        const userPools = await retrievePoolsFromDatabase(
            this.chatId.toString()
        );
        const nonEmptyPools = Object.keys(userPools).filter(
            key => Array.isArray(userPools[key]) && userPools[key].length > 0
        );

        bot.sendMessage(this.chatId, 'Select blockchain:', {
            reply_markup: {
                keyboard: [nonEmptyPools],
                one_time_keyboard: true,
            },
        });

        this.state = 'selectChainToRemovePool';
    }

    async pickAddressToRemovePoolForSelectedChain(selectedChainMesage) {
        this.state = 'pickPoolAddressToRemove';
        const selectedChain = selectedChainMesage.text;

        this.pool = new Pool(selectedChain, null);

        if (!networks.includes(selectedChain)) {
            bot.sendMessage(this.chatId, 'Invalid chain, try again!');
            return;
        }

        const poolAddresses = await retrievePoolsFromDatabase(this.chatId.toString());

        bot.sendMessage(this.chatId, 'Pick a pool to remove:', {
            reply_markup: {
                keyboard: [poolAddresses[selectedChain]],
                one_time_keyboard: true,
            },
        });
    }

    async removePoolForSelectedChain(removePoolMessage) {
        this.pool.address = removePoolMessage.text;

        const record = {
            id: this.chatId.toString(),
            chain: this.pool.chain,
            address: this.pool.address,
        };

        await removePoolFromDatabase(record);
        bot.sendMessage(this.chatId, 'Pool removed!');

        this.pool = null;
        this.state = 'idle';
    }

    async viewPools() {
        this.state = 'viewPools';

        const userPools = await retrievePoolsFromDatabase(
            this.chatId.toString()
        );
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

        bot.sendMessage(this.chatId, message, {
            parse_mode: 'HTML',
            disable_web_page_preview: true,
        });

        this.state = 'idle';
    }
}
