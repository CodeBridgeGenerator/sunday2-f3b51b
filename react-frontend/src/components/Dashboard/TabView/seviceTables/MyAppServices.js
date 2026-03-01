import React, { useEffect, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { ProgressSpinner } from 'primereact/progressspinner';
import client from '../../../../services/restClient';
import { TabView, TabPanel } from 'primereact/tabview';
import { connect } from 'react-redux';

const AdminServices = (props) => {
    const [jobData, setJobData] = useState([]);
    const [mailJobData, setMailJobData] = useState([]);
    const [errorLogData, setErrorLogData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeIndex, setActiveIndex] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                if (activeIndex === 0) {
                    // Fetch Dynaloader Jobs data
                    const res = await client.service('jobQues').find({ query: { $limit: 5 } });
                    setJobData(res.data);
                } else if (activeIndex === 1) {
                    // Fetch Mail Jobs data
                    const res = await client.service('mailQues').find({ query: { $limit: 5 } });
                    setMailJobData(res.data);
                } else if (activeIndex === 2) {
                    // Fetch Error Logs data
                    const res = await client.service('errorLogs').find({ query: { $limit: 5 } });
                    setErrorLogData(res.data);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                props.alert({
                    title: 'Error',
                    type: 'error',
                    message: error.message || 'Failed to fetch data'
                });
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [activeIndex, props]);

    return (
        <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
            <TabPanel header="Jobs">
                <div className="jobs-table">
                    {loading ? (
                        <ProgressSpinner />
                    ) : (
                        <DataTable
                            value={jobData}
                            rowHover
                            paginator
                            rows={10}
                            rowsPerPageOptions={[10, 50, 250, 500]}
                            paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
                            currentPageReportTemplate="{first} to {last} of {totalRecords}"
                            rowClassName="cursor-pointer"
                        >
                            <Column field="machineId" header="MachineId" sortable />
                            <Column field="assignedSupervisor" header="Assigned Supervisor" sortable />
                            <Column field="assignedTechnician" header="Assigned Technician" sortable />
                            <Column field="status" header="Status" sortable />
                        </DataTable>
                    )}
                </div>
            </TabPanel>

            <TabPanel header="Mails">
                <div className="mail-jobs-table">
                    {loading ? (
                        <ProgressSpinner />
                    ) : (
                        <DataTable
                            value={mailJobData}
                            rowHover
                            paginator
                            rows={10}
                            rowsPerPageOptions={[10, 50, 250, 500]}
                            paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
                            currentPageReportTemplate="{first} to {last} of {totalRecords}"
                            rowClassName="cursor-pointer"
                        >
                            <Column field="machineId" header="MachineId" sortable />
                            <Column field="assignedSupervisor" header="Assigned Supervisor" sortable />
                            <Column field="assignedTechnician" header="Assigned Technician" sortable />
                            <Column field="status" header="Status" sortable />
                        </DataTable>
                    )}
                </div>
            </TabPanel>

            <TabPanel header="Errors">
                <div className="error-logs-table">
                    {loading ? (
                        <ProgressSpinner />
                    ) : (
                        <DataTable
                            value={errorLogData}
                            rowHover
                            paginator
                            rows={10}
                            rowsPerPageOptions={[10, 50, 250, 500]}
                            paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
                            currentPageReportTemplate="{first} to {last} of {totalRecords}"
                            rowClassName="cursor-pointer"
                        >
                            <Column field="machineId" header="MMachineId" sortable />
                            <Column field="assignedSupervisor" header="Assigned Supervisor" sortable />
                            <Column field="assignedTechnician" header="Assigned Technician" sortable />
                            <Column field="status" header="Status" sortable />
                        </DataTable>
                    )}
                </div>
            </TabPanel>
        </TabView>
    );
};

const mapState = (state) => {
    const { user } = state.auth;
    return { user };
};
const mapDispatch = (dispatch) => ({
    alert: (data) => dispatch.toast.alert(data),
    hasServicePermission: (service) => dispatch.perms.hasServicePermission(service),
    hasServiceFieldsPermission: (service) => dispatch.perms.hasServiceFieldsPermission(service)
});

export default connect(mapState, mapDispatch)(AdminServices);
