/*
pools: {
    {
        ethereum: [
            {
                // Those fields are not supposed to change
                address: '0x11950d141ecb863f01007add7d1a342041227b58',
                name: 'ETH/USDC',
                dex: 'uniswap',
                fee: 0.3,
            },
            {
                address: '0x99886a66926d6a6e9240a67225073926e5d0b02f',
                name: 'PEPE/ETH',
                dex: 'sushiswap',
                fee: 1,
            }
        ]
    }
}
*/

export function formatMessage(data) {
    let message = '';
    let index = 1;

    for (const entry of data) {
        const info = entry.pair;

        const pair = `${info.baseToken.symbol}/${info.quoteToken.symbol}`
            .replace('<', '&lt;')
            .replace('>', '&gt;')
            .replace('&', '&amp;');
        const chain = info.chainId;
        const dex = info.dexId;
        const tvl = info.liquidity.usd;
        const vol24 = info.volume.h24;
        const url = info.url;

        message += `${index++}: <a href="${url}">${pair}</a> on ${dex} (${chain}):\nTVL: ${Math.round(
            tvl
        )}\nVol: ${Math.round(vol24)}\n\n`;
    }

    return message;
}
