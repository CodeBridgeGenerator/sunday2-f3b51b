const fs = require('fs');
const fileFolder = './src/resources';
const codeGen = require('./utils/codegen');
const _ = require('lodash');
const mongoose = require('mongoose');
const console = require('console');
const { decryptData } = require('./utils/encryption');
const userEmails = ['kana@cloudbasha.com'];

// Your setup function
module.exports = async (app) => {
    const roles = await app.service('roles').find({});

    if (roles.data.length > 0) {
        console.log('Nothing to update');
        return;
    }
    const files = fileSorter();
    const fileData = files
        .map((file) => {
            const names = file.split('.');
            const service = _.camelCase(names[1]);
            return { service: service, data: getData(file) };
        })
        .filter((e) => e.data.length > 0);
    const superRole = getSuperRole(fileData);
    const superPosi = getSuperPosition(fileData);
    const userInvites = userEmails.map((email) => {
        return {
            emailToInvite: email,
            status: false,
            sendMailCounter: 0,
            code: codeGen(),
            role: superRole,
            position: superPosi
        };
    });

    const promises = fileData.map(async (service) => {
        await app.service(service.service).create(service.data);
    });

    Promise.all(promises)
        .then(async () => {
            console.log(userInvites);
            const results = await app
                .service('userInvites')
                .create(userInvites);
            console.log(decryptData(app, results.encrypted));
        })
        .catch(console.error);
    return;
};

const getSuperRole = (data) => {
    const roles = _.find(data, { service: 'roles' });
    const role = _.find(roles.data, { name: 'Super' });
    console.log(role);
    return role._id;
};

const getSuperPosition = (data) => {
    const positions = _.find(data, { service: 'positions' });
    const position = _.find(positions.data, { name: 'Super' });
    console.log(position);
    return position._id;
};

const fileSorter = () => {
    let files = fs.readdirSync(fileFolder);
    files = files.filter(
        (file) => !['config.json', 'standard.json'].includes(file)
    );

    const sortOrder = [
        'templates',
        'roles',
        'positions',
        'users',
        'profiles',
        'permission_services',
        'companies',
        'branches'
    ];
    files = files.sort((a, b) => a.localeCompare(b));
    files = _.sortBy(files, function (file) {
        return _.indexOf(sortOrder, file.split('.')[1]);
    });

    return files;
};

const getData = (file) => {
    const fileData = require(`./resources/${file}`);
    if (fileData.length === 0) return [];

    const records = fileData.map((n) => {
        for (const [key, value] of Object.entries(n)) {
            if (typeof value === 'object') {
                for (const [key1, value1] of Object.entries(value)) {
                    if (key1 === '$oid')
                        n[key] = new mongoose.Types.ObjectId(value1);
                    if (key1 === '$date') n[key] = value1;
                }
            }
        }
        const temp = n;
        delete temp.__v;
        delete temp.createdAt;
        delete temp.updatedAt;
        return temp;
    });
    return records;
};
