import { dbPool } from "../src/database/connection";
import { redisClient } from "../src/config/redis";
import { logger } from "../src/utils/logger";

// Ensure Jest types are available
/// <reference types="jest" />

// TEST DATABASE SETUP
beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    process.env.DB_NAME = 'base_test';

    try {
        await dbPool.connect();
        await redisClient.connect();
        logger.info('Test database connected'); 
    } catch (error) {
        logger.error('Test setup failed:', error); 
    }
});

afterAll(async () => {
    // CLEAN UP CONNECTIONS
    await dbPool.end();
    await redisClient.quit(); 
});

// CLEAN UP BETWEEN TESTS
afterEach(async () => {
    const client = await dbPool.connect();
    try {
        // CLEAN TEST DATA
        await client.query('DELETE FROM webhook_events');
        await client.query('DELETE FROM settlement_payments');
        await client.query('DELETE FROM settlements');
        await client.query('DELETE FROM transactions');
        await client.query('DELETE FROM payments');
        await client.query('DELETE FROM merchants WHERE email LIKE \'%test%\'');
    } finally {
        client.release(); 
    }
});