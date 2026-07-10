import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';

class MockQueue {
    constructor(name) {
        this.name = name;
    }

    async add(jobName, data) {
        const jobId = uuidv4();
        const job = { id: jobId, data };
        
        // Notify any active workers asynchronously
        setImmediate(() => {
            MockWorker.triggerJob(this.name, job);
        });

        return job;
    }
}

class MockWorker extends EventEmitter {
    static workers = new Map();

    constructor(queueName, processor) {
        super();
        this.queueName = queueName;
        this.processor = processor;
        
        if (!MockWorker.workers.has(queueName)) {
            MockWorker.workers.set(queueName, []);
        }
        MockWorker.workers.get(queueName).push(this);
    }

    static async triggerJob(queueName, job) {
        const workers = MockWorker.workers.get(queueName);
        if (!workers || workers.length === 0) {
            console.warn(`No worker registered for queue: ${queueName}`);
            return;
        }
        // Round robin or pick first
        const worker = workers[0];
        try {
            const result = await worker.processor(job);
            worker.emit('completed', job, result);
        } catch (err) {
            worker.emit('failed', job, err);
        }
    }
}

export const runQueue = new MockQueue('run-queue');
export const redisConnection = null;
export { MockQueue as Queue, MockWorker as Worker };
