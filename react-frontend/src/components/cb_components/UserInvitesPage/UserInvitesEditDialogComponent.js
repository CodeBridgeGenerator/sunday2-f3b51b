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
import { InputNumber } from 'primereact/inputnumber';
import { getSchemaValidationErrorsStrings } from '../../../utils';
import { Dropdown } from 'primereact/dropdown';
import { CascadeSelect } from 'primereact/cascadeselect';

const UserInvitesCreateDialogComponent = (props) => {
    const [_entity, set_entity] = useState({});
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [company, setCompany] = useState([]);
    const [branch, setBranch] = useState([]);
    const [positionsRolesOptions, setPositionsRolesOptions] = useState([]);
    const urlParams = useParams();

    useEffect(() => {
        set_entity(props.entity);
    }, [props.entity, props.show]);

    const onSave = async () => {
        let _data = {
            emailToInvite: _entity?.emailToInvite,
            sendMailCounter: _entity?.sendMailCounter,
            code: _entity?.code,
            position: _entity?.position?.positionID,
            role: _entity?.position?.roleID,
            company: _entity?.company?._id,
            branch: _entity?.branch?._id
        };

        setLoading(true);
        try {
            const result = await client.service('userInvites').patch(_entity._id, _data);
            props.onHide();
            props.alert({
                type: 'success',
                title: 'Edit info',
                message: 'Info userInvites updated successfully'
            });
            props.onEditResult(result);
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

    return (
        <Dialog header="Edit User Invites" visible={props.show} closable={false} onHide={props.onHide} modal style={{ width: '40vw' }} className="min-w-max" footer={renderFooter()} resizable={false}>
            <div className="grid p-fluid overflow-y-auto" style={{ maxWidth: '55vw' }} role="userInvites-edit-dialog-component">
                <div className="col-12 md:col-6 field mt-5">
                    <span className="align-items-center">
                        <label htmlFor="emailToInvite">Invitation Email:</label>
                        <InputText id="emailToInvite" className="w-full mb-3 p-inputtext-sm" value={_entity?.emailToInvite} onChange={(e) => setValByKey('emailToInvite', e.target.value)} required />
                    </span>
                </div>
                <div className="col-12 md:col-6 field mt-5">
                    <span className="align-items-center">
                        <label htmlFor="sendMailCounter">SendMailCounter:</label>
                        <InputNumber id="sendMailCounter" className="w-full mb-3 p-inputtext-sm" value={_entity?.sendMailCounter} useGrouping={false} onChange={(e) => setValByKey('sendMailCounter', e.value)} />
                    </span>
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
                    <label htmlFor="position">Role and Position</label>
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
                {/* <div className="col-12 md:col-6 field">
          <span className="align-items-center">
            <label htmlFor="code">Code:</label>
            <InputNumber
              id="code"
              className="w-full mb-3 p-inputtext-sm"
              value={_entity?.code}
              useGrouping={false}
              onChange={(e) => setValByKey("code", e.value)}
            />
          </span>
          <small className="p-error">
            {!_.isEmpty(error["code"]) ? (
              <p className="m-0" key="error-code">
                {error["code"]}
              </p>
            ) : null}
          </small>
        </div> */}
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
