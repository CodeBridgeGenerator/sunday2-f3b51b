const express = require('@feathersjs/express');
const fcmSendService = require('./fcmService');

module.exports = function (app) {
    app.post(
        '/fcm/send',
        express.raw({ type: 'application/json' }),
        fcmSendService
    );
};
