const IORedis = require('ioredis');
const dockerRedis = {
    maxRetriesPerRequest: null,
    host: 'redis',
    port: 6379
};
const redisClient = new IORedis(dockerRedis);
redisClient.on('connect', () => {
    console.log('Connected to Redis');
});

redisClient.on('error', (err) => {
    console.error('Redis connection error:', err.message);
});

module.exports = redisClient;
