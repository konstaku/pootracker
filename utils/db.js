'use strict';
import { users } from './../index.js';

export async function addPoolToDatabase(record) {
    try {
        const { id, chain, address } = record;
        // Check if user already exists
        const userExists = await users.findOne({ _id: id });
        if (!userExists) {
            const newUser = await users.insertOne({
                _id: id,
                pools: {
                    ethereum: [],
                    arbitrum: [],
                    optimism: [],
                    polygon: [],
                    bsc: [],
                },
            });

            console.log(`Added ${newUser} to database`);
        }

        // Check if the element already exists
        const document = await users.findOne({
            _id: id,
            [`pools.${chain}`]: address,
        });
        // If yes, return message
        if (document) {
            console.log('This record already exists!');
        }
        // If not, add the element
        else {
            console.log('record:', record);
            console.log('users:', users);
            console.log(`*** Pushing ${address} to ${chain} for ${id}`);
            const result = await users.updateOne(
                { _id: id },
                { $push: { [`pools.${chain}`]: { 'address': address, 'fees': null } } }
            );
            console.log(`Added ${result.modifiedCount} pool ${address} to ${chain}`);
        }
    } catch (e) {
        console.log('Error adding pool!', e);
    }
}

export async function removePoolFromDatabase(record) {
    const { id, chain, address } = record;

    console.log(`
        Removing pool for ${id}
        on chain ${chain}
        address ${address}
    `);

    // Check if the element already exists
    const document = await users.findOne({ _id: id, [`pools.${chain}`]: {'address': address } });
    // If not, return message
    if (!document) {
        console.log('No such pool!');
    }
    // If yes, remove the element
    else {
        const result = await users.updateOne(
            { _id: id },
            { $pull: { [`pools.${chain}`]: { address: address } } }
        );
        console.log(`Removed ${result.modifiedCount} pool from ${chain}`);
    }
}

export async function retrievePoolsFromDatabase(id) {
    // Retrieve all data for the user and return their pools
    const result = await users.findOne({ _id: id });
    return result.pools;
}
