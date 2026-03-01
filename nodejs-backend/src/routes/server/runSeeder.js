const config = require('../../resources/config.json');
const _ = require('lodash');

async function runSeeder(request, response) {
    try {
        let services = _.get(config, 'services');
        let promises = [];
        const adminUserData = await getAdminUser(request.appInstance);

        if (Array.isArray(services) && !_.isEmpty(services)) {
            services.forEach(async (service) => {
                const exists = await checkIfDataExist(
                    service.serviceName,
                    request.appInstance
                );
                if (
                    Array.isArray(service.seeder) &&
                    !_.isEmpty(service.seeder) &&
                    !exists
                ) {
                    console.log(service.serviceName);
                    const updatedData = service.seeder.map((item) => ({
                        ...item,
                        createdBy: adminUserData[0]._id,
                        updatedBy: adminUserData[0]._id
                    }));

                    const promise = request.appInstance
                        .service(service.serviceName)
                        .Model.create(updatedData)
                        .catch(console.error);
                    if (promises.length === 0) promises = [promise];
                    else promises.push(promise);
                }
            });
        }

        if (Array.isArray(promises) && !_.isEmpty(promises)) {
            const results = await Promise.all(promises);
            return response
                .status(200)
                .json({ status: true, message: 'success', results });
        } else {
            return response
                .status(200)
                .json({ status: false, message: 'promises empty' });
        }
    } catch (error) {
        console.log('end error');
        return response
            .status(500)
            .json({ status: false, message: 'failure', error });
    }
}

const checkIfDataExist = async (serviceName, app) => {
    try {
        const results = await app.service(serviceName).Model.find().limit(1);
        return Array.isArray(results) && !_.isEmpty(results) ? true : false;
    } catch (err) {
        console.error(err);
    }
};

const getAdminUser = async (app) => {
    try {
        const results = await app.service('users').Model.find().limit(1);
        return Array.isArray(results) && !_.isEmpty(results) ? results : [];
    } catch (err) {
        console.error(err);
    }
};
module.exports = runSeeder;
