const express = require('@feathersjs/express');
const verifyRecaptcha = require('./verifyRecaptcha');

function attachApp(app) {
    return (req, res, next) => {
        req.appInstance = app;
        next();
    };
}

module.exports = function (app) {
    app.use(attachApp(app));

    app.post(
        '/verify-recaptcha',
        express.json({ type: 'application/json' }),
        verifyRecaptcha
    );
};
