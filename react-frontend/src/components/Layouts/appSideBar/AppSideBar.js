// AppSideBar.js
import { useEffect, useMemo, useState } from 'react';
import { classNames } from 'primereact/utils';

import AppMenu from './AppMenu.js';
import AppFooter from '../AppFooter.js';
import AppSideBarProvider from './AppSideBarProvider.js';
import Toggle from '../../../assets/icons/Toggle.js';

import Home from '../../../assets/icons/Home.js';
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
import DepartmentAdmin from '../../../assets/icons/DepartmentAdmin.js';
import Files from '../../../assets/icons/Files.js';
import Errors from '../../../assets/icons/Errors.js';
// ~cb-add-import~

const iconMapping = {
    Home: <Home />,
    Data: <Data />,
    Messaging: <Messaging />,
    Report: <Report />,
    GenAI: <GenAI />,
    StaffInfo: <StaffInfo />,
    Stack: <Stack />,
    DynaLoader: <DynaLoader />,
    Server: <Server />,
    Email: <Email />,
    MailSent: <MailSent />,
    Load: <Load />,
    Chat: <Chat />,
    Terminal: <Terminal />,
    Documents: <Documents />,
    Admin: <Admin />,
    Users: <Users />,
    Building: <Building />,
    Profile: <Profile />,
    Profiles: <Profiles />,
    Employees: <Employees />,
    UserLogin: <UserLogin />,
    Superiors: <Superiors />,
    Roles: <Roles />,
    Positions: <Positions />,
    Addresses: <Addresses />,
    Phones: <Phones />,
    Companies: <Companies />,
    Branches: <Branches />,
    Sections: <Sections />,
    Permissions: <Permissions />,
    HeadOfSection: <HeadOfSection />,
    HeadOfDept: <HeadOfDept />,
    DepartmentAdmin: <DepartmentAdmin />,
    Files: <Files />,
    Errors: <Errors />
};

const getIconComponent = (iconPathOrName) => {
    if (!iconPathOrName) return <div className="h-5 w-5 bg-gray-300 rounded" />;

    // DB saves paths like "../../../assets/icons/Companies.js"
    const clean = iconPathOrName.toString().replace('../../../assets/icons/', '').replace('.js', '').replace('Icon', '').trim();

    return iconMapping[clean] || <div className="h-5 w-5 bg-gray-300 rounded" />;
};

const processDbMenus = (menus = []) => {
    return (menus || []).map((m) => ({
        ...m,
        icon: getIconComponent(m.icon),
        menus: m.menus ? processDbMenus(m.menus) : undefined
    }));
};

const AppSideBar = (props) => {
    const { activeKey: initialActiveKey, activeDropdown: initialActiveDropdown, dbMenus = [], isMenuLoading } = props;

    const [activeKey, setActiveKey] = useState(initialActiveKey);
    const [activeDropdown, setActiveDropdown] = useState(initialActiveDropdown);
    const [open, setOpen] = useState(true);

    const dbMenusProcessed = useMemo(() => processDbMenus(dbMenus), [dbMenus]);

    const useDbMenu = dbMenusProcessed && dbMenusProcessed.length > 0;

    return (
        <>
            <div className={classNames('duration-300 flex-shrink-0', open ? 'w-[280px]' : 'w-[calc(3rem+20px)]')}></div>

            <AppSideBarProvider activeKey={activeKey} setActiveKey={setActiveKey} open={open} setOpen={setOpen} activeDropdown={activeDropdown} setActiveDropdown={setActiveDropdown}>
                <div className={classNames('fixed z-[100] flex flex-col top-20 left-0 h-[calc(100vh-5rem)] overflow-y-hidden overflow-x-hidden flex-shrink-0 shadow bg-[#F8F9FA] border-r border-[#DEE2E6] border-solid duration-300', open ? 'w-[280px]' : 'w-[calc(3rem+20px)]')}>
                    <div className="flex-grow gap-1 p-2 overflow-x-hidden overflow-y-auto no-scrollbar">
                        <div className="flex gap-3 px-3 py-[10px]">
                            <span className="cursor-pointer" onClick={() => setOpen(!open)}>
                                <Toggle />
                            </span>
                        </div>

                        {/* OPTIONAL: small loading state (doesn't block) */}
                        {isMenuLoading && <div className={classNames('px-3 py-2 text-sm text-gray-500', open ? 'block' : 'hidden')}>Loading menu...</div>}

                        {/* ✅ If DB menu exists -> render it. Else -> render your current default sidebar */}
                        {useDbMenu ? (
                            dbMenusProcessed.map((menu, i) => <AppMenu key={i} icon={menu.icon} label={menu.label} menuKey={menu.menuKey} to={menu.to} menus={menu.menus} setActiveKey={setActiveKey} />)
                        ) : (
                            <>
                                {/* ===================== DEFAULT MENU (YOUR CURRENT MENU) ===================== */}
                                <AppMenu
                                    icon={<Home />}
                                    label="My app"
                                    menuKey="dashboard"
                                    to="/cbAdmin/dashboard"
                                    menus={
                                        [
{
                  icon: <Home />,
                  label: "Highways",
                  menuKey: "highways",
                  to: "/app/highways",
                },
                                            /* ~cb-add-menu~ */
                                        ]
                                    }
                                />

                                <AppMenu
                                    icon={<Admin />}
                                    label="People"
                                    menuKey="hr-controls"
                                    to="/cbAdmin/DashboardHRControls"
                                    menus={[
                                        {
                                            label: 'Roles',
                                            icon: <Roles />,
                                            menuKey: 'roles',
                                            to: '/cbAdmin/roles'
                                        },
                                        {
                                            label: 'Positions',
                                            icon: <Positions />,
                                            menuKey: 'positions',
                                            to: '/cbAdmin/positions'
                                        },
                                        {
                                            icon: <Home />,
                                            label: 'Office',
                                            menuKey: 'office',
                                            menus: [
                                                {
                                                    icon: <DepartmentAdmin />,
                                                    label: 'Department Admins',
                                                    menuKey: 'department-admin',
                                                    to: '/cbAdmin/departmentAdmin'
                                                },
                                                {
                                                    icon: <HeadOfDept />,
                                                    label: 'Head of departments',
                                                    menuKey: 'head-of-department',
                                                    to: '/cbAdmin/departmentHOD'
                                                },
                                                {
                                                    icon: <HeadOfSection />,
                                                    label: 'Head of sections',
                                                    menuKey: 'haed-of-section',
                                                    to: '/cbAdmin/departmentHOS'
                                                },
                                                {
                                                    label: 'Superiors',
                                                    icon: <Superiors />,
                                                    menuKey: 'superiors',
                                                    to: '/cbAdmin/superior'
                                                },
                                                {
                                                    label: 'Employees',
                                                    icon: <Employees />,
                                                    menuKey: 'employees',
                                                    to: '/cbAdmin/employees'
                                                },
                                                {
                                                    label: 'Staff info',
                                                    icon: <StaffInfo />,
                                                    menuKey: 'staff-info',
                                                    to: '/cbAdmin/staffinfo'
                                                }
                                            ]
                                        },
                                        {
                                            icon: <Permissions />,
                                            label: 'Permissions',
                                            menuKey: 'service-permissions',
                                            to: '/cbAdmin/permissionServices'
                                        }
                                    ]}
                                    setActiveKey={setActiveKey}
                                />

                                <AppMenu
                                    icon={<Data />}
                                    label="Data"
                                    menuKey="data-management"
                                    to="/cbAdmin/DashboardDataManagement"
                                    menus={[
                                        {
                                            label: 'DynaLoader',
                                            icon: <DynaLoader />,
                                            menuKey: 'dyna-loader',
                                            to: '/cbAdmin/dynaLoader'
                                        },
                                        {
                                            label: 'Documents',
                                            icon: <Documents />,
                                            menuKey: 'documents',
                                            to: '/cbAdmin/documentStorages'
                                        },
                                        {
                                            label: 'Assets',
                                            icon: <Files />,
                                            menuKey: 'assets'
                                        },
                                        {
                                            label: 'Email templates',
                                            icon: <Email />,
                                            menuKey: 'email-templates',
                                            to: '/cbAdmin/templates'
                                        }
                                    ]}
                                    setActiveKey={setActiveKey}
                                />

                                <AppMenu
                                    icon={<GenAI />}
                                    label="Gen Ai"
                                    menuKey="gen-ai"
                                    menus={[
                                        {
                                            label: 'Chat AI',
                                            icon: <Chat />,
                                            menuKey: 'chat-ai',
                                            to: '/cbAdmin/chataiProject'
                                        },
                                        {
                                            label: 'Prompts',
                                            icon: <Terminal />,
                                            menuKey: 'prompts',
                                            to: '/cbAdmin/prompts'
                                        },
                                        {
                                            label: 'Usage',
                                            icon: <Documents />,
                                            menuKey: 'usage',
                                            to: '/cbAdmin/chataiUsage'
                                        }
                                    ]}
                                />

                                <AppMenu
                                    icon={<Users />}
                                    label="Users"
                                    menuKey="user-management"
                                    to="/cbAdmin/DashboardUserManagement"
                                    menus={[
                                        {
                                            label: 'Users',
                                            icon: <Profile />,
                                            menuKey: 'users',
                                            to: '/cbAdmin/users'
                                        },
                                        {
                                            label: 'Profiles',
                                            icon: <Profiles />,
                                            menuKey: 'profiles',
                                            to: '/cbAdmin/profiles'
                                        },
                                        {
                                            label: 'Invites',
                                            icon: <MailSent />,
                                            menuKey: 'user-invites',
                                            to: '/cbAdmin/userInvites'
                                        },
                                        {
                                            label: 'Logins',
                                            icon: <UserLogin />,
                                            menuKey: 'user-logins',
                                            to: '/cbAdmin/loginHistory'
                                        },
                                        {
                                            label: 'Addresses',
                                            icon: <Addresses />,
                                            menuKey: 'addresses',
                                            to: '/cbAdmin/userAddresses'
                                        },
                                        {
                                            label: 'Phones',
                                            icon: <Phones />,
                                            menuKey: 'phones',
                                            to: '/cbAdmin/userPhones'
                                        },
                                        {
                                            icon: <Profile />,
                                            label: 'Profile Menu',
                                            menuKey: 'profileMenu',
                                            to: '/cbAdmin/profileMenu'
                                        }
                                    ]}
                                    setActiveKey={setActiveKey}
                                />

                                <AppMenu
                                    icon={<Building />}
                                    label="Company"
                                    menuKey="company-management"
                                    to="/cbAdmin/DashboardCompanyData"
                                    menus={[
                                        {
                                            label: 'Companies',
                                            icon: <Companies />,
                                            menuKey: 'companies',
                                            to: '/cbAdmin/companies'
                                        },
                                        {
                                            label: 'Branches',
                                            icon: <Branches />,
                                            menuKey: 'branches',
                                            to: '/cbAdmin/branches'
                                        },
                                        {
                                            label: 'Departments',
                                            icon: <Positions />,
                                            menuKey: 'departments',
                                            to: '/cbAdmin/departments'
                                        },
                                        {
                                            label: 'Sections',
                                            icon: <Sections />,
                                            menuKey: 'sections',
                                            to: '/cbAdmin/sections'
                                        },
                                        {
                                            label: 'Addresses',
                                            icon: <Addresses />,
                                            menuKey: 'company-addresses',
                                            to: '/cbAdmin/companyAddresses'
                                        },
                                        {
                                            label: 'Phones',
                                            icon: <Phones />,
                                            menuKey: 'company-phones',
                                            to: '/cbAdmin/companyPhones'
                                        }
                                    ]}
                                    setActiveKey={setActiveKey}
                                />

                                <AppMenu
                                    icon={<Admin />}
                                    label="Admin"
                                    menuKey="admin-controls"
                                    to="/cbAdmin/DashboardAdminControl"
                                    menus={[
                                        {
                                            label: 'DynaLoader jobs',
                                            icon: <DynaLoader />,
                                            menuKey: 'job-ques',
                                            to: '/cbAdmin/jobQues'
                                        },
                                        {
                                            label: 'Mail jobs',
                                            icon: <Email />,
                                            menuKey: 'mail-job-ques',
                                            to: '/cbAdmin/mailQues'
                                        },
                                        {
                                            label: 'Mail logs',
                                            icon: <MailSent />,
                                            menuKey: 'mail-sent-logs',
                                            to: '/cbAdmin/mails'
                                        },
                                        {
                                            label: 'Error logs',
                                            menuKey: 'errors',
                                            icon: <Errors />,
                                            to: '/cbAdmin/errorLogs'
                                        }
                                    ]}
                                    setActiveKey={setActiveKey}
                                />
                                {/* ===================== END DEFAULT MENU ===================== */}
                            </>
                        )}
                    </div>

                    <div className={classNames('text-center duration-300', open ? 'opacity-100' : 'opacity-0')}>
                        <AppFooter />
                    </div>
                </div>
            </AppSideBarProvider>
        </>
    );
};

export default AppSideBar;
