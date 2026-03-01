import React from 'react';
import { useLocation } from 'react-router-dom';
import { Provider, connect } from 'react-redux'; // Import connect
import MyRouter from './MyRouter/MyRouter';
import store from './utils/store';
import { AppConfigStatic } from './AppConfigStatic';
import AppTopbar from './components/Layouts/AppTopbar';
import AppFooter from './components/Layouts/AppFooter';
import MainLayout from './components/Layouts/MainLayout';
import LoadingWrapper from './MyRouter/wrappers/LoadingWrapper';
import ToastWrapper from './MyRouter/wrappers/ToastWrapper';
import StartupWrapper from './MyRouter/wrappers/StartupWrapper';

import 'primereact/resources/themes/lara-light-cyan/theme.css';
import 'primereact/resources/primereact.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';
import 'prismjs/themes/prism-coy.css';
import './assets/layout/layout.scss';
import './assets/mainTheme/mainTheme.css';
import './css/customStyles.css';
import AppSideBar from './components/Layouts/appSideBar/AppSideBar';
import ProjectSideBarLayout from './components/Layouts/ProjectSideBarLayout';
import { excludeLocations } from './utils';
import { classNames } from 'primereact/utils';
import PageWrapper from './MyRouter/wrappers/PageWrapper';

const App = ({ isLoggedIn }) => {
    const location = useLocation();
    const regex = /^\/reseta\/[a-f0-9]{24}$/;
    const showSideMenuButton = true;

    const isExcluded = excludeLocations.some((exclude) => {
        if (typeof exclude === 'string') {
            return exclude === location.pathname;
        } else if (exclude instanceof RegExp) {
            return exclude.test(location.pathname);
        }
        return false;
    });
    return (
        <Provider store={store}>
            <AppTopbar showSideMenuButton={showSideMenuButton} />

            <MainLayout>
                {!isExcluded && (
                    <div
                        className={classNames('flex min-h-[calc(100vh-5rem)] bg-white', {
                            'mt-20': !isExcluded || !regex.test(location.pathname)
                        })}
                    >
                        <ProjectSideBarLayout />

                        <div className="flex-1 ml-2" style={{ overflowX: 'auto' }}>
                            <MyRouter isLoggedIn={isLoggedIn} />
                        </div>
                    </div>
                )}
                {isExcluded && (
                    <div className="flex-1 ml-2" style={{ overflowX: 'auto' }}>
                        <MyRouter isLoggedIn={isLoggedIn} />
                    </div>
                )}
            </MainLayout>

            <LoadingWrapper />
            <ToastWrapper />
            <StartupWrapper />
            <PageWrapper />

            <AppConfigStatic rippleEffect={true} inputStyle={'outlined'} layoutMode={'static'} layoutColorMode={'light'} />
        </Provider>
    );
};

const mapState = (state) => {
    const { isLoggedIn } = state.auth;
    return { isLoggedIn };
};

export default connect(mapState)(App);
