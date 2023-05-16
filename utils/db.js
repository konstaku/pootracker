'use strict';
import { MongoClient } from 'mongodb';

const uri =
    'mongodb+srv://konstaku:TXcJq3R8GTYF83e7@juicy-pools.9xlzavj.mongodb.net/?retryWrites=true&w=majority';
export const client = new MongoClient(uri);

// Start database connection
const database = client.db('juicy_pools_testing');
const users = database.collection('users');

export async function addPoolToDatabase(record) {
    try {
        const { id, chain, pool } = record;
        // Check if user already exists
        const userExists = await users.findOne({ _id: id });
        if (!userExists) {
            const newUser = await users.insertOne({
                _id: id,
                pools: {
                    ethereum: [],
                    optimism: [],
                    arbitrum: [],
                    polygon: [],
                    bsc: [],
                },
            });

            console.log(`Added ${newUser} to database`);
        }

        // Check if the element already exists
        const document = await users.findOne({
            _id: id,
            [`pools.${chain}`]: pool,
        });
        // If yes, return message
        if (document) {
            console.log('This record already exists!');
        }
        // If not, add the element
        else {
            console.log('record:', record);
            console.log('users:', users);
            const result = await users.updateOne(
                { _id: id },
                { $push: { [`pools.${chain}`]: pool } }
            );
            console.log(`Added ${result.modifiedCount} pool to ${chain}`);
        }
    } catch (e) {
        console.log('Error adding pool!', e);
    }
}

export async function removePoolFromDatabase(record) {
    const { id, chain, pool } = record;

    // Check if the element already exists
    const document = await users.findOne({ _id: id, [`pools.${chain}`]: pool });
    // If not, return message
    if (!document) {
        console.log('No such pool!');
    }
    // If yes, remove the element
    else {
        const result = await users.updateOne(
            { _id: id },
            { $pull: { [`pools.${chain}`]: pool } }
        );
        console.log(`Removed ${result.modifiedCount} pool from ${chain}`);
    }
}

export async function retrievePoolsFromDatabase(id) {
    // Retrieve all data for the user and return their pools
    const result = await users.findOne({ _id: id });
    return result.pools;
}
