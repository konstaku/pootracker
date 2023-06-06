import queryList from './../data/queryList.json' assert { type: 'json' };

const DUNE_API_KEY = 'kZIqqNfNNSBa7pMkbjgdTzM3UAO7qNaP';

export async function fetchPoolFees(pool) {
    // Go to Dune results and fetch data regarding pool fees
    const { chain, address } = pool;
    const queryId = queryList[chain];

    let fees = 0;

    try {
        console.log('Fetching data for pool', pool, 'queryId =', queryId);

        const response = await fetch(`https://api.dune.com/api/v1/query/${queryId}/results?api_key=${DUNE_API_KEY}`);
        const data = await response.json();

        console.log('Fetched data:', data);

        const fetchedPool = data.result.rows.filter(el => el['address'] === address);

        console.log(`Fetching pool fees for pool ${pool}`);

        fees = fetchedPool[0].fees / 10000;
    } catch (error) {
        console.log('Error fetching fees for pool', error);
    }

    return fees;
}