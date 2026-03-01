import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { useParams } from 'react-router-dom';
import client from '../../../services/restClient.js';
import _ from 'lodash';
import initilization from '../../../utils/init.js';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

//icons
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

const ProfileMenuCreateDialogComponent = (props) => {
    const [activeStep, setActiveStep] = useState(1);
    const navigate = useNavigate();
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [serviceOptions, setServiceOptions] = useState([]);

    const [formData, setFormData] = useState({
        role: null,
        position: null,
        profile: null,
        user: null,
        company: null,
        branch: null,
        department: null,
        section: null,
        menuItems: [{ name: '', routePage: '', submenus: [], icon: '' }] // Initialize with one menu item
    });

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const apiUrl = process.env.REACT_APP_SERVER_URL + '/listServices';
                const response = await axios.get(apiUrl);
                if (response.data?.status && response.data?.data) {
                    // Add slash before each service name and additional routes
                    const services = response.data.data.map((service) => `/${service}`);
                    const additionalRoutes = [
                        '/dashboard',
                        '/DashboardAdminControl',
                        '/DashboardCompanyData',
                        '/DashboardDataManagement',
                        '/DashboardErrors',
                        '/DashboardGenAi',
                        '/DashboardHRControls',
                        '/DashboardMessaging',
                        '/DashboardTicket',
                        '/DashboardUserManagement',
                        '/DashboardStock',
                        '/DashboardSale',
                        '/DashboardMaster'
                    ];
                    setServiceOptions([...services, ...additionalRoutes]);
                } else {
                    console.error('Failed to fetch service options:', response.data);
                }
            } catch (err) {
                console.error('Error fetching services:', err);
            }
        };
        fetchServices();
    }, []);

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

    const handleAddMenu = () => {
        setFormData((prev) => ({
            ...prev,
            menuItems: [...prev.menuItems, { name: '', routePage: '', submenus: [], icon: '' }]
        }));
    };

    const handleMenuChange = (index, field, value) => {
        setFormData((prev) => {
            const updatedMenuItems = [...prev.menuItems];
            updatedMenuItems[index] = { ...updatedMenuItems[index], [field]: value };
            return { ...prev, menuItems: updatedMenuItems };
        });
    };

    const handleAddSubmenu = (menuIndex) => {
        setFormData((prev) => {
            const updatedMenuItems = [...prev.menuItems];
            const currentSubmenus = updatedMenuItems[menuIndex].submenus || [];
            updatedMenuItems[menuIndex] = {
                ...updatedMenuItems[menuIndex],
                submenus: [...currentSubmenus, { name: '', routePage: '', icon: '' }]
            };
            return { ...prev, menuItems: updatedMenuItems };
        });
    };

    const handleSubmenuChange = (menuIndex, submenuIndex, field, value) => {
        setFormData((prev) => {
            const updatedMenuItems = [...prev.menuItems];
            updatedMenuItems[menuIndex].submenus[submenuIndex] = {
                ...updatedMenuItems[menuIndex].submenus[submenuIndex],
                [field]: value
            };
            return { ...prev, menuItems: updatedMenuItems };
        });
    };
    // Consolidated Save Handler
    const handleSave = async () => {
        try {
            // No need to check activeStep, save everything at once
            await client.service('profileMenu').create(formData);
            console.log('Saved form data:', formData);
            props.alert({
                type: 'success',
                title: 'User Context and Menu Items',
                message: 'Data saved successfully!'
            });
            navigate('/some-other-route');
        } catch (err) {
            console.error('Error saving data:', err);
            setError({ saveData: 'Failed to save data.' }); // Use a generic error key
            props.alert({
                type: 'error',
                title: 'Save Error',
                message: err.message || 'Failed to save data.'
            });
        }
    };

    const [error, setError] = useState({});

    const [rolesOptions, setRolesOptions] = useState([]);
    const [positionOptions, setPositionOptions] = useState([]);
    const [profileOptions, setProfileOptions] = useState([]);
    const [userOptions, setUserOptions] = useState([]);
    const [companyOptions, setCompanyOptions] = useState([]);
    const [branchOptions, setBranchOptions] = useState([]);
    const [departmentOptions, setDepartmentOptions] = useState([]);
    const [sectionOptions, setSectionOptions] = useState([]);
    const [selectedRole, setSelectedRole] = useState(null);
    const [filteredPositions, setFilteredPositions] = useState([]);
    const [filteredProfiles, setFilteredProfiles] = useState([]);

    useEffect(() => {
        // Fetch roles options
        const fetchRolesOptions = async () => {
            try {
                const response = await client.service('roles').find({ query: { $limit: 10000 } });
                setRolesOptions(response.data.map((item) => ({ label: item.name, value: item._id })));
            } catch (error) {
                console.error(`Error fetching Roles options:`, error);
                props.alert({
                    title: 'Roles',
                    type: 'error',
                    message: error.message || 'Failed to fetch Roles options'
                });
            }
        };

        // Fetch all positions
        const fetchPositionOptions = async () => {
            try {
                const response = await client.service('positions').find({ query: { $limit: 10000 } });
                setPositionOptions(response.data);
            } catch (error) {
                console.error(`Error fetching Position options:`, error);
                props.alert({
                    title: 'Positions',
                    type: 'error',
                    message: error.message || 'Failed to fetch Position options'
                });
            }
        };

        const fetchProfileOptions = async () => {
            try {
                const response = await client.service('profiles').find({ query: { $limit: 10000 } });
                setProfileOptions(response.data); // Store all profiles, not just mapped options
            } catch (error) {
                console.error(`Error fetching Profile options:`, error);
                props.alert({
                    title: 'Profile',
                    type: 'error',
                    message: error.message || `Failed to fetch Profile options`
                });
            }
        };

        const fetchUserOptions = async () => {
            try {
                const response = await client.service('users').find({ query: { $limit: 10000 } });
                setUserOptions(response.data.map((item) => ({ label: item.name, value: item._id })));
            } catch (error) {
                console.error(`Error fetching User options:`, error);
                props.alert({
                    title: 'User',
                    type: 'error',
                    message: error.message || `Failed to fetch User options`
                });
            }
        };

        const fetchCompanyOptions = async () => {
            try {
                const response = await client.service('companies').find({ query: { $limit: 10000 } });
                setCompanyOptions(response.data.map((item) => ({ label: item.name, value: item._id })));
            } catch (error) {
                console.error(`Error fetching Company options:`, error);
                props.alert({
                    title: 'Company',
                    type: 'error',
                    message: error.message || `Failed to fetch Company options`
                });
            }
        };

        const fetchBranchOptions = async () => {
            try {
                const response = await client.service('branches').find({ query: { $limit: 10000 } });
                setBranchOptions(response.data.map((item) => ({ label: item.name, value: item._id })));
            } catch (error) {
                console.error(`Error fetching Branch options:`, error);
                props.alert({
                    title: 'Branch',
                    type: 'error',
                    message: error.message || `Failed to fetch Branch options`
                });
            }
        };

        const fetchDepartmentOptions = async () => {
            try {
                const response = await client.service('departments').find({ query: { $limit: 10000 } });
                setDepartmentOptions(response.data.map((item) => ({ label: item.name, value: item._id })));
            } catch (error) {
                console.error(`Error fetching Department options:`, error);
                props.alert({
                    title: 'Department',
                    type: 'error',
                    message: error.message || `Failed to fetch Department options`
                });
            }
        };

        const fetchSectionOptions = async () => {
            try {
                const response = await client.service('sections').find({ query: { $limit: 10000 } });
                setSectionOptions(response.data.map((item) => ({ label: item.name, value: item._id })));
            } catch (error) {
                console.error(`Error fetching Section options:`, error);
                props.alert({
                    title: 'Section',
                    type: 'error',
                    message: error.message || `Failed to fetch Section options`
                });
            }
        };

        // Call all the fetch functions
        fetchRolesOptions();
        fetchPositionOptions();
        fetchProfileOptions();
        fetchUserOptions();
        fetchCompanyOptions();
        fetchBranchOptions();
        fetchDepartmentOptions();
        fetchSectionOptions();
    }, []);

    useEffect(() => {
        // Filter positions based on selected role
        if (selectedRole) {
            const filtered = positionOptions.filter((position) => position.roleId === selectedRole);
            setFilteredPositions(filtered.map((item) => ({ label: item.name, value: item._id })));
        } else {
            setFilteredPositions([]);
        }
    }, [selectedRole, positionOptions]);

    useEffect(() => {
        if (formData.position) {
            const filtered = profileOptions.filter((profile) => profile.position === formData.position);
            setFilteredProfiles(filtered.map((item) => ({ label: item.name, value: item._id })));
        } else {
            setFilteredProfiles([]);
        }
    }, [formData.position, profileOptions]);

    const handleRoleChange = (e) => {
        setSelectedRole(e.value);
        setFormData({ ...formData, role: e.value });
    };

    const handlePositionChange = (e) => {
        setFormData({ ...formData, position: e.value });
    };

    const handleProfileChange = (e) => {
        setFormData({ ...formData, profile: e.value });
    };

    const handleStepClick = (step) => {
        setActiveStep(step);
    };

    const handleNext = () => {
        setActiveStep((prevStep) => Math.min(prevStep + 1, 3)); // Ensure step doesn't exceed 3
    };

    const handleBack = () => {
        setActiveStep((prevStep) => Math.max(prevStep - 1, 1)); // Ensure step doesn't go below 1
    };

    const handleInputChange = (field, value) => {
        setFormData((prevData) => ({
            ...prevData,
            [field]: value
        }));
    };

    const handleDeleteMenu = (index) => {
        setFormData((prev) => {
            const updatedMenuItems = prev.menuItems.filter((_, i) => i !== index);
            return { ...prev, menuItems: updatedMenuItems };
        });
    };

    const handleDeleteSubmenu = (menuIndex, submenuIndex) => {
        setFormData((prev) => {
            const updatedMenuItems = [...prev.menuItems];
            updatedMenuItems[menuIndex].submenus = updatedMenuItems[menuIndex].submenus.filter((_, i) => i !== submenuIndex);
            return { ...prev, menuItems: updatedMenuItems };
        });
    };
    const [collapsedMenus, setCollapsedMenus] = useState({});

    const toggleCollapse = (index) => {
        setCollapsedMenus((prev) => ({
            ...prev,
            [index]: !prev[index]
        }));
    };

    return (
        <Dialog header="Create ProfileMenu" visible={props.show} closable={false} onHide={props.onHide} modal style={{ width: '40vw' }} className="min-w-max scalein animation-ease-in-out animation-duration-1000" resizable={false}>
            <div className="flex min-h-[calc(100vh-5rem)] bg-white">
                <div className="flex-1 ml-2">
                    {/* Steps */}
                    <ul className="list-none p-0 m-0 flex flex-column md:flex-row mt-6">
                        {['User Context', 'Menu Items', 'Preview'].map((step, index) => (
                            <li key={index} className={`relative mr-0 md:mr-8 flex-auto cursor-pointer ${activeStep === index + 1 ? 'active' : ''}`} onClick={() => handleStepClick(index + 1)}>
                                {/* Step Indicator */}
                                <div className={`border-round p-3 surface-card flex flex-column md:flex-row align-items-center z-1 ${activeStep === index + 1 ? 'border-2 border-blue-500' : 'border-1 border-300'}`}>
                                    <i className={`pi ${activeStep > index + 1 ? 'pi-check-circle text-green-500' : activeStep === index + 1 ? 'pi-credit-card text-blue-600' : 'pi-circle-fill text-600'} text-2xl md:text-4xl mb-2 md:mb-0 mr-0 md:mr-3`}></i>
                                    <div>
                                        <div className={`font-medium mb-1 ${activeStep === index + 1 ? 'text-blue-600' : 'text-900'}`}>{step}</div>
                                    </div>
                                </div>
                                {/* Line between steps */}
                                {index < 2 && <div className={`w-full absolute top-50 left-100 hidden md:block ${activeStep > index + 1 ? 'bg-blue-500' : 'surface-300'}`} style={{ transform: 'translateY(-50%)', height: '2px' }}></div>}
                            </li>
                        ))}
                    </ul>

                    {/* Content for each step */}
                    <div className="surface-section px-4 py-5 md:px-6 lg:px-8">
                        {activeStep === 1 && (
                            <div>
                                <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>User Context</h2>
                                {/* User Context Form */}
                                <div className="p-fluid grid">
                                    {/* Basic Fields */}
                                    <div className="field col-12 md:col-4">
                                        <label htmlFor="role">Select Role</label>
                                        <Dropdown
                                            id="role"
                                            value={formData.role} // Use formData
                                            options={rolesOptions}
                                            onChange={handleRoleChange}
                                            placeholder="Select a Role"
                                        />
                                    </div>

                                    {selectedRole && (
                                        <div className="field col-12 md:col-4">
                                            <label htmlFor="position">Select Position</label>
                                            <Dropdown
                                                id="position"
                                                value={formData.position} // Use formData
                                                options={filteredPositions}
                                                onChange={handlePositionChange}
                                                placeholder="Select a Position"
                                            />
                                        </div>
                                    )}

                                    {formData.position && (
                                        <div className="field col-12 md:col-4">
                                            <label htmlFor="profile">Profile</label>
                                            <Dropdown
                                                id="profile"
                                                value={formData.profile} // Use formData
                                                options={filteredProfiles}
                                                onChange={handleProfileChange}
                                                placeholder="Select a Profile"
                                            />
                                        </div>
                                    )}

                                    {/* <div className="field col-12 md:col-4">
                                        <label htmlFor="user">User</label>
                                        <Dropdown
                                            id="user"
                                            value={profileMenuData.user}
                                            options={userOptions}
                                             onChange={(e) => handleInputChange(1, "user", e.value)} // Use generic handler, step is no longer needed
                                            placeholder="Select a User"
                                        />
                                    </div> */}

                                    {/* Advanced Options */}
                                    <div className="col-12">
                                        <div className="flex align-items-center">
                                            <h5 className="m-0">Advanced Options</h5>
                                            <Button icon={showAdvanced ? 'pi pi-minus' : 'pi pi-plus'} onClick={() => setShowAdvanced(!showAdvanced)} className="ml-2 p-button-text" />
                                        </div>
                                        {showAdvanced && (
                                            <div className="p-fluid grid">
                                                <div className="field col-12 md:col-4">
                                                    <label htmlFor="company">Company</label>
                                                    <Dropdown
                                                        id="company"
                                                        value={formData.company} // Use formData
                                                        options={companyOptions}
                                                        onChange={(e) => handleInputChange('company', e.value)} // Use generic handler
                                                        placeholder="Select a Company"
                                                    />
                                                </div>
                                                <div className="field col-12 md:col-4">
                                                    <label htmlFor="branch">Branch</label>
                                                    <Dropdown
                                                        id="branch"
                                                        value={formData.branch} // Use formData
                                                        options={branchOptions}
                                                        onChange={(e) => handleInputChange('branch', e.value)} // Use generic handler
                                                        placeholder="Select a Branch"
                                                    />
                                                </div>
                                                <div className="field col-12 md:col-4">
                                                    <label htmlFor="department">Department</label>
                                                    <Dropdown
                                                        id="department"
                                                        value={formData.department} // Use formData
                                                        options={departmentOptions}
                                                        onChange={(e) => handleInputChange('department', e.value)} // Use generic handler
                                                        placeholder="Select a Department"
                                                    />
                                                </div>
                                                <div className="field col-12 md:col-4">
                                                    <label htmlFor="section">Section</label>
                                                    <Dropdown
                                                        id="section"
                                                        value={formData.section} // Use formData
                                                        options={sectionOptions}
                                                        onChange={(e) => handleInputChange('section', e.value)} // Use generic handler
                                                        placeholder="Select a Section"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {/* Error message (if any) */}
                                {error.saveData && <p style={{ color: 'red', marginTop: '10px' }}>{error.saveData}</p>}
                                <div className="mt-4">
                                    <Button label="Next" onClick={handleNext} />
                                </div>
                            </div>
                        )}
                        {activeStep === 2 && (
                            <div>
                                <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Menu Items</h2>

                                {/* Menu Items Form */}
                                <div>
                                    {formData.menuItems.map((menu, menuIndex) => (
                                        <div key={menuIndex}>
                                            <div>
                                                <Button icon={collapsedMenus[menuIndex] ? 'pi pi-chevron-right' : 'pi pi-chevron-down'} onClick={() => toggleCollapse(menuIndex)} className="p-button-text" />
                                                <div className="p-fluid grid">
                                                    <div className="field col-12 md:col-4">
                                                        <label htmlFor={`menuName-${menuIndex}`}>Menu Name</label>
                                                        <InputText id={`menuName-${menuIndex}`} value={menu.name} onChange={(e) => handleMenuChange(menuIndex, 'name', e.target.value)} />
                                                    </div>
                                                    <div className="field col-12 md:col-4">
                                                        <label htmlFor={`menuRoutePage-${menuIndex}`}>Route Page</label>
                                                        <Dropdown id={`menuRoutePage-${menuIndex}`} value={menu.routePage} options={serviceOptions} onChange={(e) => handleMenuChange(menuIndex, 'routePage', e.value)} placeholder="Select a Route Page" />
                                                    </div>
                                                    <div className="field col-12 md:col-4">
                                                        <label htmlFor={`menuIcon-${menuIndex}`}>Icon</label>
                                                        <Dropdown
                                                            id={`menuIcon-${menuIndex}`}
                                                            value={menu.icon}
                                                            options={iconOptions}
                                                            optionLabel="label"
                                                            optionValue="value"
                                                            onChange={(e) => handleMenuChange(menuIndex, 'icon', e.value)}
                                                            placeholder="Select an Icon"
                                                            itemTemplate={(option) => (
                                                                <div className="flex align-items-center">
                                                                    {option.icon}
                                                                    <span className="ml-2">{option.label}</span>
                                                                </div>
                                                            )}
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {!collapsedMenus[menuIndex] && (
                                                <>
                                                    {menu.submenus.map((submenu, submenuIndex) => (
                                                        <div key={submenuIndex} style={{ marginLeft: '20px' }}>
                                                            <div className="p-fluid grid">
                                                                <div className="field col-12 md:col-4">
                                                                    <label htmlFor={`submenuName-${menuIndex}-${submenuIndex}`}>Submenu Name</label>
                                                                    <InputText id={`submenuName-${menuIndex}-${submenuIndex}`} value={submenu.name} onChange={(e) => handleSubmenuChange(menuIndex, submenuIndex, 'name', e.target.value)} />
                                                                </div>
                                                                <div className="field col-12 md:col-4">
                                                                    <label htmlFor={`submenuRoutePage-${menuIndex}-${submenuIndex}`}>Route Page</label>
                                                                    <Dropdown
                                                                        id={`submenuRoutePage-${menuIndex}-${submenuIndex}`}
                                                                        value={submenu.routePage}
                                                                        options={serviceOptions}
                                                                        onChange={(e) => handleSubmenuChange(menuIndex, submenuIndex, 'routePage', e.value)}
                                                                        placeholder="Select a Route Page"
                                                                    />
                                                                </div>
                                                                <div className="field col-12 md:col-4">
                                                                    <label htmlFor={`submenuIcon-${menuIndex}-${submenuIndex}`}>Icon</label>
                                                                    <Dropdown
                                                                        id={`submenuIcon-${menuIndex}-${submenuIndex}`}
                                                                        value={submenu.icon}
                                                                        options={iconOptions}
                                                                        optionLabel="label"
                                                                        optionValue="value"
                                                                        onChange={(e) => handleSubmenuChange(menuIndex, submenuIndex, 'icon', e.value)}
                                                                        placeholder="Select an Icon"
                                                                        itemTemplate={(option) => (
                                                                            <div className="flex align-items-center">
                                                                                {option.icon}
                                                                                <span className="ml-2">{option.label}</span>
                                                                            </div>
                                                                        )}
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className="flex justify-content-end">
                                                                <Button icon="pi pi-trash" className="p-button-danger p-button-sm" onClick={() => handleDeleteSubmenu(menuIndex, submenuIndex)} tooltip="Delete Submenu" tooltipOptions={{ position: 'bottom' }} />
                                                            </div>
                                                        </div>
                                                    ))}

                                                    <Button label="Add Submenu" icon="pi pi-plus" onClick={() => handleAddSubmenu(menuIndex)} className="mb-3 ml-4" />

                                                    <div className="flex justify-content-end">
                                                        <Button icon="pi pi-trash" className="p-button-danger p-button-sm" onClick={() => handleDeleteMenu(menuIndex)} tooltip="Delete Menu" tooltipOptions={{ position: 'bottom' }} />
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    ))}

                                    <Button label="Add Menu" icon="pi pi-plus" onClick={handleAddMenu} />
                                </div>

                                {/* Error message (if any) */}
                                {error.saveData && ( //Consistent error handling
                                    <p style={{ color: 'red', marginTop: '10px' }}>{error.saveData}</p>
                                )}
                                <div className="mt-4">
                                    {activeStep === 2 && <Button label="Back" onClick={handleBack} className="p-button-secondary mr-2" />}
                                    {activeStep === 2 && <Button label="Next" onClick={handleNext} />}
                                </div>
                            </div>
                        )}
                        {activeStep === 3 && (
                            <div>
                                <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Preview</h2>

                                <div className="surface-card p-4">
                                    <div className="grid">
                                        {Object.entries(formData)
                                            .filter(([key]) => key !== 'menuItems') // Exclude menuItems
                                            .map(([key, value]) => {
                                                let displayValue = value;

                                                // Check if the key is role, position, or profile
                                                if (key === 'role' && rolesOptions.find((option) => option.value === value)) {
                                                    displayValue = rolesOptions.find((option) => option.value === value).label;
                                                } else if (key === 'position' && positionOptions.find((option) => option._id === value)) {
                                                    displayValue = positionOptions.find((option) => option._id === value).name;
                                                } else if (key === 'profile' && profileOptions.find((option) => option._id === value)) {
                                                    displayValue = profileOptions.find((option) => option._id === value).name;
                                                } else if (key === 'user' && userOptions.find((option) => option.value === value)) {
                                                    displayValue = userOptions.find((option) => option.value === value).label;
                                                } else if (key === 'company' && companyOptions.find((option) => option.value === value)) {
                                                    displayValue = companyOptions.find((option) => option.value === value).label;
                                                } else if (key === 'branch' && branchOptions.find((option) => option.value === value)) {
                                                    displayValue = branchOptions.find((option) => option.value === value).label;
                                                } else if (key === 'department' && departmentOptions.find((option) => option.value === value)) {
                                                    displayValue = departmentOptions.find((option) => option.value === value).label;
                                                } else if (key === 'section' && sectionOptions.find((option) => option.value === value)) {
                                                    displayValue = sectionOptions.find((option) => option.value === value).label;
                                                }

                                                return (
                                                    <div key={key} className="col-12 md:col-6 lg:col-4">
                                                        <div className="flex align-items-center mb-2">
                                                            <span className="font-bold mr-2">{key}:</span>
                                                            <span className="text-gray-700">{displayValue || 'Not selected'}</span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                    </div>
                                </div>

                                <h3>Menu Items</h3>
                                <div className="surface-card p-4">
                                    <ul className="m-0 p-0 list-none">
                                        {formData.menuItems.map((menu, menuIndex) => (
                                            <li key={menuIndex} className="mb-3">
                                                <div className="flex align-items-center">
                                                    {menu.icon &&
                                                        (() => {
                                                            const SelectedIcon = iconOptions.find((icon) => icon.value === menu.icon)?.icon;
                                                            return SelectedIcon ? <span className="mr-2">{SelectedIcon}</span> : null;
                                                        })()}
                                                    <div className="font-bold text-xl">{menu.name}</div>
                                                </div>
                                                <div className="text-gray-600 ml-3">Route: {menu.routePage}</div>
                                                {menu.submenus.length > 0 && (
                                                    <ul className="m-0 p-0 ml-6 list-none">
                                                        {menu.submenus.map((submenu, submenuIndex) => (
                                                            <li key={submenuIndex} className="mb-2">
                                                                <div className="flex align-items-center">
                                                                    {submenu.icon &&
                                                                        (() => {
                                                                            const SelectedSubIcon = iconOptions.find((icon) => icon.value === submenu.icon)?.icon;
                                                                            return SelectedSubIcon ? <span className="mr-2">{SelectedSubIcon}</span> : null;
                                                                        })()}
                                                                    <div className="text-lg">{submenu.name}</div>
                                                                </div>
                                                                <div className="text-gray-600 ml-3">Route: {submenu.routePage}</div>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Navigation Buttons */}
                    <div className="mt-4">
                        {activeStep === 3 && ( // Removed Back button
                            <Button label="Back" onClick={handleBack} className="p-button-secondary mr-2" />
                        )}
                        {/* {activeStep < 3 && <Button label="Next" onClick={handleNext} />}  Removed Next button*/}
                        {activeStep === 3 && <Button label="Save" onClick={handleSave} />}
                    </div>
                </div>
            </div>
        </Dialog>
    );
};

const mapState = (state) => {
    const { user } = state.auth;
    return { user };
};
const mapDispatch = (dispatch) => ({
    alert: (data) => dispatch.toast.alert(data),
    hasServicePermission: (service) => dispatch.perms.hasServicePermission(service),
    hasServiceFieldsPermission: (service) => dispatch.perms.hasServiceFieldsPermission(service)
});

export default connect(mapState, mapDispatch)(ProfileMenuCreateDialogComponent);
