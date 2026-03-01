import React, { useEffect, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { ProgressSpinner } from 'primereact/progressspinner';
import client from '../../../../services/restClient';
import { TabView, TabPanel } from 'primereact/tabview';
import { connect } from 'react-redux';

const CompanyServices = (props) => {
    const [companyData, setCompanyData] = useState([]);
    const [branchData, setBranchData] = useState([]);
    const [departmentData, setDepartmentData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeIndex, setActiveIndex] = useState(0); // Track active tab

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                if (activeIndex === 0) {
                    // Fetch companies data
                    const res = await client.service('prompts').find({ query: { $limit: 5 } });
                    setCompanyData(res.data);
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

    const dropdownTemplate0 = (rowData, { rowIndex }) => <p>{rowData.companyId?.name}</p>;

    return (
        <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
            <TabPanel header="Prompts">
                <div className="companies-table">
                    {loading ? (
                        <ProgressSpinner />
                    ) : (
                        <DataTable
                            value={companyData}
                            rowHover
                            paginator
                            rows={10}
                            rowsPerPageOptions={[10, 50, 250, 500]}
                            paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
                            currentPageReportTemplate="{first} to {last} of {totalRecords}"
                            rowClassName="cursor-pointer"
                        >
                            <Column field="prompt" header="Prompt" sortable />
                            <Column field="type" header="Type" sortable />
                            <Column field="role" header="Role" sortable />
                            <Column field="model" header="Model" sortable />
                        </DataTable>
                    )}
                </div>
            </TabPanel>
        </TabView>
    );
};

export default CompanyServices;
