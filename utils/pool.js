import { queryList } from './../data/queryList.json' assert { type: 'json' };

export class Pool {
    constructor(chain, address) {
        this.chain = chain;
        this.address = address;
    }
    
    async setInfo() {
        const response = await fetch(`https://api.dexscreener.com/latest/dex/pairs/${this.chain}/${this.address}`);
        const fetchedData = await response.json();

        this.dex = fetchedData.pair.dexId;
        this.url = fetchedData.pair.url;
        this.name = `${fetchedData.pair.baseToken.symbol}/${fetchedData.pair.quoteToken.symbol}`
    }
}