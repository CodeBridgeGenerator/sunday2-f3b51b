import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { connect } from 'react-redux';
import ProtectedRoute from './ProtectedRoute';

import SingleHighwaysPage from "../components/app_components/HighwaysPage/SingleHighwaysPage";
import HighwayProjectLayoutPage from "../components/app_components/HighwaysPage/HighwayProjectLayoutPage";
//  ~cb-add-import~

const AppRouter = () => {
    return (
        <Routes>
            {/* ~cb-add-unprotected-route~ */}
<Route path="/highways/:singleHighwaysId" exact element={<SingleHighwaysPage />} />
<Route path="/highways" exact element={<HighwayProjectLayoutPage />} />
            <Route element={<ProtectedRoute redirectPath={'/login'} />}>{/* ~cb-add-protected-route~ */}</Route>
        </Routes>
    );
};

const mapState = (state) => {
    const { isLoggedIn } = state.auth;
    return { isLoggedIn };
};
const mapDispatch = (dispatch) => ({
    alert: (data) => dispatch.toast.alert(data)
});

export default connect(mapState, mapDispatch)(AppRouter);
