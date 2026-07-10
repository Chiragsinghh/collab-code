import { runQueue } from '../lib/queue.js';

export const execute = async (req, res) => {
  try {
    const { language, code } = req.body;
    if (!code) return res.status(400).json({ output: "❌ No code provided" });

    // Push to Queue
    const job = await runQueue.add('run-job', { language, code });

    res.json({
      jobId: job.id,
      status: 'queued',
      message: 'Job submitted to execution queue'
    });
  } catch (error) {
    res.status(500).json({ output: `❌ Error: ${error.message}` });
  }
};
