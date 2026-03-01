const assert = require('assert');
const app = require('../../src/app');

let usersRefData = [
    {
        name: 'Standard User',
        email: 'standard@example.com',
        password: 'password'
    }
];

const usersService = app.service('users').Model;
const service = app.service('audits').Model;
const patch = {
    description: 'audits updated'
};
let testData = [];
let usersRefDataResults = [];

describe('audits service', () => {
    let results = [];
    it('registered the service', () => {
        assert.ok(service, 'Registered the service (audits)');
    });

    it('create multi ref users', async () => {
        usersRefDataResults = await usersService
            .create(usersRefData)
            .catch((err) => {
                console.error(err);
                throw err;
            });
        if (usersRefDataResults.length === 0)
            assert.fail('User creation failed!');
        assert.ok(
            usersService,
            `Created (${usersRefDataResults.length} users) success!`
        );
    });

    it('create audits data', async () => {
        const standardUser = await usersService.findOne({
            email: 'standard@example.com'
        });

        // create a object array of audits test schema model
        testData = [
            {
                serviceName: 'jobStationTickets',
                action: 'patch',
                details: JSON.stringify({
                    ticketId: '6822edf3e91deefc221e1077',
                    incomingRemarks: 'start work',
                    uploadOfPictureBeforeRepair: ['6822ef9ee91deefc221e19aa'],
                    status: 'In Progress'
                }),
                method: 'patch',
                createdBy: standardUser._id,
                updatedBy: standardUser._id
            }
        ];
        results = await service.create(testData).catch((err) => {
            console.error(err);
            throw err;
        });
        if (!results || results.length === 0)
            assert.fail('audits creation failed!');
        assert.ok(service, `Created (${results.length} audits) success!`);
    });

    it('verify audits creation', async () => {
        for (let i = 0; i < results.length; i++) {
            const exists = await service.findById(results[i]._id);
            assert.ok(exists, `userPhone ${results[i]} exists!`);
        }
    });

    it('patch audits', async () => {
        for (let i = 0; i < results.length; i++) {
            const patched = await service.findByIdAndUpdate(
                results[i]._id,
                patch,
                {
                    new: true
                }
            );
            assert.ok(patched, `audits ${patched} patched!`);
            assert.strictEqual(patched.type, patch.type);
        }
    });

    it('remove all audits test data', async () => {
        for (let i = 0; i < results.length; i++) {
            const removed = await service.findByIdAndDelete(results[i]._id);
            assert.ok(removed, `audits data ${results[i].number} removed!`);
        }
    });

    it('remove all user test data', async () => {
        for (let i = 0; i < usersRefDataResults.length; i++) {
            const removed = await usersService.findByIdAndDelete(
                usersRefDataResults[i]._id
            );
            assert.ok(
                removed,
                `User data ${usersRefDataResults[i].name} removed!`
            );
        }
    });
});
