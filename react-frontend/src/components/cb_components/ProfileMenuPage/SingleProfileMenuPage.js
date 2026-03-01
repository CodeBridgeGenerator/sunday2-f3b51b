import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { classNames } from 'primereact/utils';
import { Button } from 'primereact/button';
import { TabView, TabPanel } from 'primereact/tabview';
import { SplitButton } from 'primereact/splitbutton';
import client from '../../../services/restClient.js';
import CommentsSection from '../../common/CommentsSection.js';
import ProjectLayout from '../../Layouts/ProjectLayout.js';
import HomeIcon from '../../../assets/icons/Home.js';
import Data from '../../../assets/icons/Data.js';
import Messaging from '../../../assets/icons/Messaging.js';
import Report from '../../../assets/icons/Report.js';
import GenAI from '../../../assets/icons/GenAI.js';
import StaffInfo from '../../../assets/icons/StaffInfo.js';
import Stack from '../../../assets/icons/Stack.js';
import DynaLoader from '../../../assets/icons/DynaLoader.js';
import Server from '../../../assets/icons/Server.js';
import Email from '../../../assets/icons/Email.js';
import MailSent from '../../../assets/icons/MailSent.js';
import Load from '../../../assets/icons/Load.js';
import Chat from '../../../assets/icons/Chat.js';
import Terminal from '../../../assets/icons/Terminal.js';
import Documents from '../../../assets/icons/Documents.js';
import Admin from '../../../assets/icons/Admin.js';
import Users from '../../../assets/icons/Users.js';
import Triangle from '../../../assets/icons/Triangle.js';
import Checklist from '../../../assets/icons/Checklist.js';
import Tickets from '../../../assets/icons/Tickets.js';
import Incoming from '../../../assets/icons/Incoming.js';
import JobStation from '../../../assets/icons/Jobstation.js';
import External from '../../../assets/icons/External.js';
import Raiseexternal from '../../../assets/icons/Raiseexternal.js';
import Building from '../../../assets/icons/Building.js';
import Profile from '../../../assets/icons/Profile.js';
import Profiles from '../../../assets/icons/Profiles.js';
import Employees from '../../../assets/icons/Employees.js';
import UserLogin from '../../../assets/icons/UserLogin.js';
import Superiors from '../../../assets/icons/Superiors.js';
import Roles from '../../../assets/icons/Roles.js';
import Positions from '../../../assets/icons/Positions.js';
import Addresses from '../../../assets/icons/Addresses.js';
import Phones from '../../../assets/icons/Phones.js';
import Companies from '../../../assets/icons/Companies.js';
import Branches from '../../../assets/icons/Branches.js';
import Sections from '../../../assets/icons/Sections.js';
import Permissions from '../../../assets/icons/Permissions.js';
import HeadOfSection from '../../../assets/icons/HeadOfSection.js';
import HeadOfDept from '../../../assets/icons/HeadOfDept.js';
import Department from '../../../assets/icons/Department.js';
import DepartmentAdmin from '../../../assets/icons/DepartmentAdmin.js';
import Files from '../../../assets/icons/Files.js';
import Sales from '../../../assets/icons/Sales.js';
import Stocks from '../../../assets/icons/Stocks.js';
import StockIn from '../../../assets/icons/StockIn.js';
import StockOut from '../../../assets/icons/StockIn.js';
import Logs from '../../../assets/icons/Logs.js';
import People from '../../../assets/icons/People.js';
import Technician from '../../../assets/icons/Master.js';
import Master from '../../../assets/icons/Master.js';
import Tests from '../../../assets/icons/Tests.js';
import Errors from '../../../assets/icons/Errors.js';
import Supervisor from '../../../assets/icons/Supervisor.js';

const SingleProfileMenuPage = (props) => {
    const navigate = useNavigate();
    const urlParams = useParams();
    const [_entity, set_entity] = useState({});
    const [isHelpSidebarVisible, setHelpSidebarVisible] = useState(false);

    const [user, setUser] = useState([]);
    // State for related data
    const [roles, setRoles] = useState([]);
    const [positions, setPositions] = useState([]);
    const [profiles, setProfiles] = useState([]);
    const [users, setUsers] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [branches, setBranches] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [sections, setSections] = useState([]);

    // Fetch related data
    useEffect(() => {
        const fetchRelatedData = async () => {
            try {
                const [rolesRes, positionsRes, profilesRes, usersRes, companiesRes, branchesRes, departmentsRes, sectionsRes] = await Promise.all([
                    client.service('roles').find({ query: { $limit: 10000 } }),
                    client.service('positions').find({ query: { $limit: 10000 } }),
                    client.service('profiles').find({ query: { $limit: 10000 } }),
                    client.service('users').find({ query: { $limit: 10000 } }),
                    client.service('companies').find({ query: { $limit: 10000 } }),
                    client.service('branches').find({ query: { $limit: 10000 } }),
                    client.service('departments').find({ query: { $limit: 10000 } }),
                    client.service('sections').find({ query: { $limit: 10000 } })
                ]);

                setRoles(rolesRes.data);
                setPositions(positionsRes.data);
                setProfiles(profilesRes.data);
                setUsers(usersRes.data);
                setCompanies(companiesRes.data);
                setBranches(branchesRes.data);
                setDepartments(departmentsRes.data);
                setSections(sectionsRes.data);
            } catch (error) {
                console.error('Error fetching related data:', error);
            }
        };

        fetchRelatedData();
    }, []);

    // Helper function to get names from IDs
    const getRelatedNames = (ids, collection) => {
        if (!ids || ids.length === 0) return ['N/A'];
        return ids.map((id) => {
            const item = collection.find((item) => item._id === id);
            return item ? item.name : 'Unknown';
        });
    };
    // Icon Mapping (Centralize this if used in multiple components)
    const iconOptions = [
        {
            label: 'Home',
            value: '../../../assets/icons/Home.js',
            icon: <HomeIcon />
        },
        { label: 'Data', value: '../../../assets/icons/Data.js', icon: <Data /> },
        {
            label: 'Messaging',
            value: '../../../assets/icons/Messaging.js',
            icon: <Messaging />
        },
        {
            label: 'Report',
            value: '../../../assets/icons/Report.js',
            icon: <Report />
        },
        {
            label: 'GenAI',
            value: '../../../assets/icons/GenAI.js',
            icon: <GenAI />
        },
        {
            label: 'StaffInfo',
            value: '../../../assets/icons/StaffInfo.js',
            icon: <StaffInfo />
        },
        {
            label: 'Stack',
            value: '../../../assets/icons/Stack.js',
            icon: <Stack />
        },
        {
            label: 'DynaLoader',
            value: '../../../assets/icons/DynaLoader.js',
            icon: <DynaLoader />
        },
        {
            label: 'Server',
            value: '../../../assets/icons/Server.js',
            icon: <Server />
        },
        {
            label: 'Email',
            value: '../../../assets/icons/Email.js',
            icon: <Email />
        },
        {
            label: 'MailSent',
            value: '../../../assets/icons/MailSent.js',
            icon: <MailSent />
        },
        { label: 'Load', value: '../../../assets/icons/Load.js', icon: <Load /> },
        { label: 'Chat', value: '../../../assets/icons/Chat.js', icon: <Chat /> },
        {
            label: 'Terminal',
            value: '../../../assets/icons/Terminal.js',
            icon: <Terminal />
        },
        {
            label: 'Documents',
            value: '../../../assets/icons/Documents.js',
            icon: <Documents />
        },
        {
            label: 'Admin',
            value: '../../../assets/icons/Admin.js',
            icon: <Admin />
        },
        {
            label: 'Users',
            value: '../../../assets/icons/Users.js',
            icon: <Users />
        },
        {
            label: 'Triangle',
            value: '../../../assets/icons/Triangle.js',
            icon: <Triangle />
        },
        {
            label: 'Checklist',
            value: '../../../assets/icons/Checklist.js',
            icon: <Checklist />
        },
        {
            label: 'Tickets',
            value: '../../../assets/icons/Tickets.js',
            icon: <Tickets />
        },
        {
            label: 'Incoming',
            value: '../../../assets/icons/Incoming.js',
            icon: <Incoming />
        },
        {
            label: 'JobStation',
            value: '../../../assets/icons/Jobstation.js',
            icon: <JobStation />
        },
        {
            label: 'External',
            value: '../../../assets/icons/External.js',
            icon: <External />
        },
        {
            label: 'Raiseexternal',
            value: '../../../assets/icons/Raiseexternal.js',
            icon: <Raiseexternal />
        },
        {
            label: 'Building',
            value: '../../../assets/icons/Building.js',
            icon: <Building />
        },
        {
            label: 'Profile',
            value: '../../../assets/icons/Profile.js',
            icon: <Profile />
        },
        {
            label: 'Profiles',
            value: '../../../assets/icons/Profiles.js',
            icon: <Profiles />
        },
        {
            label: 'Employees',
            value: '../../../assets/icons/Employees.js',
            icon: <Employees />
        },
        {
            label: 'UserLogin',
            value: '../../../assets/icons/UserLogin.js',
            icon: <UserLogin />
        },
        {
            label: 'Superiors',
            value: '../../../assets/icons/Superiors.js',
            icon: <Superiors />
        },
        {
            label: 'Roles',
            value: '../../../assets/icons/Roles.js',
            icon: <Roles />
        },
        {
            label: 'Positions',
            value: '../../../assets/icons/Positions.js',
            icon: <Positions />
        },
        {
            label: 'Addresses',
            value: '../../../assets/icons/Addresses.js',
            icon: <Addresses />
        },
        {
            label: 'Phones',
            value: '../../../assets/icons/Phones.js',
            icon: <Phones />
        },
        {
            label: 'Companies',
            value: '../../../assets/icons/Companies.js',
            icon: <Companies />
        },
        {
            label: 'Branches',
            value: '../../../assets/icons/Branches.js',
            icon: <Branches />
        },
        {
            label: 'Sections',
            value: '../../../assets/icons/Sections.js',
            icon: <Sections />
        },
        {
            label: 'Permissions',
            value: '../../../assets/icons/Permissions.js',
            icon: <Permissions />
        },
        {
            label: 'HeadOfSection',
            value: '../../../assets/icons/HeadOfSection.js',
            icon: <HeadOfSection />
        },
        {
            label: 'HeadOfDept',
            value: '../../../assets/icons/HeadOfDept.js',
            icon: <HeadOfDept />
        },
        {
            label: 'Department',
            value: '../../../assets/icons/Department.js',
            icon: <Department />
        },
        {
            label: 'DepartmentAdmin',
            value: '../../../assets/icons/DepartmentAdmin.js',
            icon: <DepartmentAdmin />
        },
        {
            label: 'Files',
            value: '../../../assets/icons/Files.js',
            icon: <Files />
        },
        {
            label: 'Sales',
            value: '../../../assets/icons/Sales.js',
            icon: <Sales />
        },
        {
            label: 'Stocks',
            value: '../../../assets/icons/Stocks.js',
            icon: <Stocks />
        },
        {
            label: 'StockIn',
            value: '../../../assets/icons/StockIn.js',
            icon: <StockIn />
        },
        {
            label: 'StockOut',
            value: '../../../assets/icons/StockOut.js',
            icon: <StockOut />
        },
        { label: 'Logs', value: '../../../assets/icons/Logs.js', icon: <Logs /> },
        {
            label: 'People',
            value: '../../../assets/icons/People.js',
            icon: <People />
        },
        {
            label: 'Technician',
            value: '../../../assets/icons/Technician.js',
            icon: <Technician />
        },
        {
            label: 'Master',
            value: '../../../assets/icons/Master.js',
            icon: <Master />
        },
        {
            label: 'Tests',
            value: '../../../assets/icons/Tests.js',
            icon: <Tests />
        },
        {
            label: 'Errors',
            value: '../../../assets/icons/Errors.js',
            icon: <Errors />
        },
        {
            label: 'Supervisor',
            value: '../../../assets/icons/Supervisor.js',
            icon: <Supervisor />
        }
    ];

    const getIconComponent = (iconPath) => {
        if (!iconPath) return null;
        const icon = iconOptions.find((i) => i.value === iconPath);
        return icon ? icon.icon : <span>[Icon]</span>; // Fallback
    };

    useEffect(() => {
        client
            .service('profileMenu')
            .get(urlParams.singleProfileMenuId)
            .then((res) => {
                set_entity(res || {});
            })
            .catch((error) => {
                console.debug({ error });
                props.alert({
                    title: 'ProfileMenu',
                    type: 'error',
                    message: error.message || 'Failed get profileMenu'
                });
            });
    }, [props, urlParams.singleProfileMenuId]);

    const goBack = () => {
        navigate('/cbAdmin/profileMenu');
    };

    const toggleHelpSidebar = () => {
        setHelpSidebarVisible(!isHelpSidebarVisible);
    };

    const copyPageLink = () => {
        const currentUrl = window.location.href;

        navigator.clipboard
            .writeText(currentUrl)
            .then(() => {
                props.alert({
                    title: 'Link Copied',
                    type: 'success',
                    message: 'Page link copied to clipboard!'
                });
            })
            .catch((err) => {
                console.error('Failed to copy link: ', err);
                props.alert({
                    title: 'Error',
                    type: 'error',
                    message: 'Failed to copy page link.'
                });
            });
    };

    const menuItems = [
        {
            label: 'Copy link',
            icon: 'pi pi-copy',
            command: () => copyPageLink()
        },
        {
            label: 'Help',
            icon: 'pi pi-question-circle',
            command: () => toggleHelpSidebar()
        }
    ];
    const renderMenuItems = (menuItems) => {
        if (!menuItems || menuItems.length === 0) {
            return <p>No menu items available.</p>;
        }

        return (
            <ul className="menu-list">
                {menuItems.map((menuItem, index) => (
                    <li key={index} className="menu-item">
                        <div className="menu-item-header">
                            {getIconComponent(menuItem.icon)}
                            <span className="menu-item-name">{menuItem.name}</span>
                            <span> - </span>
                            <span className="menu-item-route">Route: {menuItem.routePage}</span>
                        </div>
                        {menuItem.submenus && menuItem.submenus.length > 0 && (
                            <ul className="submenu-list">
                                {menuItem.submenus.map((submenu, subIndex) => (
                                    <li key={subIndex} className="submenu-item">
                                        {getIconComponent(submenu.icon)}
                                        <span className="submenu-item-name">{submenu.name}</span>
                                        <span> - </span>
                                        <span className="submenu-item-route">Route: {submenu.routePage}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </li>
                ))}
            </ul>
        );
    };

    return (
        <ProjectLayout>
            <div className="col-12 flex flex-column align-items-center">
                <div className="col-12">
                    <div className="flex align-items-center justify-content-between">
                        <div className="flex align-items-center">
                            <Button className="p-button-text" icon="pi pi-chevron-left" onClick={() => goBack()} />
                            <h3 className="m-0">ProfileMenu</h3>
                            <SplitButton model={menuItems} dropdownIcon="pi pi-ellipsis-h" buttonClassName="hidden" menuButtonClassName="ml-1 p-button-text" />
                        </div>
                    </div>

                    <div className="card w-full">
                        <div className="grid">
                            <div className="col-12 md:col-6 lg:col-4">
                                <label className="text-sm text-gray-600">Roles</label>
                                <div className="m-0 ml-3">
                                    {_entity.roles?.length > 0
                                        ? getRelatedNames(_entity.roles, roles).map((name, index) => (
                                              <React.Fragment key={_entity.roles[index]}>
                                                  <Link to={`/roles/${_entity.roles[index]}`}>{name}</Link>
                                                  {index < _entity.roles.length - 1 && ', '}
                                              </React.Fragment>
                                          ))
                                        : 'N/A'}
                                </div>
                            </div>

                            {/* Positions */}
                            <div className="col-12 md:col-6 lg:col-4">
                                <label className="text-sm text-gray-600">Positions</label>
                                <div className="m-0 ml-3">
                                    {_entity.positions?.length > 0
                                        ? getRelatedNames(_entity.positions, positions).map((name, index) => (
                                              <React.Fragment key={_entity.positions[index]}>
                                                  <Link to={`/positions/${_entity.positions[index]}`}>{name}</Link>
                                                  {index < _entity.positions.length - 1 && ', '}
                                              </React.Fragment>
                                          ))
                                        : 'N/A'}
                                </div>
                            </div>

                            {/* Profiles */}
                            <div className="col-12 md:col-6 lg:col-4">
                                <label className="text-sm text-gray-600">Profiles</label>
                                <div className="m-0 ml-3">
                                    {_entity.profiles?.length > 0
                                        ? getRelatedNames(_entity.profiles, profiles).map((name, index) => (
                                              <React.Fragment key={_entity.profiles[index]}>
                                                  <Link to={`/profiles/${_entity.profiles[index]}`}>{name}</Link>
                                                  {index < _entity.profiles.length - 1 && ', '}
                                              </React.Fragment>
                                          ))
                                        : 'N/A'}
                                </div>
                            </div>

                            {/* <div className="col-12 md:col-6 lg:col-3">
                                <label className="text-sm text-gray-600">User</label>
                                <p className="m-0 ml-3">
                                    {_entity.user ? (
                                        <Link to={`/users/${_entity.user}`}>
                                            {getRelatedName(_entity.user, users)}
                                        </Link>
                                    ) : "N/A"}
                                </p>
                            </div> */}
                            <div className="col-12 md:col-6 lg:col-3">
                                <label className="text-sm text-gray-600">Company</label>
                                <p className="m-0 ml-3">{_entity.company ? <Link to={`/companies/${_entity.company}`}>{getRelatedName(_entity.company, companies)}</Link> : 'N/A'}</p>
                            </div>
                            <div className="col-12 md:col-6 lg:col-3">
                                <label className="text-sm text-gray-600">Branch</label>
                                <p className="m-0 ml-3">{_entity.branch ? <Link to={`/branches/${_entity.branch}`}>{getRelatedName(_entity.branch, branches)}</Link> : 'N/A'}</p>
                            </div>
                            <div className="col-12 md:col-6 lg:col-3">
                                <label className="text-sm text-gray-600">Department</label>
                                <p className="m-0 ml-3">{_entity.department ? <Link to={`/departments/${_entity.department}`}>{getRelatedName(_entity.department, departments)}</Link> : 'N/A'}</p>
                            </div>
                            <div className="col-12 md:col-6 lg:col-3">
                                <label className="text-sm text-gray-600">Section</label>
                                <p className="m-0 ml-3">{_entity.section ? <Link to={`/sections/${_entity.section}`}>{getRelatedName(_entity.section, sections)}</Link> : 'N/A'}</p>
                            </div>
                            {/* Menu Items Display */}
                            <div className="col-12">
                                <label className="text-sm text-gray-600">Menu Items</label>
                                {renderMenuItems(_entity.menuItems)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-2">
                <TabView></TabView>
            </div>

            <CommentsSection recordId={urlParams.singleProfileMenuId} user={props.user} alert={props.alert} serviceName="profileMenu" />

            <div
                id="rightsidebar"
                className={classNames('overlay-auto z-10 surface-overlay shadow-2 fixed top-0 right-0 w-20rem animation-duration-150 animation-ease-in-out', { hidden: !isHelpSidebarVisible, block: isHelpSidebarVisible })}
                style={{
                    height: '100%',
                    backgroundColor: 'rgba(0, 0, 0, 0.5)'
                }}
            >
                <div className="flex flex-column h-full p-4 bg-white" style={{ height: 'calc(100% - 60px)', marginTop: '60px' }}>
                    <span className="text-xl font-medium text-900 mb-3">Help bar</span>
                    <div className="border-2 border-dashed surface-border border-round surface-section flex-auto"></div>
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
    hasServicePermission: (service) => dispatch.perms.hasServicePermission(service),
    hasServiceFieldsPermission: (service) => dispatch.perms.hasServiceFieldsPermission(service)
});

export default connect(mapState, mapDispatch)(SingleProfileMenuPage);
