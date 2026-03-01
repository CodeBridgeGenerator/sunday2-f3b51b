import _ from 'lodash';
import client from '../services/restClient';
import axios from 'axios';

export const requestOptions = (path, data) => {
    const token = localStorage.getItem('feathers-jwt');

    const obj = {
        method: !_.isEmpty(data) ? 'post' : 'get',
        url: `${process.env.REACT_APP_SERVER_URL}/${path}`,
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        }
    };
    if (!_.isEmpty(data)) obj['data'] = data;
    // console.log("req",obj);
    return obj;
};

export const getCommentSchema = (comment) => {
    const schemaList = comment?.split(',').map((s) => s?.trim());
    let obj = {
        label: schemaList[0]?.trim(),
        component: schemaList[1]?.trim(),
        autoComplete: schemaList[2]?.trim() === 'true',
        creatable: schemaList[3]?.trim() === 'true',
        editable: schemaList[4]?.trim() === 'true',
        display: schemaList[5]?.trim() === 'true',
        displayOnEdit: schemaList[6]?.trim() === 'true',
        displayOnSingle: schemaList[7]?.trim() === 'true',
        displayOnDataTable: schemaList[8]?.trim() === 'true',
        refServiceName: schemaList[9]?.trim(),
        refDatabaseName: schemaList[10]?.trim(),
        relationshipType: schemaList[11]?.trim(),
        identifierFieldName: schemaList[12]?.split(':') ?? ''
    };
    return obj;
};

export const getDistinctMongodbData = async (obj) => {
    let distinct = [];
    if (!_.isEmpty(obj?.refDatabaseName) && !_.isEmpty(obj?.identifierFieldName)) {
        const _data = {
            collection: obj.refDatabaseName,
            fieldName: obj.identifierFieldName[0]
        };
        const res = await axios(requestOptions('mongodb/distinct', _data));
        if (Array.isArray(res?.data)) {
            distinct = res?.data?.data;
        }
    }
    return distinct;
};

export const getReferenceData = async (obj) => {
    if (_.isEmpty(obj?.refServiceName) && _.isEmpty(obj?.identifierFieldName)) return null;
    const collection = obj.refServiceName?.trim();
    const fieldName = obj.identifierFieldName[0]?.trim();
    const res = await client.service(collection).find({});
    return _.uniqBy(res.data, fieldName);
};

export const getSchemaValidationErrorsStrings = (errorObj) => {
    let errMsg = {};
    for (const key in errorObj.errors) {
        if (Object.hasOwnProperty.call(errorObj.errors, key)) {
            const element = errorObj.errors[key];
            if (element?.message) {
                errMsg[key] = element.message;
            }
        }
    }
    return errMsg.length ? errMsg : errorObj.message ? { error: errorObj.message } : {};
};

export const getAllService = async (setAllItems) => {
    const res = await axios(requestOptions('listServices'));
    if (Array.isArray(res?.data?.data)) {
        setAllItems(res?.data?.data);
    }
};

export const updateMany = async (params) => {
    try {
        return await axios(requestOptions('mongodb/updateMany', params));
    } catch (err) {
        return err;
    }
};

export const deleteMany = async (params) => {
    try {
        return await axios(requestOptions('mongodb/deleteMany', params));
    } catch (err) {
        return err;
    }
};

export const excludeLocations = ['/settings', '/account', '/', '/login-faq', '/signup', '/login', '/login-faq', /^\/reset\/[a-f0-9]{24}$/];

export default {
    requestOptions,
    getCommentSchema,
    getReferenceData,
    getDistinctMongodbData,
    getSchemaValidationErrorsStrings,
    getAllService,
    updateMany,
    deleteMany,
    excludeLocations
};
