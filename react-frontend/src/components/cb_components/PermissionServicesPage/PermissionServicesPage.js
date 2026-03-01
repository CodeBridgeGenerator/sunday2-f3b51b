import React, { useEffect, useState, useRef } from 'react';
import { connect } from 'react-redux';
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import client from '../../../services/restClient';
import _ from 'lodash';
import entityCreate from '../../../utils/entity';
import { Button } from 'primereact/button';
import { SplitButton } from 'primereact/splitbutton';
import DownloadCSV from '../../../utils/DownloadCSV';
import AreYouSureDialog from '../../common/AreYouSureDialog';
import PermissionServicesDatatable from './PermissionServicesDataTable';
import PermissionServicesEditDialogComponent from './PermissionServicesEditDialogComponent';
import PermissionServicesCreateDialogComponent from './PermissionServicesCreateDialogComponent';
import PermissionServicesFakerDialogComponent from './PermissionServicesFakerDialogComponent';
import PermissionServicesSeederDialogComponent from './PermissionServicesSeederDialogComponent';
import SortIcon from '../../../assets/media/Sort.png';
import FilterIcon from '../../../assets/media/Filter.png';

const PermissionServicesPage = (props) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);
    const [fields, setFields] = useState([]);
    const [showAreYouSureDialog, setShowAreYouSureDialog] = useState(false);
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [newRecord, setRecord] = useState({});
    const [showFakerDialog, setShowFakerDialog] = useState(false);
    const [showDeleteAllDialog, setShowDeleteAllDialog] = useState(false);
    const [showSeederDialog, setShowSeederDialog] = useState(false);
    const [selectedEntityIndex, setSelectedEntityIndex] = useState(null);
    const [showUpload, setShowUpload] = useState(false);
    const [showFilter, setShowFilter] = useState(false);
    const [selectedFilterFields, setSelectedFilterFields] = useState([]);
    const [selectedHideFields, setSelectedHideFields] = useState([]);
    const [showColumns, setShowColumns] = useState(false);
    const [searchDialog, setSearchDialog] = useState(false);
    const urlParams = useParams();
    const filename = 'permissionServices';
    const [isHelpSidebarVisible, setHelpSidebarVisible] = useState(false);
    const [initialData, setInitialData] = useState([]);
    const [selectedSortOption, setSelectedSortOption] = useState('');
    const [selectedDelete, setSelectedDelete] = useState([]);
    const [permissions, setPermissions] = useState({});
    const [paginatorRecordsNo, setPaginatorRecordsNo] = useState(10);
    const [selectedUser, setSelectedUser] = useState();

    const [refresh, setRefresh] = useState(false);
    const [triggerDownload, setTriggerDownload] = useState(false);

    const helpSidebarRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (helpSidebarRef.current && !helpSidebarRef.current.contains(event.target) && isHelpSidebarVisible) {
                setHelpSidebarVisible(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isHelpSidebarVisible]);

    const toggleHelpSidebar = () => {
        setHelpSidebarVisible(!isHelpSidebarVisible);
    };

    useEffect(() => {
        const _getSchema = async () => {
            const _schema = await props.getSchema('permissionServices');
            let _fields = _schema.data.map((field, i) => i > 15 && field.field);
            setSelectedHideFields(_fields);
            _fields = _schema.data.map((field, i) => {
                return {
                    name: field.field,
                    value: field.field,
                    type: field?.properties?.type
                };
            });
            setFields(_fields);
        };
        _getSchema();
        props.hasServicePermission(filename).then(setPermissions);
        if (location?.state?.action === 'create') {
            entityCreate(location, setRecord);
            setShowCreateDialog(true);
        } else if (location?.state?.action === 'edit') {
            setShowCreateDialog(true);
        }
    }, []);

    useEffect(() => {
        // on mount
        setLoading(true);
        client
            .service('permissionServices')
            .find({
                query: {
                    $limit: 10000,
                    profile: urlParams.singleProfilesId,
                    roleId: urlParams.singleRolesId,
                    positionId: urlParams.singlePositionsId,
                    employeeId: urlParams.singleEmployeesId,
                    userId: urlParams.singleUsersId,
                    $populate: [
                        { path: 'profile', service: 'profiles', select: ['name'] },
                        { path: 'roleId', service: 'roles', select: ['name'] },
                        { path: 'positionId', service: 'positions', select: ['name'] }
                    ]
                }
            })
            .then((res) => {
                let results = res.data;
                setData(results);
                setInitialData(results);
                setLoading(false);
                props.hide();
            })
            .catch((error) => {
                console.log({ error });
                setLoading(false);
                props.alert({
                    title: 'Service Permissions',
                    type: 'error',
                    message: error.message || 'Failed get Service Permissions'
                });
            });
    }, [showFakerDialog, showDeleteAllDialog, showEditDialog, showCreateDialog, refresh]);

    const onClickSaveFilteredfields = (ff) => {
        console.log(ff);
    };

    const onClickSaveHiddenfields = (ff) => {
        console.log(ff);
    };

    const onEditRow = (rowData, rowIndex) => {
        setSelectedEntityIndex(rowData._id);
        setShowEditDialog(true);
    };

    const onCreateResult = (newEntity) => {
        setData([...data, newEntity]);
    };
    const onFakerCreateResults = (newEntities) => {
        setSelectedEntityIndex();
        setData([...data, ...newEntities]);
    };
    const onSeederResults = (newEntities) => {
        setSelectedEntityIndex();
        setData([...data, ...newEntities]);
    };

    const onEditResult = (newEntity) => {
        let _newData = _.cloneDeep(data);
        _.set(_newData, { _id: selectedEntityIndex }, newEntity);
        setData(_newData);
    };

    const deleteRow = async () => {
        try {
            await client.service('permissionServices').remove(selectedEntityIndex);
            let _newData = data.filter((data) => data._id !== selectedEntityIndex);
            setData(_newData);
            setSelectedEntityIndex();
            setShowAreYouSureDialog(false);
        } catch (error) {
            console.log({ error });
            props.alert({
                title: 'Service Permissions',
                type: 'error',
                message: error.message || 'Failed delete record'
            });
        }
    };
    const onRowDelete = (index) => {
        setSelectedEntityIndex(index);
        setShowAreYouSureDialog(true);
    };

    const onShowDeleteAll = (rowData, rowIndex) => {
        setShowDeleteAllDialog(true);
    };

    const deleteAll = async () => {
        if (process.env.REACT_APP_ENV !== 'development') {
            props.alert({
                title: 'Delete is disabled for non-dev envs',
                type: 'error',
                message: 'Delete is not recommended.'
            });
            return;
        }

        setShowDeleteAllDialog(false);
        const countDataItems = data?.length;
        const promises = data.map((e) => client.service('permissionServices').remove(e?._id));
        await Promise.all(
            promises.map((p) =>
                p.catch((error) => {
                    props.alert({
                        title: 'Service Permissions',
                        type: 'error',
                        message: error.message || 'Failed to delete all records'
                    });
                    console.log({ error });
                })
            )
        );
        await props.alert({
            title: 'Service Permissions',
            type: 'warn',
            message: `Successfully dropped ${countDataItems} records`
        });
    };

    const onRowClick = ({ data }) => {
        navigate(`/cbAdmin/permissionServices/${data._id}`);
    };
    const copyPageLink = () => {
        const currentUrl = window.location.href;
        navigator.clipboard
            .writeText(currentUrl)
            .then(() => {
                props.alert({
                    title: 'Copied',
                    type: 'success',
                    message: 'Page link copied to clipboard'
                });
            })
            .catch((error) => {
                props.alert({
                    title: 'Error',
                    type: 'error',
                    message: 'Failed to copy page link'
                });
                console.error('Failed to copy: ', error);
            });
    };

    const menuItems = [
        {
            label: 'Copy link',
            icon: 'pi pi-copy',
            command: () => copyPageLink()
        },
        // {
        //     label: "Share",
        //     icon: "pi pi-share-alt",
        //     command: () => setSearchDialog(true)
        // },
        permissions.import && {
            label: 'Import',
            icon: 'pi pi-upload',
            command: () => setShowUpload(true)
        },
        permissions.export && {
            label: 'Export',
            icon: 'pi pi-download',
            command: () => {
                data.length > 0
                    ? setTriggerDownload(true)
                    : props.alert({
                          title: 'Export',
                          type: 'warn',
                          message: 'no data to export'
                      });
            }
        },
        {
            label: 'Help',
            icon: 'pi pi-question-circle',
            command: () => toggleHelpSidebar()
        },
        { separator: true },
        process.env.REACT_APP_ENV == 'development' && {
            label: 'Testing',
            icon: 'pi pi-check-circle',
            items: [
                {
                    label: 'Faker',
                    icon: 'pi pi-bullseye',
                    command: (e) => {
                        setShowFakerDialog(true);
                    },
                    show: true
                },
                {
                    label: `Drop ${data?.length}`,
                    icon: 'pi pi-trash',
                    command: (e) => {
                        setShowDeleteAllDialog(true);
                    }
                }
            ]
        },
        permissions.seeder && {
            label: 'Data seeder',
            icon: 'pi pi-database',
            command: (e) => {
                setShowSeederDialog(true);
            }
        }
    ];

    const onMenuSort = (sortOption) => {
        let sortedData;
        switch (sortOption) {
            case 'nameAsc':
                sortedData = _.orderBy(data, ['name'], ['asc']);
                break;
            case 'nameDesc':
                sortedData = _.orderBy(data, ['name'], ['desc']);
                break;
            case 'createdAtAsc':
                sortedData = _.orderBy(data, ['createdAt'], ['asc']);
                break;
            case 'createdAtDesc':
                sortedData = _.orderBy(data, ['createdAt'], ['desc']);
                break;
            default:
                sortedData = data;
        }
        setData(sortedData);
    };

    const filterMenuItems = [
        {
            label: `Filter`,
            icon: 'pi pi-filter',
            command: () => setShowFilter(true)
        },
        {
            label: `Clear`,
            icon: 'pi pi-filter-slash',
            command: () => setSelectedFilterFields([])
        }
    ];

    const sortMenuItems = [
        {
            label: 'Sort by',
            template: (item) => (
                <div
                    style={{
                        fontWeight: 'bold',
                        padding: '8px 16px',
                        backgroundColor: '#ffffff',
                        fontSize: '16px'
                    }}
                >
                    {item.label}
                </div>
            ),
            command: () => {}
        },
        { separator: true },
        { label: 'Name Ascending', command: () => onMenuSort('nameAsc') },
        { label: 'Name Descending', command: () => onMenuSort('nameDesc') },
        {
            label: 'Created At Ascending',
            command: () => onMenuSort('createdAtAsc')
        },
        {
            label: 'Created At Descending',
            command: () => onMenuSort('createdAtDesc')
        },
        {
            label: 'Reset',
            command: () => setData(_.cloneDeep(initialData)),
            template: (item) => (
                <div
                    style={{
                        color: '#d30000',
                        textAlign: 'center',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        fontWeight: 'bold',
                        padding: '8px 16px',
                        fontSize: '13px'
                    }}
                >
                    {item.label}
                </div>
            )
        }
    ];

    useEffect(() => {
        get();
    }, []);

    const get = async () => {
        const response = await props.get();
        const currentCache = response?.results;
        if (currentCache) {
            setSelectedUser(currentCache.selectedUser);
            const selectedUserProfile = currentCache.profiles.find((profile) => profile.profileId === currentCache.selectedUser);

            if (selectedUserProfile && selectedUserProfile.preferences) {
                setPaginatorRecordsNo(_.get(selectedUserProfile, 'preferences.settings.permissionServices.paginatorRecordsNo') || 10);
            } else {
                console.warn('Selected user profile or preferences not found in cache.');
            }
        } else {
            console.warn('selectedUser not found in cache.');
        }
    };

    useEffect(() => {
        const updateCache = async () => {
            const response = await props.get();
            const currentCache = response?.results;

            if (currentCache && selectedUser) {
                const selectedUserProfileIndex = currentCache.profiles.findIndex((profile) => profile.profileId === selectedUser);

                if (selectedUserProfileIndex !== -1) {
                    _.set(currentCache.profiles[selectedUserProfileIndex], 'preferences.settings.permissionServices.paginatorRecordsNo', paginatorRecordsNo);

                    props.set(currentCache);
                } else {
                    console.warn('Selected user profile not found in cache.');
                }
            } else {
                console.warn('Cache or selectedUser is not available.');
            }
        };

        if (paginatorRecordsNo !== 10) {
            updateCache();
        }
    }, [paginatorRecordsNo, selectedUser]);

    return (
        <div className="mt-5">
            <div className="grid">
                <div className="col-6 flex align-items-center justify-content-start">
                    <h4 className="mb-0 ml-2">
                        <span>
                            {' '}
                            <Link to="/DashboardHRControls">People</Link> /{' '}
                        </span>
                        <strong>Permissions </strong>
                    </h4>
                    {permissions?.read && <SplitButton model={menuItems.filter((m) => !(m.icon === 'pi pi-trash' && items?.length === 0))} dropdownIcon="pi pi-ellipsis-h" buttonClassName="hidden" menuButtonClassName="ml-1 p-button-text" />}
                </div>
                <div className="col-6 flex justify-content-end">
                    <>
                        <SplitButton
                            model={filterMenuItems.filter((m) => !(m.icon === 'pi pi-trash' && data?.length === 0))}
                            dropdownIcon={<img src={FilterIcon} style={{ marginRight: '4px', width: '1em', height: '1em' }} />}
                            buttonClassName="hidden"
                            menuButtonClassName="ml-1 p-button-text"
                            // menuStyle={{ width: "250px" }}
                        ></SplitButton>
                        <SplitButton
                            model={sortMenuItems.filter((m) => !(m.icon === 'pi pi-trash' && data?.length === 0))}
                            dropdownIcon={<img src={SortIcon} style={{ marginRight: '4px', width: '1em', height: '1em' }} />}
                            buttonClassName="hidden"
                            menuButtonClassName="ml-1 p-button-text"
                            menuStyle={{ width: '200px' }}
                        ></SplitButton>
                        {permissions?.create && <Button label="add" style={{ height: '30px', marginRight: '10px' }} rounded loading={loading} icon="pi pi-plus" onClick={() => setShowCreateDialog(true)} role="permissionServices-add-button" />}
                    </>
                </div>
            </div>
            <div className="grid align-items-center">
                <div className="col-12" role="permissionServices-datatable">
                    <PermissionServicesDatatable
                        items={data}
                        fields={fields}
                        onRowDelete={onRowDelete}
                        onEditRow={onEditRow}
                        onRowClick={onRowClick}
                        searchDialog={searchDialog}
                        setSearchDialog={setSearchDialog}
                        showUpload={showUpload}
                        setShowUpload={setShowUpload}
                        showFilter={showFilter}
                        setShowFilter={setShowFilter}
                        showColumns={showColumns}
                        setShowColumns={setShowColumns}
                        onClickSaveFilteredfields={onClickSaveFilteredfields}
                        selectedFilterFields={selectedFilterFields}
                        setSelectedFilterFields={setSelectedFilterFields}
                        selectedHideFields={selectedHideFields}
                        setSelectedHideFields={setSelectedHideFields}
                        onClickSaveHiddenfields={onClickSaveHiddenfields}
                        loading={loading}
                        user={props.user}
                        selectedDelete={selectedDelete}
                        setSelectedDelete={setSelectedDelete}
                        // onCreateResult={onCreateResult}
                        selectedUser={selectedUser}
                        setPaginatorRecordsNo={setPaginatorRecordsNo}
                        paginatorRecordsNo={paginatorRecordsNo}
                        filename={filename}
                    />
                </div>
            </div>
            <DownloadCSV data={data} fileName={filename} triggerDownload={triggerDownload} setTriggerDownload={setTriggerDownload} />
            <AreYouSureDialog header="Delete" body="Are you sure you want to delete this record?" show={showAreYouSureDialog} onHide={() => setShowAreYouSureDialog(false)} onYes={() => deleteRow()} />
            <PermissionServicesEditDialogComponent entity={_.find(data, { _id: selectedEntityIndex })} show={showEditDialog} onHide={() => setShowEditDialog(false)} onEditResult={onEditResult} />
            <PermissionServicesCreateDialogComponent entity={newRecord} show={showCreateDialog} onHide={() => setShowCreateDialog(false)} onCreateResult={onCreateResult} />
            <PermissionServicesFakerDialogComponent show={showFakerDialog} onHide={() => setShowFakerDialog(false)} onFakerCreateResults={onFakerCreateResults} />
            <PermissionServicesSeederDialogComponent show={showSeederDialog} onHide={() => setShowSeederDialog(false)} onSeederResults={onSeederResults} />
            <AreYouSureDialog header={`Drop ${data?.length} records`} body={`Are you sure you want to drop ${data?.length} records?`} show={showDeleteAllDialog} onHide={() => setShowDeleteAllDialog(false)} onYes={() => deleteAll()} />
        </div>
    );
};
const mapState = (state) => {
    const { isLoggedIn, user } = state.auth;
    return { isLoggedIn, user };
};
const mapDispatch = (dispatch) => ({
    alert: (data) => dispatch.toast.alert(data),
    getSchema: (serviceName) => dispatch.db.getSchema(serviceName),
    hasServicePermission: (service) => dispatch.perms.hasServicePermission(service),
    show: () => dispatch.loading.show(),
    hide: () => dispatch.loading.hide(),
    get: () => dispatch.cache.get(),
    set: (data) => dispatch.cache.set(data)
});

export default connect(mapState, mapDispatch)(PermissionServicesPage);
