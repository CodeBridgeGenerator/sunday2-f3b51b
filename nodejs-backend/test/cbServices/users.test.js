const assert = require('assert');
const app = require('../../src/app');

const userData = [
    {
        name: 'Super User',
        email: 'super@example.com',
        password: 'password'
    },
    {
        name: 'Standard User',
        email: 'standard@example.com',
        password: 'password'
    },
    {
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'password'
    },
    {
        name: 'Developer User',
        email: 'developer@example.com',
        password: 'password'
    },
    {
        name: 'External User',
        email: 'external@example.com',
        password: 'password'
    }
];

describe("'users' service", () => {
    const service = app.service('users');
    let usersRefDataResults = [];

    it('registered the service', () => {
        assert.ok(service, 'Registered the service (users service)');
    });

    it('create multi users', async () => {
        usersRefDataResults = await service.create(userData).catch(assert.fail);
        assert.ok(
            service,
            `Created (${usersRefDataResults.total} users) success!`
        );
        assert.ok(
            usersRefDataResults,
            `Created (${usersRefDataResults.total} users) success!`
        );
    });

    it('verify user creation', async () => {
        for (let i = 0; i < usersRefDataResults.length; i++) {
            const exists = await service.find({
                query: { email: usersRefDataResults[i].email }
            });
            assert.ok(
                exists,
                `User email ${usersRefDataResults[i].email} exists!`
            );
        }
    });

    it('patch users', async () => {
        for (let i = 0; i < usersRefDataResults.length; i++) {
            const patched = await service.patch(usersRefDataResults[i]._id, {
                name: usersRefDataResults[i].name + '_patched'
            });
            assert.ok(
                patched,
                `User email ${usersRefDataResults[i].email} patched!`
            );
        }
    });

    it('remove all test data', async () => {
        for (let i = 0; i < usersRefDataResults.length; i++) {
            const removed = await service.remove(usersRefDataResults[i]._id);
            assert.ok(
                removed,
                `User with email ${usersRefDataResults[i].email} removed!`
            );
        }
    });
});
