import client from '../services/restClient';

export const user = {
    state: {
        profile: {},
        selectedUser: {}
    }, // initial state
    reducers: {
        update(state, newState) {
            return { ...state, ...newState };
        },
        selectUser(state, user) {
            let toReturn = { ...state, selectedUser: user };
            return toReturn;
        }
    },
    effects: (dispatch) => ({
        ///////////////////////////
        //// GET ONE User ////
        ///////////////////////////
        getOneUser(_id, reduxState) {
            return new Promise((resolve, reject) => {
                if (reduxState.user.selectedUser?._id === _id) {
                    resolve(reduxState.user.selectedUser);
                    return;
                }
                client
                    .service('users')
                    .get(_id)
                    .then((res) => {
                        this.selectUser(res);
                        resolve(res);
                    })
                    .catch((error) => {
                        console.debug('Failed to get user', error);
                        dispatch.toast.alert({
                            type: 'error',
                            title: 'User',
                            message: 'Failed to get user'
                        });
                        reject(error);
                    });
            });
        },
        setOneUser(_id, reduxState) {
            if (reduxState.user.selectedUser?._id === _id) {
                return;
            }
            client
                .service('users')
                .get(_id)
                .then((res) => {
                    this.selectUser(res);
                })
                .catch((error) => {
                    console.debug('Failed to set User', error);
                    dispatch.toast.alert({
                        type: 'error',
                        title: 'User',
                        message: 'Failed to set user'
                    });
                });
        },
        async setProfile(_, reduxState) {
            const user = reduxState.auth.user;
            const { data } = await client.service('userInvites').find({
                query: {
                    emailToInvite: user.email,
                    $populate: [
                        {
                            path: 'position',
                            service: 'positions',
                            select: ['name']
                        },
                        {
                            path: 'role',
                            service: 'roles',
                            select: ['name']
                        }
                    ]
                }
            });
            const userInvite = data[0];
            const positionExtId = '66e678d947480b243fc573fb';
            const positionExtName = 'External User';
            const roleExtId = '67435a2c6521f76d8ac46f30';
            const roleExtName = 'Ext';

            const positionName = userInvite?.position?.name ? userInvite?.position?.name : positionExtName;
            const roleName = userInvite?.role?.name ? userInvite?.role?.name : roleExtName;

            const profile = {
                userId: user._id,
                name: `${user.name} ${positionName} ${roleName}`,
                position: userInvite?.position?._id ?? positionExtId,
                role: userInvite?.role?._id ?? roleExtId,
                company: userInvite?.company ?? null,
                branch: userInvite?.branch ?? null,
                department: userInvite?.department ?? null,
                section: userInvite.section ?? null
            };

            this.update({ profile: profile });
            return profile;
        },
        createProfileAfterLogin(_, reduxState) {
            this.setProfile().then((data) => {
                const user = reduxState.auth.user;
                console.log(data);
                client
                    .service('profiles')
                    .find({ query: { userId: user._id } })
                    .then((res) => {
                        if (res.total === 0) {
                            try {
                                client.service('profiles').create(this.profile);
                            } catch (error) {
                                console.debug('Failed to create profile', error);
                                dispatch.toast.alert({
                                    type: 'error',
                                    title: 'Profile',
                                    message: 'Failed to create profile'
                                });
                                reject(error);
                            }
                        }
                    });
            });
        }
    })
};
