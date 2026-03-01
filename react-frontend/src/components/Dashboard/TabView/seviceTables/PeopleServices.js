import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { TabView, TabPanel } from 'primereact/tabview';
import RolesPage from '../../../cb_components/RolesPage/RolesPage';
import ProfilesPage from '../../../cb_components/ProfilesPage/ProfilesPage';
import PositionsPage from '../../../cb_components/PositionsPage/PositionsPage';
import PermissionServicesPage from '../../../cb_components/PermissionServicesPage/PermissionServicesPage';

const PeopleServices = (props) => {
    return (
        <TabView>
            <TabPanel header="Profiles">
                <ProfilesPage></ProfilesPage>
            </TabPanel>
            <TabPanel header="Positions">
                <PositionsPage></PositionsPage>
            </TabPanel>
            <TabPanel header="Permissions">
                <PermissionServicesPage></PermissionServicesPage>
            </TabPanel>
            <TabPanel header="Roles">
                <RolesPage></RolesPage>
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

export default connect(mapState, mapDispatch)(PeopleServices);
