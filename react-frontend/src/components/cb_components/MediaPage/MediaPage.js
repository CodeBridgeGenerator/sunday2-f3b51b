import React, { useEffect, useState, useRef } from 'react';
import { connect } from 'react-redux';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import client from '../../../services/restClient';
import _ from 'lodash';
import DocumentStoragesDatatable from './MediaDataTable';
import AreYouSureDialog from '../../common/AreYouSureDialog';

const MediaPage = (props) => {
    const navigate = useNavigate();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedEntityIndex, setSelectedEntityIndex] = useState(null);
    const [showAreYouSureDialog, setShowAreYouSureDialog] = useState(false);
    const allowedExtensions = ['mp4', 'mp3', 'mov'];
    const [selectedDelete, setSelectedDelete] = useState([]);
    const [permissions, setPermissions] = useState({});
    const [selectedUser, setSelectedUser] = useState();
    const filename = 'media';

    useEffect(() => {
        //on mount
        setLoading(true);
        client
            .service('documentStorages')
            .find({
                query: {
                    $limit: 10000,
                    $populate: [
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
                let results = res.data;
                props.hasServicePermission(filename).then(setPermissions);
                const filteredResults = results.filter((item) => {
                    if (item.url) {
                        const url = item.url.toLowerCase();
                        const extension = url.split('.').pop();
                        return allowedExtensions.includes(extension);
                    }
                    return false;
                });

                setData(filteredResults);
                setLoading(false);
            })
            .catch((error) => {
                console.debug({ error });
                setLoading(false);
                props.alert({
                    title: 'Media Storages',
                    type: 'error',
                    message: error.message || 'Failed get Media Storages'
                });
            });
    }, []);

    const onRowDelete = (index) => {
        setSelectedEntityIndex(index);
        setShowAreYouSureDialog(true);
    };

    const onRowClick = ({ data }) => {
        navigate(`/cbAdmin/documentStorages/${data._id}`);
    };

    const deleteRow = async () => {
        try {
            await client.service('documentStorages').remove(selectedEntityIndex);
            let _newData = data.filter((data) => data._id !== selectedEntityIndex);
            setData(_newData);
            setSelectedEntityIndex();
            setShowAreYouSureDialog(false);
        } catch (error) {
            console.debug({ error });
            props.alert({
                title: 'Positions',
                type: 'error',
                message: error.message || 'Failed delete record'
            });
        }
    };

    return (
        <div className="mt-5">
            <div className="grid">
                <div className="col-6 flex justify-content-start">
                    <h4 className="mb-0 ml-2">
                        <span>
                            {' '}
                            <small>Data</small> /{' '}
                        </span>
                        <strong>Media </strong>
                    </h4>
                </div>
            </div>
            <div className="grid align-items-center">
                <div className="col-12" role="documentStorages-datatable">
                    <DocumentStoragesDatatable items={data} onRowDelete={onRowDelete} onRowClick={onRowClick} loading={loading} filename={filename} />
                </div>
            </div>
            <AreYouSureDialog header="Delete" body="Are you sure you want to delete this record?" show={showAreYouSureDialog} onHide={() => setShowAreYouSureDialog(false)} onYes={() => deleteRow()} />
        </div>
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

export default connect(mapState, mapDispatch)(MediaPage);
