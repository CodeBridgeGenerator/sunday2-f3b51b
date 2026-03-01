const {
    encryptResponse,
    decryptRequest,
    decryptResponse
} = require('../../utils/encryption');

module.exports = {
    before: {
        all: [],
        find: [decryptRequest],
        get: [decryptRequest],
        create: [],
        update: [],
        patch: [],
        remove: []
    },
    after: {
        all: [],
        find: [decryptResponse, encryptResponse],
        get: [decryptResponse, encryptResponse],
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
