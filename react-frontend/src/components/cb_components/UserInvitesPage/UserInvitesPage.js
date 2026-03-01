import React, { useEffect, useState, useRef } from 'react';
import { connect } from 'react-redux';
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import client from '../../../services/restClient';
import _ from 'lodash';
import { classNames } from 'primereact/utils';
import entityCreate from '../../../utils/entity';
import { Button } from 'primereact/button';
import { SplitButton } from 'primereact/splitbutton';
import SortIcon from '../../../assets/media/Sort.png';
import FilterIcon from '../../../assets/media/Filter.png';
import DownloadCSV from '../../../utils/DownloadCSV';
import AreYouSureDialog from '../../common/AreYouSureDialog';
import UserInvitesDatatable from './UserInvitesDataTable';
import UserInvitesEditDialogComponent from './UserInvitesEditDialogComponent';
import UserInvitesCreateDialogComponent from './UserInvitesCreateDialogComponent';
import UserInvitesFakerDialogComponent from './UserInvitesFakerDialogComponent';
import UserInvitesSeederDialogComponent from './UserInvitesSeederDialogComponent';
import { v4 as uuidv4 } from 'uuid';

const UserInvitesPage = (props) => {
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
    const [triggerDownload, setTriggerDownload] = useState(false);
    const [isHelpSidebarVisible, setHelpSidebarVisible] = useState(false);
    const [initialData, setInitialData] = useState([]);
    const [selectedDelete, setSelectedDelete] = useState([]);
    const [permissions, setPermissions] = useState({});
    const [selectedUser, setSelectedUser] = useState();

    const [refresh, setRefresh] = useState(false);
    const [paginatorRecordsNo, setPaginatorRecordsNo] = useState(10);
    const urlParams = useParams();
    const filename = 'userInvites';

    const helpSidebarRef = useRef(null);

    const getOrSetTabId = () => {
        let tabId = sessionStorage.getItem('browserTabId');
        if (!tabId) {
            tabId = uuidv4();
            sessionStorage.setItem('browserTabId', tabId);
        }
        return tabId;
    };

    useEffect(() => {
        const tabId = getOrSetTabId();
        if (selectedUser) {
            localStorage.setItem(`selectedUser_${tabId}`, selectedUser);
        }
    }, [selectedUser]);
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
            const _schema = await props.getSchema('userInvites');
            let _fields = _schema.data.map((field, i) => i > 5 && field.field);
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
        //on mount
        setLoading(true);
        client
            .service('userInvites')
            .find({
                query: {
                    $limit: 10000,
                    $sort: { emailToInvite: 1 },
                    position: urlParams.singlePositionsId,
                    role: urlParams.singleRolesId,
                    company: urlParams.singleCompaniesId,
                    branch: urlParams.singleBranchesId,
                    $populate: [
                        {
                            path: 'position',
                            service: 'positions',
                            select: ['name']
                        },
                        {
                            path: 'role',
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
                        }
                    ]
                }
            })
            .then((res) => {
                let results = res.data;

                setData(results);
                setInitialData(results);
                setLoading(false);
            })
            .catch((error) => {
                console.debug({ error });
                setLoading(false);
                props.alert({
                    title: 'User Invites',
                    type: 'error',
                    message: error.message || 'Failed get User Invites'
                });
            });
    }, [showFakerDialog, showDeleteAllDialog, refresh, showEditDialog, showCreateDialog]);

    const onClickSaveFilteredfields = (ff) => {
        console.debug(ff);
    };

    const onClickSaveHiddenfields = (ff) => {
        console.debug(ff);
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
            await client.service('userInvites').remove(selectedEntityIndex);
            let _newData = data.filter((data) => data._id !== selectedEntityIndex);
            setData(_newData);
            setSelectedEntityIndex();
            setShowAreYouSureDialog(false);
        } catch (error) {
            console.debug({ error });
            props.alert({
                title: 'User Invites',
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
        const promises = data.map((e) => client.service('userInvites').remove(e?._id));
        await Promise.all(
            promises.map((p) =>
                p.catch((error) => {
                    props.alert({
                        title: 'User Invites',
                        type: 'error',
                        message: error.message || 'Failed to delete all records'
                    });
                    console.debug({ error });
                })
            )
        );
        await props.alert({
            title: 'User Invites',
            type: 'warn',
            message: `Successfully dropped ${countDataItems} records`
        });
    };

    const onRowClick = ({ data }) => {
        navigate(`/cbAdmin/userInvites/${data._id}`);
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
        permissions.import
            ? {
                  label: 'Import',
                  icon: 'pi pi-upload',
                  command: () => setShowUpload(true)
              }
            : null,
        permissions.export
            ? {
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
              }
            : null,
        {
            label: 'Help',
            icon: 'pi pi-question-circle',
            command: () => toggleHelpSidebar()
        },
        { separator: true },
        process.env.REACT_APP_ENV == 'development'
            ? {
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
              }
            : null,
        permissions.seeder
            ? {
                  label: 'Data seeder',
                  icon: 'pi pi-database',
                  command: (e) => {
                      setShowSeederDialog(true);
                  }
              }
            : null
    ].filter(Boolean);

    useEffect(() => {
        get();
    }, []);

    const get = async () => {
        const tabId = getOrSetTabId();
        const response = await props.get();
        const currentCache = response?.results;

        if (currentCache) {
            const selectedUser = localStorage.getItem(`selectedUser_${tabId}`);
            setSelectedUser(selectedUser || currentCache.selectedUser);

            if (selectedUser) {
                try {
                    const profileResponse = await client.service('profiles').get(selectedUser, {
                        query: { $populate: ['position'] }
                    });

                    if (profileResponse) {
                        const selectedUserProfile = profileResponse;

                        if (selectedUserProfile.preferences) {
                            setPaginatorRecordsNo(_.get(selectedUserProfile, 'preferences.settings.userInvites.paginatorRecordsNo') || 10);
                        } else {
                            console.warn('Preferences not found in the selected user profile.');
                        }
                    } else {
                        console.warn('Selected user profile not found in the profiles service.');
                    }
                } catch (error) {
                    console.error('Error fetching profile from profiles service:', error);
                }
            } else {
                console.warn('selectedUser not found in localStorage or cache.');
            }
        } else {
            console.warn('Cache not found.');
        }
    };

    useEffect(() => {
        const updateCache = async () => {
            const response = await props.get();
            const currentCache = response?.results;

            if (currentCache && selectedUser) {
                const selectedUserProfileIndex = currentCache.profiles.findIndex((profile) => profile.profileId === selectedUser);

                if (selectedUserProfileIndex !== -1) {
                    _.set(currentCache.profiles[selectedUserProfileIndex], 'preferences.settings.userInvites.paginatorRecordsNo', paginatorRecordsNo);

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
                            <small>Users</small> /{' '}
                        </span>
                        <strong>Invites </strong>
                    </h4>
                    <SplitButton model={menuItems.filter((m) => !(m.icon === 'pi pi-trash' && items?.length === 0))} dropdownIcon="pi pi-ellipsis-h" buttonClassName="hidden" menuButtonClassName="ml-1 p-button-text" />
                </div>
                <div className="col-6 flex justify-content-end">
                    <>
                        <Button label="add" style={{ height: '30px', marginRight: '10px' }} rounded loading={loading} icon="pi pi-plus" onClick={() => setShowCreateDialog(true)} role="userInvites-add-button" />
                    </>
                </div>
            </div>
            <div className="grid align-items-center">
                <div className="col-12" role="userInvites-datatable">
                    <UserInvitesDatatable
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
                        onCreateResult={onCreateResult}
                        setRefresh={setRefresh}
                        selectedUser={selectedUser}
                        setPaginatorRecordsNo={setPaginatorRecordsNo}
                        paginatorRecordsNo={paginatorRecordsNo}
                        filename={filename}
                        hasServiceFieldsPermission={props.hasServiceFieldsPermission}
                        hasServicePermission={props.hasServicePermission}
                    />
                </div>
            </div>
            <DownloadCSV data={data} fileName={filename} triggerDownload={triggerDownload} setTriggerDownload={setTriggerDownload} />
            <AreYouSureDialog header="Delete" body="Are you sure you want to delete this record?" show={showAreYouSureDialog} onHide={() => setShowAreYouSureDialog(false)} onYes={() => deleteRow()} />
            <UserInvitesEditDialogComponent entity={_.find(data, { _id: selectedEntityIndex })} show={showEditDialog} onHide={() => setShowEditDialog(false)} onEditResult={onEditResult} />
            <UserInvitesCreateDialogComponent entity={newRecord} show={showCreateDialog} onHide={() => setShowCreateDialog(false)} onCreateResult={onCreateResult} />
            <UserInvitesFakerDialogComponent show={showFakerDialog} onHide={() => setShowFakerDialog(false)} onFakerCreateResults={onFakerCreateResults} />
            <UserInvitesSeederDialogComponent show={showSeederDialog} onHide={() => setShowSeederDialog(false)} onSeederResults={onSeederResults} />
            <AreYouSureDialog header={`Drop ${data?.length} records`} body={`Are you sure you want to drop ${data?.length} records?`} show={showDeleteAllDialog} onHide={() => setShowDeleteAllDialog(false)} onYes={() => deleteAll()} />
            <div
                ref={helpSidebarRef}
                id="rightsidebar"
                className={classNames('overlay-auto z-10 surface-overlay shadow-2 fixed top-0 right-0 w-20rem animation-duration-150 animation-ease-in-out', { hidden: !isHelpSidebarVisible, block: isHelpSidebarVisible })}
                style={{
                    height: '100%',
                    backgroundColor: 'rgba(0, 0, 0, 0.5)'
                }}
            >
                <div className="flex flex-column h-full p-4 bg-white" style={{ height: 'calc(100% - 60px)', marginTop: '60px' }}>
                    <span className="text-xl font-medium text-900 mb-3">Help bar</span>
                    <div className="border-2 border-dashed surface-border border-round surface-section flex-auto">
                        {/* Help Content */}
                        <div className="p-3"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};
const mapState = (state) => {
    const { user, isLoggedIn } = state.auth;
    return { user, isLoggedIn };
};
const mapDispatch = (dispatch) => ({
    alert: (data) => dispatch.toast.alert(data),
    getSchema: (serviceName) => dispatch.db.getSchema(serviceName),
    hasServicePermission: (service) => dispatch.perms.hasServicePermission(service),
    hasServiceFieldsPermission: (service) => dispatch.perms.hasServiceFieldsPermission(service),
    show: () => dispatch.loading.show(),
    hide: () => dispatch.loading.hide(),
    get: () => dispatch.cache.get(),
    set: (data) => dispatch.cache.set(data)
});

export default connect(mapState, mapDispatch)(UserInvitesPage);
