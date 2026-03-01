// src/services/users/users.hooks.js
const { authenticate } = require('@feathersjs/authentication').hooks;
const { hashPassword, protect } =
    require('@feathersjs/authentication-local').hooks;
const { iff, isProvider } = require('feathers-hooks-common');

module.exports = {
    before: {
        all: [],
        find: [
            iff(isProvider('external'), async (context) => {
                if (context.params.query && context.params.query.email) {
                    context.params.query = {
                        ...context.params.query,
                        $select: [
                            '_id',
                            'email',
                            'failedLoginAttempts',
                            'accountLockedUntil'
                        ]
                    };
                    return context;
                }
                if (!context.params.authentication) {
                    throw new Error('Not authenticated');
                }
                await authenticate('jwt')(context);
            })
        ],
        get: [authenticate('jwt')],
        create: [hashPassword('password')],
        update: [authenticate('jwt'), hashPassword('password')],
        patch: [
            iff(
                isProvider('external'),
                authenticate('jwt'),
                async (context) => {
                    // Allow updating failed attempts without requiring password
                    if (
                        context.data.failedLoginAttempts !== undefined ||
                        context.data.accountLockedUntil !== undefined
                    ) {
                        delete context.params.provider;
                        return context;
                    }
                    // Otherwise require password hashing
                    return hashPassword('password')(context);
                }
            )
        ],
        remove: [authenticate('jwt')]
    },

    after: {
        all: [protect('password')],
        find: [],
        get: [],
        create: [],
        update: [],
        patch: [],
        remove: []
    },

    error: {
        all: [],
        find: [],
        get: [],
        create: [],
        update: [],
        patch: [],
        remove: []
    }
};
