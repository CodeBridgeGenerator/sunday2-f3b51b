import React, { useEffect, useState, useRef } from 'react';
import { connect } from 'react-redux';
import ProjectLayout from '../Layouts/ProjectLayout';
import { Button } from 'primereact/button';
import { classNames } from 'primereact/utils';
import { useNavigate } from 'react-router-dom';

const DashboardWelcome = (props) => {
    const { user } = props;
    const [isHelpSidebarVisible, setHelpSidebarVisible] = useState(false);
    const helpSidebarRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (helpSidebarRef.current && !helpSidebarRef.current.contains(event.target) && isHelpSidebarVisible) {
                setHelpSidebarVisible(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isHelpSidebarVisible]);

    useEffect(() => {
        props.getPermissionFields();
        props.getPermissionServices();
    }, []);

    const toggleHelpSidebar = () => {
        setHelpSidebarVisible(!isHelpSidebarVisible);
    };

    return (
        <ProjectLayout>
            <div className="flex flex-col bg-white">
                <div className="flex flex-col mt-0 mr-0 w-full max-md:mt-10 max-md:max-w-full">
                    <div className="flex w-full bg-indigo-50 min-h-[296px] items-center px-12 max-md:px-5">
                        {/* Image Section */}
                        <img
                            loading="lazy"
                            src="https://cdn.builder.io/api/v1/image/assets/TEMP/9f83b2a37dfc6c7d709fd73b16ee4a915257802292051ec93f307d81f5da3038?placeholderIfAbsent=true&apiKey=ac6c884931b34b908ff08cbf3e00bff1"
                            className="object-contain min-w-[210px] max-w-[250px] aspect-[1.09]"
                            alt="Welcome"
                        />

                        {/* Text Section */}
                        <div className="flex flex-col grow shrink pl-10">
                            <div className="flex flex-col text-slate-700">
                                <h1 className="text-3xl font-bold leading-none">Welcome, {user.name}</h1>
                                <p className="mt-4 text-base leading-6">
                                    <p className="mt-4 text-base leading-6">Welcome to the App dashboard - a centralized platform for managing data and their workflows.</p>
                                </p>
                            </div>
                            <div className="flex gap-5 items-start mt-8 text-sm font-semibold tracking-wide leading-none text-center">
                                {/* <button className="gap-3 px-6 py-3 text-red-700 border-2 border-red-700 border-solid min-h-[42px] rounded-[100px] max-md:px-5">
                  Guide me
                </button>
                <button className="gap-3 px-6 py-3 text-white bg-red-700 min-h-[42px] rounded-[100px] max-md:px-5">
                  Manage cards
                </button> */}
                                <Button
                                    label="Guide me"
                                    onClick={() => toggleHelpSidebar()}
                                    className="p-button-rounded p-button-secondary ml-2"
                                    style={{
                                        color: '#D30000',
                                        borderColor: '#D30000',
                                        backgroundColor: 'transparent',
                                        // height: "30px",
                                        width: '150px'
                                    }}
                                />
                                <Button
                                    label="Manage Profiles"
                                    onClick={() => navigate('/account')}
                                    // disabled={!editedCommentText.trim()}
                                    className="p-button-rounded p-button-primary "
                                    style={
                                        {
                                            // height: "30px",
                                        }
                                    }
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div
                ref={helpSidebarRef}
                id="rightsidebar"
                className={classNames('overlay-auto z-10 surface-overlay shadow-2 fixed top-0 right-0 w-20rem animation-duration-150 animation-ease-in-out', { hidden: !isHelpSidebarVisible, block: isHelpSidebarVisible })}
                style={{
                    height: '100%',
                    backgroundColor: 'rgba(0, 0, 0, 0.5)'
                }}
            >
                <div className="flex flex-column h-full p-4 bg-white" style={{ height: 'calc(100% - 60px)', marginTop: '60px' }}>
                    <span className="text-xl font-medium text-900 mb-3">Help bar</span>
                    <div className="border-2 border-dashed surface-border border-round surface-section flex-auto">{/* Help Content */}</div>
                </div>
            </div>
        </ProjectLayout>
    );
};

const mapState = (state) => {
    const { user, isLoggedIn } = state.auth;
    return { user, isLoggedIn };
};

const mapDispatch = (dispatch) => ({
    alert: (data) => dispatch.toast.alert(data),
    getPermissionFields: () => dispatch.perms.getPermissionFields(),
    getPermissionServices: () => dispatch.perms.getPermissionServices()
});

export default connect(mapState, mapDispatch)(DashboardWelcome);
