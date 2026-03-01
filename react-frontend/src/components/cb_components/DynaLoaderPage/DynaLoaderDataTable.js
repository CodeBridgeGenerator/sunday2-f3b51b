import React, { useRef, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { connect } from 'react-redux';
import _ from 'lodash';
import { Button } from 'primereact/button';
import { Skeleton } from 'primereact/skeleton';
import moment from 'moment';

const DynaLoaderDataTable = ({ items, onEditRow, onRowDelete, onRowClick, hasServicePermission, hasServiceFieldsPermission, filename }) => {
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

    const pTemplate0 = (rowData, { rowIndex }) => <p>{rowData.from}</p>;
    const pTemplate1 = (rowData, { rowIndex }) => <p>{rowData.to2}</p>;
    const pTemplate2 = (rowData, { rowIndex }) => <p>{rowData.name}</p>;
    const pTemplate3 = (rowData, { rowIndex }) => <p>{moment(rowData.createdAt).fromNow()}</p>;
    const pTemplate4 = (rowData, { rowIndex }) => <p>{moment(rowData.updatedAt).fromNow()}</p>;
    const editTemplate = (rowData, { rowIndex }) => <Button onClick={() => onEditRow(rowData, rowIndex)} icon={`pi ${rowData.isEdit ? 'pi-check' : 'pi-send'}`} className={`p-button-rounded p-button-text ${rowData.isEdit ? 'p-button-success' : 'p-button-warning'}`} />;
    const deleteTemplate = (rowData, { rowIndex }) => <Button onClick={() => onRowDelete(rowData._id)} icon="pi pi-trash" className="p-button-rounded p-button-danger p-button-text" />;

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
                        rowClassName="cursor-pointer"
                        alwaysShowPaginator={!urlParams.singleUsersId}
                    >
                        <Column field="from" header="Source" body={pTemplate0} sortable frozen style={{ minWidth: '8rem' }} />
                        <Column field="to2" header="Destination" body={pTemplate1} sortable style={{ minWidth: '8rem' }} />
                        <Column field="name" header="Action" body={pTemplate2} sortable style={{ minWidth: '8rem' }} />
                        <Column field="createdAt" header="Created" body={pTemplate3} sortable style={{ minWidth: '8rem' }} />
                        <Column field="updatedAt" header="Updated" body={pTemplate4} sortable style={{ minWidth: '8rem' }} />
                        <Column header="Check & run" body={editTemplate} />
                        <Column header="Delete" body={deleteTemplate} />
                    </DataTable>
                </>
            ) : (
                <div className="p-m-3 p-text-center">
                    <h3>You do not have permission to view this data.</h3>
                </div>
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

export default connect(mapState, mapDispatch)(DynaLoaderDataTable);
