const express = require('@feathersjs/express');
const multer = require('multer');
const objectUpload2S3 = require('./objectUpload2S3');
const object2DeleteS3 = require('./object2DeleteS3');
const objectListsS3 = require('./objectListsS3');

function attachApp(app) {
    return (req, res, next) => {
        req.appInstance = app;
        next();
    };
}

module.exports = function (app) {
    // Set up multer to handle multipart/form-data
    const upload = multer({ storage: multer.memoryStorage() });
    app.use(attachApp(app));
    // Manage s3 files
    app.post('/s3uploader', upload.array('files'), objectUpload2S3);
    app.post(
        '/s3delete',
        express.raw({ type: 'application/json' }),
        object2DeleteS3
    );
    app.post(
        '/s3list',
        express.raw({ type: 'application/json' }),
        objectListsS3
    );
};
