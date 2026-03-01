const express = require('@feathersjs/express');
const { distinct, drop, updateMany, deleteMany } = require('./mongoDb');

function attachApp(app) {
    return (req, res, next) => {
        req.appInstance = app;
        next();
    };
}

module.exports = function (app) {
    app.use(attachApp(app));
    app.post(
        '/mongodb/distinct',
        express.raw({ type: 'application/json' }),
        distinct
    );
    app.post('/mongodb/drop', express.raw({ type: 'application/json' }), drop);
    app.post(
        '/mongodb/updateMany',
        express.raw({ type: 'application/json' }),
        updateMany
    );
    app.post(
        '/mongodb/deleteMany',
        express.raw({ type: 'application/json' }),
        deleteMany
    );
};
