const path = require('path');
const favicon = require('serve-favicon');
const compress = require('compression');
const helmet = require('helmet');
const cors = require('cors');
const logger = require('./logger');
const feathers = require('@feathersjs/feathers');
const configuration = require('@feathersjs/configuration');
const express = require('@feathersjs/express');
const socketio = require('@feathersjs/socketio');

const middleware = require('./middleware');
const cbServices = require('./cbServices');
const services = require('./services');
const appHooks = require('./app.hooks');
const channels = require('./channels');
const createWorker = require('./workersQue');
const genAi = require('./routes/genAi');
const emailValidator = require('./routes/emailValidator');
const recaptcha = require('./routes/recaptcha');
const redis = require('./cbServices/redis');
const server = require('./routes/server');
const mongodb = require('./routes/mongodb');
const authentication = require('./authentication');
const mongoose = require('./mongoose');
const setup = require('./setup');
const redisCache = require('feathers-redis-cache');
const redisClient = require('./cbServices/redis/config');
const s3uploader = require('./routes/upload');
const fcmService = require('./routes/fcm');

const app = express(feathers());
// Load app socketio
app.configure(
    socketio((io) => {
        io.on('connection', (socket) => {
            console.debug(socket);
        });

        // Registering Socket.io middleware
        io.use(function (socket, next) {
            // Exposing a request property to services and hooks
            socket.feathers.referrer = socket.request.referrer;
            // console.debug(socket);
            next();
        });
        io.sockets.setMaxListeners(555);
    })
);
// Load app configuration
app.configure(configuration());
// Enable security, CORS, compression, favicon and body parsing
app.use(
    helmet({
        contentSecurityPolicy: false
    })
);
const corsOptions = {
    origin: ['http://localhost:3000'],
    optionsSuccessStatus: 200,
    credentials: true
};
app.use(cors(corsOptions));
app.use(compress());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/', express.static(app.get('public')));
app.use('/reset/*', express.static(app.get('public')));
app.use('/loginreset/*', express.static(app.get('public')));
app.use(favicon(path.join(app.get('public'), 'favicon.ico')));
// Set up Plugins and providers
app.configure(express.rest());
app.configure(mongoose);
// Configure other middleware (see `middleware/index.js`)
app.configure(middleware);
app.configure(authentication);
app.configure(redisCache.client({ client: redisClient }));
app.configure(redisCache.services({ pathPrefix: '/cache' }));
// Set up our services (see `services/index.js`)
app.configure(services);
app.configure(cbServices);
// Set up event channels (see channels.js)
app.configure(channels);
// Set up job queues
createWorker(app);
// Configure a middleware for 404s and the error handler
app.configure(genAi);
app.configure(fcmService);
app.configure(s3uploader);
app.configure(emailValidator);
app.configure(recaptcha);
app.configure(redis);
app.configure(server);
app.configure(mongodb);

app.use(express.notFound());
app.use(express.errorHandler({ logger }));
// Initialize setup on app start
setup(app);
app.hooks(appHooks);
module.exports = app;
