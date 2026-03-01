const IORedis = require('ioredis');

const localRedis = { maxRetriesPerRequest: null };

const redisClient = new IORedis(localRedis);

redisClient.on('connect', () => {
    console.log('Connected to Redis');
});

redisClient.on('error', (err) => {
    console.error('Redis connection error:', err.message);
});

module.exports = redisClient;
