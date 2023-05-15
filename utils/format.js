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
