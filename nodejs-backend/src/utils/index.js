const _ = require('lodash');

const requestOptions = (path, data) => {
    const obj = {
        method: !_.isEmpty(data) ? 'post' : 'get',
        url: `${process.env.PROJECT_BACKEND}/${path}`,
        headers: {
            'Content-Type': 'application/json'
        }
    };
    if (!_.isEmpty(data)) obj['data'] = data;
    return obj;
};

module.exports = { requestOptions };
