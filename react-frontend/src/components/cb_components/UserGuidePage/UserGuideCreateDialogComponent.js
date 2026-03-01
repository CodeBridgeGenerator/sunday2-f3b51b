import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { useParams } from 'react-router-dom';
import client from '../../../services/restClient';
import _ from 'lodash';
import initilization from '../../../utils/init';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { getSchemaValidationErrorsStrings } from '../../../utils';
const UserGuideCreateDialogComponent = (props) => {
    const [_entity, set_entity] = useState({});
    const [error, setError] = useState({});
    const [loading, setLoading] = useState(false);
    const urlParams = useParams();

    useEffect(() => {
        let init = {};
        if (!_.isEmpty(props?.entity)) {
            init = initilization({ ...props?.entity, ...init }, [], setError);
        }
        set_entity({ ...init });
    }, [props.show]);

    const validate = () => {
        let ret = true;
        const error = {};

        if (_.isEmpty(_entity?.serviceName)) {
            error['serviceName'] = `ServiceName field is required`;
            ret = false;
        }
        if (!ret) setError(error);
        return ret;
    };

    const onSave = async () => {
        if (!validate()) return;
        let _data = {
            serviceName: _entity?.serviceName,
            expiry: _entity?.expiry,
            createdBy: props.user._id,
            updatedBy: props.user._id
        };

        setLoading(true);

        try {
            const result = await client.service('userGuide').create(_data);
            props.onHide();
            props.alert({
                type: 'success',
                title: 'Create info',
                message: 'Info UserGuide created successfully'
            });
            props.onCreateResult(result);
        } catch (error) {
            console.debug('error', error);
            setError(getSchemaValidationErrorsStrings(error) || 'Failed to create');
            props.alert({
                type: 'error',
                title: 'Create',
                message: 'Failed to create in UserGuide'
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

    return (
        <Dialog header="Create UserGuide" visible={props.show} closable={false} onHide={props.onHide} modal style={{ width: '40vw' }} className="min-w-max" footer={renderFooter()} resizable={false}>
            <div className="grid p-fluid overflow-y-auto" style={{ maxWidth: '55vw' }} role="userGuide-create-dialog-component">
                <div className="col-12 md:col-6 field">
                    <span className="align-items-center">
                        <label htmlFor="serviceName">ServiceName:</label>
                        <InputText id="serviceName" className="w-full mb-3 p-inputtext-sm" value={_entity?.serviceName} onChange={(e) => setValByKey('serviceName', e.target.value)} required />
                    </span>
                    <small className="p-error">
                        {!_.isEmpty(error['serviceName']) ? (
                            <p className="m-0" key="error-serviceName">
                                {error['serviceName']}
                            </p>
                        ) : null}
                    </small>
                </div>
                <div className="col-12 md:col-6 field">
                    <span className="align-items-center">
                        <label htmlFor="expiry">Expiry:</label>
                        undefined
                    </span>
                    <small className="p-error">
                        {!_.isEmpty(error['expiry']) ? (
                            <p className="m-0" key="error-expiry">
                                {error['expiry']}
                            </p>
                        ) : null}
                    </small>
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

export default connect(mapState, mapDispatch)(UserGuideCreateDialogComponent);
