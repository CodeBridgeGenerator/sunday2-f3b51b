const IORedis = require('ioredis');
const secureRedis = {
    maxRetriesPerRequest: null
    // host: 'host name',
    // port: 6379,
    //   password: null,
    //   tls: {
    //   ca: fs.readFileSync('LOCAL/PATH/TO/rackspace-ca-2016.pem')
    //   }
};

const redisClient = new IORedis(secureRedis);

redisClient.on('connect', () => {
    console.log('Connected to Redis');
});

redisClient.on('error', (err) => {
    console.error('Redis connection error:', err.message);
});

module.exports = redisClient;
