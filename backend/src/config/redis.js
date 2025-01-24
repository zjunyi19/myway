const Redis = require('ioredis');

const redisClient = new Redis({
    port: process.env.REDIS_PORT,    
    host: process.env.REDIS_HOST,   
    username: process.env.REDIS_USERNAME, 
    password: process.env.REDIS_PASSWORD,
    db: 0,     
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));
redisClient.on('connect', () => console.log('Connected to Redis'));

module.exports = redisClient; 