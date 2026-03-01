const express = require('@feathersjs/express');
const verifyEmail = require('./verifyEmail');

function attachApp(app) {
    return (req, res, next) => {
        req.appInstance = app;
        next();
    };
}

module.exports = function (app) {
    app.use(attachApp(app));

    app.post(
        '/verify-email',
        express.json({ type: 'application/json' }),
        verifyEmail
    );
};
