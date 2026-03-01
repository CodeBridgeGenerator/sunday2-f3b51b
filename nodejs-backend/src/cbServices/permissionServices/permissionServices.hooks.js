const { authenticate } = require('@feathersjs/authentication').hooks;
const {
    encryptResponse,
    decryptRequest,
    decryptResponse
} = require('../../utils/encryption');

const checkAdminAccess = async (context) => {
    const { app, params } = context;
    const userId = params.user._id;

    // Find the user's profile and check for admin/super roles
    const profiles = await app.service('profiles').find({
        query: {
            userId: userId,
            $populate: 'role'
        }
    });
    console.log('profiles', profiles);
    // Check if any profile has exactly admin or super role (case-sensitive exact match)
    const hasAdminAccess = profiles.data.some((profile) => {
        // Ensure role exists and has a name property
        if (!profile.role || !profile.role.name) return false;

        // Trim and exact match (case-sensitive)
        const roleName = profile.role.name.trim();
        console.log('roleName', roleName);
        return roleName === 'Admin' || roleName === 'Super';
    });

    if (!hasAdminAccess) {
        throw new Error('You do not have permission to access this resource');
    }

    return context;
};

module.exports = {
    before: {
        all: [authenticate('jwt')],
        find: [decryptRequest],
        get: [checkAdminAccess],
        create: [checkAdminAccess],
        update: [checkAdminAccess],
        patch: [checkAdminAccess],
        remove: [checkAdminAccess]
    },

    after: {
        all: [],
        find: [decryptResponse, encryptResponse],
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
