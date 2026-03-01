const express = require('@feathersjs/express');
const listServices = require('./listServices');
const { getQuotationIndex, getDeliveryIndex } = require('./listIndex');

function attachApp(app) {
    return (req, res, next) => {
        req.appInstance = app;
        next();
    };
}

module.exports = function (app) {
    app.use(attachApp(app));
    app.get(
        '/listServices',
        express.raw({ type: 'application/json' }),
        listServices
    );

    app.get(
        '/getQuotationIndex',
        express.raw({ type: 'application/json' }),
        getQuotationIndex
    );

    app.get(
        '/getDeliveryIndex',
        express.raw({ type: 'application/json' }),
        getDeliveryIndex
    );
};
