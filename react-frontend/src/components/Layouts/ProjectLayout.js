import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';

const AppLayout = (props) => {
    const { children } = props;

    return <div className="flex-1"> {children}</div>;
};

const mapState = (state) => {
    const { isLoggedIn, user } = state.auth;
    return { isLoggedIn, user };
};

const mapDispatch = (dispatch) => ({
    logout: () => dispatch.auth.logout(),
    getCache: () => dispatch.cache.get(),
    setCache: (data) => dispatch.cache.set(data)
});

export default connect(mapState, mapDispatch)(AppLayout);
