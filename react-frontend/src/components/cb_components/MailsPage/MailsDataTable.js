import React, { useRef, useEffect, useState } from 'react';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import _ from 'lodash';
import { useParams } from 'react-router-dom';
import { Skeleton } from 'primereact/skeleton';

const MailsDataTable = ({ items, onRowClick, loading, filename, hasServiceFieldsPermission, hasServicePermission }) => {
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

    const p_dateTemplate0 = (rowData, { rowIndex }) => <p>{new Date(rowData.sentDateTime).toLocaleDateString()}</p>;
    const p_booleanTemplate1 = (rowData, { rowIndex }) => <p>{String(rowData.sentStatus)}</p>;
    const pTemplate2 = (rowData, { rowIndex }) => <p>{rowData.mailType}</p>;
    const pTemplate3 = (rowData, { rowIndex }) => <p>{rowData.toHistory}</p>;

    const pCreatedBy = (rowData, { rowIndex }) => <p>{rowData.createdBy?.name}</p>;

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
                        <Column field="sentDateTime" header="Sent Date Time" body={p_dateTemplate0} sortable style={{ minWidth: '8rem' }} />
                        <Column field="sentStatus" header="Sent Status" body={p_booleanTemplate1} style={{ minWidth: '8rem' }} />
                        <Column field="mailType" header="Mail Type" body={pTemplate2} sortable style={{ minWidth: '8rem' }} />
                        <Column field="toHistory" header="To History" body={pTemplate3} style={{ minWidth: '8rem' }} />
                        <Column field="createdBy" header="createdBy" body={pCreatedBy} sortable style={{ minWidth: '8rem' }} />
                    </DataTable>
                </>
            ) : (
                <div>You do not have permission to view this data.</div>
            )}
        </>
    );
};

export default MailsDataTable;
