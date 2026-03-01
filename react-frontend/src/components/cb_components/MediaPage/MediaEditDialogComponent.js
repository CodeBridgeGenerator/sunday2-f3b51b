import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { useParams } from 'react-router-dom';
import client from '../../../services/restClient';
import _ from 'lodash';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { getSchemaValidationErrorsStrings } from '../../../utils';

const DocumentStoragesCreateDialogComponent = (props) => {
    const [_entity, set_entity] = useState({});
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const urlParams = useParams();

    useEffect(() => {
        set_entity(props.entity);
    }, [props.entity, props.show]);

    const onSave = async () => {
        let _data = {
            name: _entity?.name,
            size: _entity?.size,
            path: _entity?.path,
            lastModifiedDate: _entity?.lastModifiedDate,
            lastModified: _entity?.lastModified,
            eTag: _entity?.eTag,
            versionId: _entity?.versionId,
            url: _entity?.url,
            tableId: _entity?.tableId,
            tableName: _entity?.tableName
        };

        setLoading(true);
        try {
            const result = await client.service('documentStorages').patch(_entity._id, _data);
            props.onHide();
            props.alert({
                type: 'success',
                title: 'Edit info',
                message: 'Info documentStorages updated successfully'
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
        <Dialog header="Edit Media Storages" visible={props.show} closable={false} onHide={props.onHide} modal style={{ width: '40vw' }} className="min-w-max" footer={renderFooter()} resizable={false}>
            <div className="grid p-fluid overflow-y-auto" style={{ maxWidth: '55vw' }} role="documentStorages-edit-dialog-component">
                <div className="col-12 md:col-6 field mt-5">
                    <span className="align-items-center">
                        <label htmlFor="name">Media Name:</label>
                        <InputText id="name" className="w-full mb-3 p-inputtext-sm" value={_entity?.name} onChange={(e) => setValByKey('name', e.target.value)} required />
                    </span>
                </div>
                <div className="col-12 md:col-6 field mt-5">
                    <span className="align-items-center">
                        <label htmlFor="size">Size:</label>
                        <InputNumber id="size" className="w-full mb-3 p-inputtext-sm" value={_entity?.size} useGrouping={false} onChange={(e) => setValByKey('size', e.value)} />
                    </span>
                </div>
                <div className="col-12 md:col-6 field mt-5">
                    <span className="align-items-center">
                        <label htmlFor="path">Path:</label>
                        <InputText id="path" className="w-full mb-3 p-inputtext-sm" value={_entity?.path} onChange={(e) => setValByKey('path', e.target.value)} required />
                    </span>
                </div>
                <div className="col-12 md:col-6 field mt-5">
                    <span className="align-items-center">
                        <label htmlFor="lastModifiedDate">Last Modified Date:</label>
                        undefined
                    </span>
                </div>
                <div className="col-12 md:col-6 field mt-5">
                    <span className="align-items-center">
                        <label htmlFor="lastModified">Last Modified:</label>
                        <InputNumber id="lastModified" className="w-full mb-3 p-inputtext-sm" value={_entity?.lastModified} onChange={(e) => setValByKey('lastModified', e.value)} />
                    </span>
                </div>
                <div className="col-12 md:col-6 field mt-5">
                    <span className="align-items-center">
                        <label htmlFor="eTag">AWS ETag:</label>
                        <InputText id="eTag" className="w-full mb-3 p-inputtext-sm" value={_entity?.eTag} onChange={(e) => setValByKey('eTag', e.target.value)} required />
                    </span>
                </div>
                <div className="col-12 md:col-6 field mt-5">
                    <span className="align-items-center">
                        <label htmlFor="versionId">AWS Version Id:</label>
                        <InputText id="versionId" className="w-full mb-3 p-inputtext-sm" value={_entity?.versionId} onChange={(e) => setValByKey('versionId', e.target.value)} required />
                    </span>
                </div>
                <div className="col-12 md:col-6 field mt-5">
                    <span className="align-items-center">
                        <label htmlFor="url">Url:</label>
                        <InputText id="url" className="w-full mb-3 p-inputtext-sm" value={_entity?.url} onChange={(e) => setValByKey('url', e.target.value)} required />
                    </span>
                </div>
                <div className="col-12 md:col-6 field mt-5">
                    <span className="align-items-center">
                        <label htmlFor="tableId">Table Id:</label>
                        <InputText id="tableId" className="w-full mb-3 p-inputtext-sm" value={_entity?.tableId} onChange={(e) => setValByKey('tableId', e.target.value)} required />
                    </span>
                </div>
                <div className="col-12 md:col-6 field mt-5">
                    <span className="align-items-center">
                        <label htmlFor="tableName">Table Name:</label>
                        <InputText id="tableName" className="w-full mb-3 p-inputtext-sm" value={_entity?.tableName} onChange={(e) => setValByKey('tableName', e.target.value)} required />
                    </span>
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

export default connect(mapState, mapDispatch)(DocumentStoragesCreateDialogComponent);
