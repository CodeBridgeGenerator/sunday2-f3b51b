import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import React, { useState, useRef, useEffect } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import { Button } from 'primereact/button';

import { useParams } from 'react-router-dom';
import moment from 'moment';
import UploadService from '../../../services/UploadService';
import { InputText } from 'primereact/inputtext';
import { Dialog } from 'primereact/dialog';
import { MultiSelect } from 'primereact/multiselect';
import DownloadCSV from '../../../utils/DownloadCSV';
import InboxCreateDialogComponent from '../InboxPage/InboxCreateDialogComponent';
import InviteIcon from '../../../assets/media/Invite.png';
import ExportIcon from '../../../assets/media/Export & Share.png';
import CopyIcon from '../../../assets/media/Clipboard.png';
import DuplicateIcon from '../../../assets/media/Duplicate.png';
import DeleteIcon from '../../../assets/media/Trash.png';
import { Toast } from 'primereact/toast';
import DeleteImage from '../../../assets/media/Delete.png';
import client from '../../../services/restClient';
import { Dropdown } from 'primereact/dropdown';
import { Skeleton } from 'primereact/skeleton';
import { Checkbox } from 'primereact/checkbox';

const PositionsDataTable = ({
    items,
    fields,
    onRowClick,
    searchDialog,
    setSearchDialog,
    showUpload,
    setShowUpload,
    showFilter,
    setShowFilter,
    showColumns,
    setShowColumns,
    onClickSaveFilteredfields,
    selectedFilterFields,
    setSelectedFilterFields,
    selectedHideFields,
    setSelectedHideFields,
    onClickSaveHiddenfields,
    loading,
    user,
    onCreateResult,
    setRefresh,

    setPaginatorRecordsNo,
    paginatorRecordsNo,
    hasServicePermission,
    hasServiceFieldsPermission,
    filename
}) => {
    const dt = useRef(null);
    const urlParams = useParams();
    const [globalFilter, setGlobalFilter] = useState('');
    const [selectedItems, setSelectedItems] = useState([]);
    const [showDialog, setShowDialog] = useState(false);
    const [data, setData] = useState([]);
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    const [triggerDownload, setTriggerDownload] = useState(false);
    const [permissions, setPermissions] = useState({});
    const [fieldPermissions, setFieldPermissions] = useState({});
    const [isLoadingPermissions, setIsLoadingPermissions] = useState(true);

    const header = (
        <div
            className="table-header"
            style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}
        >
            <h5 className="m-0"></h5>
            <span className="p-input-icon-left">
                <i className="pi pi-search" />
                <InputText type="search" value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)} placeholder="Keyword Search" />
            </span>
        </div>
    );

    const dropdownTemplate0 = (rowData, { rowIndex }) => <p>{rowData.userId?.name}</p>;
    const pTemplate1 = (rowData, { rowIndex }) => <p>{moment(rowData.loginTime).fromNow()}</p>;
    const pTemplate2 = (rowData, { rowIndex }) => <p>{rowData.device}</p>;
    const pTemplate3 = (rowData, { rowIndex }) => <p>{rowData.ip}</p>;
    const pTemplate4 = (rowData, { rowIndex }) => <p>{rowData.browser}</p>;
    const pTemplate5 = (rowData, { rowIndex }) => <p>{rowData.userAgent}</p>;
    const pTemplate6 = (rowData, { rowIndex }) => <p>{moment(rowData.logoutTime).fromNow()}</p>;

    const checkboxTemplate = (rowData) => (
        <Checkbox
            checked={selectedItems.some((item) => item._id === rowData._id)}
            onChange={(e) => {
                let _selectedItems = [...selectedItems];

                if (e.checked) {
                    _selectedItems.push(rowData);
                } else {
                    _selectedItems = _selectedItems.filter((item) => item._id !== rowData._id);
                }
                setSelectedItems(_selectedItems);
            }}
        />
    );

    const template1 = {
        layout: 'RowsPerPageDropdown CurrentPageReport FirstPageLink PrevPageLink JumpToPageInput NextPageLink LastPageLink',
        RowsPerPageDropdown: (options) => {
            const dropdownOptions = [
                { label: 5, value: 5 },
                { label: 10, value: 10 },
                { label: 20, value: 20 },
                { label: 120, value: 120 }
            ];

            return (
                <React.Fragment>
                    <div>
                        <Dropdown
                            value={paginatorRecordsNo}
                            options={dropdownOptions}
                            onChange={(e) => {
                                options.onChange(e);
                                setPaginatorRecordsNo(e.value);
                            }}
                        />
                        <span className="mr-3 ml-2" style={{ color: 'var(--text-color)', userSelect: 'none' }}>
                            items per page
                        </span>
                        <span style={{ width: '10px' }}></span>
                    </div>
                </React.Fragment>
            );
        },
        CurrentPageReport: (options) => {
            return (
                <div className=" mr-20">
                    <span style={{ color: 'grey', userSelect: 'none' }}>
                        <span className="mr-3 ml-2">|</span>
                        <span className="mr-20">
                            {options.first} - {options.last} of {options.totalRecords} items{' '}
                        </span>
                    </span>
                </div>
            );
        },
        JumpToPageInput: (options) => {
            return (
                <div>
                    <span>Page</span>
                    {options.element}
                    <span>of {options.props.totalPages}</span>
                </div>
            );
        }
    };

    useEffect(() => {
        const fetchPermissions = async () => {
            setIsLoadingPermissions(true);
            const servicePermission = await hasServicePermission(filename);
            const fieldPermissions = await hasServiceFieldsPermission(filename);
            setPermissions(servicePermission);
            setFieldPermissions(fieldPermissions);
            setIsLoadingPermissions(false);
        };

        fetchPermissions();
    }, []);

    const handleMessage = () => {
        setShowDialog(true); // Open the dialog
    };

    const handleHideDialog = () => {
        setShowDialog(false); // Close the dialog
    };
    const toast = useRef(null);

    const handleCopy = async () => {
        if (!selectedItems || selectedItems.length === 0) return;

        try {
            const dataToCopy = selectedItems.map((item) => _.omit(item, ['_id', 'createdAt', 'updatedAt']));
            await navigator.clipboard.writeText(JSON.stringify(dataToCopy, null, 2));
            toast.current.show({
                severity: 'success',
                summary: 'Copied',
                detail: `Login History data copied to clipboard`,
                life: 3000
            });

            setRefresh((prev) => !prev);
        } catch (error) {
            console.error('Failed to copy to clipboard', error);
            toast.current.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to copy to clipboard',
                life: 3000
            });
        }
    };

    const handleDuplicate = async () => {
        if (!selectedItems || selectedItems.length === 0) return;

        try {
            const promises = selectedItems.map((item) => {
                const newItem = _.omit(item, ['_id', 'createdAt', 'updatedAt']);
                newItem.createdBy = user._id;
                newItem.updatedBy = user._id;
                return client.service('loginHistory').create(newItem);
            });

            toast.current.show({
                severity: 'success',
                summary: 'Duplicated',
                detail: `${selectedItems.length} Login History duplicated successfully`,
                life: 3000
            });
            deselectAllRows();
            setRefresh((prev) => !prev);
        } catch (error) {
            console.error('Failed to duplicate Login History', error);
            toast.current.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to duplicate Login History',
                life: 3000
            });
        }
    };

    const handleExport = () => {
        if (!items || items.length === 0) {
            toast.current.show({
                severity: 'warn',
                summary: 'Warning',
                detail: 'No data available to export',
                life: 3000
            });
            return;
        }

        const dataToExport = selectedItems.length > 0 ? selectedItems : items;
        setTriggerDownload(true);

        toast.current.show({
            severity: 'success',
            summary: 'Exported',
            detail: `${dataToExport.length} items exported successfully`,
            life: 3000
        });
    };

    const renderSkeleton = () => {
        return (
            <DataTable value={Array.from({ length: 5 })} className="p-datatable-striped">
                <Column body={<Skeleton />} />
                <Column body={<Skeleton />} />
                <Column body={<Skeleton />} />
                <Column body={<Skeleton />} />
                <Column body={<Skeleton />} />
            </DataTable>
        );
    };

    return (
        <>
            {isLoadingPermissions ? (
                renderSkeleton()
            ) : permissions.read ? (
                <>
                    <DataTable
                        value={items}
                        ref={dt}
                        removableSort
                        onRowClick={onRowClick}
                        scrollable
                        rowHover
                        stripedRows
                        paginator
                        rows={paginatorRecordsNo}
                        rowsPerPageOptions={[10, 50, 250, 500]}
                        paginatorTemplate={template1}
                        rowClassName="cursor-pointer"
                        alwaysShowPaginator={!urlParams.singleUsersId}
                        selection={selectedItems}
                        onSelectionChange={(e) => setSelectedItems(e.value)}
                        onCreateResult={onCreateResult}
                        globalFilter={globalFilter}
                        header={header}
                        user={user}
                    >
                        <Column selectionMode="multiple" headerStyle={{ width: '3rem' }} body={checkboxTemplate} />
                        <Column field="userId" header="User" body={dropdownTemplate0} filter={selectedFilterFields.includes('userId')} hidden={selectedHideFields?.includes('userId')} style={{ minWidth: '8rem' }} />
                        <Column field="loginTime" header="Logged IN" body={pTemplate1} filter={selectedFilterFields.includes('loginTime')} hidden={selectedHideFields?.includes('loginTime')} sortable style={{ minWidth: '8rem' }} />
                        <Column field="device" header="Device" body={pTemplate2} filter={selectedFilterFields.includes('device')} hidden={selectedHideFields?.includes('device')} sortable style={{ minWidth: '8rem' }} />
                        <Column field="ip" header="IP" body={pTemplate3} filter={selectedFilterFields.includes('ip')} hidden={selectedHideFields?.includes('ip')} sortable style={{ minWidth: '8rem' }} />
                        <Column field="browser" header="Browser" body={pTemplate4} filter={selectedFilterFields.includes('Browser')} hidden={selectedHideFields?.includes('Browser')} sortable style={{ minWidth: '8rem' }} />
                        <Column field="userAgent" header="Agent" body={pTemplate5} filter={selectedFilterFields.includes('userAgent')} hidden={selectedHideFields?.includes('userAgent')} sortable style={{ minWidth: '8rem' }} />
                        <Column field="lougoutTime" header="Logged Out" body={pTemplate6} filter={selectedFilterFields.includes('lougoutTime')} hidden={selectedHideFields?.includes('lougoutTime')} sortable style={{ minWidth: '8rem' }} />
                    </DataTable>

                    {selectedItems.length > 0 ? (
                        <div
                            className="card center"
                            style={{
                                position: 'fixed',
                                bottom: '20px',
                                left: 200,
                                right: 0,
                                margin: '0 auto',
                                width: '51rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '10px',
                                fontSize: '14px',
                                fontFamily: 'Arial, sans-serif',
                                color: '#2A4454',
                                backgroundColor: '#fff',
                                boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
                                zIndex: 1000
                            }}
                        >
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    border: '1px solid #2A4454',
                                    padding: '5px',
                                    borderRadius: '5px'
                                }}
                            >
                                {selectedItems.length} selected
                                <span
                                    className="pi pi-times"
                                    style={{
                                        cursor: 'pointer',
                                        marginLeft: '10px',
                                        color: '#2A4454'
                                    }}
                                    onClick={() => {
                                        deselectAllRows();
                                    }}
                                />
                            </div>

                            {/* New buttons section */}
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                {/* Copy button */}
                                <Button
                                    label="Copy"
                                    labelposition="right"
                                    icon={
                                        <img
                                            src={CopyIcon}
                                            style={{
                                                marginRight: '4px',
                                                width: '1em',
                                                height: '1em'
                                            }}
                                        />
                                    }
                                    // tooltip="Copy"
                                    onClick={handleCopy}
                                    className="p-button-rounded p-button-text"
                                    style={{
                                        backgroundColor: 'white',
                                        color: '#2A4454',
                                        border: '1px solid transparent',
                                        transition: 'border-color 0.3s',
                                        fontSize: '14px',
                                        fontFamily: 'Arial, sans-serif',
                                        marginRight: '8px',
                                        gap: '4px'
                                    }}
                                />

                                {/* Duplicate button */}
                                <Button
                                    label="Duplicate"
                                    labelposition="right"
                                    icon={
                                        <img
                                            src={DuplicateIcon}
                                            style={{
                                                marginRight: '4px',
                                                width: '1em',
                                                height: '1em'
                                            }}
                                        />
                                    }
                                    // tooltip="Duplicate"
                                    onClick={handleDuplicate}
                                    className="p-button-rounded p-button-text"
                                    style={{
                                        backgroundColor: 'white',
                                        color: '#2A4454',
                                        border: '1px solid transparent',
                                        transition: 'border-color 0.3s',
                                        fontSize: '14px',
                                        fontFamily: 'Arial, sans-serif',
                                        marginRight: '8px',
                                        gap: '4px'
                                    }}
                                />

                                {/* Export button */}
                                <Button
                                    label="Export"
                                    labelposition="right"
                                    icon={
                                        <img
                                            src={ExportIcon}
                                            style={{
                                                marginRight: '4px',
                                                width: '1em',
                                                height: '1em'
                                            }}
                                        />
                                    }
                                    onClick={handleExport}
                                    className="p-button-rounded p-button-text"
                                    style={{
                                        backgroundColor: 'white',
                                        color: '#2A4454',
                                        border: '1px solid transparent',
                                        transition: 'border-color 0.3s',
                                        fontSize: '14px',
                                        fontFamily: 'Arial, sans-serif',
                                        marginRight: '8px',
                                        gap: '4px'
                                    }}
                                />

                                {/* Message button */}
                                <Button
                                    label="Message"
                                    labelposition="right"
                                    icon={
                                        <img
                                            src={InviteIcon}
                                            style={{
                                                marginRight: '4px',
                                                width: '1em',
                                                height: '1em'
                                            }}
                                        />
                                    }
                                    onClick={handleMessage}
                                    className="p-button-rounded p-button-text"
                                    style={{
                                        backgroundColor: 'white',
                                        color: '#2A4454',
                                        border: '1px solid transparent',
                                        transition: 'border-color 0.3s',
                                        fontSize: '14px',
                                        fontFamily: 'Arial, sans-serif',
                                        marginRight: '8px',
                                        gap: '4px'
                                    }}
                                />

                                {/* InboxCreateDialogComponent */}
                                <InboxCreateDialogComponent
                                    show={showDialog}
                                    onHide={handleHideDialog}
                                    serviceInbox="companies"
                                    onCreateResult={onCreateResult}
                                    // selectedItemsId={selectedItems.map(item => item._id)}
                                    selectedItemsId={selectedItems}
                                />

                                {/* <div style={{ display: 'flex', alignItems: 'center' }}> */}
                                <Button
                                    label="Delete"
                                    labelposition="right"
                                    icon={
                                        <img
                                            src={DeleteIcon}
                                            style={{
                                                marginRight: '4px',
                                                width: '1em',
                                                height: '1em'
                                            }}
                                        />
                                    }
                                    onClick={handleDelete}
                                    style={{
                                        backgroundColor: 'white',
                                        color: '#2A4454',
                                        border: '1px solid transparent',
                                        transition: 'border-color 0.3s',
                                        fontSize: '14px',
                                        fontFamily: 'Arial, sans-serif',
                                        gap: '4px'
                                    }}
                                />
                            </div>
                        </div>
                    ) : null}

                    <Dialog header="Upload Login History Data" visible={showUpload} onHide={() => setShowUpload(false)}>
                        <UploadService
                            user={user}
                            serviceName="loginHistory"
                            onUploadComplete={() => {
                                setShowUpload(false); // Close the dialog after upload
                            }}
                        />
                    </Dialog>

                    <Dialog header="Search Login History" visible={searchDialog} onHide={() => setSearchDialog(false)}>
                        Search
                    </Dialog>
                    <Dialog header="Filter Users" visible={showFilter} onHide={() => setShowFilter(false)}>
                        <div className="card flex justify-content-center">
                            <MultiSelect value={selectedFilterFields} onChange={(e) => setSelectedFilterFields(e.value)} options={fields} optionLabel="name" optionValue="value" filter placeholder="Select Fields" maxSelectedLabels={6} className="w-full md:w-20rem" />
                        </div>
                        <Button
                            text
                            label="save as pref"
                            onClick={() => {
                                console.debug(selectedFilterFields);
                                onClickSaveFilteredfields(selectedFilterFields);
                                setSelectedFilterFields(selectedFilterFields);
                                setShowFilter(false);
                            }}
                        ></Button>
                    </Dialog>

                    <Dialog header="Hide Columns" visible={showColumns} onHide={() => setShowColumns(false)}>
                        <div className="card flex justify-content-center">
                            <MultiSelect value={selectedHideFields} onChange={(e) => setSelectedHideFields(e.value)} options={fields} optionLabel="name" optionValue="value" filter placeholder="Select Fields" maxSelectedLabels={6} className="w-full md:w-20rem" />
                        </div>
                        <Button
                            text
                            label="save as pref"
                            onClick={() => {
                                console.debug(selectedHideFields);
                                onClickSaveHiddenfields(selectedHideFields);
                                setSelectedHideFields(selectedHideFields);
                                setShowColumns(false);
                            }}
                        ></Button>
                    </Dialog>
                    <Toast ref={toast} />
                    <Dialog
                        visible={showDeleteConfirmation}
                        onHide={() => setShowDeleteConfirmation(false)}
                        footer={
                            <div className="flex justify-content-center" style={{ padding: '1rem' }}>
                                <Button
                                    label="Cancel"
                                    onClick={() => setShowDeleteConfirmation(false)}
                                    rounded
                                    className="p-button-rounded p-button-secondary ml-2"
                                    style={{
                                        color: '#D30000',
                                        borderColor: '#D30000',
                                        backgroundColor: 'white',
                                        width: '200px',
                                        marginRight: '2rem'
                                    }}
                                />
                            </div>
                        }
                    >
                        <div className="flex flex-column align-items-center">
                            <img
                                src={DeleteImage}
                                alt="Delete Icon"
                                style={{
                                    width: '150px',
                                    height: '150px',
                                    marginBottom: '10px'
                                }}
                            />
                            <span
                                style={{
                                    fontWeight: 'bold',
                                    fontSize: '1.2em',
                                    marginBottom: '10px'
                                }}
                            >
                                Delete listing?
                            </span>
                            <p style={{ marginBottom: '10px' }}>This action cannot be undone, and all data will be deleted permanently.</p>
                        </div>
                    </Dialog>

                    <DownloadCSV data={items} fileName={filename} triggerDownload={triggerDownload} setTriggerDownload={setTriggerDownload} selectedData={selectedItems} />
                </>
            ) : (
                <p>You do not have permission to view this data.</p>
            )}
        </>
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

export default connect(mapState, mapDispatch)(PositionsDataTable);
