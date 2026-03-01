import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { useParams } from 'react-router-dom';
import client from '../../../services/restClient';
import _ from 'lodash';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Checkbox } from 'primereact/checkbox';
import { getSchemaValidationErrorsStrings } from '../../../utils';

const RolesEditDialogComponent = (props) => {
    const [_entity, set_entity] = useState({});
    const [error, setError] = useState({});
    const [loading, setLoading] = useState(false);
    const urlParams = useParams();

    useEffect(() => {
        set_entity(props.entity);
    }, [props.entity, props.show]);

    const onSave = async () => {
        setLoading(true);

        try {
            // Check if the role is being set as default
            if (_entity.isDefault) {
                // Find if there is already a default role
                const existingDefault = await client.service('roles').find({
                    query: {
                        isDefault: true,
                        _id: { $ne: _entity._id } // Exclude the current role being edited
                    }
                });

                if (existingDefault.data.length > 0) {
                    throw new Error('Only one role can be set as default.');
                }
            }

            // Prepare the data to be updated
            let _data = {
                name: _entity?.name,
                description: _entity?.description,
                isDefault: _entity?.isDefault
            };

            // Update the role
            const result = await client.service('roles').patch(_entity._id, _data);

            // Close the dialog and show success message
            props.onHide();
            props.alert({
                type: 'success',
                title: 'Edit info',
                message: 'Info roles updated successfully'
            });
            props.onEditResult(result);
        } catch (error) {
            console.debug('error', error);
            if (error.message === 'Only one role can be set as default.') {
                setError({ isDefault: error.message });
            } else {
                setError(getSchemaValidationErrorsStrings(error) || 'Failed to update info');
            }
            props.alert({
                type: 'error',
                title: 'Edit info',
                message: error.message || 'Failed to update info'
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

    const setValByKey = (key, val) => {
        let new_entity = { ..._entity, [key]: val };
        set_entity(new_entity);
        setError({});
    };

    return (
        <Dialog header="Edit Roles" visible={props.show} closable={false} onHide={props.onHide} modal style={{ width: '40vw' }} className="min-w-max" footer={renderFooter()} resizable={false}>
            <div className="grid p-fluid overflow-y-auto" style={{ maxWidth: '55vw' }} role="roles-edit-dialog-component">
                <div className="col-12 md:col-6 field">
                    <span className="align-items-center">
                        <label htmlFor="name">Name:</label>
                        <InputText id="name" className="w-full mb-3 p-inputtext-sm" value={_entity?.name} onChange={(e) => setValByKey('name', e.target.value)} />
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
                        <label htmlFor="description">Description:</label>
                        <InputTextarea id="description" rows={5} cols={30} value={_entity?.description} onChange={(e) => setValByKey('description', e.target.value)} autoResize />
                    </span>
                    <small className="p-error">
                        {!_.isEmpty(error['description']) && (
                            <p className="m-0" key="error-description">
                                {error['description']}
                            </p>
                        )}
                    </small>
                </div>
                <div className="col-12 md:col-6 field flex">
                    <span className="align-items-center">
                        <label htmlFor="isDefault">Is default:</label>
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

export default connect(mapState, mapDispatch)(RolesEditDialogComponent);
