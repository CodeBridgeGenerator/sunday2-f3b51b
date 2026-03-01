import { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { useLocation, useParams } from 'react-router-dom';
import client from '../../services/restClient';

const PageWrapper = (props) => {
    const location = useLocation();
    const params = useParams();

    useEffect(() => {
        const data = {
            pageName: location.pathname,
            ...getNavigatorInfo(),
            marketCode: params?.marketCode ? params.marketCode : 'untracked',
            isLoggedIn: props?.isLoggedIn ?? false,
            userId: null
        };
        createRecord(data);
    }, []);

    const createRecord = (data) => {
        client
            .service('userTrackerId')
            .create(data)
            .catch((error) => {
                console.debug({ error });
            });
    };

    const getNavigatorInfo = () => {
        let browserId = localStorage.getItem('browser');

        const navigatorInfo = {
            // Basic Browser & OS Info
            userAgent: navigator.userAgent,
            language: navigator.language,

            // Time & Locale Settings
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,

            // Feature Support (Boolean Flags)
            cookiesEnabled: navigator.cookieEnabled,
            doNotTrack: navigator.doNotTrack || 'N/A', // Usually '1' or '0' or 'unspecified'

            // Hardware Concurrency
            hardwareConcurrency: navigator.hardwareConcurrency || 'N/A' // Number of CPU cores
        };

        if (!browserId) {
            browserId = generateUUID();
            localStorage.setItem('browser', browserId);
        }

        return { ...navigatorInfo, trackerCode: browserId };
    };

    const generateUUID = () => {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            const r = (Math.random() * 16) | 0;
            const v = c === 'x' ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        });
    };

    return null;
};

const mapState = (state) => {
    const { isLoggedIn, user } = state.auth;
    return { isLoggedIn, user };
};

const mapDispatch = (dispatch) => ({
    alert: (data) => dispatch.toast.alert(data),
    hasServicePermission: (service) => dispatch.perms.hasServicePermission(service),
    hasServiceFieldsPermission: (service) => dispatch.perms.hasServiceFieldsPermission(service)
});

export default connect(mapState, mapDispatch)(PageWrapper);
