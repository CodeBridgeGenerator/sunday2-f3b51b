const { Service } = require('feathers-mongoose');
const FindService = require('../../utils/abstracts/FindService');
const MixedService = FindService(Service);

exports.Users = class Users extends MixedService {
    async find(params) {
        // Convert email to lowercase if it exists in query
        if (params.query && params.query.email) {
            params.query.email = params.query.email.toLowerCase();
        }
        return super.find(params);
    }
};
