import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { useParams } from 'react-router-dom';
import client from '../../../services/restClient';
import _ from 'lodash';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import moment from 'moment';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Checkbox } from 'primereact/checkbox';
import { getSchemaValidationErrorsStrings, updateMany } from '../../../utils';
const typeArray = ['Land line', 'Mobile', 'Fax', 'WA Only', 'SMS Only'];
const typeOptions = typeArray.map((x) => ({ name: x, value: x }));

const UserPhonesCreateDialogComponent = (props) => {
    const [_entity, set_entity] = useState({});
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const urlParams = useParams();
    const [userId, setUserId] = useState([]);

    useEffect(() => {
        set_entity(props.entity);
    }, [props.entity, props.show]);

    useEffect(() => {
        //on mount users
        client
            .service('users')
            .find({
                query: {
                    $limit: 10000,
                    $sort: { createdAt: -1 },
                    _id: urlParams.singleUsersId
                }
            })
            .then((res) => {
                setUserId(
                    res.data.map((e) => {
                        return { name: e['name'], value: e._id };
                    })
                );
            })
            .catch((error) => {
                console.debug({ error });
                props.alert({
                    title: 'Users',
                    type: 'error',
                    message: error.message || 'Failed get users'
                });
            });
    }, []);

    const validate = () => {
        let ret = true;
        const error = {};

        if (_.isEmpty(_entity?.number)) {
            error['number'] = `Phone number is required`;
            ret = false;
        }

        if (_.isEmpty(_entity?.userId)) {
            error['userId'] = `User is required`;
            ret = false;
        }

        if (_.isEmpty(_entity?.type)) {
            error['type'] = `Phone type is required`;
            ret = false;
        }

        if (_.isEmpty(_entity?.type)) {
            error['type'] = `Phone type is required`;
            ret = false;
        }

        if (_.isEmpty(_entity?.countryCode)) {
            error['countryCode'] = `Phone Country Code is required`;
            ret = false;
        }

        if (!ret) setError(error);
        return ret;
    };

    const onSave = async () => {
        if (!validate()) return;

        let _data = {
            userId: _entity?.userId?._id,
            countryCode: _entity?.countryCode,
            operatorCode: _entity?.operatorCode,
            number: _entity?.number,
            type: _entity?.type,
            isDefault: _entity?.isDefault
        };

        setLoading(true);

        if (_entity?.isDefault) {
            const updated = await updateMany({
                collection: 'user_phones',
                query: {
                    type: _entity?.type,
                    userId: _entity?.userId?._id
                },
                update: { isDefault: false },
                user: props.user
            });
            console.debug('updated', updated);
        } else {
            const validResult = await client.service('userPhones').find({
                query: { type: _entity?.type, userId: _entity?.userId?._id }
            });
            if (validResult.total <= 1) _entity.isDefault = true;
        }

        try {
            await client.service('userPhones').patch(_entity._id, _data);
            const eagerResult = await client.service('userPhones').find({
                query: {
                    $limit: 10000,
                    _id: { $in: [_entity._id] },
                    $populate: [
                        {
                            path: 'userId',
                            service: 'users',
                            select: ['name']
                        }
                    ]
                }
            });
            props.onHide();
            props.alert({
                type: 'success',
                title: 'Edit info',
                message: 'Info userPhones updated successfully'
            });
            props.onEditResult(eagerResult.data[0]);
        } catch (error) {
            console.debug('error', error);
            setError(getSchemaValidationErrorsStrings(error) || 'Failed to update info');
            props.alert({
                type: 'error',
                title: 'Edit info',
                message: 'Failed to update info'
            });
        }
        setLoading(false);
    };

    const renderFooter = () => (
        <div className="flex justify-content-end">
            <Button label="save" className="p-button-text no-focus-effect" onClick={onSave} loading={loading} />
            <Button label="close" className="p-button-text no-focus-effect p-button-secondary" onClick={props.onHide} />
        </div>
    );

    const setValByKey = (key, val) => {
        let new_entity = { ..._entity, [key]: val };
        set_entity(new_entity);
        setError({});
    };

    const userIdOptions = userId.map((elem) => ({
        name: elem.name,
        value: elem.value
    }));

    return (
        <Dialog header="Edit User Phones" visible={props.show} closable={false} onHide={props.onHide} modal style={{ width: '40vw' }} className="min-w-max" footer={renderFooter()} resizable={false}>
            <div className="grid p-fluid overflow-y-auto" style={{ maxWidth: '55vw' }} role="userPhones-edit-dialog-component">
                <div className="col-12 md:col-6 field">
                    <span className="align-items-center">
                        <label htmlFor="userId">User:</label>
                        <Dropdown id="userId" value={_entity?.userId?._id} optionLabel="name" optionValue="value" options={userIdOptions} onChange={(e) => setValByKey('userId', { _id: e.value })} disabled={true} />
                    </span>
                </div>
                <div className="col-12 md:col-6 field">
                    <span className="align-items-center">
                        <label htmlFor="countryCode">Country Code:</label>
                        <InputText id="countryCode" className="w-full mb-3 p-inputtext-sm" value={_entity?.countryCode} onChange={(e) => setValByKey('countryCode', e.target.value)} />
                    </span>
                    <small className="p-error">
                        {!_.isEmpty(error['countryCode']) && (
                            <p className="m-0" key="error-countryCode">
                                {error['countryCode']}
                            </p>
                        )}
                    </small>
                </div>
                <div className="col-12 md:col-6 field">
                    <span className="align-items-center">
                        <label htmlFor="operatorCode">Operator Code:</label>
                        <InputText id="operatorCode" className="w-full mb-3 p-inputtext-sm" value={_entity?.operatorCode} onChange={(e) => setValByKey('operatorCode', e.target.value)} />
                    </span>
                    <small className="p-error">
                        {!_.isEmpty(error['operatorCode']) && (
                            <p className="m-0" key="error-operatorCode">
                                {error['operatorCode']}
                            </p>
                        )}
                    </small>
                </div>
                <div className="col-12 md:col-6 field">
                    <span className="align-items-center">
                        <label htmlFor="number">Phone Number:</label>
                        <InputText id="number" className="w-full mb-3 p-inputtext-sm" value={_entity?.number} onChange={(e) => setValByKey('number', e.target.value)} />
                    </span>
                    <small className="p-error">
                        {!_.isEmpty(error['number']) && (
                            <p className="m-0" key="error-number">
                                {error['number']}
                            </p>
                        )}
                    </small>
                </div>
                <div className="col-12 md:col-6 field">
                    <span className="align-items-center">
                        <label htmlFor="type">Type:</label>
                        <Dropdown id="type" value={_entity?.type} options={typeOptions} optionLabel="name" optionValue="value" onChange={(e) => setValByKey('type', e.value)} />
                    </span>
                    <small className="p-error">
                        {!_.isEmpty(error['type']) && (
                            <p className="m-0" key="error-type">
                                {error['type']}
                            </p>
                        )}
                    </small>
                </div>
                <div className="col-12 md:col-6 field flex">
                    <span className="align-items-center">
                        <label htmlFor="isDefault">Is Default:</label>
                        <Checkbox id="isDefault" className="ml-3" checked={_entity?.isDefault} onChange={(e) => setValByKey('isDefault', e.checked)} />
                    </span>
                    <small className="p-error">
                        {!_.isEmpty(error['isDefault']) && (
                            <p className="m-0" key="error-isDefault">
                                {error['isDefault']}
                            </p>
                        )}
                    </small>
                </div>
                <div className="col-12">&nbsp;</div>
            </div>
        </Dialog>
    );
};

const mapState = (state) => {
    const { user } = state.auth;
    return { user };
};
const mapDispatch = (dispatch) => ({
    alert: (data) => dispatch.toast.alert(data),
    hasServicePermission: (service) => dispatch.perms.hasServicePermission(service),
    hasServiceFieldsPermission: (service) => dispatch.perms.hasServiceFieldsPermission(service)
});

export default connect(mapState, mapDispatch)(UserPhonesCreateDialogComponent);
