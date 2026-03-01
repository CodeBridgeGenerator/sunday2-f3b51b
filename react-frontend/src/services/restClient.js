import feathers from '@feathersjs/feathers';
import rest from '@feathersjs/rest-client';
import auth from '@feathersjs/authentication-client';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { decryptResponseClientHook } from '../utils/encryption';

if (!process.env.REACT_APP_SERVER_URL) throw `Environmental variable 'REACT_APP_SERVER_URL' is required.`;

const app = feathers();
const restClient = rest(process.env.REACT_APP_SERVER_URL);
app.configure(restClient.axios(axios));

function isTokenExpired(token) {
    if (!token) return true;

    try {
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        return decoded.exp < currentTime;
    } catch (error) {
        return true;
    }
}

// Enhanced path checking
const shouldSkipAuthRedirect = () => {
    const currentPath = window.location.pathname;

    // Skip auth for these exact paths
    const excludedPaths = ['/login', '/', '/signup', '/login-faq'];
    if (excludedPaths.includes(currentPath)) return true;

    // Skip auth for reset password URLs (both patterns)
    const resetPathRegex = /^\/reset\/[a-f0-9]{24}\/?$/i;
    const loginResetPathRegex = /^\/loginreset\/[a-f0-9]{24}\/?$/i;

    if (resetPathRegex.test(currentPath) || loginResetPathRegex.test(currentPath)) {
        return true;
    }

    return false;
};

app.hooks({
    error: {
        all: [
            async (context) => {
                if (shouldSkipAuthRedirect()) {
                    return context;
                }

                const token = localStorage.getItem('feathers-jwt');

                if ((context.error.name === 'NotAuthenticated' || context.error.code === 401) && isTokenExpired(token)) {
                    localStorage.removeItem('feathers-jwt');

                    if (!window.location.pathname.startsWith('/login')) {
                        window.location.href = '/login?sessionExpired=true';
                    }
                }
                return context;
            }
        ]
    }
});

app.configure(
    auth({
        storage: window.localStorage,
        cookie: 'feathers-jwt',
        storageKey: 'feathers-jwt'
    })
);

// Service hooks remain the same
app.service('userChangePassword').hooks({
    after: {
        all: [decryptResponseClientHook]
    }
});

app.service('userInvites').hooks({
    after: {
        all: [decryptResponseClientHook]
    }
});

app.service('mailQues').hooks({
    after: {
        all: [decryptResponseClientHook]
    }
});

app.service('permissionServices').hooks({
    after: {
        all: [decryptResponseClientHook]
    }
});

export default app;
