import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import client from '../../../services/restClient';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import seederData from './permissionServices.seeder.json';
import { SeederService } from './../../../services/SeederService';

import { getSchemaValidationErrorsStrings } from '../../../utils';

const PermissionServicesSeederDialogComponent = (props) => {
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setError('');
    }, []);

    const onRun = async () => {
        if (!seederData.length) return;
        setError('');
        let results = [];
        const promises = [];
        const services = [];
        setLoading(true);
        try {
            for (let i = 0; i < seederData.length; i++) {
                const res = await SeederService('permissionServices', seederData[i], promises, services, _schema, props.user);

                results = [...results, res];
            }
            props.onHide();
            props.alert({
                type: 'success',
                title: 'Seeder',
                message: 'Seeder ran successfully'
            });
            props.onSeederResults(results);
        } catch (error) {
            console.log('error', error);
            setError(getSchemaValidationErrorsStrings(error) || 'Failed to run seeder');
            props.alert({
                type: 'error',
                title: 'Seeder',
                message: 'Failed to run seeder'
            });
        }
        setLoading(false);
    };

    const renderFooter = () => (
        <div className="flex justify-content-end">
            <Button label="run" className="p-button-text no-focus-effect" onClick={onRun} loading={loading} disabled={!seederData.length} />
            <Button label="close" className="p-button-text no-focus-effect p-button-secondary" onClick={props.onHide} />
        </div>
    );

    return (
        <Dialog header="Seeder" visible={props.show} closable={false} onHide={props.onHide} modal style={{ width: '40vw' }} className="min-w-max" footer={renderFooter()} resizable={false}>
            <div>
                <div className="w-full">
                    {!Array.isArray(error) ? (
                        <pre>{JSON.stringify(seederData, null, 2)}</pre>
                    ) : (
                        <div>
                            <h4>Error Found</h4>
                        </div>
                    )}
                </div>

                <small className="p-error">
                    {Array.isArray(error)
                        ? error.map((e, i) => (
                              <p className="m-0" key={i}>
                                  {e}
                              </p>
                          ))
                        : error}
                </small>
            </div>
        </Dialog>
    );
};

const mapState = (state) => {
    const { isLoggedIn, user } = state.auth;
    return { isLoggedIn, user };
};

const mapDispatch = (dispatch) => ({
    alert: (data) => dispatch.toast.alert(data),
    hasServicePermission: (service) => dispatch.perms.hasServicePermission(service),
    hasServiceFieldsPermission: (service) => dispatch.perms.hasServiceFieldsPermission(service)
});

export default connect(mapState, mapDispatch)(PermissionServicesSeederDialogComponent);
