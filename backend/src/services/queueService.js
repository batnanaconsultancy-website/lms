const { Queue } = require('bullmq');
const Redis = require('ioredis');

const connection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null
});

const syncQueue = new Queue('sync-queue', { connection });

module.exports = { syncQueue, connection };
