/* eslint-disable react/prop-types */
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { useParams } from 'react-router-dom';
import client from '../../../services/restClient';
import _ from 'lodash';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
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

const DepartmentHODEditDialogComponent = (props) => {
    const [_entity, set_entity] = useState({});
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const urlParams = useParams();
    const [Department, setDepartment] = useState([]);
    const [Head, setHead] = useState([]);

    useEffect(() => {
        set_entity(props.entity);
    }, [props.entity, props.show]);

    useEffect(() => {
        //on mount departments
        client
            .service('departments')
            .find({
                query: {
                    $limit: 10000,
                    $sort: { createdAt: -1 },
                    _id: urlParams.singleDepartmentsId
                }
            })
            .then((res) => {
                setDepartment(
                    res.data.map((e) => {
                        return { name: e['name'], value: e._id };
                    })
                );
            })
            .catch((error) => {
                console.debug({ error });
                props.alert({
                    title: 'Departments',
                    type: 'error',
                    message: error.message || 'Failed get departments'
                });
            });
    }, []);
    useEffect(() => {
        //on mount employees
        client
            .service('employees')
            .find({
                query: {
                    $limit: 10000,
                    $sort: { createdAt: -1 },
                    _id: urlParams.singleEmployeesId
                }
            })
            .then((res) => {
                setHead(
                    res.data.map((e) => {
                        return { name: e['fullname'], value: e._id };
                    })
                );
            })
            .catch((error) => {
                console.debug({ error });
                props.alert({
                    title: 'Employees',
                    type: 'error',
                    message: error.message || 'Failed get employees'
                });
            });
    }, []);

    const onSave = async () => {
        let _data = {
            Department: _entity?.Department?._id,
            Head: _entity?.Head?._id
        };

        setLoading(true);
        try {
            await client.service('departmentHOD').patch(_entity._id, _data);
            const eagerResult = await client.service('departmentHOD').find({
                query: {
                    $limit: 10000,
                    _id: { $in: [_entity._id] },
                    $populate: [
                        {
                            path: 'Department',
                            service: 'departments',
                            select: ['name']
                        },
                        {
                            path: 'Head',
                            service: 'employees',
                            select: ['fullname']
                        }
                    ]
                }
            });
            props.onHide();
            props.alert({
                type: 'success',
                title: 'Edit info',
                message: 'Info departmentHOD updated successfully'
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

    const DepartmentOptions = Department.map((elem) => ({
        name: elem.name,
        value: elem.value
    }));
    const HeadOptions = Head.map((elem) => ({
        name: elem.name,
        value: elem.value
    }));

    return (
        <Dialog header="Edit Department Heads" visible={props.show} closable={false} onHide={props.onHide} modal style={{ width: '40vw' }} className="min-w-max scalein animation-ease-in-out animation-duration-1000" footer={renderFooter()} resizable={false}>
            <div className="grid p-fluid overflow-y-auto" style={{ maxWidth: '55vw' }} role="departmentHOD-edit-dialog-component">
                <div className="col-12 md:col-6 field">
                    <span className="align-items-center">
                        <label htmlFor="Department">Department:</label>
                        <Dropdown id="Department" value={_entity?.Department?._id} optionLabel="name" optionValue="value" options={DepartmentOptions} onChange={(e) => setValByKey('Department', { _id: e.value })} />
                    </span>
                    <small className="p-error">
                        {!_.isEmpty(error['Department']) && (
                            <p className="m-0" key="error-Department">
                                {error['Department']}
                            </p>
                        )}
                    </small>
                </div>
                <div className="col-12 md:col-6 field">
                    <span className="align-items-center">
                        <label htmlFor="Head">Head:</label>
                        <Dropdown id="Head" value={_entity?.Head?._id} optionLabel="name" optionValue="value" options={HeadOptions} onChange={(e) => setValByKey('Head', { _id: e.value })} />
                    </span>
                    <small className="p-error">
                        {!_.isEmpty(error['Head']) && (
                            <p className="m-0" key="error-Head">
                                {error['Head']}
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

export default connect(mapState, mapDispatch)(DepartmentHODEditDialogComponent);
