import React, { useRef, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import _ from 'lodash';
import moment from 'moment';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Skeleton } from 'primereact/skeleton';

const JobQuesDataTable = ({ items, filename, hasServiceFieldsPermission, hasServicePermission }) => {
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
    const pTemplate1 = (rowData, { rowIndex }) => <p>{rowData.type}</p>;
    const pTemplate2 = (rowData, { rowIndex }) => <p>{rowData.data}</p>;
    const pTemplate3 = (rowData, { rowIndex }) => <p>{rowData.service}</p>;
    const calendar_timeonlyTemplate4 = (rowData, { rowIndex }) => <p>{new Date(rowData.start).toLocaleDateString()}</p>;
    const calendar_timeonlyTemplate5 = (rowData, { rowIndex }) => <p>{new Date(rowData.end).toLocaleDateString()}</p>;

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
                        <Column field="name" header="Name" body={pTemplate0} sortable style={{ minWidth: '8rem' }} />
                        <Column field="type" header="Type" body={pTemplate1} sortable style={{ minWidth: '8rem' }} />
                        <Column field="data" header="Data" body={pTemplate2} sortable style={{ minWidth: '8rem' }} />
                        <Column field="service" header="Service" body={pTemplate3} sortable style={{ minWidth: '8rem' }} />
                        <Column field="start" header="Start" body={calendar_timeonlyTemplate4} sortable style={{ minWidth: '8rem' }} />
                        <Column field="end" header="End" body={calendar_timeonlyTemplate5} sortable style={{ minWidth: '8rem' }} />
                        <Column field="createdAt" header="Created" body={pCreatedAt} sortable style={{ minWidth: '8rem' }} />
                    </DataTable>
                </>
            ) : (
                <p>You do not have permission to view this data.</p>
            )}
        </>
    );
};

export default JobQuesDataTable;
