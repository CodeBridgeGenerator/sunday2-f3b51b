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
import { Checkbox } from 'primereact/checkbox';
import { Dropdown } from 'primereact/dropdown';
import axios from 'axios';
import { getSchemaValidationErrorsStrings } from '../../../utils';

const PermissionServicesCreateDialogComponent = (props) => {
    const [_entity, set_entity] = useState({});
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const urlParams = useParams();
    const [profile, setProfile] = useState([]);
    const [roleId, setRoleId] = useState([]);
    const [positionId, setPositionId] = useState([]);
    const [employeeId, setEmployeeId] = useState([]);
    const [userId, setUserId] = useState([]);
    const [selectedOption, setSelectedOption] = useState('');
    const fixedServiceOptions = [
        'audits',
        'authentication',
        'branches',
        'cache/clear/all',
        'cache/clear/group',
        'cache/clear/single',
        'cache/flashdb',
        'chatai',
        'contacts',
        'comments',
        'companies',
        'companyAddresses',
        'companyPhones',
        'config',
        'departments',
        'documentStorages',
        'dynaFields',
        'dynaLoader',
        'errorLogs',
        'errorsWH',
        'inbox',
        'jobQues',
        'locationMaster',
        'loginHistory',
        'mailQues',
        'mails',
        'mailWH',
        'notifications',
        'permissionFields',
        'permissionServices',
        'positions',
        'profiles',
        'prompts',
        'roles',
        'sections',
        'steps',
        'superior',
        'templates',
        'uploader',
        'userAddresses',
        'userChangePassword',
        'userGuide',
        'userInvites',
        'userPhones',
        'users'
    ];
    // const [serviceOptions, setServiceOptions] = useState([]);
    const [serviceOptions, setServiceOptions] = useState(fixedServiceOptions);

    useEffect(() => {
        set_entity(props.entity);
    }, [props.entity, props.show]);

    // useEffect(() => {
    //   const fetchServices = async () => {
    //     try {
    //       const apiUrl = process.env.REACT_APP_SERVER_URL + "/listServices";
    //       const response = await axios.get(apiUrl);
    //       if (response.data?.data) {
    //         setServiceOptions(response.data.data);
    //       } else {
    //         console.error("Failed to fetch service options:", response.data);
    //       }
    //     } catch (err) {
    //       console.error("Error fetching services:", err);
    //     }
    //   };
    //   fetchServices();
    // }, []);

    useEffect(() => {
        //on mount profiles
        client
            .service('profiles')
            .find({
                query: {
                    $limit: 10000,
                    $sort: { createdAt: -1 },
                    _id: urlParams.singleProfilesId
                }
            })
            .then((res) => {
                setProfile(
                    res.data.map((e) => {
                        return { name: e['name'], value: e._id };
                    })
                );
            })
            .catch((error) => {
                console.log({ error });
                props.alert({
                    title: 'Profiles',
                    type: 'error',
                    message: error.message || 'Failed get profiles'
                });
            });
    }, []);
    useEffect(() => {
        //on mount roles
        client
            .service('roles')
            .find({
                query: {
                    $limit: 10000,
                    $sort: { createdAt: -1 },
                    _id: urlParams.singleRolesId
                }
            })
            .then((res) => {
                setRoleId(
                    res.data.map((e) => {
                        return { name: e['name'], value: e._id };
                    })
                );
            })
            .catch((error) => {
                console.log({ error });
                props.alert({
                    title: 'Roles',
                    type: 'error',
                    message: error.message || 'Failed get roles'
                });
            });
    }, []);
    useEffect(() => {
        //on mount positions
        client
            .service('positions')
            .find({
                query: {
                    $limit: 10000,
                    $sort: { createdAt: -1 },
                    _id: urlParams.singlePositionsId
                }
            })
            .then((res) => {
                setPositionId(
                    res.data.map((e) => {
                        return { name: e['name'], value: e._id };
                    })
                );
            })
            .catch((error) => {
                console.log({ error });
                props.alert({
                    title: 'Positions',
                    type: 'error',
                    message: error.message || 'Failed get positions'
                });
            });
    }, []);

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
                console.log({ error });
                props.alert({
                    title: 'Users',
                    type: 'error',
                    message: error.message || 'Failed get users'
                });
            });
    }, []);

    const onSave = async () => {
        let _data = {
            service: _entity?.service,
            create: _entity?.create,
            read: _entity?.read,
            update: _entity?.update,
            delete: _entity?.delete,
            import: _entity?.import,
            export: _entity?.export,
            seeder: _entity?.seeder,
            profile: _entity?.profile?._id,
            roleId: _entity?.roleId?._id,
            positionId: _entity?.positionId?._id,
            employeeId: _entity?.employeeId?._id,
            userId: _entity?.userId?._id
        };

        setLoading(true);
        try {
            await client.service('permissionServices').patch(_entity._id, _data);
            const eagerResult = await client.service('permissionServices').find({
                query: {
                    $limit: 10000,
                    _id: { $in: [_entity._id] },
                    $populate: [
                        {
                            path: 'profile',
                            service: 'profiles',
                            select: ['name']
                        },
                        {
                            path: 'roleId',
                            service: 'roles',
                            select: ['name']
                        },
                        {
                            path: 'positionId',
                            service: 'positions',
                            select: ['name']
                        },
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
                message: 'Info permissionServices updated successfully'
            });
            props.onEditResult(eagerResult.data[0]);
        } catch (error) {
            console.log('error', error);
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

    const profileOptions = profile.map((elem) => ({
        name: elem.name,
        value: elem.value
    }));
    const roleIdOptions = roleId.map((elem) => ({
        name: elem.name,
        value: elem.value
    }));
    const positionIdOptions = positionId.map((elem) => ({
        name: elem.name,
        value: elem.value
    }));
    const employeeIdOptions = employeeId.map((elem) => ({
        name: elem.name,
        value: elem.value
    }));
    const userIdOptions = userId.map((elem) => ({
        name: elem.name,
        value: elem.value
    }));

    useEffect(() => {
        if (_entity?.roleId) {
            setSelectedOption('roleId');
        } else if (_entity?.positionId) {
            setSelectedOption('positionId');
        } else if (_entity?.profile) {
            setSelectedOption('profile');
        } else if (_entity?.employeeId) {
            setSelectedOption('employeeId');
        }
    }, [_entity]);

    return (
        <Dialog header="Edit Service Permissions" visible={props.show} closable={false} onHide={props.onHide} modal style={{ width: '40vw' }} className="min-w-max" footer={renderFooter()} resizable={false}>
            <div className="grid p-fluid overflow-y-auto" style={{ maxWidth: '55vw' }} role="permissionServices-edit-dialog-component">
                <div className="col-12 md:col-6 field mt-5">
                    <span className="align-items-center">
                        <label htmlFor="service">Service:</label>
                        <Dropdown id="service" className="w-full mb-3 mt-2" value={_entity?.service} options={serviceOptions} onChange={(e) => setValByKey('service', e.value)} />
                    </span>
                </div>

                <div className="col-12 md:col-6 field mt-5">
                    <div className="p-field-checkbox mb-2">
                        <input type="radio" id="roleId" name="selectionOption" onChange={() => setSelectedOption('roleId')} checked={selectedOption === 'roleId'} />
                        <label htmlFor="roleId">Role</label>
                        <input type="radio" id="positionId" name="selectionOption" onChange={() => setSelectedOption('positionId')} checked={selectedOption === 'positionId'} />
                        <label htmlFor="positionId">Position</label>
                        <input type="radio" id="profile" name="selectionOption" onChange={() => setSelectedOption('profile')} checked={selectedOption === 'profile'} />
                        <label htmlFor="profile">Profile</label>
                        {/* <input type="radio" id="employeeId" name="selectionOption" onChange={() => setSelectedOption("employeeId")}   checked={selectedOption === "employeeId"} />
                    <label htmlFor="employeeId">Employee</label> */}
                    </div>

                    {selectedOption === 'profile' && (
                        <div>
                            <Dropdown id="profile" value={_entity?.profile?._id} optionLabel="name" optionValue="value" options={profileOptions} onChange={(e) => setValByKey('profile', { _id: e.value })} />
                        </div>
                    )}

                    {selectedOption === 'roleId' && (
                        <div>
                            <Dropdown id="roleId" value={_entity?.roleId?._id} optionLabel="name" optionValue="value" options={roleIdOptions} onChange={(e) => setValByKey('roleId', { _id: e.value })} />
                        </div>
                    )}

                    {selectedOption === 'positionId' && (
                        <div>
                            <Dropdown id="positionId" value={_entity?.positionId?._id} optionLabel="name" optionValue="value" options={positionIdOptions} onChange={(e) => setValByKey('positionId', { _id: e.value })} />
                        </div>
                    )}

                    {/* {selectedOption === "employeeId" && (
                  <div>
           
                    <Dropdown
                      id="employeeId"
                      value={_entity?.employeeId?._id}
                      optionLabel="name"
                      optionValue="value"
                      options={employeeIdOptions}
                      onChange={(e) => setValByKey("employeeId", { _id: e.value })}
                    />
                  </div>
                )} */}
                </div>

                {/* <div className="col-12 md:col-6 field mt-5">
          <span className="align-items-center">
            <label htmlFor="roleId">Role:</label>
            <Dropdown
              id="roleId"
              value={_entity?.roleId?._id}
              optionLabel="name"
              optionValue="value"
              options={roleIdOptions}
              onChange={(e) => setValByKey("roleId", { _id: e.value })}
            />
          </span>
        </div>
        <div className="col-12 md:col-6 field mt-5">
          <span className="align-items-center">
            <label htmlFor="profile">Profile:</label>
            <Dropdown
              id="profile"
              value={_entity?.profile?._id}
              optionLabel="name"
              optionValue="value"
              options={profileOptions}
              onChange={(e) => setValByKey("profile", { _id: e.value })}
            />
          </span>
        </div>

        <div className="col-12 md:col-6 field mt-5">
          <span className="align-items-center">
            <label htmlFor="positionId">PositionId:</label>
            <Dropdown
              id="positionId"
              value={_entity?.positionId?._id}
              optionLabel="name"
              optionValue="value"
              options={positionIdOptions}
              onChange={(e) => setValByKey("positionId", { _id: e.value })}
            />
          </span>
        </div> */}
                <div className="col-12 md:col-6 field mt-5">
                    <span className="align-items-center">
                        <label htmlFor="create">Create:</label>
                        <Checkbox id="create" className="ml-3" checked={_entity?.create} onChange={(e) => setValByKey('create', e.checked)} />
                    </span>
                </div>
                <div className="col-12 md:col-6 field mt-5">
                    <span className="align-items-center">
                        <label htmlFor="read">Read:</label>
                        <Checkbox id="read" className="ml-3" checked={_entity?.read} onChange={(e) => setValByKey('read', e.checked)} />
                    </span>
                </div>
                <div className="col-12 md:col-6 field mt-5">
                    <span className="align-items-center">
                        <label htmlFor="update">Update:</label>
                        <Checkbox id="update" className="ml-3" checked={_entity?.update} onChange={(e) => setValByKey('update', e.checked)} />
                    </span>
                </div>
                <div className="col-12 md:col-6 field mt-5">
                    <span className="align-items-center">
                        <label htmlFor="delete">Delete:</label>
                        <Checkbox id="delete" className="ml-3" checked={_entity?.delete} onChange={(e) => setValByKey('delete', e.checked)} />
                    </span>
                </div>
                <div className="col-12 md:col-6 field mt-5">
                    <span className="align-items-center">
                        <label htmlFor="import">Import:</label>
                        <Checkbox id="import" className="ml-3" checked={_entity?.import} onChange={(e) => setValByKey('import', e.checked)} />
                    </span>
                    <small className="p-error">
                        {!_.isEmpty(error['import']) ? (
                            <p className="m-0" key="error-import">
                                {error['import']}
                            </p>
                        ) : null}
                    </small>
                </div>

                <div className="col-12 md:col-6 field mt-5">
                    <span className="align-items-center">
                        <label htmlFor="export">Export:</label>
                        <Checkbox id="export" className="ml-3" checked={_entity?.export} onChange={(e) => setValByKey('export', e.checked)} />
                    </span>
                    <small className="p-error">
                        {!_.isEmpty(error['export']) ? (
                            <p className="m-0" key="error-export">
                                {error['export']}
                            </p>
                        ) : null}
                    </small>
                </div>

                <div className="col-12 md:col-6 field mt-5">
                    <span className="align-items-center">
                        <label htmlFor="seeder">Seeder:</label>
                        <Checkbox id="seeder" className="ml-3" checked={_entity?.seeder} onChange={(e) => setValByKey('seeder', e.checked)} />
                    </span>
                    <small className="p-error">
                        {!_.isEmpty(error['seeder']) ? (
                            <p className="m-0" key="error-seeder">
                                {error['seeder']}
                            </p>
                        ) : null}
                    </small>
                </div>
                {/* <div className="col-12 md:col-6 field mt-5">
          <span className="align-items-center">
            <label htmlFor="employeeId">EmployeeId:</label>
            <Dropdown
              id="employeeId"
              value={_entity?.employeeId?._id}
              optionLabel="name"
              optionValue="value"
              options={employeeIdOptions}
              onChange={(e) => setValByKey("employeeId", { _id: e.value })}
            />
          </span>
        </div> */}
                {/* <div className="col-12 md:col-6 field mt-5">
          <span className="align-items-center">
            <label htmlFor="userId">UserId:</label>
            <Dropdown
              id="userId"
              value={_entity?.userId?._id}
              optionLabel="name"
              optionValue="value"
              options={userIdOptions}
              onChange={(e) => setValByKey("userId", { _id: e.value })}
            />
          </span>
        </div>  */}
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

export default connect(mapState, mapDispatch)(PermissionServicesCreateDialogComponent);
