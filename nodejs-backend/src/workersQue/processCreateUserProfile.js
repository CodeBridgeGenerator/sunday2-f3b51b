const { Queue, Worker } = require('bullmq');
const connection = require('../cbServices/redis/config');
const { decryptData } = require('../utils/encryption');
const jobQueue = new Queue('createUserProfile', {
    connection
});

const createUserProfileInDB = async (app, superAdmin, data) => {
    // Validate data
    if (!data.email || !data._id) {
        console.error('[createUserProfile] Invalid job data, skipping:', data);
        return;
    }

    if (superAdmin === data.email) {
        // Super Admin: Single profile with "Super" role and "Admin" position
        const userAdminRole = await app
            .service('roles')
            .find({ query: { name: 'Super' } });
        const userAdminPosition = await app
            .service('positions')
            .find({ query: { name: 'Super' } });

        await app.service('profiles').create({
            name: `${data.name} - Super`,
            userId: data._id,
            role: userAdminRole.data[0]._id,
            position: userAdminPosition.data[0]._id
        });
    } else {
        // Regular User: Fetch userInvites and decrypt response
        let userInviteResponse;
        try {
            userInviteResponse = await app.service('userInvites').find({
                query: { emailToInvite: data.email }
            });
            console.debug(
                '[createUserProfile] userInviteResponse:',
                JSON.stringify(userInviteResponse, null, 2)
            );
        } catch (error) {
            console.error(
                '[createUserProfile] Error fetching userInvites:',
                error.message
            );
            userInviteResponse = { data: [] }; // Fallback to empty data
        }

        // Handle encrypted response
        let userInviteData = [];
        if (userInviteResponse.encrypted) {
            try {
                console.debug(
                    '[createUserProfile] Decrypting userInviteResponse.encrypted:',
                    userInviteResponse.encrypted
                );
                const decrypted = decryptData(app, userInviteResponse.encrypted);
                // Handle paginated response or direct array
                userInviteData = Array.isArray(decrypted)
                    ? decrypted
                    : Array.isArray(decrypted.data)
                      ? decrypted.data
                      : [decrypted];
                console.debug(
                    '[createUserProfile] Decrypted userInvite data:',
                    JSON.stringify(userInviteData, null, 2)
                );
            } catch (error) {
                console.error(
                    '[createUserProfile] Decryption error:',
                    error.message,
                    error.stack
                );
                userInviteData = [];
            }
        } else if (
            userInviteResponse.data &&
            Array.isArray(userInviteResponse.data)
        ) {
            userInviteData = userInviteResponse.data;
            if (userInviteData.length > 0 && userInviteData[0].encrypted) {
                try {
                    console.debug(
                        '[createUserProfile] Decrypting userInviteResponse.data[0].encrypted:',
                        userInviteData[0].encrypted
                    );
                    userInviteData = [decryptData(userInviteData[0].encrypted)];
                    console.debug(
                        '[createUserProfile] Decrypted userInvite data:',
                        JSON.stringify(userInviteData, null, 2)
                    );
                } catch (error) {
                    console.error(
                        '[createUserProfile] Decryption error for data[0]:',
                        error.message,
                        error.stack
                    );
                    userInviteData = [];
                }
            }
        } else {
            console.warn(
                '[createUserProfile] Unexpected userInviteResponse format:',
                JSON.stringify(userInviteResponse, null, 2)
            );
        }

        // Validate email match
        if (
            userInviteData.length > 0 &&
            userInviteData[0].emailToInvite !== data.email
        ) {
            console.warn(
                '[createUserProfile] Email mismatch in userInviteData:',
                userInviteData[0].emailToInvite,
                'expected:',
                data.email
            );
            userInviteData = [];
        }

        if (userInviteData.length > 0) {
            const {
                roles = [],
                positions = [],
                company,
                branch
            } = userInviteData[0];
            console.debug('[createUserProfile] Using userInviteData:', {
                roles,
                positions,
                company,
                branch
            });

            // If roles and positions are available, create profiles for each position
            if (positions.length > 0) {
                for (const positionId of positions) {
                    // Get position details (including name)
                    const position = await app
                        .service('positions')
                        .get(positionId);

                    // Get role ID (use corresponding role or default)
                    let roleId = roles[positions.indexOf(positionId)];
                    if (!roleId) {
                        const defaultRole = await app
                            .service('roles')
                            .find({ query: { isDefault: true } });
                        roleId = defaultRole.data[0]._id;
                    }

                    // Create profile
                    await app.service('profiles').create({
                        name: `${data.name} - ${position.name}`,
                        userId: data._id,
                        role: roleId,
                        position: positionId,
                        ...(company && { company }),
                        ...(branch && { branch })
                    });
                }
            } else {
                // No positions: Use default role/position
                console.debug(
                    '[createUserProfile] No positions in userInviteData, using defaults'
                );
                const defaultRole = await app
                    .service('roles')
                    .find({ query: { isDefault: true } });
                const defaultPosition = await app
                    .service('positions')
                    .find({ query: { isDefault: true } });

                await app.service('profiles').create({
                    name: `${data.name} - ${defaultPosition.data[0].name}`,
                    userId: data._id,
                    role: defaultRole.data[0]._id,
                    position: defaultPosition.data[0]._id,
                    ...(company && { company }),
                    ...(branch && { branch })
                });
            }
        } else {
            // No userInvites: Use default role/position
            console.debug(
                '[createUserProfile] No valid userInviteData, using defaults'
            );
            const defaultRole = await app
                .service('roles')
                .find({ query: { isDefault: true } });
            const defaultPosition = await app
                .service('positions')
                .find({ query: { isDefault: true } });

            await app.service('profiles').create({
                name: `${data.name} - ${defaultPosition.data[0].name}`,
                userId: data._id,
                role: defaultRole.data[0]._id,
                position: defaultPosition.data[0]._id
            });
        }
    }
};

// Create and export the worker
const createUserProfile = (app) => {
    const superAdmin = 'menakamohan1999@gmail.com';
    const worker = new Worker(
        'createUserProfile',
        async (job) => {
            const { data } = job;
            if (Array.isArray(data)) {
                for (const item of data) {
                    await createUserProfileInDB(app, superAdmin, item);
                }
            } else {
                await createUserProfileInDB(app, superAdmin, data);
            }
        },
        { connection }
    );

    // Event listeners for worker
    worker.on('completed', (job) => {
        console.debug(
            `[createUserProfile] Job ${job.id} completed successfully`
        );
        if (job.data && job.data.email) {
            if (Array.isArray(job.data)) {
                job.data.forEach((data) => {
                    if (!data.email) return; // Skip invalid data
                    const _mail = {
                        name: 'on_new_user_welcome_email',
                        type: 'firstimelogin',
                        from: process.env.MAIL_USERNAME,
                        recipients: [data.email],
                        data: {
                            name: data.name || 'User',
                            projectLabel: process.env.PROJECT_LABEL
                                ? process.env.PROJECT_LABEL
                                : process.env.PROJECT_NAME
                        },
                        status: true,
                        subject: 'First Time Login',
                        templateId: 'onWelcomeEmail'
                    };
                    app.service('mailQues').create(_mail);
                });
            } else {
                const _mail = {
                    name: 'on_new_user_welcome_email',
                    type: 'firstimelogin',
                    from: process.env.MAIL_USERNAME,
                    recipients: [job.data.email],
                    data: {
                        name: job.data.name || 'User',
                        projectLabel: process.env.PROJECT_LABEL
                            ? process.env.PROJECT_LABEL
                            : process.env.PROJECT_NAME
                    },
                    status: true,
                    subject: 'First Time Login',
                    templateId: 'onWelcomeEmail'
                };
                app.service('mailQues').create(_mail);
            }
        } else {
            console.debug(
                `[createUserProfile] Job ${job.id} skipped: Invalid or missing email in data`
            );
        }
    });

    worker.on('failed', async (job, err) => {
        console.error(
            `[createUserProfile] Job ${job.id} failed with error: ${err.message}`
        );
        if (job.data && job.data.email) {
            if (Array.isArray(job.data)) {
                job.data.forEach((data) => {
                    if (!data.email) return; // Skip invalid data
                    const _mail = {
                        name: 'on_send_welcome_email',
                        type: 'userInvitationOnCreateOnLoginQues',
                        from: process.env.MAIL_USERNAME,
                        recipients: [superAdmin],
                        status: false,
                        data: {
                            ...data,
                            projectLabel:
                                process.env.PROJECT_LABEL ??
                                process.env.PROJECT_NAME
                        },
                        subject: 'Login processing failed',
                        templateId: 'onError',
                        errorMessage: err.message
                    };
                    app.service('mailQues').create(_mail);
                });
            } else {
                const _mail = {
                    name: 'on_send_welcome_email',
                    type: 'userInvitationOnCreateOnLoginQues',
                    from: process.env.MAIL_USERNAME,
                    recipients: [superAdmin],
                    status: false,
                    data: {
                        ...job.data,
                        projectLabel:
                            process.env.PROJECT_LABEL ??
                            process.env.PROJECT_NAME
                    },
                    subject: 'Login processing failed',
                    templateId: 'onError',
                    errorMessage: err.message,
                    hook: job.data.hook ?? null
                };
                app.service('mailQues').create(_mail);
            }
        } else {
            console.error(
                `[createUserProfile] Job ${job.id} failed: Invalid or missing email in data`
            );
        }
        if (err.message.includes('job stalled more than allowable limit')) {
            await job.remove().catch((err) => {
                console.error(
                    `[createUserProfile] Job ${job.id} remove error: ${err.message}, ${err.stack}`
                );
            });
        }
    });

    const userService = app.service('users');
    userService.hooks({
        after: {
            create: async (context) => {
                const { result } = context;
                if (
                    typeof result.hook === 'undefined' &&
                    result.email &&
                    result._id
                ) {
                    await jobQueue.add('createUserProfile', result);
                }
                return context;
            }
        }
    });
};

module.exports = { createUserProfile };
