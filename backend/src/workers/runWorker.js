import { Worker } from '../lib/queue.js';
import { runCodeLocal } from '../services/runnerService.js';

// We need a way to emit logs to the specific room/socket.
// Since the worker might run in a separate process/container in production,
// usually we publish events to Redis Pub/Sub, and the Socket Server subscribes.
// For this MVP, assuming Monolith, we can try to access IO if exported, 
// OR simpler: Worker publishes progress to Queue events, and Socket Server listens to Queue events.

// Let's use the Queue Events approach in the Socket Handler, 
// but here we just process.

export const initWorker = (io) => {
    const worker = new Worker('run-queue', async (job) => {
        const { language, code } = job.data;

        console.log(`👷 Processing Job ${job.id} (${language})`);

        // Callback to stream logs
        const onLog = (text) => {
            // Emitting to room via IO instance passed during init
            // We need a way to map Job -> Room? 
            // The frontend should probably wait for 'jobId' events.
            // Let's emit to "job:{jobId}" channel
            io.emit(`run:output:${job.id}`, { output: text });
        };

        try {
            const result = await runCodeLocal(language, code, onLog);
            return result;
        } catch (err) {
            console.error(`Job ${job.id} failed:`, err);
            onLog(`\n❌ System Error: ${err.message}`);
            throw err;
        }
    }, { connection: null });

    worker.on('completed', (job, result) => {
        console.log(`✅ Job ${job.id} completed`);
        io.emit(`run:output:${job.id}`, { output: "\n✅ Execution Finished" });
    });

    worker.on('failed', (job, err) => {
        console.log(`❌ Job ${job.id} failed: ${err.message}`);
        io.emit(`run:output:${job.id}`, { output: `\n❌ Failed: ${err.message}` });
    });

    console.log("👷 Execution Worker Started");
    return worker;
};
