const { Worker } = require('bullmq');
const { connection } = require('./queueService');
const { emit } = require('./socketService');
const { query } = require('../db');
const logger = require('../utils/logger');

function startWorkers() {
  const worker = new Worker('sync-queue', async (job) => {
    const { repoFullName, headCommit } = job.data;
    logger.info(`Syncing repo: ${repoFullName}`);

    // Update sync status in DB
    await query(
      `UPDATE github_repos SET sync_status='syncing', last_synced_at=NOW() WHERE repo_full_name=$1`,
      [repoFullName]
    );
    emit(`repo:${repoFullName}`, 'sync:started', { repoFullName });

    // Simulate sync (in production: git fetch + reset)
    await new Promise(r => setTimeout(r, 500));

    await query(
      `UPDATE github_repos SET sync_status='synced', last_commit_hash=$1, last_synced_at=NOW() WHERE repo_full_name=$2`,
      [headCommit?.id || null, repoFullName]
    );

    emit(`repo:${repoFullName}`, 'sync:completed', { repoFullName, headCommit });
    logger.info(`Sync complete: ${repoFullName}`);
  }, { connection, concurrency: 5 });

  worker.on('failed', (job, err) => {
    logger.error(`Job failed ${job?.id}:`, err.message);
    if (job?.data?.repoFullName) {
      query(`UPDATE github_repos SET sync_status='error' WHERE repo_full_name=$1`,
        [job.data.repoFullName]).catch(() => {});
      emit(`repo:${job.data.repoFullName}`, 'sync:failed', { error: err.message });
    }
  });

  logger.info('BullMQ workers started');
}

module.exports = { startWorkers };
