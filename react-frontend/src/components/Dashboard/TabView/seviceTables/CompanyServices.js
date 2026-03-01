import React, { useState } from 'react';
import { TabView, TabPanel } from 'primereact/tabview';
import { connect } from 'react-redux';
import CompanyPage from '../../../cb_components/CompaniesPage/CompaniesPage';
import BranchesPage from '../../../cb_components/BranchesPage/BranchesPage';
import DepartmentsPage from '../../../cb_components/DepartmentsPage/DepartmentsPage';
import SectionsPage from '../../../cb_components/SectionsPage/SectionsPage';
import CompanyAddressesPage from '../../../cb_components/CompanyAddressesPage/CompanyAddressesPage';
import CompanyPhonesPage from '../../../cb_components/CompanyPhonesPage/CompanyPhonesPage';

const CompanyServices = (props) => {
    const [loading, setLoading] = useState(false);

    return (
        <TabView>
            <TabPanel header="Companies">
                <CompanyPage></CompanyPage>
            </TabPanel>

            <TabPanel header="Branches">
                <BranchesPage></BranchesPage>
            </TabPanel>

            <TabPanel header="Departments">
                <DepartmentsPage></DepartmentsPage>
            </TabPanel>

            <TabPanel header="Sections">
                <SectionsPage></SectionsPage>
            </TabPanel>

            <TabPanel header="Addresses">
                <CompanyAddressesPage></CompanyAddressesPage>
            </TabPanel>

            <TabPanel header="Phones">
                <CompanyPhonesPage></CompanyPhonesPage>
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

export default connect(mapState, mapDispatch)(CompanyServices);
