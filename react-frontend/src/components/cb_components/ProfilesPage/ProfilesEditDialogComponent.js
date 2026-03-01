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
import { InputTextarea } from 'primereact/inputtextarea';
import { Checkbox } from 'primereact/checkbox';
import { Chips } from 'primereact/chips';
import { CascadeSelect } from 'primereact/cascadeselect';
import { getSchemaValidationErrorsStrings } from '../../../utils';

const ProfilesCreateDialogComponent = (props) => {
    const [_entity, set_entity] = useState({});
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const urlParams = useParams();
    const [userId, setUserId] = useState([]);
    const [department, setDepartment] = useState([]);
    const [section, setSection] = useState([]);
    const [position, setPosition] = useState([]);
    const [manager, setManager] = useState([]);
    const [company, setCompany] = useState([]);
    const [branch, setBranch] = useState([]);
    const [address, setAddress] = useState([]);
    const [phone, setPhone] = useState([]);
    const [positionsRolesOptions, setPositionsRolesOptions] = useState([]);

    useEffect(() => {
        set_entity(props.entity);
    }, [props.entity, props.show]);

    useEffect(() => {
        // on mount users
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
                setManager(
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

    useEffect(() => {
        // on mount departments
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
        // on mount sections
        client
            .service('sections')
            .find({
                query: {
                    $limit: 10000,
                    $sort: { createdAt: -1 },
                    _id: urlParams.singleSectionsId
                }
            })
            .then((res) => {
                setSection(
                    res.data.map((e) => {
                        return { name: e['name'], value: e._id };
                    })
                );
            })
            .catch((error) => {
                console.debug({ error });
                props.alert({
                    title: 'Sections',
                    type: 'error',
                    message: error.message || 'Failed get sections'
                });
            });
    }, []);

    useEffect(() => {
        client
            .service('roles')
            .find({
                query: {
                    $limit: 10000,
                    $sort: { createdAt: -1 }
                }
            })
            .then((rolesRes) => {
                const formattedRoles = rolesRes.data.map((role) => ({
                    name: role.name,
                    code: role._id,
                    items: []
                }));

                client
                    .service('positions')
                    .find({
                        query: {
                            $limit: 10000,
                            $sort: { createdAt: -1 }
                        }
                    })
                    .then((positionsRes) => {
                        positionsRes.data.forEach((position) => {
                            const role = formattedRoles.find((r) => r.code === position.roleId);
                            if (role) {
                                role.items.push({
                                    name: position.name,
                                    code: position._id,
                                    positionID: position._id,
                                    roleID: position.roleId
                                });
                            }
                        });
                        setPositionsRolesOptions(formattedRoles);
                    })
                    .catch((error) => {
                        console.error({ error });
                        props.alert({
                            title: 'Positions',
                            type: 'error',
                            message: error.message || 'Failed to fetch positions'
                        });
                    });
            })
            .catch((error) => {
                console.error({ error });
                props.alert({
                    title: 'Roles',
                    type: 'error',
                    message: error.message || 'Failed to fetch roles'
                });
            });
    }, []);

    useEffect(() => {
        // on mount companies
        client
            .service('companies')
            .find({
                query: {
                    $limit: 10000,
                    $sort: { createdAt: -1 },
                    _id: urlParams.singleCompaniesId
                }
            })
            .then((res) => {
                setCompany(
                    res.data.map((e) => {
                        return { name: e['name'], value: e._id };
                    })
                );
            })
            .catch((error) => {
                console.debug({ error });
                props.alert({
                    title: 'Companies',
                    type: 'error',
                    message: error.message || 'Failed get companies'
                });
            });
    }, []);

    const handleCompanyChange = (e) => {
        const selectedCompanyId = e.value;
        set_entity((prev) => ({
            ...prev,
            company: { _id: selectedCompanyId },
            branch: null
        }));
        setBranch([]);

        client
            .service('branches')
            .find({
                query: {
                    companyId: selectedCompanyId,
                    $limit: 10000,
                    $sort: { createdAt: -1 }
                }
            })
            .then((res) => {
                setBranch(res.data.map((b) => ({ name: b.name, value: b._id })));
            })
            .catch((error) => props.alert({ type: 'error', message: error.message }));
    };

    useEffect(() => {
        // on mount userAddresses
        client
            .service('userAddresses')
            .find({
                query: {
                    $limit: 10000,
                    $sort: { createdAt: -1 },
                    userId: urlParams.singleUsersId
                }
            })
            .then((res) => {
                setAddress(
                    res.data.map((e) => {
                        return { name: e['Street1'], value: e._id };
                    })
                );
            })
            .catch((error) => {
                console.debug({ error });
                props.alert({
                    title: 'UserAddresses',
                    type: 'error',
                    message: error.message || 'Failed get userAddresses'
                });
            });
    }, []);

    useEffect(() => {
        // on mount userPhones
        client
            .service('userPhones')
            .find({
                query: {
                    $limit: 10000,
                    $sort: { createdAt: -1 },
                    _id: urlParams.singleUserPhonesId
                }
            })
            .then((res) => {
                setPhone(
                    res.data.map((e) => {
                        return { name: e['number'], value: e._id };
                    })
                );
            })
            .catch((error) => {
                console.debug({ error });
                props.alert({
                    title: 'UserPhones',
                    type: 'error',
                    message: error.message || 'Failed get userPhones'
                });
            });
    }, []);

    const onSave = async () => {
        let _data = {
            name: _entity?.name,
            userId: _entity?.userId?._id,
            image: _entity?.image,
            bio: _entity?.bio,
            department: _entity?.department?._id,
            hod: _entity?.hod,
            section: _entity?.section?._id,
            hos: _entity?.hos,
            position: _entity?.position?.positionID,
            role: _entity?.position?.roleID,
            manager: _entity?.manager?._id,
            company: _entity?.company?._id,
            branch: _entity?.branch?._id,
            skills: _entity?.skills,
            address: _entity?.address?._id,
            phone: _entity?.phone?._id
        };

        setLoading(true);
        try {
            await client.service('profiles').patch(_entity._id, _data);
            const eagerResult = await client.service('profiles').find({
                query: {
                    $limit: 10000,
                    _id: { $in: [_entity._id] },
                    $populate: [
                        {
                            path: 'userId',
                            service: 'users',
                            select: ['name']
                        },
                        {
                            path: 'department',
                            service: 'departments',
                            select: ['name']
                        },
                        {
                            path: 'section',
                            service: 'sections',
                            select: ['name']
                        },
                        {
                            path: 'position',
                            service: 'positions',
                            select: ['name']
                        },
                        {
                            path: 'company',
                            service: 'companies',
                            select: ['name']
                        },
                        {
                            path: 'branch',
                            service: 'branches',
                            select: ['name']
                        },
                        {
                            path: 'address',
                            service: 'userAddresses',
                            select: ['Street1']
                        },
                        {
                            path: 'phone',
                            service: 'userPhones',
                            select: ['number']
                        }
                    ]
                }
            });
            props.onHide();
            props.alert({
                type: 'success',
                title: 'Edit info',
                message: 'Info profiles updated successfully'
            });
            // props.onEditResult(eagerResult.data[0]);
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
    const departmentOptions = department.map((elem) => ({
        name: elem.name,
        value: elem.value
    }));
    const sectionOptions = section.map((elem) => ({
        name: elem.name,
        value: elem.value
    }));
    const positionOptions = position.map((elem) => ({
        name: elem.name,
        value: elem.value
    }));
    const managerOptions = manager.map((elem) => ({
        name: elem.name,
        value: elem.value
    }));
    // const companyOptions = company.map((elem) => ({
    //   name: elem.name,
    //   value: elem.value,
    // }));
    // const branchOptions = branch.map((elem) => ({
    //   name: elem.name,
    //   value: elem.value,
    // }));
    const addressOptions = address.map((elem) => ({
        name: elem.name,
        value: elem.value
    }));
    const phoneOptions = phone.map((elem) => ({
        name: elem.name,
        value: elem.value
    }));

    return (
        <Dialog header="Edit Profiles" visible={props.show} closable={false} onHide={props.onHide} modal style={{ width: '40vw' }} className="min-w-max" footer={renderFooter()} resizable={false}>
            <div className="grid p-fluid overflow-y-auto" style={{ maxWidth: '55vw' }} role="profiles-edit-dialog-component">
                <div className="col-12 md:col-6 field">
                    <span className="align-items-center">
                        <label htmlFor="name">Name:</label>
                        <InputText id="name" className="w-full mb-3 p-inputtext-sm" value={_entity?.name} onChange={(e) => setValByKey('name', e.target.value)} required />
                    </span>
                    <small className="p-error">
                        {!_.isEmpty(error['name']) && (
                            <p className="m-0" key="error-name">
                                {error['name']}
                            </p>
                        )}
                    </small>
                </div>
                <div className="col-12 md:col-6 field">
                    <span className="align-items-center">
                        <label htmlFor="userId">User:</label>
                        <Dropdown id="userId" value={_entity?.userId?._id} optionLabel="name" optionValue="value" options={userIdOptions} onChange={(e) => setValByKey('userId', { _id: e.value })} />
                    </span>
                    <small className="p-error">
                        {!_.isEmpty(error['userId']) && (
                            <p className="m-0" key="error-userId">
                                {error['userId']}
                            </p>
                        )}
                    </small>
                </div>
                <div className="col-12 field">
                    <span className="align-items-center">
                        <label htmlFor="bio">Bio:</label>
                        <InputTextarea id="bio" rows={5} cols={30} value={_entity?.bio} onChange={(e) => setValByKey('bio', e.target.value)} autoResize />
                    </span>
                    <small className="p-error">
                        {!_.isEmpty(error['bio']) && (
                            <p className="m-0" key="error-bio">
                                {error['bio']}
                            </p>
                        )}
                    </small>
                </div>
                <div className="col-12 field">
                    <span className="align-items-center">
                        <label htmlFor="skills">Skills:</label>
                        <Chips id="skills" className="w-full mb-3" value={_entity?.skills} onChange={(e) => setValByKey('skills', e.target.value)} />
                    </span>
                    <small className="p-error">
                        {!_.isEmpty(error['skills']) && (
                            <p className="m-0" key="error-skills">
                                {error['skills']}
                            </p>
                        )}
                    </small>
                </div>
                <div className="col-12 md:col-6 field">
                    <label htmlFor="company">Company</label>
                    <Dropdown id="company" value={_entity?.company?._id || null} options={company} onChange={handleCompanyChange} optionLabel="name" placeholder="Select a company" />
                    {error.company && <small className="p-error">{error.company}</small>}
                </div>

                <div className="col-12 md:col-6 field">
                    <label htmlFor="branch">Branch</label>
                    <Dropdown id="branch" value={_entity?.branch?._id || null} options={branch} onChange={(e) => set_entity({ ..._entity, branch: { _id: e.value } })} optionLabel="name" placeholder="Select a branch" disabled={!branch.length} />
                </div>
                <div className="col-12 md:col-6 field">
                    <label htmlFor="position">Position and Role</label>
                    <CascadeSelect
                        id="position"
                        value={_entity?.position}
                        options={positionsRolesOptions}
                        optionLabel="name"
                        optionGroupLabel="name"
                        optionGroupChildren={['items']}
                        style={{ minWidth: '14rem' }}
                        placeholder="Select a Position"
                        onChange={(e) => {
                            setValByKey('position', e.value);
                        }}
                    />
                    {error.position && <small className="p-error">{error.position}</small>}
                </div>

                <div className="col-12 md:col-6 field">
                    <span className="align-items-center">
                        <label htmlFor="manager">Manager:</label>
                        <Dropdown id="manager" value={_entity?.manager?._id} optionLabel="name" optionValue="value" options={managerOptions} onChange={(e) => setValByKey('manager', { _id: e.value })} />
                    </span>
                    <small className="p-error">
                        {!_.isEmpty(error['manager']) && (
                            <p className="m-0" key="error-manager">
                                {error['manager']}
                            </p>
                        )}
                    </small>
                </div>
                <div className="col-12 md:col-6 field flex">
                    <span className="align-items-center">
                        <label htmlFor="hod">Head of Department:</label>
                        <Checkbox id="hod" className="ml-3" checked={_entity?.hod} onChange={(e) => setValByKey('hod', e.checked)} required />
                    </span>
                    <small className="p-error">
                        {!_.isEmpty(error['hod']) && (
                            <p className="m-0" key="error-hod">
                                {error['hod']}
                            </p>
                        )}
                    </small>
                </div>

                <div className="col-12 md:col-6 field flex">
                    <span className="align-items-center">
                        <label htmlFor="hos">Head of Section:</label>
                        <Checkbox id="hos" className="ml-3" checked={_entity?.hos} onChange={(e) => setValByKey('hos', e.checked)} required />
                    </span>
                    <small className="p-error">
                        {!_.isEmpty(error['hos']) && (
                            <p className="m-0" key="error-hos">
                                {error['hos']}
                            </p>
                        )}
                    </small>
                </div>

                <div className="col-12 md:col-6 field">
                    <span className="align-items-center">
                        <label htmlFor="address">Address:</label>
                        <Dropdown id="address" value={_entity?.address?._id} optionLabel="name" optionValue="value" options={addressOptions} onChange={(e) => setValByKey('address', { _id: e.value })} />
                    </span>
                    <small className="p-error">
                        {!_.isEmpty(error['address']) && (
                            <p className="m-0" key="error-address">
                                {error['address']}
                            </p>
                        )}
                    </small>
                </div>
                <div className="col-12 md:col-6 field">
                    <span className="align-items-center">
                        <label htmlFor="phone">Phone:</label>
                        <Dropdown id="phone" value={_entity?.phone?._id} optionLabel="name" optionValue="value" options={phoneOptions} onChange={(e) => setValByKey('phone', { _id: e.value })} />
                    </span>
                    <small className="p-error">
                        {!_.isEmpty(error['phone']) && (
                            <p className="m-0" key="error-phone">
                                {error['phone']}
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

export default connect(mapState, mapDispatch)(ProfilesCreateDialogComponent);
