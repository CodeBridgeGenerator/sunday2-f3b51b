import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { connect } from 'react-redux';
import ProtectedRoute from './ProtectedRoute';
import NoMatch from './NoMatch';
import ProjectSideBarLayout from '../components/Layouts/ProjectSideBarLayout';
import LoginPage from '../components/LoginPage/LoginPage';
import SignUpPage from '../components/LoginPage/signUp/SignUpPage';
import ResetPage from '../components/LoginPage/ResetPage';
import MaintenancePage from '../components/common/MaintenancePage';
import LoginFaqPage from '../components/LoginPage/LoginFaqPage';
import DashboardWelcome from '../components/Dashboard/DashboardWelcome';
import Account from '../components/cb_components/Account/Account';
import CBRouter from './CBRouter';
import AppRouter from './AppRouter';

//  ~cb-add-import~

const MyRouter = (props) => {
    return (
        <Routes>
            <Route
                path="/"
                exact
                element={
                    props.isLoggedIn ? (
                        <div className="flex min-h-[calc(100vh-5rem)] bg-white mt-20">
                            <ProjectSideBarLayout>
                                {' '}
                                <DashboardWelcome />{' '}
                            </ProjectSideBarLayout>{' '}
                        </div>
                    ) : (
                        <LoginPage />
                    )
                }
            />
            <Route
                path="/login"
                exact
                element={
                    props.isLoggedIn ? (
                        <div className="flex min-h-[calc(100vh-5rem)] bg-white mt-20">
                            <ProjectSideBarLayout>
                                {' '}
                                <DashboardWelcome />{' '}
                            </ProjectSideBarLayout>{' '}
                        </div>
                    ) : (
                        <LoginPage />
                    )
                }
            />
            <Route path="/reset/:singleChangeForgotPasswordId" exact element={<ResetPage />} />
            <Route path="/signup" exact element={<SignUpPage />} />
            <Route path="/maintenance" exact element={<MaintenancePage />} />
            <Route path="/login-faq" exact element={<LoginFaqPage />} />

            <Route element={<ProtectedRoute redirectPath={'/login'} />}>
                <Route path="/project" exact element={<DashboardWelcome />} />
                {/* user details */}
                <Route path="/account" exact element={<Account />} />
                <Route path="/cbAdmin/*" exact element={<CBRouter />} />
                <Route path="/app/*" exact element={<AppRouter />} />
            </Route>
            {/* ~cb-add-route~ */}
            <Route path="*" element={<NoMatch />} />
        </Routes>
    );
};

const mapState = (state) => {
    const { isLoggedIn } = state.auth;
    return { isLoggedIn };
};
const mapDispatch = (dispatch) => ({
    alert: (data) => dispatch.toast.alert(data),
    hasServicePermission: (service) => dispatch.perms.hasServicePermission(service),
    hasServiceFieldsPermission: (service) => dispatch.perms.hasServiceFieldsPermission(service)
});

export default connect(mapState, mapDispatch)(MyRouter);
