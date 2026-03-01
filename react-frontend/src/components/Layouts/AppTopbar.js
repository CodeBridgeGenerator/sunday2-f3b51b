import React, { useRef, useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { classNames } from 'primereact/utils';
import { Button } from 'primereact/button';
import { Menu } from 'primereact/menu';
import client from '../../services/restClient';
import Email from '../../assets/icons/Email.js';
import { Avatar } from 'primereact/avatar';
import { Tag } from 'primereact/tag';
import './Notification.css';
import NotificationMenu from './NotificationMenu.js';
import { v4 as uuidv4 } from 'uuid';

const AppTopbar = (props) => {
    const navigate = useNavigate();
    const userMenuRef = useRef(null);
    const profileMenuRef = useRef(null);
    const [ticker, setTicker] = useState('');
    const label = process.env.REACT_APP_PROJECT_LABEL;
    const [profiles, setProfiles] = useState([]);
    const [roleNames, setRoleNames] = useState({});
    const [userItems, setUserItems] = useState([]);
    const [isHelpSidebarVisible, setHelpSidebarVisible] = useState(false);
    const [url, setUrl] = useState([]);
    const [imageUrls, setImageUrls] = useState({});
    const [isUserMenuVisible, setUserMenuVisible] = useState(false);
    const [isProfileMenuVisible, setProfileMenuVisible] = useState(false);

    const getOrSetTabId = () => {
        let tabId = sessionStorage.getItem('browserTabId');
        if (!tabId) {
            tabId = uuidv4();
            sessionStorage.setItem('browserTabId', tabId);
        }
        return tabId;
    };
    const browserTabId = getOrSetTabId();
    const userProfiles = profiles.filter((profile) => profile.userId?._id === props.user._id);
    const [selectedUser, setSelectedUser] = useState(localStorage.getItem('selectedUser_' + browserTabId) || userProfiles[0]?._id || null);

    const [selectedUserName, setSelectedUserName] = useState('');
    const [selectedUserAvatar, setSelectedUserAvatar] = useState(null);
    const helpSidebarRef = useRef(null);

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

    const toggleHelpSidebar = () => {
        setHelpSidebarVisible(!isHelpSidebarVisible);
    };

    useEffect(() => {
        if (selectedUser) {
            localStorage.setItem('selectedUser_' + browserTabId, selectedUser);
        }
    }, [selectedUser, browserTabId]);

    const initializeCacheStructure = async () => {
        try {
            // Fetch the current cache
            const response = await props.getCache();
            const currentCache = response.results || {};

            // Fetch all profiles
            const profilesResponse = await client.service('profiles').find({
                query: {
                    $limit: 10000,
                    $populate: ['position']
                }
            });
            const profilesData = profilesResponse.data;

            // Filter profiles for the current user
            const filteredProfilesData = profilesData.filter((profile) => profile.userId === props.user._id);

            // console.debug(
            //   "Filtered profiles for current user:",
            //   filteredProfilesData,
            // );

            // Build default cache structure
            const defaultCacheStructure = {
                profiles: filteredProfilesData.map((profile) => ({
                    profileId: profile._id,
                    role: profile.position?.roleId || 'Unknown Role',
                    preferences: {
                        dashboardCards: [],
                        recent: [],
                        favourites: [],
                        settings: {}
                    }
                })),
                selectedUser: selectedUser || filteredProfilesData[0]?._id,
                browserTabId: browserTabId
            };

            // Check if cache needs to be updated
            if (!currentCache.profiles || currentCache.profiles.length !== filteredProfilesData.length) {
                console.debug('Updating cache with new profile data.');

                const updatedCache = {
                    ...currentCache,
                    profiles: defaultCacheStructure.profiles,
                    selectedUser: selectedUser || filteredProfilesData[0]?._id,
                    browserTabId: browserTabId
                };

                // Save updated cache
                await props.setCache(updatedCache);
                console.debug('Cache updated successfully.');
            } else {
                console.debug('Cache already up-to-date.');
            }
        } catch (error) {
            console.error('Error initializing cache structure:', error);
        }
    };

    useEffect(() => {
        if (props.user && props.user._id) {
            initializeCacheStructure();
        }
    }, [props.user._id]);

    // useEffect(() => {
    //   initializeCacheStructure();
    // }, []);

    // Handle user patched event only once
    useEffect(() => {
        const handlePatchedUser = (user) => {
            if (props.user._id === user?._id) {
                props.logout();
            }
            setTicker(`patched ${user.name}`);
        };

        client.service('users').on('patched', handlePatchedUser);

        return () => {
            client.service('users').off('patched', handlePatchedUser);
        };
    }, [props.user._id, props.logout]);

    const showMenu = (e) => {
        if (userMenuRef?.current) userMenuRef.current.show(e);
    };
    const showProfileMenu = (e) => {
        if (profileMenuRef?.current) profileMenuRef.current.show(e);
    };

    const handleUserMenuHover = (e) => {
        setUserMenuVisible(true);
        showMenu(e);
    };

    const handleProfileMenuHover = (e) => {
        setProfileMenuVisible(true);
        showProfileMenu(e);
    };

    const handleUserMenuLeave = () => {
        setUserMenuVisible(false);
    };

    const handleProfileMenuLeave = () => {
        setProfileMenuVisible(false);
    };

    const fetchRoleNames = async (profiles) => {
        const uniqueRoleIds = [...new Set(profiles.map((profile) => profile.position?.roleId).filter(Boolean))];
        const rolePromises = uniqueRoleIds.map((roleId) => client.service('roles').get(roleId));

        try {
            const roles = await Promise.all(rolePromises);
            const roleMap = roles.reduce((acc, role) => {
                acc[role._id] = role.name;
                return acc;
            }, {});
            setRoleNames(roleMap);
        } catch (error) {
            console.error('Error fetching role names:', error);
        }
    };

    useEffect(() => {
        const fetchProfiles = async () => {
            try {
                const res = await client.service('profiles').find({
                    query: {
                        $limit: 10000,
                        $populate: [
                            { path: 'userId', service: 'users', select: ['name'] },
                            { path: 'company', service: 'companies', select: ['name'] },
                            {
                                path: 'position',
                                service: 'positions',
                                select: ['name', 'roleId', 'description']
                            },
                            { path: 'branch', service: 'branches', select: ['name'] },
                            { path: 'section', service: 'sections', select: ['name'] },
                            { path: 'department', service: 'departments', select: ['name'] },
                            {
                                path: 'address',
                                service: 'user_addresses',
                                select: ['Street1', 'City', 'State', 'Country']
                            },
                            {
                                path: 'phone',
                                service: 'user_phones',
                                select: ['countryCode', 'operatorCode', 'number']
                            },
                            { path: 'position.roleId', service: 'roles', select: ['name'] }
                        ]
                    }
                });
                setProfiles(res.data);
                fetchRoleNames(res.data);
            } catch (error) {
                console.error('Error fetching profiles:', error);
            }
        };

        fetchProfiles();
    }, [props.user]);

    // Fetch and cache image URLs
    useEffect(() => {
        profiles.forEach((profile) => {
            const imageId = profile.image?.[0];
            if (imageId && !imageUrls[imageId]) {
                client
                    .service('documentStorages')
                    .get(imageId)
                    .then((record) => {
                        setImageUrls((prev) => ({ ...prev, [imageId]: record.url }));
                    })
                    .catch((error) => console.error('Error fetching image URL:', error));
            }
        });
    }, [profiles, imageUrls]);

    const fetchImageUrl = async (imageId) => {
        if (!imageId) {
            // console.error("Image ID is undefined");
            return '';
        }
        try {
            const record = await client.service('documentStorages').get(imageId);
            setUrl(record.url);
            return record.url ? record.url : '';
        } catch (error) {
            console.error('Error fetching image URL:', error);
            return '';
        }
    };

    useEffect(() => {
        const formattedUserItems = profiles
            .filter((profile) => profile.userId?._id === props.user._id)
            .map((profile) => ({
                id: profile._id,
                name: profile.name || 'Unknown',
                position: profile.position?.name || 'Unknown Position',
                role: roleNames[profile.position?.roleId] || 'Unknown Role',
                status: 'success',
                avatarContent: {
                    type: profile.image && profile.image.length > 0 ? 'image' : 'text',
                    id: profile.image?.[0],
                    url: imageUrls[profile.image?.[0]]
                }
            }))
            .sort((a, b) => a.name.localeCompare(b.name)); // Sort alphabetically by name

        setUserItems(formattedUserItems);

        // **Set initial selected user and update display information**
        let initialSelectedUser = selectedUser;
        if (!initialSelectedUser && formattedUserItems[0]) {
            initialSelectedUser = formattedUserItems[0].id;
            setSelectedUser(initialSelectedUser);
        }

        const selectedUserProfile = formattedUserItems.find((user) => user.id === initialSelectedUser);
        if (selectedUserProfile) {
            setSelectedUserName(selectedUserProfile.name);
            if (selectedUserProfile.avatarContent.type === 'image' && selectedUserProfile.avatarContent.url) {
                setSelectedUserAvatar(selectedUserProfile.avatarContent.url);
            } else {
                setSelectedUserAvatar(
                    (() => {
                        const tokens = selectedUserProfile.name.split(' ').filter((token) => token !== '-' && token.trim() !== '');
                        if (tokens.length >= 2) {
                            return tokens
                                .slice(0, 2)
                                .map((n) => n.charAt(0).toUpperCase())
                                .join('');
                        }
                        return selectedUserProfile.name.substring(0, 2).toUpperCase();
                    })()
                );
            }
        }
    }, [profiles, roleNames, imageUrls, props.user?._id, selectedUser]);

    //   if (!selectedUser && formattedUserItems[0]) {
    //     setSelectedUser(formattedUserItems[0].id);
    //   }
    // }, [profiles, roleNames,imageUrls, props.user?._id]);

    const handleUserChange = async (e) => {
        const userId = e.target.value;
        setSelectedUser(userId);

        const selectedProfile = profiles.find((profile) => profile?._id === userId);
        const selectedRole = selectedProfile?.position?.roleId || 'Unknown Role';
        console.debug('Selected user profile:', selectedProfile);
        try {
            await updateCache(userId, selectedRole);
            props.setProfile(selectedProfile);
            console.debug('Cache updated successfully for user:', userId);
        } catch (error) {
            console.error('Error updating cache:', error);
        }
    };

    const updateCache = async (userId, selectedRole) => {
        try {
            const response = await props.getCache();
            const currentCache = response.results || {};
            const updatedCache = {
                ...currentCache,
                selectedUser: userId,
                browserTabId: browserTabId
            };

            if (updatedCache.results) {
                delete updatedCache.results;
            }

            await props.setCache(updatedCache);
            console.debug('Cache updated successfully with selectedRole:', selectedRole);
            // Navigate to the root route
            navigate('/');
            // Reload the page
            window.location.reload();
        } catch (error) {
            console.error('Error updating cache:', error);
        }
    };

    const profileItems = [
        ...userItems.map((user) => ({
            label: (
                <div className="container flex flex-row ms-0" style={{ width: '350px', cursor: 'pointer' }} onClick={() => handleUserChange({ target: { value: user.id } })}>
                    <div className="ps-0">
                        {user.avatarContent.type === 'image' && user.avatarContent.url ? (
                            <Avatar
                                image={user.avatarContent.url}
                                className="mr-2"
                                shape="circle"
                                size="large"
                                style={{
                                    borderRadius: '50%'
                                }}
                            />
                        ) : (
                            <Avatar
                                label={(() => {
                                    const tokens = user.name.split(' ').filter((token) => token !== '-' && token.trim() !== '');
                                    if (tokens.length >= 2) {
                                        return tokens
                                            .slice(0, 2)
                                            .map((token) => token.charAt(0).toUpperCase())
                                            .join('');
                                    }
                                    return user.name.substring(0, 2).toUpperCase();
                                })()}
                                className="mr-2"
                                shape="circle"
                                size="large"
                                style={{
                                    borderRadius: '50%',
                                    backgroundColor: '#D30000',
                                    color: '#ffffff'
                                }}
                            />
                        )}
                    </div>
                    <div className="container flex-grow">
                        <div
                            className="justify-start mb-2"
                            style={{
                                fontSize: '13px',
                                fontWeight: '600',
                                color: '#2A4454',
                                textAlign: 'left',
                                width: '12rem'
                            }}
                        >
                            {user.name}
                        </div>
                        <div className="justify-start mb-2" style={{ fontSize: '11px', color: 'gray', textAlign: 'left' }}>
                            {user.position}
                        </div>
                        <div className="flex justify-start align-items-end">
                            <Tag value={user.role} severity={user.status} />
                        </div>
                    </div>
                    <div className="container pe-10 mt-1">
                        <input type="radio" id={user.id} name="userRadio" value={user.id} checked={selectedUser === user.id} onChange={(e) => handleUserChange(e)} />
                    </div>
                </div>
            ),
            command: () => {
                console.debug(`Selected user object:`, user);
            }
        }))
    ];

    const items = [
        {
            label: 'Profile',
            icon: 'pi pi-user',
            command: (event) => {
                navigate('/account');
                event.originalEvent.stopPropagation();
            }
        },
        {
            label: 'Settings',
            icon: 'pi pi-cog',
            command: (event) => {
                navigate('/settings');
                event.originalEvent.stopPropagation();
            }
        },
        {
            label: 'Help',
            icon: 'pi pi-question-circle',
            command: () => toggleHelpSidebar()
        },
        {
            label: 'Log Out',
            icon: 'pi pi-fw pi-sign-out',
            template: (item) => {
                return (
                    <ul className="p-menu-list p-reset">
                        <li className="p-menu-list p-reset" key={item.label}>
                            <a className="p-menuitem-link" onClick={onLogout} role="menuitem">
                                <span className={'p-menuitem-icon pi pi-sign-out text-primary'}></span>
                                <span className={'p-menuitem-text text-primary'}>{item.label}</span>
                            </a>
                        </li>
                    </ul>
                );
            }
        }
    ];

    const onLogout = async (e) => {
        try {
            const latestLogin = await client.service('loginHistory').find({
                query: {
                    userId: props.user._id,
                    $limit: 1,
                    $sort: { loginTime: -1 }
                }
            });

            if (latestLogin.data.length > 0) {
                const latestRecordId = latestLogin.data[0]._id;

                await client.service('loginHistory').patch(latestRecordId, {
                    logoutTime: new Date()
                });
            }
            setSelectedUser(null);
            await props.logout();
            setSelectedUser(null);
            navigate('/', { replace: true });
            closeMenu(e);
        } catch (error) {
            console.error('Error updating logout time or logging out:', error);
        }
    };

    return props.isLoggedIn ? (
        <div className="layout-topbar">
            <Link to="/project">
                <div className="cursor-pointer min-w-max flex align-items-end">
                    {/* <img
            src={"./assets/logo/atlas-logo.svg"}
            height={50}
            className="mt-0"
          /> */}
                    <h3
                        className="text-red-500"
                        style={{
                            fontFamily: 'MarlinGeo',
                            fontWeight: 'bolder',
                            margin: 0,
                            marginBottom: 8
                        }}
                    >
                        <i className="pi pi-menu" style={{ fontSize: '1.5rem' }}></i> {label !== '' ? label : 'Star PAR'}
                    </h3>
                </div>
            </Link>
            {ticker}

            <ul className="layout-topbar-menu lg:flex origin-top">
                <div
                    style={{
                        backgroundColor: 'rgba(139, 139, 139, 0.1)',
                        borderRadius: '10px',
                        display: 'flex',
                        justifyContent: 'center'
                    }}
                    className="mr-5"
                    onClick={showProfileMenu}
                    // onMouseEnter={handleProfileMenuHover}
                    // onMouseLeave={handleProfileMenuLeave}
                    aria-controls="profile-popup-menu"
                    aria-haspopup
                >
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '0.25rem 0.5rem'
                        }}
                    >
                        {selectedUserAvatar && (
                            <Avatar
                                image={typeof selectedUserAvatar === 'string' && selectedUserAvatar.startsWith('http') ? selectedUserAvatar : null}
                                label={
                                    typeof selectedUserAvatar === 'string' && !selectedUserAvatar.startsWith('http')
                                        ? (() => {
                                              const tokens = selectedUserAvatar.split(' ').filter((token) => token !== '-' && token.trim() !== '');
                                              if (tokens.length >= 2) {
                                                  return tokens
                                                      .slice(0, 2)
                                                      .map((token) => token.charAt(0).toUpperCase())
                                                      .join('');
                                              }
                                              return selectedUserAvatar.substring(0, 2).toUpperCase();
                                          })()
                                        : null
                                }
                                className="mr-2"
                                shape="circle"
                                size="small"
                                style={{
                                    borderRadius: '50%',
                                    backgroundColor: '#D30000',
                                    color: '#ffffff'
                                }}
                            />
                        )}
                        <span className="font-medium">{selectedUserName}</span>
                    </div>
                </div>

                <div className="mt-2 ">
                    <Link to="/inbox">
                        <Email />
                    </Link>
                </div>
                <div className="mt-2 ">
                    <NotificationMenu />
                </div>
                {props.onSettings ? (
                    <li>
                        <button className="p-link layout-topbar-button" onClick={props.onSettings}>
                            <i className="pi pi-cog" />
                            <span>Settings</span>
                        </button>
                    </li>
                ) : null}
                {props.onAccount ? (
                    <li>
                        <button className="p-link layout-topbar-button" onClick={props.onAccount}>
                            <i className="pi pi-user" />
                            <span>Profile</span>
                        </button>
                    </li>
                ) : null}
            </ul>

            <Menu
                model={items}
                popup
                ref={userMenuRef}
                id="user-popup-menu"
                style={{
                    width: '310px',
                    marginTop: '15px',
                    transform: 'translateX(20px)',
                    maxHeight: '800px',
                    overflowY: 'auto'
                }}
            />

            <Menu
                model={profileItems}
                popup
                ref={profileMenuRef}
                id="profile-popup-menu"
                key={selectedUser}
                style={{
                    width: '310px',
                    transform: 'translateX(80px)',
                    marginTop: '15px',
                    maxHeight: '600px',
                    overflowY: 'auto'
                }}
                appendTo="self"
            />
            {props.isLoggedIn ? (
                <>
                    <Avatar
                        label={(() => {
                            if (props.user.name) {
                                const tokens = props.user.name.split(' ').filter((token) => token !== '-' && token.trim() !== '');
                                if (tokens.length >= 2) {
                                    return tokens
                                        .slice(0, 2)
                                        .map((token) => token.charAt(0).toUpperCase())
                                        .join('');
                                }
                                return props.user.name.substring(0, 2).toUpperCase();
                            } else {
                                return ' ';
                            }
                        })()}
                        className="mr-2 ml-2"
                        shape="circle"
                        onClick={showMenu}
                        // onMouseEnter={handleUserMenuHover}
                        // onMouseLeave={handleUserMenuLeave}
                        aria-controls="user-popup-menu"
                        aria-haspopup
                        style={{
                            borderRadius: '50%',
                            backgroundColor: '#D30000',
                            color: '#ffffff'
                        }}
                    />
                </>
            ) : (
                <Button label="login" className="p-button-rounded" onClick={() => navigate('/login')} />
            )}

            <div
                ref={helpSidebarRef}
                id="rightsidebar"
                className={classNames('overlay-auto z-10 surface-overlay shadow-2 fixed top-0 right-0 w-20rem animation-duration-150 animation-ease-in-out', { hidden: !isHelpSidebarVisible, block: isHelpSidebarVisible })}
                style={{
                    height: '100%',
                    backgroundColor: 'rgba(0, 0, 0, 0.5)'
                }}
            >
                <div className="flex flex-column h-full p-4 bg-white" style={{ height: 'calc(100% - 60px)', marginTop: '10px' }}>
                    <span className="text-xl font-medium text-900 mb-3">Help</span>
                    <div className="border-2 border-dashed surface-border border-round surface-section flex-auto">
                        <div className="mt-3">What do you want to do today?</div>
                    </div>
                </div>
            </div>
        </div>
    ) : null;
};

const mapState = (state) => {
    const { isLoggedIn, user } = state.auth;
    return { isLoggedIn, user };
};

const mapDispatch = (dispatch) => ({
    logout: () => dispatch.auth.logout(),
    getCache: () => dispatch.cache.get(),
    setCache: (data) => dispatch.cache.set(data),
    setProfile: (profile) => dispatch.perms.setProfile(profile)
});

export default connect(mapState, mapDispatch)(AppTopbar);
