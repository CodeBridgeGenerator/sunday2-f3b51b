import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { connect } from 'react-redux';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import _ from 'lodash';
import { Button } from 'primereact/button';
import { Skeleton } from 'primereact/skeleton';

const DocumentStoragesDataTable = ({ items, onRowDelete, onRowClick, loading, hasServicePermission, hasServiceFieldsPermission, filename }) => {
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

    const pTemplate0 = (rowData, { rowIndex }) => <p>{rowData.name}</p>;
    const pTemplate1 = (rowData, { rowIndex }) => <p>{rowData.tableName}</p>;
    const p_numberTemplate1 = (rowData, { rowIndex }) => <p>{rowData.size}</p>;
    const pTemplate2 = (rowData, { rowIndex }) => <p>{rowData.path}</p>;
    const p_dateTemplate3 = (rowData, { rowIndex }) => <p>{new Date(rowData.lastModifiedDate).toLocaleDateString()}</p>;
    const p_numberTemplate4 = (rowData, { rowIndex }) => <p>{rowData.lastModified}</p>;
    const pTemplate5 = (rowData, { rowIndex }) => <p>{rowData.eTag}</p>;
    const pTemplate6 = (rowData, { rowIndex }) => <p>{rowData.versionId}</p>;
    const pTemplate7 = (rowData, { rowIndex }) => (
        <p>
            <a href={rowData?.url} target="_blank" rel="noreferrer">
                {rowData?.url}
            </a>
        </p>
    );

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
                        loading={loading}
                    >
                        <Column field="name" header="Document Name" body={pTemplate0} sortable style={{ minWidth: '8rem' }} />
                        <Column field="size" header="Size" body={p_numberTemplate1} sortable style={{ minWidth: '8rem' }} />
                        {/* <Column
          field="path"
          header="Path"
          body={pTemplate2}
          sortable
          style={{ minWidth: "8rem" }}
        /> */}
                        <Column />
                        <Column field="tableName" header="Table Name" body={pTemplate1} sortable style={{ minWidth: '8rem' }} />
                        {/* <Column
          field="lastModifiedDate"
          header="Modified"
          body={p_dateTemplate3}
          sortable
          style={{ minWidth: "8rem" }}
        />
        {/* <Column
          field="lastModified"
          header="Last Modified"
          body={p_numberTemplate4}
          sortable
          style={{ minWidth: "8rem" }}
        /> */}
                        {/* <Column
          field="eTag"
          header="AWS ETag"
          body={pTemplate5}
          sortable
          style={{ minWidth: "8rem" }}
        /> */}
                        {/* <Column
          field="versionId"
          header="AWS Version Id"
          body={pTemplate6}
          sortable
          style={{ minWidth: "8rem" }}
        /> */}
                        <Column field="url" header="Url" body={pTemplate7} sortable style={{ minWidth: '8rem' }} />
                        <Column header="Delete" body={deleteTemplate} />
                    </DataTable>
                </>
            ) : (
                <p>You do not have permission to view Document Storages.</p>
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

export default connect(mapState, mapDispatch)(DocumentStoragesDataTable);
