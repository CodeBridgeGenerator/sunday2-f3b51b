import { Button } from 'primereact/button';
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { Link, useNavigate, useParams } from 'react-router-dom';
import client from '../../../services/restClient';
import { Tag } from 'primereact/tag';
import moment from 'moment';
import ProjectLayout from '../../Layouts/ProjectLayout';

// Helper functions moved outside the component for clarity
const getPermissionTag = (value) => {
    return value ? <Tag severity="success" value="Yes"></Tag> : <Tag severity="danger" value="No"></Tag>;
};

const renderRelatedLink = (entity, path) => {
    if (!entity) return null;
    return (
        <Link to={`/${path}/${entity._id}`} className="text-primary hover:underline">
            <p className="m-0 font-semibold">{entity.name}</p>
        </Link>
    );
};

const SinglePermissionServicesPage = (props) => {
    const navigate = useNavigate();
    const urlParams = useParams();
    const [_entity, set_entity] = useState({});

    useEffect(() => {
        //on mount
        client
            .service('permissionServices')
            .get(urlParams.singlePermissionServicesId, {
                query: {
                    $populate: [{ path: 'createdBy', service: 'users', select: ['name'] }, { path: 'updatedBy', service: 'users', select: ['name'] }, 'profile', 'roleId', 'positionId', 'userId']
                }
            })
            .then((res) => {
                set_entity(res || {});
            })
            .catch((error) => {
                console.log({ error });
                props.alert({
                    title: 'PermissionServices',
                    type: 'error',
                    message: error.message || 'Failed to get permissionServices'
                });
            });
    }, [props, urlParams.singlePermissionServicesId]);

    const goBack = () => {
        navigate(-1);
    };

    return (
        <ProjectLayout>
            <div className="col-12 flex flex-column align-items-center">
                <div className="col-10">
                    <div className="flex align-items-center justify-content-start">
                        <Button className="p-button-text p-button-sm mr-2" icon="pi pi-arrow-left" onClick={() => goBack()} />
                        <h3 className="m-0">Service Permission</h3>
                    </div>
                    <p className="text-sm text-500">permissionServices/{urlParams.singlePermissionServicesId}</p>
                </div>
                <div className="card col-10">
                    <div className="grid">
                        <div className="col-12 md:col-6 lg:col-3">
                            <label className="text-sm text-primary">Service</label>
                            <p className="m-0">{_entity?.service}</p>
                        </div>
                        {_entity?.profile && (
                            <div className="col-12 md:col-6 lg:col-3">
                                <label className="text-sm text-primary">Profile</label>
                                {renderRelatedLink(_entity?.profile, 'profiles')}
                            </div>
                        )}
                        {_entity?.roleId && (
                            <div className="col-12 md:col-6 lg:col-3">
                                <label className="text-sm text-primary">Role</label>
                                {renderRelatedLink(_entity?.roleId, 'roles')}
                            </div>
                        )}
                        {_entity?.positionId && (
                            <div className="col-12 md:col-6 lg:col-3">
                                <label className="text-sm text-primary">Position</label>
                                {renderRelatedLink(_entity?.positionId, 'positions')}
                            </div>
                        )}
                        {_entity?.userId && (
                            <div className="col-12 md:col-6 lg:col-3">
                                <label className="text-sm text-primary">User</label>
                                {renderRelatedLink(_entity?.userId, 'users')}
                            </div>
                        )}

                        <div className="col-12 md:col-6 lg:col-3">
                            <label className="text-sm text-primary">Create</label>
                            <p className="m-0">{getPermissionTag(_entity?.create)}</p>
                        </div>
                        <div className="col-12 md:col-6 lg:col-3">
                            <label className="text-sm text-primary">Read</label>
                            <p className="m-0">{getPermissionTag(_entity?.read)}</p>
                        </div>
                        <div className="col-12 md:col-6 lg:col-3">
                            <label className="text-sm text-primary">Update</label>
                            <p className="m-0">{getPermissionTag(_entity?.update)}</p>
                        </div>
                        <div className="col-12 md:col-6 lg:col-3">
                            <label className="text-sm text-primary">Delete</label>
                            <p className="m-0">{getPermissionTag(_entity?.delete)}</p>
                        </div>
                        <div className="col-12 md:col-6 lg:col-3">
                            <label className="text-sm text-primary">Import</label>
                            <p className="m-0">{getPermissionTag(_entity?.import)}</p>
                        </div>
                        <div className="col-12 md:col-6 lg:col-3">
                            <label className="text-sm text-primary">Export</label>
                            <p className="m-0">{getPermissionTag(_entity?.export)}</p>
                        </div>
                        <div className="col-12 md:col-6 lg:col-3">
                            <label className="text-sm text-primary">Seeder</label>
                            <p className="m-0">{getPermissionTag(_entity?.seeder)}</p>
                        </div>

                        <div className="col-12 md:col-6 lg:col-3">
                            <label className="text-sm text-primary">Created By</label>
                            <p className="m-0">{_entity?.createdBy?.name}</p>
                        </div>
                        <div className="col-12 md:col-6 lg:col-3">
                            <label className="text-sm text-primary">Updated By</label>
                            <p className="m-0">{_entity?.updatedBy?.name}</p>
                        </div>
                        <div className="col-12 md:col-6 lg:col-3">
                            <label className="text-sm text-primary">Created At</label>
                            <p className="m-0">{moment(_entity?.createdAt).format('DD/MM/YYYY hh:mm A')}</p>
                        </div>
                        <div className="col-12 md:col-6 lg:col-3">
                            <label className="text-sm text-primary">Updated At</label>
                            <p className="m-0">{moment(_entity?.updatedAt).format('DD/MM/YYYY hh:mm A')}</p>
                        </div>
                    </div>
                </div>
            </div>
        </ProjectLayout>
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

export default connect(mapState, mapDispatch)(SinglePermissionServicesPage);
