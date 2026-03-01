const highways = require("./highways/highways.service.js");
// ~cb-add-require-service-name~

// eslint-disable-next-line no-unused-vars
module.exports = function (app) {
  app.configure(highways);
    // ~cb-add-configure-service-name~
};
