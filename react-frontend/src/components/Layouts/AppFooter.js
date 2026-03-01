import React from 'react';
import FloatingButton from './FloatingButton';
import { connect } from 'react-redux';

const AppFooter = (props) => {
    return (
        <footer className="flex items-center justify-between w-full h-16 border-t border-gray-200 px-4 relative">
            <p className="text-sm text-gray-600">© 2024 Code Bridge Sdn. Bhd. All rights reserved.</p>
            {props.isLoggedIn ? (
                <div className="flex items-center ml-2">
                    <FloatingButton />
                </div>
            ) : null}
        </footer>
    );
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

export default connect(mapState, mapDispatch)(AppFooter);
