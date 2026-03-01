import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import React, { useState, useRef, useEffect } from 'react';
import _ from 'lodash';
import { Button } from 'primereact/button';
import { useParams } from 'react-router-dom';
import moment from 'moment';
import UploadService from '../../../services/UploadService';
import { InputText } from 'primereact/inputtext';
import { Dialog } from 'primereact/dialog';
import { MultiSelect } from 'primereact/multiselect';
import { Skeleton } from 'primereact/skeleton';
import DownloadCSV from '../../../utils/DownloadCSV';
import InboxCreateDialogComponent from '../../cb_components/InboxPage/InboxCreateDialogComponent';
import InviteIcon from '../../../assets/media/Invite.png';
import ExportIcon from '../../../assets/media/Export & Share.png';
import CopyIcon from '../../../assets/media/Clipboard.png';
import DuplicateIcon from '../../../assets/media/Duplicate.png';
import DeleteIcon from '../../../assets/media/Trash.png';
import { Dropdown } from 'primereact/dropdown';
import { Toast } from 'primereact/toast';
import DeleteImage from '../../../assets/media/Delete.png';
import { connect } from 'react-redux';
import client from '../../../services/restClient';
import { TabView, TabPanel } from 'primereact/tabview';

const PermissionServicesDataTable = ({
    items,
    fields,
    onEditRow,
    onRowDelete,
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
    setSelectedDelete,
    setRefresh,
    onCreateResult,
    selectedUser,
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
    const [permissions, setPermissions] = useState({});
    const [fieldPermissions, setFieldPermissions] = useState({});
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    const [isLoadingPermissions, setIsLoadingPermissions] = useState(true);

    const toast = useRef(null);
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

    const fetchServicePermissions = async () => {
        setIsLoadingPermissions(true);
        const servicePermissions = await hasServicePermission(filename);
        const fieldPermissions = await hasServiceFieldsPermission(filename);
        setIsLoadingPermissions(false);
        setPermissions(servicePermissions);
        setFieldPermissions(fieldPermissions);
        console.log('Service Permissions:', servicePermissions);
        console.log('Field Permissions:', fieldPermissions);
    };

    useEffect(() => {
        fetchServicePermissions();
    }, [selectedUser]);

    const groupItems = (items, groupField) => {
        return _.groupBy(items, groupField);
    };

    // Common columns for all tables
    const commonColumns = [
        {
            field: 'service',
            header: 'Service',
            body: (rowData) => <p>{rowData.service}</p>
        },
        {
            field: 'create',
            header: 'Create',
            body: (rowData) => <p>{String(rowData.create)}</p>
        },
        {
            field: 'read',
            header: 'Read',
            body: (rowData) => <p>{String(rowData.read)}</p>
        },
        {
            field: 'update',
            header: 'Update',
            body: (rowData) => <p>{String(rowData.update)}</p>
        },
        {
            field: 'delete',
            header: 'Delete',
            body: (rowData) => <p>{String(rowData.delete)}</p>
        },
        {
            field: 'import',
            header: 'Import',
            body: (rowData) => <p>{String(rowData.import)}</p>
        },
        {
            field: 'export',
            header: 'Export',
            body: (rowData) => <p>{String(rowData.export)}</p>
        },
        {
            field: 'seeder',
            header: 'Seeder',
            body: (rowData) => <p>{String(rowData.seeder)}</p>
        }
    ];

    // Separate items by category
    const groupedRoleItems = groupItems(
        items.filter((item) => item.roleId),
        'roleId.name'
    );
    const groupedPositionItems = groupItems(
        items.filter((item) => item.positionId),
        'positionId.name'
    );
    const groupedProfileItems = groupItems(
        items.filter((item) => item.profile),
        'profile.name'
    );

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

    // Render DataTable with grouping
    const renderDataTable = (groupedItems, groupField, groupHeaderTemplate, extraColumn) => (
        <>
            {isLoadingPermissions ? (
                renderSkeleton()
            ) : permissions.read ? (
                <>
                    <DataTable
                        value={Object.values(groupedItems).flat()}
                        ref={dt}
                        removableSort
                        onRowClick={onRowClick}
                        scrollable
                        rowHover
                        stripedRows
                        paginator
                        rows={paginatorRecordsNo}
                        rowsPerPageOptions={[10, 50, 250, 500]}
                        size={'small'}
                        paginatorTemplate={template1}
                        currentPageReportTemplate="{first} to {last} of {totalRecords}"
                        rowClassName="cursor-pointer"
                        alwaysShowPaginator={!urlParams.singleUsersId}
                        loading={loading}
                        globalFilter={globalFilter}
                        header={header}
                        selection={selectedItems}
                        onSelectionChange={(e) => setSelectedItems(e.value)}
                        rowGroupMode="subheader"
                        groupRowsBy={groupField}
                        rowGroupHeaderTemplate={groupHeaderTemplate}
                        // expandableRowGroups expandedRows={expandedRows} onRowToggle={(e) => setExpandedRows(e.data)}
                    >
                        {/* First Column: Service */}
                        <Column field="service" header="Service" body={(rowData) => <p>{rowData.service}</p>} filter={selectedFilterFields.includes('service')} hidden={selectedHideFields?.includes('service')} style={{ minWidth: '8rem' }} />

                        {/* Second Column: Role, Position, or Profile */}
                        {/* <Column
        field={extraColumn.field}
        header={extraColumn.header}
        body={extraColumn.body}
        filter={selectedFilterFields.includes(extraColumn.field)}
        hidden={selectedHideFields?.includes(extraColumn.field)}
        style={{ minWidth: "8rem" }}
      /> */}

                        {/* Render remaining common columns */}
                        {commonColumns.slice(1).map((col, idx) => (
                            <Column key={idx} field={col.field} header={col.header} body={col.body} filter={selectedFilterFields.includes(col.field)} hidden={selectedHideFields?.includes(col.field)} style={{ minWidth: '8rem' }} />
                        ))}

                        <Column header="Edit" body={(rowData) => <Button onClick={() => onEditRow(rowData)} icon={`pi ${rowData.isEdit ? 'pi-check' : 'pi-pencil'}`} className={`p-button-rounded p-button-text ${rowData.isEdit ? 'p-button-success' : 'p-button-warning'}`} />} />
                        <Column header="Delete" body={(rowData) => <Button onClick={() => onRowDelete(rowData._id)} icon="pi pi-times" className="p-button-rounded p-button-danger p-button-text" />} />
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
                                    serviceInbox="profiles"
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
                    );
                    <Dialog header="Upload Profiles Data" visible={showUpload} onHide={() => setShowUpload(false)}>
                        <UploadService
                            user={user}
                            serviceName="profiles"
                            onUploadComplete={() => {
                                setShowUpload(false); // Close the dialog after upload
                            }}
                        />
                    </Dialog>
                    <Dialog header="Search Profiles" visible={searchDialog} onHide={() => setSearchDialog(false)}>
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
                                {/* <Button
                  label="Delete"
                  onClick={confirmDelete}
                  className="no-focus-effect"
                  rounded
                  style={{ width: "200px" }}
                /> */}
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
                    {/* <DownloadCSV
            data={items}
            fileName="profiles"
            triggerDownload={triggerDownload}
            setTriggerDownload={setTriggerDownload}
            selectedData={selectedItems}
          /> */}
                </>
            ) : (
                <p>You do not have permission to view this data.</p>
            )}
        </>
    );

    // Header templates for grouping
    const roleHeaderTemplate = (data) => (
        <div className="flex align-items-center gap-2">
            <span className="font-bold">{data.roleId?.name}</span>
        </div>
    );

    const positionHeaderTemplate = (data) => (
        <div className="flex align-items-center gap-2">
            <span className="font-bold">{data.positionId?.name}</span>
        </div>
    );

    const profileHeaderTemplate = (data) => (
        <div className="flex align-items-center gap-2">
            <span className="font-bold">{data.profile?.name}</span>
        </div>
    );

    return (
        <>
            <TabView>
                <TabPanel header="Roles">
                    {renderDataTable(groupedRoleItems, 'roleId.name', roleHeaderTemplate, {
                        field: 'roleId.name',
                        header: 'Role',
                        body: (rowData) => <p>{rowData.roleId?.name}</p>
                    })}
                </TabPanel>
                <TabPanel header="Positions">
                    {renderDataTable(groupedPositionItems, 'positionId.name', positionHeaderTemplate, {
                        field: 'positionId.name',
                        header: 'Position',
                        body: (rowData) => <p>{rowData.positionId?.name}</p>
                    })}
                </TabPanel>
                <TabPanel header="Profiles">
                    {renderDataTable(groupedProfileItems, 'profile.name', profileHeaderTemplate, {
                        field: 'profile.name',
                        header: 'Profile',
                        body: (rowData) => <p>{rowData.profile?.name}</p>
                    })}
                </TabPanel>
            </TabView>

            {/* Dialogs for upload, search, filter, and hide columns */}
            <Dialog header="Upload PermissionServices Data" visible={showUpload} onHide={() => setShowUpload(false)}>
                <UploadService user={user} serviceName="permissionService" onUploadComplete={() => setShowUpload(false)} />
            </Dialog>

            <Dialog header="Search PermissionServices" visible={searchDialog} onHide={() => setSearchDialog(false)}>
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
                        onClickSaveFilteredfields(selectedFilterFields);
                        setSelectedFilterFields(selectedFilterFields);
                        setShowFilter(false);
                    }}
                />
            </Dialog>

            <Dialog header="Hide Columns" visible={showColumns} onHide={() => setShowColumns(false)}>
                <div className="card flex justify-content-center">
                    <MultiSelect value={selectedHideFields} onChange={(e) => setSelectedHideFields(e.value)} options={fields} optionLabel="name" optionValue="value" filter placeholder="Select Fields" maxSelectedLabels={6} className="w-full md:w-20rem" />
                </div>
                <Button
                    text
                    label="save as pref"
                    onClick={() => {
                        onClickSaveHiddenfields(selectedHideFields);
                        setSelectedHideFields(selectedHideFields);
                        setShowColumns(false);
                    }}
                />
            </Dialog>
        </>
    );
};

const mapState = (state) => {
    const { isLoggedIn, user } = state.auth;
    return { isLoggedIn, user };
};

const mapDispatch = (dispatch) => ({
    alert: (data) => dispatch.toast.alert(data),
    get: () => dispatch.cache.get(),
    set: (data) => dispatch.cache.set(data),
    hasServicePermission: (service) => dispatch.perms.hasServicePermission(service),
    hasServiceFieldsPermission: (service) => dispatch.perms.hasServiceFieldsPermission(service)
});

export default connect(mapState, mapDispatch)(PermissionServicesDataTable);
