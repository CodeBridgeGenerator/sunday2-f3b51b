const { Queue, Worker } = require('bullmq');
const connection = require('../cbServices/redis/config');
const sendMailService = require('../cbServices/nodeMailer/sendMailService');
const { decryptData } = require('../utils/encryption');
const mailQues = new Queue('mailQues', { connection });

const createChangeForgotPasswordQueWorker = (app) => {
    const superAdmin = '~cb-user-email~';
    const worker = new Worker(
        'mailQues',
        async (job) => {
            // Decrypt job.data if encrypted
            let jobData = job.data;
            if (jobData.encrypted) {
                try {
                    console.debug(
                        '[mailQues] Decrypting job.data.encrypted:',
                        jobData.encrypted
                    );
                    jobData = decryptData(app, jobData.encrypted);
                    console.debug(
                        '[mailQues] Decrypted job.data:',
                        JSON.stringify(jobData, null, 2)
                    );
                } catch (error) {
                    console.error(
                        '[mailQues] Decryption error:',
                        error.message,
                        error.stack
                    );
                    throw new Error(
                        `Failed to decrypt job.data: ${error.message}`
                    );
                }
            }

            // Validate job data
            if (!jobData._id) {
                console.error(
                    '[mailQues] Missing _id in job.data:',
                    JSON.stringify(jobData, null, 2)
                );
                throw new Error('Missing _id in job.data');
            }

            let subject = '';
            let body = '';
            let contentHTML = '';

            if (jobData.content) {
                body = jobData.content;
                contentHTML = jobData.content;
                subject = jobData.subject || 'No Subject';
            } else if (jobData.templateId) {
                const template = await app
                    .service('templates')
                    .find({ query: { name: jobData.templateId } });

                if (!template.data.length) {
                    throw new Error(
                        `Template ${jobData.templateId} not found, please create.`
                    );
                }

                const templateContent = template.data[0];
                if (typeof templateContent === 'undefined') {
                    throw new Error(
                        `Email template not found => ${jobData.templateId}`
                    );
                }

                subject = templateContent.subject;
                body = templateContent.body;
                contentHTML = body;
            } else {
                throw new Error(
                    "Either 'content' or 'templateId' must be provided in the job data."
                );
            }

            if (jobData.data) {
                Object.entries(jobData.data).forEach(([key, value]) => {
                    subject = subject.replace(`{{${key}}}`, value);
                    contentHTML = contentHTML.replace(`{{${key}}}`, value);
                });
            }

            // Convert base64 attachments to Buffer for nodemailer
            const attachments = (jobData.attachments || []).map(
                (attachment) => ({
                    filename: attachment.filename,
                    content: Buffer.from(attachment.content, 'base64'),
                    contentType: attachment.contentType
                })
            );

            // Patch mailQues with content
            try {
                await app.service('mailQues').patch(jobData._id, {
                    jobId: job.id,
                    content: contentHTML
                });
            } catch (error) {
                console.error(
                    '[mailQues] Failed to patch mailQues:',
                    error.message,
                    error.stack
                );
                if (error.name === 'NotFound') {
                    console.warn(
                        '[mailQues] Skipping patch: No record found for id',
                        jobData._id
                    );
                } else {
                    throw error;
                }
            }

            try {
                await sendMailService(
                    jobData.name,
                    jobData.from,
                    jobData.recipients,
                    subject,
                    body,
                    contentHTML,
                    attachments,
                    []
                );
            } catch (error) {
                console.error(
                    '[mailQues] Email sending failed:',
                    error.message,
                    error.stack
                );
                throw error;
            }
        },
        { connection }
    );

    worker.on('completed', (job) => {
        console.debug(`[mailQues] Mail ${job.id} completed successfully`);
        if (job.data && job.data._id) {
            app.service('mailQues')
                .patch(job.data._id, {
                    jobId: job.id,
                    end: new Date(),
                    status: true
                })
                .catch((error) => {
                    console.error(
                        '[mailQues] Failed to patch on completion:',
                        error.message,
                        error.stack
                    );
                    if (error.name === 'NotFound') {
                        console.warn(
                            '[mailQues] Skipping completion patch: No record found for id',
                            job.data._id
                        );
                    }
                });
        }
    });

    worker.on('failed', async (job, err) => {
        console.error(
            `[mailQues] Mail ${job.id} failed with error:`,
            err.message
        );
        if (job.data && job.data._id) {
            app.service('mailQues')
                .patch(job.data._id, {
                    jobId: job.id,
                    end: new Date(),
                    data: { ...job.data },
                    errorMessage: err.message,
                    status: false
                })
                .catch((error) => {
                    console.error(
                        '[mailQues] Failed to patch on failure:',
                        error.message,
                        error.stack
                    );
                    if (error.name === 'NotFound') {
                        console.warn(
                            '[mailQues] Skipping failure patch: No record found for id',
                            job.data._id
                        );
                    }
                });

            job.data['errors'] = err.message;
            job.data['project'] = process.env.PROJECT_NAME;
            job.data['env'] = process.env.ENV;

            await sendMailService(
                job.data.name,
                job.data.from,
                [superAdmin],
                `Failed - ${err.message}`,
                err.message,
                `<p><pre><code>${JSON.stringify(job.data, null, 4)}</code></pre></p>`,
                []
            );
        }
    });

    worker.on('error', (err) => {
        console.error('[mailQues] Worker error:', err.message, err.stack);
    });

    const mailQuesService = app.service('mailQues');
    mailQuesService.hooks({
        after: {
            create: async (context) => {
                let { result } = context;
                console.debug(
                    '[mailQues] Original result:',
                    JSON.stringify(result, null, 2)
                );

                // Decrypt result if encrypted
                if (result && result.encrypted) {
                    console.debug(
                        '[mailQues] Decrypting result:',
                        result.encrypted
                    );
                    result = decryptData(result.encrypted);
                    console.debug(
                        '[mailQues] Decrypted result:',
                        JSON.stringify(result, null, 2)
                    );
                }

                console.debug(
                    '[mailQues] Adding job to queue:',
                    JSON.stringify(result, null, 2)
                );
                if (
                    Array.isArray(result.recipients) &&
                    result.recipients.length > 0
                ) {
                    if (typeof result.hook === 'undefined') {
                        await mailQues.add('mailQues', result);
                    }
                } else {
                    console.warn(
                        '[mailQues] Skipping queue addition: No valid recipients found'
                    );
                }
                return context;
            }
        }
    });
};

module.exports = { createChangeForgotPasswordQueWorker };
