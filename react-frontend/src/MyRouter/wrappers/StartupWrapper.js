import { useEffect } from 'react';
import { connect } from 'react-redux';
import { useLocation } from 'react-router-dom';

const StartupWrapper = (props) => {
    const location = useLocation();
    const regex = /^\/reset\/[a-f0-9]{24}$/;

    useEffect(() => {
        // runs once
        if (!regex.test(location.pathname)) {
            props.reAuth().catch((error) => {
                // console.debug("error", error);
            });
        }
    }, []);

    return null;
};

const mapState = (state) => {
    const { isLoggedIn, user } = state.auth;
    return { isLoggedIn, user };
};
const mapDispatch = (dispatch) => ({
    reAuth: () => dispatch.auth.reAuth()
});

export default connect(mapState, mapDispatch)(StartupWrapper);
