import queryList from './../data/queryList.json' assert { type: 'json' };

const DUNE_API_KEY = 'kZIqqNfNNSBa7pMkbjgdTzM3UAO7qNaP';

export async function fetchPoolFees(pool) {
    // Go to Dune results and fetch data regarding pool fees
    const { chain, address } = pool;
    const queryId = queryList[chain];

    let fees = 0;

    try {
        const response = await fetch(`https://api.dune.com/api/v1/query/${queryId}/results?api_key=${DUNE_API_KEY}`);
        const data = await response.json();
        const pool = data.result.rows.filter(el => el['address'] === address);
        fees = pool.fees;
    } catch (error) {
        console.log(error);
    }

    return fees;
}