// used in seeder
import client from './restClient';
import _ from 'lodash';

const getRelations = (s, _schema) => {
    const fieldList = _.find(_schema.data, { field: s });
    if (fieldList) {
        return true;
    } else return false;
};

const getServiceName = (s, _schema) => {
    const fieldList = _.find(_schema.data, { field: s });
    if (fieldList.ref) {
        return fieldList.ref;
    } else return '';
};

const getPathName = (s, _schema) => {
    const fieldList = _.find(_schema.data, { field: s });
    const l = String(fieldList.comment).split(',');
    if (l[9]) {
        return l[9];
    } else return '';
};

const getFieldNameFromLabel = (f, l, _schema) => {
    const fieldList = _.find(_schema.data, { field: f });
    const c = String(fieldList?.comment).split(',');
    if (l[0] === c) {
        fieldList?.field;
    } else return c;
};

const compareFields = (data, _schema) => {
    const requiredFields = _schema.data.filter((f) => f.required === true).map((f) => f.field);
    const objectIdFields = _schema.data.filter((f) => f.type === 'ObjectId').map((f) => f.field);
    const isAllFieldsIncluded = Object.keys(data).every((f) => requiredFields.includes(f));
    const isAllObjectIdsValues = Object.keys(data).every((f) => objectIdFields.includes(f) && String(data[f]).length === 12);
    const isAllRequiredObjectIdsValues = Object.keys(data).every((f) => objectIdFields.includes(f) && requiredFields.includes(f) && String(data[f]).length === 12);

    const _data = data;

    //   const _data = _.mapKeys(data, (v, k) => getFieldNameFromLabel(v, k, _schema));
    // map the keys to the schema not the label

    return {
        _data,
        requiredFields,
        objectIdFields,
        isAllFieldsIncluded,
        isAllObjectIdsValues,
        isAllRequiredObjectIdsValues
    };
};

export const SeederService = async (serviceInUseName, _data, promises, services, _schema, user) => {
    Object.entries(_data).forEach((v, k) => {
        if (getRelations(v[0], _schema)) {
            const serviceName = getServiceName(v[0], _schema);
            if (serviceName !== '' && !services.includes(serviceName)) {
                promises.push(client.service(serviceName).find({ strict: true }));
                services.push(serviceName);
            }
        }
    });
    if (promises.length > 0) {
        const allResults = await Promise.all(promises);

        Object.entries(_data).forEach((v, k) => {
            if (getRelations(v[0], _schema)) {
                const serviceName = getServiceName(v[0], _schema);
                const index = services.indexOf(serviceName, _schema);
                const search = {};
                search[getPathName(v[0], _schema)] = v[1];
                if (!_.isEmpty(allResults[index]?.data)) {
                    const _theValue = _.find(allResults[index].data, search);
                    if (_theValue?._id) _data[v[0]] = _theValue._id;
                }
            }
        });
    }

    _data = _.mapKeys(_data, (v, k) => k);
    _data['createdBy'] = user._id;
    _data['updatedBy'] = user._id;
    console.log(_data);
    const compared = compareFields(_data, _schema);
    console.log(compared);
    _data = compared._data;
    console.log(_data);
    const res = await client.service(serviceInUseName).create(_data);
    return res;
};

export default {
    SeederService
};
