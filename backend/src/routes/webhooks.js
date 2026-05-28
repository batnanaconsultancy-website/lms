const express = require('express');
const r = express.Router();
const crypto = require('crypto');
const { syncQueue } = require('../services/queueService');

r.post('/github', async (req, res) => {
  const sig = req.headers['x-hub-signature-256'];
  if (!sig) return res.status(401).json({ error: 'Missing signature' });

  const digest = 'sha256=' + crypto
    .createHmac('sha256', process.env.GITHUB_WEBHOOK_SECRET)
    .update(req.body)
    .digest('hex');

  if (!crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(sig))) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  const event   = req.headers['x-github-event'];
  const payload = JSON.parse(req.body.toString());
  const repo    = payload.repository;
  if (!repo || !['push', 'pull_request'].includes(event)) {
    return res.json({ message: 'ignored' });
  }

  await syncQueue.add('sync-repo', {
    event,
    repoFullName: repo.full_name,
    repoCloneUrl: repo.clone_url,
    ref: payload.ref,
    headCommit: payload.head_commit,
  }, { attempts: 3, backoff: { type: 'exponential', delay: 1000 } });

  res.status(202).json({ queued: true });
});

module.exports = r;
