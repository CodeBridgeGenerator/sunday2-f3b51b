const mongoose = require('mongoose');
const logger = require('./logger');

if (!process.env.MONGODB_URL)
    throw { message: "Environmental variable 'MONGODB_URL' is required." };
else console.log(process.env.MONGODB_URL);

module.exports = function (app) {
    mongoose.connect(process.env.MONGODB_URL).catch((err) => {
        logger.error(err);
        process.exit(1);
    });
    mongoose.set('strictQuery', false);
    app.set('mongooseClient', mongoose);
};
