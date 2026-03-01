import React from 'react';
import ProjectLayout from '../../Layouts/ProjectLayout';
import { connect } from 'react-redux';
import DepartmentHOSPage from './DepartmentHOSPage';

const DepartmentHOProjectLayoutPage = (props) => {
    return (
        <ProjectLayout>
            <DepartmentHOSPage />
        </ProjectLayout>
    );
};

const mapState = (state) => {
    const { user, isLoggedIn } = state.auth;
    return { user, isLoggedIn };
};

const mapDispatch = (dispatch) => ({
    alert: (data) => dispatch.toast.alert(data),
    hasServicePermission: (service) => dispatch.perms.hasServicePermission(service),
    hasServiceFieldsPermission: (service) => dispatch.perms.hasServiceFieldsPermission(service)
});

export default connect(mapState, mapDispatch)(DepartmentHOProjectLayoutPage);
