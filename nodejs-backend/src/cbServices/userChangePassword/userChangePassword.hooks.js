const {
    encryptResponse,
    decryptRequest,
    decryptResponse
} = require('../../utils/encryption');

// Rate limiting configuration
const RATE_LIMIT = {
    WINDOW: 15 * 60 * 1000,
    MAX_ATTEMPTS: 3
};

const checkRateLimit = async (context) => {
    const { data, params } = context;
    const ip =
        params.headers['x-forwarded-for'] || params.connection.remoteAddress;

    const existing = await context.service.find({
        query: {
            userEmail: data.userEmail,
            $sort: { createdAt: -1 },
            $limit: 1
        }
    });

    if (existing.total > 0) {
        const record = existing.data[0];
        const now = new Date();
        const timeSinceLastAttempt = now - new Date(record.createdAt);

        if (
            timeSinceLastAttempt < RATE_LIMIT.WINDOW &&
            record.sendEmailCounter >= RATE_LIMIT.MAX_ATTEMPTS
        ) {
            throw new Error(
                `Too many password reset attempts. Please wait ${Math.ceil(
                    (RATE_LIMIT.WINDOW - timeSinceLastAttempt) / 60000
                )} minutes before trying again.`
            );
        }
    }

    context.data = {
        ...context.data,
        ipAddress: ip,
        sendEmailCounter:
            existing.total > 0 ? existing.data[0].sendEmailCounter + 1 : 1
    };

    return context;
};

module.exports = {
    before: {
        all: [],
        find: [decryptRequest],
        get: [decryptRequest],
        create: [decryptRequest, checkRateLimit],
        update: [decryptRequest],
        patch: [decryptRequest],
        remove: []
    },
    after: {
        all: [encryptResponse],
        find: [decryptResponse, encryptResponse],
        get: [decryptResponse, encryptResponse],
        create: [encryptResponse],
        update: [encryptResponse],
        patch: [encryptResponse],
        remove: []
    },
    error: {
        all: [],
        find: [],
        get: [],
        create: [
            async (context) => {
                if (
                    context.error.message.includes(
                        'Too many password reset attempts'
                    )
                ) {
                    context.error.code = 429;
                }
                return context;
            }
        ],
        update: [],
        patch: [],
        remove: []
    }
};
