import client from '../services/restClient';

const initState = {
    user: {},
    isLoggedIn: false
};

export const auth = {
    state: {
        ...initState
    },
    reducers: {
        // handle state changes with pure functions
        update(state, newState) {
            return { ...state, ...newState };
        }
    },
    effects: (dispatch) => ({
        //////////////////
        //// GET USER ////
        //////////////////
        async getUser(_, reduxState) {
            return new Promise((resolve, reject) => {
                const { user } = reduxState.auth;
                client
                    .service('users')
                    .get(user._id)
                    .then((_user) => {
                        this.update({ user: _user });
                        resolve();
                    })
                    .catch((error) => {
                        console.log('Failed to get user', { error });
                        dispatch.toast.alert({
                            type: 'error',
                            title: 'Get user',
                            message: error.message || 'Failed to get user'
                        });
                        reject(error);
                    });
            });
        },
        ///////////////
        //// LOGIN //// using feathers rest client
        ///////////////
        async login(data, reduxState) {
            return new Promise((resolve, reject) => {
                dispatch.loading.show();
                client
                    .authenticate({
                        ...data,
                        strategy: 'local'
                    })
                    .then((loginResponse) => {
                        if (!loginResponse?.user?.status) {
                            this.update({ isLoggedIn: false });
                            dispatch.toast.alert({
                                type: 'error',
                                message: 'Invalid Login.'
                            });
                            resolve(loginResponse);
                        } else {
                            // await _setLoginEmail(data.email, loginResponse?.accessToken);
                            this.update({ isLoggedIn: true, user: loginResponse.user });
                            resolve(loginResponse);
                        }
                    })
                    .catch((error) => {
                        console.debug('error', { error });
                        reject(error);
                    })
                    .finally(() => dispatch.loading.hide());
            });
        },
        //////////////////////////
        //// LOGIN FOR O AUTH ////
        //////////////////////////
        async loginForOAuth(data, reduxState) {
            return new Promise((resolve, reject) => {
                dispatch.loading.show();
                client
                    .authenticate({
                        ...data,
                        strategy: 'local'
                    })
                    .then((loginResponse) => {
                        this.update({ isLoggedIn: true, user: loginResponse.user });
                        resolve();
                    })
                    .catch((error) => {
                        reject(error);
                    })
                    .finally(() => dispatch.loading.hide());
            });
        },
        /////////////////////////
        //// RE-AUTHENTICATE ////
        /////////////////////////
        // async reAuth(data, reduxState) {
        //   // Skip reAuth if we're already on login page
        //   if (window.location.pathname === '/login') {
        //     return Promise.resolve();
        //   }

        //   return new Promise((resolve, reject) => {
        //     dispatch.loading.show();
        //     client
        //       .reAuthenticate()
        //       .then((loginResponse) => {
        //         if (loginResponse?.user?.status) {
        //           this.update({ isLoggedIn: true, user: loginResponse.user });
        //           resolve();
        //         } else {
        //           this.update({ isLoggedIn: false });
        //           reject(new Error("Login denied"));
        //         }
        //       })
        //       .catch((error) => {
        //         this.update({ isLoggedIn: false });
        //         // Don't redirect here - let the global handler do it
        //         reject(error);
        //       })
        //       .finally(() => dispatch.loading.hide());
        //   });
        // },
        async reAuth(data, reduxState) {
            return new Promise((resolve, reject) => {
                dispatch.loading.show();
                client
                    .reAuthenticate()
                    .then((loginResponse) => {
                        if (!loginResponse?.user?.status) {
                            this.update({ isLoggedIn: false, user: loginResponse.user });
                            dispatch.toast.alert({
                                type: 'error',
                                message: 'login was denied, please contact admin.'
                            });
                        } else if (loginResponse?.user?.status) {
                            this.update({ isLoggedIn: true, user: loginResponse.user });
                            // await _setLoginEmail(loginResponse?.user?.email, loginResponse?.accessToken);
                        }
                        resolve();
                    })
                    .catch((error) => {
                        console.debug('error', { error });
                        //dispatch.toast.alert({ type: 'error', message: error.message || 'Failed to reAuthenticate!' });
                        reject(error);
                    })
                    .finally(() => {
                        dispatch.loading.hide();
                    });
            });
        },
        ////////////////
        //// LOGOUT ////
        ////////////////
        async logout(_, reduxState) {
            dispatch.loading.show();
            const { user } = reduxState.auth;
            await client
                .logout()
                .then(async () => {
                    dispatch.toast.alert({
                        title: 'Authenticator',
                        type: 'success',
                        message: `${user?.name} logged out!`
                    });
                    this.update(initState);
                })
                .catch((error) => {
                    console.debug('error', { error });
                    dispatch.toast.alert({
                        type: 'error',
                        message: error.message || 'Failed to logout!'
                    });
                    this.update(initState);
                });
            window.localStorage.clear();
            window.sessionStorage.clear();
            dispatch.loading.hide();
        },

        //////////////////////
        //// CREATE USER /////
        //////////////////////
        async createUser(data, reduxState) {
            return new Promise((resolve, reject) => {
                dispatch.loading.show();
                client
                    .service('users')
                    .create(data)
                    .then(() => {
                        dispatch.toast.alert({
                            type: 'success',
                            title: 'Sign Up',
                            message: 'Successful'
                        });
                        resolve();
                    })
                    .catch((error) => {
                        console.debug('error', { error });
                        dispatch.toast.alert({
                            type: 'error',
                            title: 'Sign Up',
                            message: error.message || 'Failed to sign up'
                        });
                        reject(error);
                    })
                    .finally(() => dispatch.loading.hide());
            });
        },
        ///////////////////////////////
        //// CREATE USER FOR O AUTH ////
        ////////////////////////////////
        async createUserForOauth(data, reduxState) {
            return new Promise((resolve, reject) => {
                dispatch.loading.show();

                client
                    .service('users')
                    .create(data)
                    .then((results) => {
                        const userProfileData = {
                            userId: results._id,
                            imageUrl: data.imageUrl,
                            uId: data.uId,
                            provider: data.provider
                        };
                    })
                    .catch((error) => {
                        console.debug('error', { error });
                        dispatch.toast.alert({
                            type: 'error',
                            title: 'create User For Oauth',
                            message: error.message || 'Failed to sign up'
                        });
                    });

                client
                    .service('usersProfile')
                    .create(userProfileData)
                    .then(() => {
                        dispatch.toast.alert({
                            type: 'success',
                            title: 'Sign Up',
                            message: 'Successful'
                        });
                        resolve();
                    })
                    .catch((error) => {
                        console.debug('error', { error });
                        dispatch.toast.alert({
                            type: 'error',
                            title: 'Sign Up',
                            message: 'You are already signed in!'
                        });
                        reject(error);
                    })
                    .finally(() => dispatch.loading.hide());
            });
        },
        ////////////////////
        //// PATCH USER ////
        ////////////////////
        async patchUser({ _id, data }, reduxState) {
            return new Promise((resolve, reject) => {
                if (!_id) {
                    dispatch.toast.alert({
                        type: 'error',
                        message: 'User id is required'
                    });
                    reject('User id is required');
                    return;
                }
                console.debug(_id, data);
                client
                    .service('users')
                    .patch(_id, data)
                    .then((user) => {
                        console.debug(user);
                        this.update({ user });
                        dispatch.toast.alert({
                            type: 'success',
                            title: 'Password Reset',
                            message: 'Successful'
                        });
                        resolve(user);
                    })
                    .catch((e) => {
                        console.debug('errrrrrr>>>>>', e);
                        dispatch.toast.alert({
                            type: 'error',
                            title: 'Password Reset',
                            message: 'Failed' + e
                        });
                        reject(e);
                    });
            });
        },
        /////////////////////////
        //// CHANGE PASSWORD ////
        /////////////////////////
        async changeUserPassword({ oldPassword, newPassword }, reduxState) {
            return new Promise((resolve, reject) => {
                dispatch.loading.show();
                client
                    .service('users')
                    .patch(reduxState.auth.user._id, {
                        oldPassword,
                        newPassword,
                        changePassword: true,
                        clientName: 'codebridge-website'
                    })
                    .then((res) => {
                        dispatch.toast.alert({
                            type: 'success',
                            title: 'Password',
                            message: 'User password updated successfully!'
                        });
                        resolve();
                    })
                    .catch((err) => {
                        console.debug('Failed to update user password', err);
                        dispatch.toast.alert({
                            type: 'error',
                            title: 'Password',
                            message: err.message || 'Failed to update user password'
                        });
                        this.update({
                            passwordPolicyErrors: Array.isArray(err.data) ? err.data : []
                        });
                        reject(err);
                    });

                dispatch.loading.hide();
            });
        }
    })
};
