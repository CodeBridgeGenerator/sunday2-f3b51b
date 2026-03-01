import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import _ from 'lodash';
import { Button } from 'primereact/button';
import { TabView, TabPanel } from 'primereact/tabview';
import client from '../../../services/restClient';
import AccountChangePassword from './AccountChangePassword';
import AccountChangeName from './AccountChangeName';
import AccountChangeImage from './AccountChangeImage';
import ProfilesCreateDialogComponent from '../ProfilesPage/FilteredProfilesCreateDialogComponent';
import ProfileCard from './Profilecard';
import { v4 as uuidv4 } from 'uuid';

const Account = (props) => {
    const [showChangePassword, setShowChangePassword] = useState(false);
    const [showChangeName, setShowChangeName] = useState(false);
    const [showChangeImage, setShowChangeImage] = useState(false);
    const [activeTabIndex, setActiveTabIndex] = useState(0);
    const [activeIndex, setActiveIndex] = useState(0);
    const [addProfile, setAddProfile] = useState(false);
    const [iprofile, setIProfile] = useState(0);
    const [role, setRole] = useState('');
    const [data, setData] = useState([]);
    const [lastLogin, setLastLogin] = useState('');
    const [loginHistoryData, setLoginHistoryData] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(true);
    const [historyError, setHistoryError] = useState('');
    const [userRoleName, setUserRoleName] = useState('Unknown Role');
    const [addProfileVisible, setAddProfileVisible] = useState(false);
    const { user } = props;
    const navigate = useNavigate();

    const getOrSetTabId = () => {
        let tabId = sessionStorage.getItem('browserTabId');
        if (!tabId) {
            tabId = uuidv4();
            sessionStorage.setItem('browserTabId', tabId);
        }
        return tabId;
    };

    useEffect(() => {
        if (iprofile && data[iprofile]?.position?.roleId)
            client
                .service('roles')
                .find({ query: { roleId: data[iprofile].position.roleId } })
                .then((res) => setRole(res.data[0].name));
    }, [iprofile]);

    useEffect(() => {
        // Fetch last login date for the user
        client
            .service('loginHistory')
            .find({
                query: { userId: user._id, $limit: 1, $sort: { loginTime: -1 } }
            }) // Get the most recent login
            .then((res) => {
                if (res.data.length > 0) {
                    setLastLogin(new Date(res.data[0].loginTime).toLocaleString());
                } else {
                    setLastLogin('No login records available');
                }
            })
            .catch((error) => {
                console.error('Failed to fetch last login', error);
                setLastLogin('Failed to fetch last login');
            });

        // Fetch login history data
        client
            .service('loginHistory')
            .find({
                query: { userId: user._id, $limit: 10, $sort: { loginTime: -1 } }
            })
            .then((res) => {
                setLoginHistoryData(res.data);
                setLoadingHistory(false);
            })
            .catch((err) => {
                setHistoryError('Failed to fetch login history');
                setLoadingHistory(false);
                console.error(err);
            });
    }, [user._id]);

    useEffect(() => {
        client
            .service('profiles')
            .find({
                query: {
                    $limit: 10000,
                    $populate: [
                        {
                            path: 'userId',
                            service: 'users',
                            select: ['name']
                        },
                        {
                            path: 'company',
                            service: 'companies',
                            select: ['name']
                        },
                        {
                            path: 'position',
                            service: 'positions',
                            select: ['name', 'roleId']
                        },
                        {
                            path: 'branch',
                            service: 'branches',
                            select: ['name']
                        },
                        {
                            path: 'section',
                            service: 'sections',
                            select: ['name']
                        },
                        {
                            path: 'department',
                            service: 'departments',
                            select: ['name']
                        }
                    ]
                }
            })
            .then((res) => {
                let results = res.data;
                setData(results);
            })
            .catch((error) => {
                props.alert({
                    title: 'User Profiles',
                    type: 'error',
                    message: error.message || 'Failed get profiles'
                });
            });
    }, []);

    const items = [{ label: 'Profile' }, { label: 'Login history' }];

    const handleChangePassword = () => {
        setShowChangePassword(true);
    };

    // const handleAddProfile = () => {
    //   setAddProfile(true);
    // };

    function ProfileField({ label, value }) {
        return (
            <div className="flex flex-col mt-5 w-full">
                <label className="text-gray-600">{label}</label>
                <p className="font-semibold">{value}</p>
            </div>
        );
    }

    function BackButton() {
        return (
            <Button
                onClick={() => navigate('/project')}
                icon="pi pi-angle-left"
                label="Back to dashboard"
                className="gap-1.5 font-semibold tracking-wide text-right text-[#D30000] bg-transparent border-0 ml-[-1.2rem]"
                style={{
                    color: '#D30000',
                    backgroundColor: 'transparent',
                    border: 'none',
                    fontSize: '13px'
                }}
            />
        );
    }

    const profileData = [
        { label: 'Email', value: user.email },
        { label: 'User ID', value: user._id },
        // { label: "Employment type", value: "Full-time employment" },
        // { label: "Hire date", value: "2 Aug 2023" },
        { label: 'Last login', value: lastLogin }
    ];

    const profile = (data, i, len) => (
        <>
            <div className="px-6 py-5" style={{ backgroundColor: 'white' }}>
                <div>
                    <ProfileCard />
                </div>{' '}
            </div>
        </>
    );

    const loginHistory = () => {
        if (loadingHistory) return <p>Loading login history...</p>;
        if (historyError) return <p>{historyError}</p>;

        return (
            <div className=" py-5" style={{ backgroundColor: 'white' }}>
                {/* <h2 className="text-xl font-semibold mb-4">Login History</h2> */}
                <table className="min-w-full bg-white border border-gray-200">
                    <thead>
                        <tr>
                            <th className="py-2 px-4 border-b">Login Time</th>
                            <th className="py-2 px-4 border-b">IP Address</th>
                            {/* <th className="py-2 px-4 border-b">Browser</th>
              <th className="py-2 px-4 border-b">Device</th> */}
                            <th className="py-2 px-4 border-b">Device and Browser Info</th>
                            <th className="py-2 px-4 border-b">Logout Time</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loginHistoryData.map((record, index) => (
                            <tr key={index}>
                                <td className="py-2 px-4 border-b">{new Date(record.loginTime).toLocaleString()}</td>
                                <td className="py-2 px-4 border-b">{record.ip || 'N/A'}</td>
                                {/* <td className="py-2 px-4 border-b">{record.browser || "N/A"}</td>
                <td className="py-2 px-4 border-b">{record.device || "N/A"}</td> */}
                                <td className="py-2 px-4 border-b">{record.userAgent || 'N/A'}</td>
                                <td className="py-2 px-4 border-b">{record.logoutTime && !isNaN(new Date(record.logoutTime).getTime()) ? new Date(record.logoutTime).toLocaleString() : 'Not Logged Out'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    const sidebarContent = (
        <nav className="flex flex-col items-start px-5 pt-20 pb-6 leading-none bg-gray-50 border-r border-zinc-200" style={{ width: '280px', fontSize: '13px' }}>
            <BackButton />
            <hr className="shrink-0 self-stretch mt-3 w-full h-px border border-solid border-zinc-200" />
            <h1 className="mt-3 text-2xl font-bold leading-none text-slate-700">Profile</h1>
            <section className="flex flex-col self-stretch tracking-wide">
                <Button
                    label="Change password"
                    onClick={handleChangePassword}
                    className="font-semibold text-left text-[#D30000] bg-transparent border-0"
                    style={{
                        color: '#D30000',
                        backgroundColor: 'transparent',
                        border: 'none',
                        paddingLeft: 0,
                        fontSize: '13px'
                    }}
                />
                {/* <Button
          label="Change Name"
          className="font-semibold text-left text-[#D30000] bg-transparent border-0"
          style={{
            color: "#D30000",
            backgroundColor: "transparent",
            border: "none",
            paddingLeft: 0,
            fontSize: "13px",
          }}
        /> */}
                {/* <Button
          label="Change Image"
          className="font-semibold text-left text-[#D30000] bg-transparent border-0"
          style={{
            color: "#D30000",
            backgroundColor: "transparent",
            border: "none",
            paddingLeft: 0,
            fontSize: "13px",
          }}
        /> */}
                {profileData.map((field, index) => (
                    <ProfileField key={index} label={field.label} value={field.value} className="mb-1" />
                ))}
            </section>
            <footer className="mt-56 text-xs tracking-wide leading-5 text-zinc-500">© 2024 Code Bridge Sdn Bhd. All rights reserved.</footer>
        </nav>
    );

    const onTabChange = (e) => {
        setActiveTabIndex(e.index);
    };

    useEffect(() => {
        const fetchRoleForSelectedUser = async () => {
            try {
                let tabId = getOrSetTabId();
                let selectedProfileId = localStorage.getItem('selectedUser_' + tabId);
                const profileResponse = await client.service('profiles').get(selectedProfileId, {
                    query: { $select: ['role'] }
                });

                if (profileResponse?.role) {
                    const roleId = profileResponse.role;
                    const roleResponse = await client.service('roles').get(roleId, {
                        query: { $select: ['name'] }
                    });
                    if (roleResponse?.name) {
                        setRole(roleResponse.name);

                        setAddProfileVisible(roleResponse.name === 'Admin' || roleResponse.name === 'Super');
                    }
                }
            } catch (error) {
                console.error('Failed to fetch role for selected user:', error);
            }
        };

        fetchRoleForSelectedUser();
    }, [props]);

    const handleAddProfile = () => {
        setAddProfile(true);
        setAddProfileVisible(true);
    };

    return (
        <div className="flex bg-white">
            {/* Side Menu */}
            <div className=" h-screen mt-4 fixed " style={{ width: '300px', height: '100vh' }}>
                {sidebarContent}
            </div>

            {/* Main Content */}
            <div className="col-12 flex justify-content-center mt-7 ml-[250px] " style={{ width: '80vw', overflowX: 'hidden', height: '90vh' }}>
                <div className="col-12">
                    <div className="flex flex-column align-items-start mb-3">
                        <div className="surface-ground" style={{ backgroundColor: 'white' }}>
                            <div className="surface-section px-6 pt-5">
                                <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
                                    <TabPanel header="Profile">
                                        <div className="flex justify-content-center w-full">{addProfileVisible && <Button label="Add new profile" onClick={handleAddProfile} icon="pi pi-plus" className="p-button-rounded p-button-primary" />}</div>
                                        {profile(data[iprofile], iprofile, data.length)}
                                    </TabPanel>
                                    <TabPanel header="Login History">{loginHistory()}</TabPanel>
                                </TabView>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <AccountChangePassword show={showChangePassword} onHide={() => setShowChangePassword(false)} />
            <AccountChangeName show={showChangeName} onHide={() => setShowChangeName(false)} />
            <AccountChangeImage show={showChangeImage} onHide={() => setShowChangeImage(false)} />

            <ProfilesCreateDialogComponent show={addProfile} onHide={() => setAddProfile(false)} userId={props.user._id} />
        </div>
    );
};

const mapState = (state) => {
    const { user } = state.auth;
    return { user };
};
const mapDispatch = (dispatch) => ({
    alert: (data) => dispatch.toast.alert(data),
    get: () => dispatch.cache.get()
});

export default connect(mapState, mapDispatch)(Account);
