const { Queue, Worker } = require('bullmq');
const connection = require('../cbServices/redis/config');
const sendFCM = require('../routes/fcm/sendFCM');

// Create and export the job queue
const jobQueue = new Queue('fcmQueue', { connection });

// Create and export the worker
const createFCMQueWorker = (app) => {
    const worker = new Worker(
        'fcmQueue',
        async (job) => {
            console.debug(job.data.payload);

            // write code here
            try {
                const result = await sendFCM(job.data.payload);
                if (!result.isSuccess) throw Error('Fcm error.');
            } catch (error) {
                console.error(error);
            }
        },
        { connection }
    );

    // Event listeners for worker
    worker.on('completed', (job) => {
        console.debug(`JobQue ${job.id} completed successfully`);
    });

    worker.on('failed', async (job, err) => {
        console.error(`JobQue ${job.id} failed with error ${err.message}`);
        if (job.data) {
            const _mail = {
                name: job.data.name.replaceAll(' ', '_').replace('=>', ''),
                type: 'fcm',
                data: { data: JSON.stringify(job.data) },
                from: 'info@cloudbasha.com',
                recipients: ['info@cloudbasha.com'],
                status: true,
                subject: 'fcm processing',
                templateId: 'onError'
            };
            app.service('mailQues').create(_mail);
        } else {
            console.error(`Job error and ${job.data} data not found`);
        }
        if (err.message === 'job stalled more than allowable limit') {
            await job.remove().catch((err) => {
                console.error(
                    `jobId: ${job.id} ,  remove error : ${err.message} , ${err.stack}`
                );
            });
        }
    });

    const fcmQuesService = app.service('fcmQues');
    fcmQuesService.hooks({
        after: {
            create: async (context) => {
                const { result } = context;
                await jobQueue.add('fcmQue', result);
                return context;
            }
        }
    });
};

module.exports = { createFCMQueWorker };
