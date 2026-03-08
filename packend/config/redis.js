import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

redis.on('connect', () => {
  console.log('✅ Connected to Redis Cloud');
});

redis.on('error', (err) => {
  console.error('❌ Redis connection error:', err);
  console.log('this is the Rides', process.env.REDIS_URL);
});

export default redis;
