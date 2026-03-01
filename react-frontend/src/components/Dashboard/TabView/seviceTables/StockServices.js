import React from 'react';
import { TabView, TabPanel } from 'primereact/tabview';
import { connect } from 'react-redux';
import StockInDetailsPage from '../../../app_components/StockInDetailsPage/StockInDetailsPage';
import StockOutDetailsPage from '../../../app_components/StockOutDetailsPage/StockOutDetailsPage';
import PartRequestDetailsPage from '../../../app_components/PartRequestDetailsPage/PartRequestDetailsPage';
import TransferDetailsPage from '../../../app_components/TransferDetailsPage/TransferDetailsPage';
import SampleDetailsPage from '../../../app_components/SampleDetailsPage/SampleDetailsPage';
import DisposalDetailsPage from '../../../app_components/DisposalDetailsPage/DisposalDetailsPage';

const StockServices = (props) => {
    return (
        <TabView>
            <TabPanel header="Stock In">
                <StockInDetailsPage />
            </TabPanel>

            <TabPanel header="Stock Out">
                <StockOutDetailsPage />
            </TabPanel>

            <TabPanel header="Part Requests">
                <PartRequestDetailsPage />
            </TabPanel>
            <TabPanel header="Transfers">
                <TransferDetailsPage />
            </TabPanel>
            <TabPanel header="Samples">
                <SampleDetailsPage />
            </TabPanel>
            <TabPanel header="Disposals">
                <DisposalDetailsPage />
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

export default connect(mapState, mapDispatch)(StockServices);
