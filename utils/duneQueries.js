import queryList from './../data/queryList.json' assert { type: 'json' };

export async function enrichPoolData(pool) {
    // This function fetches the pool from database, fetches additional data from Dune (pool fee)
    // and updates the database entry

    // 1. Read pool from database

    // 2. Find pool in Dune dashboard, error if not found

    // 3. Update the pool object with fees fetched from Dune

    // 4. Write an updated pool data to database
}

/* 
Pool structure now:

[
  {
    _id: '5950535',
    pools: {
      ethereum: [ '0x11950d141ecb863f01007add7d1a342041227b58' ],
      optimism: [
        '0x99886a66926d6a6e9240a67225073926e5d0b02f',
        '0x17d99c78f1aa7870ab30fb3e93b2fe9f6502d192',
        '0xd26ffdde6c0daaabeb0a6806221c6b9fe7519bdf',
        '0x7b17fc02d85cb5589ec1d1c3db507dc557590c79',
        '0x6c5019d345ec05004a7e7b0623a91a0d9b8d590d'
      ],
      arbitrum: [ '0xd0851b56495db22610277de3788ae0d903526322' ],
      polygon: [ '0xcd353f79d9fade311fc3119b841e1f456b54e858' ],
      bsc: [ '0xa452d0c1cdefa3db2b628cb1ea75dc2dd611c5aa' ]
    }
  }
]

What I need to do: 

[
  {
    _id: '5950535',
    pools: {
      ethereum: [{
        address: '0x11950d141ecb863f01007add7d1a342041227b58',
        fees: null,
        name : '',
      }],
      optimism: [{
        address: '0x99886a66926d6a6e9240a67225073926e5d0b02f',
        fees: null,
        name : '',
      },
      {
        address: '0x17d99c78f1aa7870ab30fb3e93b2fe9f6502d192',
        fees: null,
        name : '',
      },
    ]
    }
  }
]

*/