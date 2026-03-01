import { Button } from 'primereact/button';
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import client from '../../../services/restClient';
import moment from 'moment';
import ProjectLayout from '../../Layouts/ProjectLayout';

const SingleUserInvitesPage = (props) => {
    const navigate = useNavigate();
    const urlParams = useParams();
    const [_entity, set_entity] = useState({});

    useEffect(() => {
        // on mount
        client
            .service('userInvites')
            .get(urlParams.singleUserInvitesId, {
                query: {
                    $populate: [
                        {
                            path: 'positions',
                            service: 'positions',
                            select: ['name']
                        },
                        {
                            path: 'roles',
                            service: 'roles',
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
                            path: 'createdBy',
                            service: 'users',
                            select: ['name']
                        },
                        {
                            path: 'updatedBy',
                            service: 'users',
                            select: ['name']
                        }
                    ]
                }
            })
            .then((res) => {
                set_entity(res || {});
            })
            .catch((error) => {
                console.debug({ error });
                props.alert({
                    title: 'UserInvites',
                    type: 'error',
                    message: error.message || 'Failed to get userInvites'
                });
            });
    }, [props, urlParams.singleUserInvitesId]);

    const goBack = () => {
        navigate('/cbAdmin/userInvites');
    };

    return (
        <ProjectLayout>
            <div className="col-12 flex flex-column align-items-center">
                <div className="col-10">
                    <div className="flex align-items-center justify-content-start">
                        <Button className="p-button-text" icon="pi pi-chevron-left" onClick={() => goBack()} />
                        <h3 className="m-0">User Invites</h3>
                    </div>
                    <p>userInvites/{urlParams.singleUserInvitesId}</p>
                </div>
                <div className="card w-full">
                    <div className="grid">
                        {/* Invitation Email */}
                        <div className="col-12 md:col-6 lg:col-3">
                            <label className="text-sm text-primary">Invitation Email</label>
                            <p className="m-0 ml-3">{_entity?.emailToInvite}</p>
                        </div>

                        {/* Status */}
                        <div className="col-12 md:col-6 lg:col-3">
                            <label className="text-sm text-primary">Status</label>
                            <p className="m-0 ml-3">{_entity?.status ? 'Active' : 'Inactive'}</p>
                        </div>

                        {/* SendMailCounter */}
                        <div className="col-12 md:col-6 lg:col-3">
                            <label className="text-sm text-primary">SendMailCounter</label>
                            <p className="m-0 ml-3">{Number(_entity?.sendMailCounter)}</p>
                        </div>

                        {/* Code */}
                        <div className="col-12 md:col-6 lg:col-3">
                            <label className="text-sm text-primary">Code</label>
                            <p className="m-0 ml-3">{_entity?.code}</p>
                        </div>

                        {/* Positions */}
                        <div className="col-12 md:col-6 lg:col-3">
                            <label className="text-sm text-primary">Positions</label>
                            <p className="m-0 ml-3">{_entity?.positions?.map((pos) => pos.name).join(', ')}</p>
                        </div>

                        {/* Roles */}
                        <div className="col-12 md:col-6 lg:col-3">
                            <label className="text-sm text-primary">Roles</label>
                            <p className="m-0 ml-3">{_entity?.roles?.map((role) => role.name).join(', ')}</p>
                        </div>

                        {/* Company */}
                        <div className="col-12 md:col-6 lg:col-3">
                            <label className="text-sm text-primary">Company</label>
                            <p className="m-0 ml-3">{_entity?.company?.name}</p>
                        </div>

                        {/* Branch */}
                        <div className="col-12 md:col-6 lg:col-3">
                            <label className="text-sm text-primary">Branch</label>
                            <p className="m-0 ml-3">{_entity?.branch?.name}</p>
                        </div>
                    </div>
                </div>
            </div>
        </ProjectLayout>
    );
};

const mapState = (state) => {
    const { user, isLoggedIn } = state.auth;
    return { user, isLoggedIn };
};

const mapDispatch = (dispatch) => ({
    alert: (data) => dispatch.toast.alert(data),
    hasServicePermission: (service) => dispatch.perms.hasServicePermission(service),
    hasServiceFieldsPermission: (service) => dispatch.perms.hasServiceFieldsPermission(service)
});

export default connect(mapState, mapDispatch)(SingleUserInvitesPage);
