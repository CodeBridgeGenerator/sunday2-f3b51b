// src/authentication/local-strategy.js
const { LocalStrategy } = require('@feathersjs/authentication-local');
const { NotAuthenticated } = require('@feathersjs/errors');

class CustomLocalStrategy extends LocalStrategy {
    async authenticate(authentication, params) {
        const { email } = authentication;
        const userService = this.app.service('users');

        try {
            // Find user by email (case insensitive)
            const users = await userService.find({
                query: {
                    email: email,
                    $limit: 1
                },
                paginate: false
            });

            if (users.length === 0) {
                throw new NotAuthenticated('Invalid login credentials');
            }

            const user = users[0];

            // Check if account is locked
            if (
                user.accountLockedUntil &&
                user.accountLockedUntil > new Date()
            ) {
                const remainingTime = Math.ceil(
                    (user.accountLockedUntil - new Date()) / (60 * 1000)
                );
                throw new NotAuthenticated(
                    `Account locked. Try again in ${remainingTime} minutes.`
                );
            }

            // Verify password
            const result = await super.authenticate(authentication, params);

            // Reset failed attempts on successful login
            if (user.failedLoginAttempts > 0) {
                await userService.patch(user._id, {
                    failedLoginAttempts: 0,
                    accountLockedUntil: null
                });
            }

            return result;
        } catch (error) {
            // Only handle invalid credentials errors
            if (
                error.name === 'NotAuthenticated' &&
                error.message.includes('Invalid login')
            ) {
                try {
                    // Find user again to ensure we have latest data
                    const users = await userService.find({
                        query: {
                            email: email.toLowerCase(),
                            $limit: 1
                        },
                        paginate: false
                    });

                    if (users.length > 0) {
                        const user = users[0];
                        const attempts = (user.failedLoginAttempts || 0) + 1;
                        const MAX_ATTEMPTS = 5;
                        const LOCK_TIME = 15 * 60 * 1000; // 15 minutes

                        const updateData = {
                            failedLoginAttempts: attempts
                        };

                        // Lock account if max attempts reached
                        if (attempts >= MAX_ATTEMPTS) {
                            updateData.accountLockedUntil = new Date(
                                Date.now() + LOCK_TIME
                            );
                        }

                        // Update user with new attempt count
                        await userService.patch(user._id, updateData);

                        // Prepare error message
                        let message = 'Invalid login credentials';
                        if (attempts >= MAX_ATTEMPTS) {
                            message = `Account locked due to too many failed attempts. Please try again in ${LOCK_TIME / (60 * 1000)} minutes.`;
                        } else {
                            message += ` (${MAX_ATTEMPTS - attempts} attempts remaining)`;
                        }

                        throw new NotAuthenticated(message);
                    }
                } catch (updateError) {
                    console.error(
                        'Failed to update login attempts:',
                        updateError
                    );
                }
            }

            // Re-throw other errors
            throw error;
        }
    }
}

module.exports = CustomLocalStrategy;
