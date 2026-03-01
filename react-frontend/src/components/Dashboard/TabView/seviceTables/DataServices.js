import React, { useState } from 'react';
import { TabView, TabPanel } from 'primereact/tabview';
import { connect } from 'react-redux';
import DynaLoaderPage from '../../../cb_components/DynaLoaderPage/DynaLoaderPage';
import TemplatesPage from '../../../cb_components/TemplatesPage/TemplatesPage';
import DocumentStoragesPage from '../../../cb_components/DocumentStoragesPage/DocumentStoragesPage';
import AssetsPage from '../../../cb_components/AssetsPage/AssetsPage';
import MediaPage from '../../../cb_components/MediaPage/MediaPage';

const DataServices = (props) => {
    return (
        <TabView>
            <TabPanel header="DynaLoader">
                <DynaLoaderPage></DynaLoaderPage>
            </TabPanel>

            <TabPanel header="Documents">
                <DocumentStoragesPage></DocumentStoragesPage>
            </TabPanel>

            <TabPanel header="Images">
                <AssetsPage></AssetsPage>
            </TabPanel>
            <TabPanel header="Media">
                <MediaPage></MediaPage>
            </TabPanel>
            <TabPanel header="Email Templates">
                <TemplatesPage></TemplatesPage>
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

export default connect(mapState, mapDispatch)(DataServices);
