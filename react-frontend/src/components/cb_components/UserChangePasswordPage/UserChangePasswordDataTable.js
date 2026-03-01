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
import DownloadCSV from '../../../utils/DownloadCSV';
import { Skeleton } from 'primereact/skeleton';

const UserChangePasswordDataTable = ({
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
    hasServicePermission,
    hasServiceFieldsPermission,
    filename
}) => {
    const dt = useRef(null);
    const urlParams = useParams();

    const [permissions, setPermissions] = useState({});
    const [fieldPermissions, setFieldPermissions] = useState({});
    const [isLoadingPermissions, setIsLoadingPermissions] = useState(true);

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
    }, []);

    const pTemplate0 = (rowData, { rowIndex }) => <p>{rowData.userEmail}</p>;
    const pTemplate1 = (rowData, { rowIndex }) => <p>{rowData.server}</p>;
    const pTemplate2 = (rowData, { rowIndex }) => <p>{rowData.environment}</p>;
    const pTemplate3 = (rowData, { rowIndex }) => <p>{rowData.code}</p>;
    const p_booleanTemplate4 = (rowData, { rowIndex }) => <p>{String(rowData.status)}</p>;
    const p_numberTemplate5 = (rowData, { rowIndex }) => <p>{rowData.sendEmailCounter}</p>;
    const editTemplate = (rowData, { rowIndex }) => <Button onClick={() => onEditRow(rowData, rowIndex)} icon={`pi ${rowData.isEdit ? 'pi-check' : 'pi-pencil'}`} className={`p-button-rounded p-button-text ${rowData.isEdit ? 'p-button-success' : 'p-button-warning'}`} />;
    const deleteTemplate = (rowData, { rowIndex }) => <Button onClick={() => onRowDelete(rowData._id)} icon="pi pi-trash" className="p-button-rounded p-button-danger p-button-text" />;
    const pCreatedAt = (rowData, { rowIndex }) => <p>{moment(rowData.createdAt).fromNow()}</p>;
    const pUpdatedAt = (rowData, { rowIndex }) => <p>{moment(rowData.updatedAt).fromNow()}</p>;
    const pCreatedBy = (rowData, { rowIndex }) => <p>{rowData.createdBy?.name}</p>;
    const pUpdatedBy = (rowData, { rowIndex }) => <p>{rowData.updatedBy?.name}</p>;
    const paginatorLeft = <Button type="button" icon="pi pi-upload" text onClick={() => setShowUpload(true)} disabled={true} />;
    const paginatorRight = DownloadCSV({
        data: items,
        fileName: 'userChangePassword'
    });
    const exportCSV = () => {
        dt.current?.exportCSV();
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
                        rows={10}
                        rowsPerPageOptions={[10, 50, 250, 500]}
                        size={'small'}
                        paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
                        currentPageReportTemplate="{first} to {last} of {totalRecords}"
                        paginatorLeft={paginatorLeft}
                        paginatorRight={paginatorRight}
                        rowClassName="cursor-pointer"
                        alwaysShowPaginator={!urlParams.singleUsersId}
                        loading={loading}
                    >
                        <Column field="userEmail" header="User Email" body={pTemplate0} filter={selectedFilterFields.includes('userEmail')} hidden={selectedHideFields?.includes('userEmail')} sortable style={{ minWidth: '8rem' }} />
                        <Column field="server" header="Server" body={pTemplate1} filter={selectedFilterFields.includes('server')} hidden={selectedHideFields?.includes('server')} sortable style={{ minWidth: '8rem' }} />
                        <Column field="environment" header="Environment" body={pTemplate2} filter={selectedFilterFields.includes('environment')} hidden={selectedHideFields?.includes('environment')} sortable style={{ minWidth: '8rem' }} />
                        <Column field="code" header="Code" body={pTemplate3} filter={selectedFilterFields.includes('code')} hidden={selectedHideFields?.includes('code')} sortable style={{ minWidth: '8rem' }} />
                        <Column field="status" header="Status" body={p_booleanTemplate4} filter={selectedFilterFields.includes('status')} hidden={selectedHideFields?.includes('status')} style={{ minWidth: '8rem' }} />
                        <Column field="sendEmailCounter" header="SendEmailCounter" body={p_numberTemplate5} filter={selectedFilterFields.includes('sendEmailCounter')} hidden={selectedHideFields?.includes('sendEmailCounter')} sortable style={{ minWidth: '8rem' }} />
                        <Column header="Edit" body={editTemplate} />
                        <Column header="Delete" body={deleteTemplate} />
                        {/*<Column field="createdAt" header="created" body={pCreatedAt} sortable style={{ minWidth: "8rem" }} />*/}
                        {/*<Column field="updatedAt" header="updated" body={pUpdatedAt} sortable style={{ minWidth: "8rem" }} />*/}
                        {/*<Column field="createdBy" header="createdBy" body={pCreatedBy} sortable style={{ minWidth: "8rem" }} />*/}
                        {/*<Column field="updatedBy" header="updatedBy" body={pUpdatedBy} sortable style={{ minWidth: "8rem" }} />*/}
                    </DataTable>
                    <Dialog header="Upload UserChangePassword Data" visible={showUpload} onHide={() => setShowUpload(false)}>
                        <UploadService
                            user={user}
                            serviceName="userChangePassword"
                            onUploadComplete={() => {
                                setShowUpload(false); // Close the dialog after upload
                            }}
                            disabled={true}
                        />
                    </Dialog>

                    <Dialog header="Search UserChangePassword" visible={searchDialog} onHide={() => setSearchDialog(false)}>
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
                </>
            ) : (
                <div>You do not have permission to view User Change Password records.</div>
            )}
        </>
    );
};

export default UserChangePasswordDataTable;
