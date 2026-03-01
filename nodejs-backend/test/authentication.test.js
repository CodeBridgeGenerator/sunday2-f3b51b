const assert = require('assert');
const app = require('../src/app');

describe('authentication', () => {
    it('registered the authentication service', () => {
        assert.ok(app.service('authentication'));
    });

    describe('local strategy', () => {
        const userInfo = {
            name: `Test User-${Date.now().toString()}`,
            email: 'someone@example.com',
            password: 'supersecret'
        };

        const usersService = app.service('users');

        before(async () => {
            try {
                const existingUsers = await usersService.find({
                    query: { email: userInfo.email }
                });
                const data = existingUsers.data || existingUsers;
                await Promise.all(
                    data.map((user) => usersService.remove(user.id || user._id))
                );
            } catch (error) {
                // Ignore errors during cleanup (e.g. if DB is not ready or empty)
            }
            await app.service('users').create(userInfo);
        });

        it('authenticates user and creates accessToken', async () => {
            const { user, accessToken } = await app
                .service('authentication')
                .create({
                    strategy: 'local',
                    ...userInfo,
                    test: true
                });

            assert.ok(accessToken, 'Created access token for user');
            assert.ok(user, 'Includes user in authentication data');

            const removed = await usersService.remove(user._id);
            assert.ok(removed, `User with email ${user.email} removed!`);
        });
    });
});
