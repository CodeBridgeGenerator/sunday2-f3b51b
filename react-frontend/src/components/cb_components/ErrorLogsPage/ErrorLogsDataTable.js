import React, { useRef, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import _ from 'lodash';
import { Button } from 'primereact/button';
import moment from 'moment';
import { Skeleton } from 'primereact/skeleton';

const ErrorLogsDataTable = ({ items, onRowClick, loading, filename, hasServiceFieldsPermission, hasServicePermission }) => {
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

    const pTemplate0 = (rowData, { rowIndex }) => <p>{rowData.serviceName}</p>;
    const pTemplate1 = (rowData, { rowIndex }) => <p>{rowData.errorMessage}</p>;
    const pTemplate2 = (rowData, { rowIndex }) => <p>{rowData.message}</p>;
    const pTemplate3 = (rowData, { rowIndex }) => <p>{rowData.stack}</p>;
    const pTemplate4 = (rowData, { rowIndex }) => <p>{rowData.details}</p>;
    const pCreatedAt = (rowData, { rowIndex }) => <p>{moment(rowData.createdAt).fromNow()}</p>;

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
                        <Column field="serviceName" header="Table Name" body={pTemplate0} sortable style={{ minWidth: '8rem' }} />
                        <Column field="errorMessage" header="Error Message" body={pTemplate1} sortable style={{ minWidth: '8rem' }} />
                        <Column field="message" header="Message" body={pTemplate2} sortable style={{ minWidth: '8rem' }} />
                        <Column field="stack" header="Stack" body={pTemplate3} sortable style={{ minWidth: '8rem' }} />
                        <Column field="details" header="Details" body={pTemplate4} sortable style={{ minWidth: '8rem' }} />
                        <Column field="createdAt" header="Created" body={pCreatedAt} sortable style={{ minWidth: '8rem' }} />
                    </DataTable>
                </>
            ) : (
                <div className="p-3">
                    <h4>Access Denied</h4>
                    <p>You do not have permission to view Error Logs.</p>
                </div>
            )}
        </>
    );
};

export default ErrorLogsDataTable;
