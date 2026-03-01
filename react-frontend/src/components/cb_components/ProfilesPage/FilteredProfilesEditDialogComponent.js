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
import initilization from '../../../utils/init';
import UserAddressesCreateDialogComponent from '../UserAddressesPage/UserAddressesCreateDialogComponent';
import UserPhonesCreateDialogComponent from '../UserPhonesPage/UserPhonesCreateDialogComponent';
import CompaniesCreateDialogComponent from '../CompaniesPage/CompaniesCreateDialogComponent';
import BranchesCreateDialogComponent from '../BranchesPage/BranchesCreateDialogComponent';
import DepartmentsCreateDialogComponent from '../DepartmentsPage/DepartmentsCreateDialogComponent';
import SectionsCreateDialogComponent from '../SectionsPage/SectionsCreateDialogComponent';
import UploadFilesToS3 from '../../../services/UploadFilesToS3';
import { getSchemaValidationErrorsStrings } from '../../../utils';
import { v4 as uuidv4 } from 'uuid';

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
    const [showAddressDialog, setShowAddressDialog] = useState(false);
    const [newRecord, setRecord] = useState({});
    const [data, setData] = useState([]);
    const [showPhoneDialog, setShowPhoneDialog] = useState(false);
    const [showDepartmentDialog, setShowDepartmentDialog] = useState(false);
    const [showSectionDialog, setShowSectionDialog] = useState(false);
    const [showCompanyDialog, setShowCompanyDialog] = useState(false);
    const [showBranchDialog, setShowBranchDialog] = useState(false);
    const [addProfileVisible, setAddProfileVisible] = useState(false);
    const [userRole, setUserRole] = useState('');

    const getOrSetTabId = () => {
        let tabId = sessionStorage.getItem('browserTabId');
        if (!tabId) {
            tabId = uuidv4();
            sessionStorage.setItem('browserTabId', tabId);
        }
        return tabId;
    };

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
                console.log({ error });
                props.alert({
                    title: 'Departments',
                    type: 'error',
                    message: error.message || 'Failed get departments'
                });
            });
    }, [showDepartmentDialog]);

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
                console.log({ error });
                props.alert({
                    title: 'Sections',
                    type: 'error',
                    message: error.message || 'Failed get sections'
                });
            });
    }, [showSectionDialog]);

    useEffect(() => {
        // on mount positions
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
                setPosition(
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
                console.log({ error });
                props.alert({
                    title: 'Companies',
                    type: 'error',
                    message: error.message || 'Failed get companies'
                });
            });
    }, [showCompanyDialog]);

    useEffect(() => {
        // on mount branches
        client
            .service('branches')
            .find({
                query: {
                    $limit: 10000,
                    $sort: { createdAt: -1 },
                    _id: urlParams.singleBranchesId
                }
            })
            .then((res) => {
                setBranch(
                    res.data.map((e) => {
                        return { name: e['name'], value: e._id };
                    })
                );
            })
            .catch((error) => {
                console.log({ error });
                props.alert({
                    title: 'Branches',
                    type: 'error',
                    message: error.message || 'Failed get branches'
                });
            });
    }, [showBranchDialog]);

    useEffect(() => {
        // on mount userAddresses
        client
            .service('userAddresses')
            .find({
                query: {
                    $limit: 10000,
                    $sort: { createdAt: -1 },
                    userId: props.user._id
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
                console.log({ error });
                props.alert({
                    title: 'UserAddresses',
                    type: 'error',
                    message: error.message || 'Failed get userAddresses'
                });
            });
    }, [showAddressDialog]);

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
                console.log({ error });
                props.alert({
                    title: 'UserPhones',
                    type: 'error',
                    message: error.message || 'Failed get userPhones'
                });
            });
    }, [showPhoneDialog]);

    const onSave = async () => {
        const positionData = await client.service('positions').get(_entity.position._id);
        const roleId = positionData.roleId;
        let _data = {
            name: _entity?.name,
            userId: props.user._id,
            image: _entity?.image,
            bio: _entity?.bio,
            department: _entity?.department?._id,
            hod: _entity?.hod,
            section: _entity?.section?._id,
            hos: _entity?.hos,
            role: roleId,
            position: _entity?.position?._id,
            manager: _entity?.manager?._id,
            company: _entity?.company?._id,
            branch: _entity?.branch?._id,
            skills: _entity?.skills,
            address: _entity?.address?._id,
            phone: _entity?.phone?._id
        };

        setLoading(true);
        try {
            const result = await client.service('profiles').patch(_entity._id, _data);
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
            const imageId = result.image[0];

            const documentStorage = await client.service('documentStorages').find({
                query: {
                    _id: imageId
                }
            });

            if (documentStorage.data.length > 0) {
                const docToUpdate = documentStorage.data[0];

                await client.service('documentStorages').patch(docToUpdate._id, {
                    tableId: result._id
                });
            } else {
                console.log('No matching document found in documentStorages.');
            }

            props.onHide();
            props.alert({
                type: 'success',
                title: 'Edit info',
                message: 'Info profiles updated successfully'
            });
            // props.onEditResult(eagerResult.data[0]);
        } catch (error) {
            console.log('error', error);
            setError(getSchemaValidationErrorsStrings(error) || 'Failed to update info');
            props.alert({
                type: 'error',
                title: 'Edit info',
                message: 'Failed to update info'
            });
        } finally {
            setLoading(false);
        }
    };

    const renderFooter = () => (
        <div className="flex justify-content-end">
            <Button label="save" className="p-button-text no-focus-effect" onClick={onSave} loading={loading} />
            <Button label="close" className="p-button-text no-focus-effect p-button-secondary" onClick={props.onHide} />
        </div>
    );
    const setimageId = (id) => {
        setValByKey('image', id);
    };

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
    const companyOptions = company.map((elem) => ({
        name: elem.name,
        value: elem.value
    }));
    const branchOptions = branch.map((elem) => ({
        name: elem.name,
        value: elem.value
    }));
    const addressOptions = address.map((elem) => ({
        name: elem.name,
        value: elem.value
    }));
    const phoneOptions = phone.map((elem) => ({
        name: elem.name,
        value: elem.value
    }));

    const onCreateResult = (newEntity) => {
        setData([...data, newEntity]);
    };

    useEffect(() => {
        const fetchRoleForSelectedUser = async () => {
            try {
                let tabId = getOrSetTabId();

                // if (currentCache?.selectedUser) {
                let selectedProfileId = localStorage.getItem('selectedUser_' + tabId);

                // Fetch profile data for the selected profile ID
                const profileResponse = await client.service('profiles').get(selectedProfileId, {
                    query: { $select: ['role'] }
                });

                if (profileResponse?.role) {
                    const roleId = profileResponse.role;

                    // Fetch role details
                    const roleResponse = await client.service('roles').get(roleId, {
                        query: { $select: ['name'] }
                    });

                    if (roleResponse?.name) {
                        setUserRole(roleResponse.name); // Set the role name
                        console.log('userRole', userRole);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch role for selected user:', error);
            }
        };

        fetchRoleForSelectedUser();
    }, [props.get]);

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
                <div className="col-12 field">
                    <span className="align-items-center">
                        <label htmlFor="image">Image:</label>
                        <UploadFilesToS3
                            type={'create'}
                            //  value={_entity?.image?.[0]}
                            user={props.user}
                            id={urlParams.id}
                            serviceName="profiles"
                            onUploadComplete={setimageId}
                            // onFileLoaded={onFileimageLoaded}
                        />
                    </span>
                    <small className="p-error">
                        {!_.isEmpty(error['image']) ? (
                            <p className="m-0" key="error-image">
                                {error['image']}
                            </p>
                        ) : null}
                    </small>
                </div>

                {userRole === 'Admin' && (
                    <div className="col-12 md:col-6 field">
                        <span className="flex flex-col">
                            <label htmlFor="company">Company:</label>
                            <div className="flex align-items-center">
                                {companyOptions.length > 0 ? (
                                    <div className="w-full">
                                        <Dropdown id="company" value={_entity?.company?._id} optionLabel="name" optionValue="value" options={companyOptions} onChange={(e) => setValByKey('company', { _id: e.value })} required />
                                    </div>
                                ) : (
                                    <div>No companies found</div>
                                )}
                                <Button icon="pi pi-plus" className="p-button-text no-focus-effect ml-2" onClick={() => setShowCompanyDialog(true)} tooltip="Add Company" tooltipOptions={{ position: 'bottom' }} />
                            </div>
                        </span>
                        <small className="p-error">
                            {!_.isEmpty(error['company']) ? (
                                <p className="m-0" key="error-company">
                                    {error['company']}
                                </p>
                            ) : null}
                        </small>
                    </div>
                )}
                {userRole === 'Admin' && (
                    <div className="col-12 md:col-6 field">
                        <span className="flex flex-col">
                            <label htmlFor="branch">Branch:</label>
                            <div className="flex align-items-center">
                                {branchOptions.length > 0 ? (
                                    <div className="w-full">
                                        <Dropdown id="branch" value={_entity?.branch?._id} optionLabel="name" optionValue="value" options={branchOptions} onChange={(e) => setValByKey('branch', { _id: e.value })} />
                                    </div>
                                ) : (
                                    <div>No branches found</div>
                                )}
                                <Button icon="pi pi-plus" className="p-button-text no-focus-effect ml-2" onClick={() => setShowBranchDialog(true)} tooltip="Add Branch" tooltipOptions={{ position: 'bottom' }} />
                            </div>
                        </span>
                        <small className="p-error">
                            {!_.isEmpty(error['branch']) ? (
                                <p className="m-0" key="error-branch">
                                    {error['branch']}
                                </p>
                            ) : null}
                        </small>
                    </div>
                )}
                {userRole === 'Admin' && (
                    <div className="col-12 md:col-6 field">
                        <span className="align-items-center">
                            <label htmlFor="position">Position:</label>
                            <Dropdown id="position" value={_entity?.position?._id} optionLabel="name" optionValue="value" options={positionOptions} onChange={(e) => setValByKey('position', { _id: e.value })} required />
                        </span>
                        <small className="p-error">
                            {!_.isEmpty(error['position']) && (
                                <p className="m-0" key="error-position">
                                    {error['position']}
                                </p>
                            )}
                        </small>
                    </div>
                )}

                <div className="col-12 md:col-6 field">
                    <span className="flex flex-col">
                        <label htmlFor="address">Address:</label>
                        <div className="flex align-items-center">
                            {addressOptions.length > 0 ? (
                                <div className="w-full">
                                    <Dropdown id="address" value={_entity?.address?._id} optionLabel="name" optionValue="value" options={addressOptions} onChange={(e) => setValByKey('address', { _id: e.value })} style={{ width: '100%' }} />
                                </div>
                            ) : (
                                <div>No addresses found</div>
                            )}
                            <Button icon="pi pi-plus" className="p-button-text no-focus-effect ml-2" onClick={() => setShowAddressDialog(true)} tooltip="Add Address" tooltipOptions={{ position: 'bottom' }} />
                        </div>
                    </span>
                    <small className="p-error">
                        {!_.isEmpty(error['address']) ? (
                            <p className="m-0" key="error-address">
                                {error['address']}
                            </p>
                        ) : null}
                    </small>
                </div>

                <div className="col-12 md:col-6 field">
                    <span className="flex flex-col">
                        <label htmlFor="phone">Phone:</label>
                        <div className="flex align-items-center">
                            {phoneOptions.length > 0 ? (
                                <div className="w-full">
                                    <Dropdown id="phone" value={_entity?.phone?._id} optionLabel="name" optionValue="value" options={phoneOptions} onChange={(e) => setValByKey('phone', { _id: e.value })} style={{ width: '100%' }} />
                                </div>
                            ) : (
                                <div>No phone numbers found</div>
                            )}
                            <Button icon="pi pi-plus" className="p-button-text no-focus-effect ml-2" onClick={() => setShowPhoneDialog(true)} tooltip="Add Phone" tooltipOptions={{ position: 'bottom' }} />
                        </div>
                    </span>

                    <small className="p-error">
                        {!_.isEmpty(error['phone']) ? (
                            <p className="m-0" key="error-phone">
                                {error['phone']}
                            </p>
                        ) : null}
                    </small>
                </div>
                <div className="col-12">&nbsp;</div>
            </div>

            <UserAddressesCreateDialogComponent entity={newRecord} onCreateResult={onCreateResult} show={showAddressDialog} onHide={() => setShowAddressDialog(false)} />

            <UserPhonesCreateDialogComponent entity={newRecord} onCreateResult={onCreateResult} show={showPhoneDialog} onHide={() => setShowPhoneDialog(false)} />

            <CompaniesCreateDialogComponent entity={newRecord} onCreateResult={onCreateResult} show={showCompanyDialog} onHide={() => setShowCompanyDialog(false)} />

            <BranchesCreateDialogComponent entity={newRecord} onCreateResult={onCreateResult} show={showBranchDialog} onHide={() => setShowBranchDialog(false)} />
            <DepartmentsCreateDialogComponent entity={newRecord} onCreateResult={onCreateResult} show={showDepartmentDialog} onHide={() => setShowDepartmentDialog(false)} />
            <SectionsCreateDialogComponent entity={newRecord} onCreateResult={onCreateResult} show={showSectionDialog} onHide={() => setShowSectionDialog(false)} />
        </Dialog>
    );
};

const mapState = (state) => {
    const { user } = state.auth;
    return { user };
};
const mapDispatch = (dispatch) => ({
    alert: (data) => dispatch.toast.alert(data),
    get: () => dispatch.cache.get()
});

export default connect(mapState, mapDispatch)(ProfilesCreateDialogComponent);
