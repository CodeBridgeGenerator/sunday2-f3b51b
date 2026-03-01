import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { useParams } from 'react-router-dom';
import client from '../../../services/restClient';
import _ from 'lodash';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import moment from 'moment';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';

const getSchemaValidationErrorsStrings = (errorObj) => {
    let errMsg = {};
    for (const key in errorObj.errors) {
        if (Object.hasOwnProperty.call(errorObj.errors, key)) {
            const element = errorObj.errors[key];
            if (element?.message) {
                errMsg.push(element.message);
            }
        }
    }
    return errMsg.length ? errMsg : errorObj.message ? errorObj.message : null;
};

const ProfileMenuCreateDialogComponent = (props) => {
    const [_entity, set_entity] = useState({});
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const urlParams = useParams();
    const [user, setUser] = useState([]);

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
                setUser(
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

    const onSave = async () => {
        let _data = {
            role: _entity?.role,
            position: _entity?.position,
            profile: _entity?.profile,
            user: _entity?.user?._id,
            company: _entity?.company,
            branch: _entity?.branch,
            department: _entity?.department,
            section: _entity?.section
        };

        setLoading(true);
        try {
            await client.service('profileMenu').patch(_entity._id, _data);
            const eagerResult = await client.service('profileMenu').find({
                query: {
                    $limit: 10000,
                    _id: { $in: [_entity._id] },
                    $populate: [
                        {
                            path: 'user',
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
                message: 'Info profileMenu updated successfully'
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

    const userOptions = user.map((elem) => ({
        name: elem.name,
        value: elem.value
    }));

    return (
        <Dialog header="Edit ProfileMenu" visible={props.show} closable={false} onHide={props.onHide} modal style={{ width: '40vw' }} className="min-w-max scalein animation-ease-in-out animation-duration-1000" footer={renderFooter()} resizable={false}>
            <div className="grid p-fluid overflow-y-auto" style={{ maxWidth: '55vw' }} role="profileMenu-edit-dialog-component">
                <div className="col-12 md:col-6 field">
                    <span className="align-items-center">
                        <label htmlFor="role">Role:</label>
                        <InputText id="role" className="w-full mb-3 p-inputtext-sm" value={_entity?.role} onChange={(e) => setValByKey('role', e.target.value)} required />
                    </span>
                    <small className="p-error">
                        {!_.isEmpty(error['role']) && (
                            <p className="m-0" key="error-role">
                                {error['role']}
                            </p>
                        )}
                    </small>
                </div>
                <div className="col-12 md:col-6 field">
                    <span className="align-items-center">
                        <label htmlFor="position">Position:</label>
                        <InputText id="position" className="w-full mb-3 p-inputtext-sm" value={_entity?.position} onChange={(e) => setValByKey('position', e.target.value)} required />
                    </span>
                    <small className="p-error">
                        {!_.isEmpty(error['position']) && (
                            <p className="m-0" key="error-position">
                                {error['position']}
                            </p>
                        )}
                    </small>
                </div>
                <div className="col-12 md:col-6 field">
                    <span className="align-items-center">
                        <label htmlFor="profile">Profile:</label>
                        <InputText id="profile" className="w-full mb-3 p-inputtext-sm" value={_entity?.profile} onChange={(e) => setValByKey('profile', e.target.value)} required />
                    </span>
                    <small className="p-error">
                        {!_.isEmpty(error['profile']) && (
                            <p className="m-0" key="error-profile">
                                {error['profile']}
                            </p>
                        )}
                    </small>
                </div>
                <div className="col-12 md:col-6 field">
                    <span className="align-items-center">
                        <label htmlFor="user">User:</label>
                        <Dropdown id="user" value={_entity?.user?._id} optionLabel="name" optionValue="value" options={userOptions} onChange={(e) => setValByKey('user', { _id: e.value })} />
                    </span>
                    <small className="p-error">
                        {!_.isEmpty(error['user']) && (
                            <p className="m-0" key="error-user">
                                {error['user']}
                            </p>
                        )}
                    </small>
                </div>
                <div className="col-12 md:col-6 field">
                    <span className="align-items-center">
                        <label htmlFor="company">Company:</label>
                        <InputText id="company" className="w-full mb-3 p-inputtext-sm" value={_entity?.company} onChange={(e) => setValByKey('company', e.target.value)} required />
                    </span>
                    <small className="p-error">
                        {!_.isEmpty(error['company']) && (
                            <p className="m-0" key="error-company">
                                {error['company']}
                            </p>
                        )}
                    </small>
                </div>
                <div className="col-12 md:col-6 field">
                    <span className="align-items-center">
                        <label htmlFor="branch">Branch:</label>
                        <InputText id="branch" className="w-full mb-3 p-inputtext-sm" value={_entity?.branch} onChange={(e) => setValByKey('branch', e.target.value)} required />
                    </span>
                    <small className="p-error">
                        {!_.isEmpty(error['branch']) && (
                            <p className="m-0" key="error-branch">
                                {error['branch']}
                            </p>
                        )}
                    </small>
                </div>
                <div className="col-12 md:col-6 field">
                    <span className="align-items-center">
                        <label htmlFor="department">Department:</label>
                        <InputText id="department" className="w-full mb-3 p-inputtext-sm" value={_entity?.department} onChange={(e) => setValByKey('department', e.target.value)} required />
                    </span>
                    <small className="p-error">
                        {!_.isEmpty(error['department']) && (
                            <p className="m-0" key="error-department">
                                {error['department']}
                            </p>
                        )}
                    </small>
                </div>
                <div className="col-12 md:col-6 field">
                    <span className="align-items-center">
                        <label htmlFor="section">Section:</label>
                        <InputText id="section" className="w-full mb-3 p-inputtext-sm" value={_entity?.section} onChange={(e) => setValByKey('section', e.target.value)} required />
                    </span>
                    <small className="p-error">
                        {!_.isEmpty(error['section']) && (
                            <p className="m-0" key="error-section">
                                {error['section']}
                            </p>
                        )}
                    </small>
                </div>
                <div className="col-12">&nbsp;</div>
                <small className="p-error">
                    {Array.isArray(Object.keys(error))
                        ? Object.keys(error).map((e, i) => (
                              <p className="m-0" key={i}>
                                  {e}: {error[e]}
                              </p>
                          ))
                        : error}
                </small>
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

export default connect(mapState, mapDispatch)(ProfileMenuCreateDialogComponent);
