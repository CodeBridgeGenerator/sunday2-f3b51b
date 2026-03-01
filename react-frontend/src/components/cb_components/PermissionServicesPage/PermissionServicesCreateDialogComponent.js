import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { useParams } from 'react-router-dom';
import client from '../../../services/restClient';
import _ from 'lodash';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { Checkbox } from 'primereact/checkbox';
import { MultiSelect } from 'primereact/multiselect';
import axios from 'axios';

const PermissionServicesCreateDialogComponent = (props) => {
    const [_entity, set_entity] = useState({});
    const [error, setError] = useState({});
    const [loading, setLoading] = useState(false);
    const urlParams = useParams();
    const [profiles, setProfiles] = useState([]);
    const [roles, setRoles] = useState([]);
    const [positions, setPositions] = useState([]);
    const [selectedOption, setSelectedOption] = useState('roleId');
    const [serviceOptions, setServiceOptions] = useState([]);
    const [selectAll, setSelectAll] = useState(false);
    const [crudAll, setCRUDAll] = useState(false);
    const [adminAll, setAdminAll] = useState(false);

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const apiUrl = process.env.REACT_APP_SERVER_URL + '/listServices';
                const response = await axios.get(apiUrl);
                if (response.data?.status && response.data?.data) {
                    setServiceOptions(response.data.data);
                } else {
                    console.error('Failed to fetch service options:', response.data);
                }
            } catch (err) {
                console.error('Error fetching services:', err);
            }
        };
        fetchServices();
    }, []);

    const onHideDialog = () => {
        set_entity({});
        setError({});
        setSelectAll(false);
        setCRUDAll(false);
        setAdminAll(false);
        props.onHide();
    };

    const validate = () => {
        const errors = {};
        if (!(_entity?.services?.length > 0)) {
            errors.services = 'Please select at least one service.';
        }

        switch (selectedOption) {
            case 'roleId':
                if (!(_entity?.roleIds?.length > 0)) errors.selection = 'Please select at least one role.';
                break;
            case 'positionId':
                if (!(_entity?.positionIds?.length > 0)) errors.selection = 'Please select at least one position.';
                break;
            case 'profile':
                if (!(_entity?.profileIds?.length > 0)) errors.selection = 'Please select at least one profile.';
                break;
            default:
                break;
        }

        setError(errors);
        return _.isEmpty(errors);
    };

    const onSave = async () => {
        if (!validate()) return;
        setLoading(true);

        const services = _entity?.services || [];
        let ids = [];
        let idKey = '';

        switch (selectedOption) {
            case 'roleId':
                ids = _entity?.roleIds || [];
                idKey = 'roleId';
                break;
            case 'positionId':
                ids = _entity?.positionIds || [];
                idKey = 'positionId';
                break;
            case 'profile':
                ids = _entity?.profileIds || [];
                idKey = 'profile';
                break;
            default:
                props.alert({
                    type: 'error',
                    title: 'Error',
                    message: 'Invalid selection type'
                });
                setLoading(false);
                return;
        }

        const recordsToCreate = [];
        services.forEach((service) => {
            ids.forEach((id) => {
                recordsToCreate.push({
                    service,
                    [idKey]: id,
                    create: _entity?.create || false,
                    read: _entity?.read || false,
                    update: _entity?.update || false,
                    delete: _entity?.delete || false,
                    import: _entity?.import || false,
                    export: _entity?.export || false,
                    seeder: _entity?.seeder || false,
                    createdBy: props.user._id,
                    updatedBy: props.user._id
                });
            });
        });

        if (recordsToCreate.length === 0) {
            props.alert({
                type: 'warn',
                title: 'Nothing to Save',
                message: 'No permission combinations to create.'
            });
            setLoading(false);
            return;
        }

        try {
            const result = await client.service('permissionServices').create(recordsToCreate);
            props.onHide();
            set_entity({});
            props.alert({
                type: 'success',
                title: 'Create Success',
                message: `${Array.isArray(result) ? result.length : 1} permission(s) created successfully.`
            });
            onHideDialog();
        } catch (error) {
            console.error('Error creating permission services:', error);
            props.alert({
                type: 'error',
                title: 'Create Failed',
                message: error.message || 'Failed to create permissions. Some combinations may already exist.'
            });
            setError({ general: error.message });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const query = { query: { $limit: 10000, $sort: { name: 1 } } };

        client
            .service('profiles')
            .find(query)
            .then((res) => setProfiles(res.data.map((e) => ({ name: e.name, value: e._id }))))
            .catch((err) =>
                props.alert({
                    title: 'Profiles',
                    type: 'error',
                    message: err.message || 'Failed to get profiles'
                })
            );

        client
            .service('roles')
            .find(query)
            .then((res) => setRoles(res.data.map((e) => ({ name: e.name, value: e._id }))))
            .catch((err) =>
                props.alert({
                    title: 'Roles',
                    type: 'error',
                    message: err.message || 'Failed to get roles'
                })
            );

        client
            .service('positions')
            .find(query)
            .then((res) => setPositions(res.data.map((e) => ({ name: e.name, value: e._id }))))
            .catch((err) =>
                props.alert({
                    title: 'Positions',
                    type: 'error',
                    message: err.message || 'Failed to get positions'
                })
            );
    }, []);

    const renderFooter = () => (
        <div className="flex justify-content-end">
            <Button label="save" className="p-button-text no-focus-effect" onClick={onSave} loading={loading} />
            <Button label="close" className="p-button-text no-focus-effect p-button-secondary" onClick={props.onHide} />
        </div>
    );

    const setValByKey = (key, val) => {
        set_entity((prev) => ({ ...prev, [key]: val }));
        setError({});
    };

    const handleGroupCheckboxChange = (group, value) => {
        let updatedEntity = { ..._entity };
        const crud = { create: value, read: value, update: value, delete: value };
        const admin = { import: value, export: value, seeder: value };

        setCRUDAll(value);
        setAdminAll(value);

        switch (group) {
            case 'all':
                setSelectAll(value);
                updatedEntity = { ...updatedEntity, ...crud, ...admin };
                break;
            case 'admin':
                setAdminAll(value);
                updatedEntity = { ...updatedEntity, ...admin };
                if (value && crudAll) setSelectAll(true);
                else setSelectAll(false);
                break;
            case 'crud':
                setCRUDAll(value);
                updatedEntity = { ...updatedEntity, ...crud };
                if (value && adminAll) setSelectAll(true);
                else setSelectAll(false);
                break;
            default:
                break;
        }
        set_entity(updatedEntity);
    };

    return (
        <Dialog header="Create Service Permissions" visible={props.show} closable={false} onHide={props.onHide} modal style={{ width: '40vw' }} className="min-w-max" footer={renderFooter} resizable={false}>
            <div className="grid p-fluid overflow-y-auto" style={{ maxWidth: '55vw' }} role="permissionServices-create-dialog-component">
                <div className="col-12 md:col-6 field mt-5">
                    <label htmlFor="services">Services:</label>
                    <MultiSelect id="services" className="w-full mt-2" value={_entity?.services} options={serviceOptions} onChange={(e) => setValByKey('services', e.value)} filter placeholder="Select Services" display="chip" />
                    {!_.isEmpty(error.services) && <small className="p-error">{error.services}</small>}
                </div>

                <div className="col-12 md:col-6 field mt-5">
                    <div className="p-field-radiobutton">
                        <input type="radio" id="roleId" name="selectionOption" value="roleId" onChange={(e) => setSelectedOption(e.target.value)} checked={selectedOption === 'roleId'} />
                        <label htmlFor="roleId" className="ml-2 mr-4">
                            Role
                        </label>
                        <input type="radio" id="positionId" name="selectionOption" value="positionId" onChange={(e) => setSelectedOption(e.target.value)} checked={selectedOption === 'positionId'} />
                        <label htmlFor="positionId" className="ml-2 mr-4">
                            Position
                        </label>
                        <input type="radio" id="profile" name="selectionOption" value="profile" onChange={(e) => setSelectedOption(e.target.value)} checked={selectedOption === 'profile'} />
                        <label htmlFor="profile" className="ml-2">
                            Profile
                        </label>
                    </div>
                    <div className="mt-2">
                        {selectedOption === 'profile' && <MultiSelect id="profileIds" value={_entity?.profileIds} options={profiles} onChange={(e) => setValByKey('profileIds', e.value)} optionLabel="name" optionValue="value" placeholder="Select Profiles" display="chip" className="w-full" />}
                        {selectedOption === 'roleId' && <MultiSelect id="roleIds" value={_entity?.roleIds} options={roles} onChange={(e) => setValByKey('roleIds', e.value)} optionLabel="name" optionValue="value" placeholder="Select Roles" display="chip" className="w-full" />}
                        {selectedOption === 'positionId' && <MultiSelect id="positionIds" value={_entity?.positionIds} options={positions} onChange={(e) => setValByKey('positionIds', e.value)} optionLabel="name" optionValue="value" placeholder="Select Positions" display="chip" className="w-full" />}
                    </div>
                    {!_.isEmpty(error.selection) && <small className="p-error">{error.selection}</small>}
                </div>

                <div className="col-12 grid mt-3">
                    <div className="col-4 field flex align-items-center">
                        <Checkbox inputId="selectAll" checked={selectAll} onChange={(e) => handleGroupCheckboxChange('all', e.checked)} className="mr-2" />
                        <label htmlFor="selectAll">Select All</label>
                    </div>
                    <div className="col-4 field flex align-items-center">
                        <Checkbox inputId="admin" checked={adminAll} onChange={(e) => handleGroupCheckboxChange('admin', e.checked)} className="mr-2" />
                        <label htmlFor="admin">Admin</label>
                    </div>
                    <div className="col-4 field flex align-items-center">
                        <Checkbox inputId="crud" checked={crudAll} onChange={(e) => handleGroupCheckboxChange('crud', e.checked)} className="mr-2" />
                        <label htmlFor="crud">CRUD Only</label>
                    </div>
                </div>

                <div className="col-12 grid mt-3">
                    {['create', 'read', 'update', 'delete', 'import', 'export', 'seeder'].map((perm) => (
                        <div className="col-6 md:col-3 field flex align-items-center" key={perm}>
                            <Checkbox inputId={perm} checked={_entity?.[perm] || false} onChange={(e) => setValByKey(perm, e.checked)} className="mr-2" />
                            <label htmlFor={perm} style={{ textTransform: 'capitalize' }}>
                                {perm}
                            </label>
                        </div>
                    ))}
                </div>

                {!_.isEmpty(error.general) && (
                    <div className="col-12">
                        <small className="p-error">{error.general}</small>
                    </div>
                )}
            </div>
        </Dialog>
    );
};

const mapState = (state) => ({ user: state.auth.user });
const mapDispatch = (dispatch) => ({
    alert: (data) => dispatch.toast.alert(data),
    hasServicePermission: (service) => dispatch.perms.hasServicePermission(service),
    hasServiceFieldsPermission: (service) => dispatch.perms.hasServiceFieldsPermission(service)
});

export default connect(mapState, mapDispatch)(PermissionServicesCreateDialogComponent);
