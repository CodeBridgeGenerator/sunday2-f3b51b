import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { useParams } from 'react-router-dom';
import client from '../../../services/restClient';
import _ from 'lodash';
import initilization from '../../../utils/init';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';
import { CascadeSelect } from 'primereact/cascadeselect';
import { Checkbox } from 'primereact/checkbox';
import { Chip } from 'primereact/chip';
import { getSchemaValidationErrorsStrings } from '../../../utils';

const UserInvitesCreateDialogComponent = (props) => {
    const [_entity, set_entity] = useState({});
    const [error, setError] = useState({});
    const [loading, setLoading] = useState(false);
    const urlParams = useParams();
    const [positionsRolesOptions, setPositionsRolesOptions] = useState([]);
    const [company, setCompany] = useState([]);
    const [branch, setBranch] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]); // To store selected items

    useEffect(() => {
        let init = { sendMailCounter: '0', positions: [], roles: [] };
        if (!_.isEmpty(props?.entity)) {
            init = initilization({ ...props?.entity, ...init }, [positionsRolesOptions, company, branch], setError);
        }
        set_entity({ ...init });
    }, [props.show]);

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validate = () => {
        let ret = true;
        const error = {};

        if (_.isEmpty(_entity?.emailToInvite)) {
            error['emailToInvite'] = `Invitation Email field is required`;
            ret = false;
        } else if (!validateEmail(_entity?.emailToInvite)) {
            error['emailToInvite'] = `Invitation Email is not valid`;
            ret = false;
        }
        if (_.isEmpty(_entity?.positions)) {
            error['positions'] = `At least one position is required`;
            ret = false;
        }
        if (_.isEmpty(_entity?.roles)) {
            error['roles'] = `At least one role is required`;
            ret = false;
        }
        if (!ret) setError(error);
        return ret;
    };

    const onSave = async () => {
        if (!validate()) return;
        let _data = {
            emailToInvite: _entity?.emailToInvite,
            sendMailCounter: _entity?.sendMailCounter,
            code: _entity?.code,
            positions: _entity?.positions,
            roles: _entity?.roles,
            company: _entity?.company?._id,
            branch: _entity?.branch?._id,
            createdBy: props.user._id,
            updatedBy: props.user._id
        };

        setLoading(true);

        try {
            const result = await client.service('userInvites').create(_data);
            props.onHide();
            props.alert({
                type: 'success',
                title: 'Create info',
                message: 'Info User Invites created successfully'
            });
            props.onCreateResult(result);
        } catch (error) {
            console.log('error', error);
            setError(getSchemaValidationErrorsStrings(error) || 'Failed to create');
            props.alert({
                type: 'error',
                title: 'Create',
                message: 'Failed to create in User Invites'
            });
        }
        setLoading(false);
    };

    useEffect(() => {
        // Fetch roles and positions
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
                    positions: []
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
                                role.positions.push({
                                    name: position.name,
                                    code: position._id
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
        // Fetch companies
        client
            .service('companies')
            .find({
                query: {
                    $limit: 10000,
                    $sort: { createdAt: -1 }
                }
            })
            .then((res) => {
                setCompany(res.data.map((e) => ({ name: e.name, value: e._id })));
            })
            .catch((error) => {
                console.debug({ error });
                props.alert({
                    title: 'Companies',
                    type: 'error',
                    message: error.message || 'Failed to fetch companies'
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

    const handleCascadeSelectChange = (e) => {
        const selectedPosition = e.value;
        if (selectedPosition) {
            const roleId = positionsRolesOptions.find((role) => role.positions.some((pos) => pos.code === selectedPosition.code))?.code;

            // Check if the item is already selected
            const isAlreadySelected = selectedItems.some((item) => item.positionId === selectedPosition.code);

            if (isAlreadySelected) {
                // Deselect the item
                setSelectedItems((prev) => prev.filter((item) => item.positionId !== selectedPosition.code));
                set_entity((prev) => ({
                    ...prev,
                    positions: prev.positions.filter((id) => id !== selectedPosition.code),
                    roles: prev.roles.filter((id) => id !== roleId)
                }));
            } else {
                // Select the item
                const newSelectedItem = {
                    positionId: selectedPosition.code,
                    roleId: roleId,
                    positionName: selectedPosition.name,
                    roleName: positionsRolesOptions.find((role) => role.code === roleId)?.name
                };

                setSelectedItems((prev) => [...prev, newSelectedItem]);

                // Update entity state
                set_entity((prev) => ({
                    ...prev,
                    positions: [...(prev.positions || []), selectedPosition.code],
                    roles: [...(prev.roles || []), roleId]
                }));
            }
        }
    };

    const handleRemoveSelectedItem = (item) => {
        setSelectedItems((prev) => prev.filter((i) => i.positionId !== item.positionId));
        set_entity((prev) => ({
            ...prev,
            positions: prev.positions.filter((id) => id !== item.positionId),
            roles: prev.roles.filter((id) => id !== item.roleId)
        }));
    };

    const renderSelectedItems = () => {
        return (
            <div className="flex flex-wrap gap-2 mt-2">
                {selectedItems.map((item, index) => (
                    <Chip key={index} label={`${item.positionName} (${item.roleName})`} removable onRemove={() => handleRemoveSelectedItem(item)} />
                ))}
            </div>
        );
    };

    const itemTemplate = (option) => {
        const isSelected = selectedItems.some((item) => item.positionId === option.code);

        return (
            <div className="flex align-items-center gap-2">
                <Checkbox checked={isSelected} readOnly />
                <span>{option.name}</span>
            </div>
        );
    };

    const renderFooter = () => (
        <div className="flex justify-content-end">
            <Button label="save" className="p-button-text no-focus-effect" onClick={onSave} loading={loading} />
            <Button label="close" className="p-button-text no-focus-effect p-button-secondary" onClick={props.onHide} />
        </div>
    );

    return (
        <Dialog header="Create User Invites" visible={props.show} closable={false} onHide={props.onHide} modal style={{ width: '40vw' }} className="min-w-max" footer={renderFooter()} resizable={false}>
            <div className="grid p-fluid overflow-y-auto" style={{ maxWidth: '55vw' }} role="userInvites-create-dialog-component">
                <div className="col-12 md:col-6 field mt-2">
                    <span className="align-items-center">
                        <label htmlFor="emailToInvite">Invitation Email:</label>
                        <InputText id="emailToInvite" value={_entity?.emailToInvite} onChange={(e) => set_entity({ ..._entity, emailToInvite: e.target.value })} required />
                    </span>
                    <small className="p-error">
                        {!_.isEmpty(error['emailToInvite']) ? (
                            <p className="m-0" key="error-emailToInvite">
                                {error['emailToInvite']}
                            </p>
                        ) : null}
                    </small>
                </div>
                <div className="col-12 md:col-6 field">
                    <label htmlFor="position">Role and Position:</label>
                    <CascadeSelect
                        id="position"
                        value={null} // Reset after selection
                        options={positionsRolesOptions}
                        optionLabel="name"
                        optionGroupLabel="name"
                        optionGroupChildren={['positions']}
                        style={{ minWidth: '14rem' }}
                        placeholder="Select a Position"
                        onChange={handleCascadeSelectChange}
                        itemTemplate={itemTemplate}
                    />
                    {renderSelectedItems()}
                    {error.positions && <small className="p-error">{error.positions}</small>}
                </div>
                <div className="col-12 md:col-6 field">
                    <label htmlFor="company">Company:</label>
                    <Dropdown id="company" value={_entity?.company?._id || null} options={company} onChange={handleCompanyChange} optionLabel="name" placeholder="Select a company" />
                    {error.company && <small className="p-error">{error.company}</small>}
                </div>
                <div className="col-12 md:col-6 field">
                    <label htmlFor="branch">Branch:</label>
                    <Dropdown id="branch" value={_entity?.branch?._id || null} options={branch} onChange={(e) => set_entity({ ..._entity, branch: { _id: e.value } })} optionLabel="name" placeholder="Select a branch" disabled={!branch.length} />
                    {error.branch && <small className="p-error">{error.branch}</small>}
                </div>
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

export default connect(mapState, mapDispatch)(UserInvitesCreateDialogComponent);
