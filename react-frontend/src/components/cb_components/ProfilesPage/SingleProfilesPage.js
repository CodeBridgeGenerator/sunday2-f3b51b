import React, { useEffect, useState, useRef } from 'react';
import { connect } from 'react-redux';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { classNames } from 'primereact/utils';
import { Button } from 'primereact/button';
import { TabView, TabPanel } from 'primereact/tabview';
import { SplitButton } from 'primereact/splitbutton';
import client from '../../../services/restClient';
import CommentsSection from '../../common/CommentsSection';
import ProjectLayout from '../../Layouts/ProjectLayout';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Chip } from 'primereact/chip';

const SingleProfilesPage = (props) => {
    const navigate = useNavigate();
    const urlParams = useParams();
    const [_entity, set_entity] = useState({});
    const [isHelpSidebarVisible, setHelpSidebarVisible] = useState(false);

    const [userId, setUserId] = useState([]);
    const [department, setDepartment] = useState([]);
    const [section, setSection] = useState([]);
    const [position, setPosition] = useState([]);
    const [manager, setManager] = useState([]);
    const [company, setCompany] = useState([]);
    const [branch, setBranch] = useState([]);
    const [address, setAddress] = useState([]);
    const [phone, setPhone] = useState([]);

    const calendar_24Template5 = (rowData, { rowIndex }) => <p>{rowData.startTime ? new Date(rowData.startTime).toLocaleString('en-GB', { hour12: false }) : 'null'}</p>;
    const calendar_24Template6 = (rowData, { rowIndex }) => <p>{rowData.endTime ? new Date(rowData.endTime).toLocaleString('en-GB', { hour12: false }) : 'null'}</p>;

    useEffect(() => {
        client
            .service('profiles')
            .get(urlParams.singleProfilesId, {
                query: {
                    $populate: [
                        {
                            path: 'createdBy',
                            service: 'users',
                            select: ['name']
                        },
                        {
                            path: 'updatedBy',
                            service: 'users',
                            select: ['name']
                        },
                        'userId',
                        'department',
                        'section',
                        'position',
                        'manager',
                        'company',
                        'branch',
                        'address',
                        'phone'
                    ]
                }
            })
            .then((res) => {
                set_entity(res || {});
                setUserId(Array.isArray(res.userId) ? res.userId.map((elem) => ({ _id: elem._id, name: elem.name })) : res.userId ? [{ _id: res.userId._id, name: res.userId.name }] : []);
                setDepartment(Array.isArray(res.department) ? res.department.map((elem) => ({ _id: elem._id, name: elem.name })) : res.department ? [{ _id: res.department._id, name: res.department.name }] : []);
                setSection(Array.isArray(res.section) ? res.section.map((elem) => ({ _id: elem._id, name: elem.name })) : res.section ? [{ _id: res.section._id, name: res.section.name }] : []);
                setPosition(Array.isArray(res.position) ? res.position.map((elem) => ({ _id: elem._id, name: elem.name })) : res.position ? [{ _id: res.position._id, name: res.position.name }] : []);
                setManager(Array.isArray(res.manager) ? res.manager.map((elem) => ({ _id: elem._id, name: elem.name })) : res.manager ? [{ _id: res.manager._id, name: res.manager.name }] : []);
                setCompany(Array.isArray(res.company) ? res.company.map((elem) => ({ _id: elem._id, name: elem.name })) : res.company ? [{ _id: res.company._id, name: res.company.name }] : []);
                setBranch(Array.isArray(res.branch) ? res.branch.map((elem) => ({ _id: elem._id, name: elem.name })) : res.branch ? [{ _id: res.branch._id, name: res.branch.name }] : []);
                setAddress(
                    Array.isArray(res.address)
                        ? res.address.map((elem) => ({
                              _id: elem._id,
                              Street1: elem.Street1
                          }))
                        : res.address
                          ? [{ _id: res.address._id, Street1: res.address.Street1 }]
                          : []
                );
                setPhone(Array.isArray(res.phone) ? res.phone.map((elem) => ({ _id: elem._id, number: elem.number })) : res.phone ? [{ _id: res.phone._id, number: res.phone.number }] : []);
            })
            .catch((error) => {
                console.debug({ error });
                props.alert({
                    title: 'Profiles',
                    type: 'error',
                    message: error.message || 'Failed get profiles'
                });
            });
    }, [props, urlParams.singleProfilesId]);

    const goBack = () => {
        navigate('/cbAdmin/profiles');
    };

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

    return (
        <ProjectLayout>
            <div className="col-12 flex flex-column align-items-center">
                <div className="col-12">
                    <div className="flex align-items-center justify-content-between">
                        <div className="flex align-items-center">
                            <Button className="p-button-text" icon="pi pi-chevron-left" onClick={() => goBack()} />
                            <h3 className="m-0">Profiles</h3>
                            <SplitButton model={menuItems} dropdownIcon="pi pi-ellipsis-h" buttonClassName="hidden" menuButtonClassName="ml-1 p-button-text" />
                        </div>
                    </div>
                    <div className="card w-full">
                        <div className="grid ">
                            <div className="col-12 md:col-6 lg:col-3 mb-10">
                                <label className="text-sm text-gray-600">Name</label>
                                <p className="m-0 ml-3">{_entity?.name}</p>
                            </div>
                            <div className="col-12 md:col-6 lg:col-3 mb-10">
                                <label className="text-sm text-gray-600">Image</label>
                                <p>
                                    <img id="image" src={_entity?.image} className="m-0 ml-3" width={300} />
                                </p>
                            </div>
                            <div className="col-12 md:col-6 lg:col-3 mb-10">
                                <label className="text-sm text-gray-600">Bio</label>
                                <p className="m-0 ml-3">{_entity?.bio}</p>
                            </div>
                            {/* <div className="col-12 md:col-6 lg:col-3 mb-10">
                <label className="text-sm text-gray-600">
                  Head of Department
                </label>
                <p className="m-0">
                  <i
                    id="hod"
                    className={`pi ${_entity?.hod ? "pi-check" : "pi-times"}`}
                  ></i>
                </p>
              </div>
              <div className="col-12 md:col-6 lg:col-3 mb-10">
                <label className="text-sm text-gray-600">Head of Section</label>
                <p className="m-0">
                  <i
                    id="hos"
                    className={`pi ${_entity?.hos ? "pi-check" : "pi-times"}`}
                  ></i>
                </p>
              </div> */}
                            <div className="col-12 md:col-6 lg:col-3 mb-10">
                                <label className="text-sm text-gray-600">Skills</label>
                                <p className="m-0 ml-3">
                                    <Chip id="skills" label={_entity?.skills} />
                                </p>
                            </div>
                            <div className="col-12 md:col-6 lg:col-3 mb-10">
                                <label className="text-sm text-gray-600">User</label>
                                {userId.map((elem) => (
                                    <Link key={elem._id} to={`/users/${elem._id}`}>
                                        <div>
                                            {' '}
                                            <p className="text-xl text-primary">{elem.name}</p>{' '}
                                        </div>
                                    </Link>
                                ))}
                            </div>
                            {/* <div className="col-12 md:col-6 lg:col-3 mb-10">
                <label className="text-sm text-gray-600">Department</label>
                {department.map((elem) => (
                  <Link key={elem._id} to={`/departments/${elem._id}`}>
                    <div>
                      {" "}
                      <p className="text-xl text-primary">{elem.name}</p>{" "}
                    </div>
                  </Link>
                ))}
              </div>
              <div className="col-12 md:col-6 lg:col-3 mb-10">
                <label className="text-sm text-gray-600">Section</label>
                {section.map((elem) => (
                  <Link key={elem._id} to={`/sections/${elem._id}`}>
                    <div>
                      {" "}
                      <p className="text-xl text-primary">{elem.name}</p>{" "}
                    </div>
                  </Link>
                ))}
              </div> */}
                            <div className="col-12 md:col-6 lg:col-3 mb-10">
                                <label className="text-sm text-gray-600">Position</label>
                                {position.map((elem) => (
                                    <Link key={elem._id} to={`/positions/${elem._id}`}>
                                        <div>
                                            {' '}
                                            <p className="text-xl text-primary">{elem.name}</p>{' '}
                                        </div>
                                    </Link>
                                ))}
                            </div>
                            {/* <div className="col-12 md:col-6 lg:col-3 mb-10">
                <label className="text-sm text-gray-600">Manager</label>
                {manager.map((elem) => (
                  <Link key={elem._id} to={`/users/${elem._id}`}>
                    <div>
                      {" "}
                      <p className="text-xl text-primary">{elem.name}</p>{" "}
                    </div>
                  </Link>
                ))}
              </div> */}
                            <div className="col-12 md:col-6 lg:col-3 mb-10">
                                <label className="text-sm text-gray-600">Company</label>
                                {company.map((elem) => (
                                    <Link key={elem._id} to={`/companies/${elem._id}`}>
                                        <div>
                                            {' '}
                                            <p className="text-xl text-primary">{elem.name}</p>{' '}
                                        </div>
                                    </Link>
                                ))}
                            </div>
                            <div className="col-12 md:col-6 lg:col-3 mb-10">
                                <label className="text-sm text-gray-600">Branch</label>
                                {branch.map((elem) => (
                                    <Link key={elem._id} to={`/branches/${elem._id}`}>
                                        <div>
                                            {' '}
                                            <p className="text-xl text-primary">{elem.name}</p>{' '}
                                        </div>
                                    </Link>
                                ))}
                            </div>
                            <div className="col-12 md:col-6 lg:col-3 mb-10">
                                <label className="text-sm text-gray-600">Address</label>
                                {address.map((elem) => (
                                    <Link key={elem._id} to={`/userAddresses/${elem._id}`}>
                                        <div>
                                            {' '}
                                            <p className="text-xl text-primary">{elem.Street1}</p>{' '}
                                        </div>
                                    </Link>
                                ))}
                            </div>
                            <div className="col-12 md:col-6 lg:col-3 mb-10">
                                <label className="text-sm text-gray-600">Phone</label>
                                {phone.map((elem) => (
                                    <Link key={elem._id} to={`/userPhones/${elem._id}`}>
                                        <div>
                                            {' '}
                                            <p className="text-xl text-primary">{elem.number}</p>{' '}
                                        </div>
                                    </Link>
                                ))}
                            </div>

                            <div className="col-12">&nbsp;</div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Conditionally render the supervisor history table */}
            {showSupervisorHistory && (
                <div className="mt-2">
                    <TabView>
                        <TabPanel header="Supervisor History">
                            <DataTable value={supervisorHistory} responsiveLayout="scroll">
                                <Column field="machineId.serialNumber" header="Machine"></Column>
                                <Column field="assignedSupervisor.name" header="Supervisor"></Column>
                                <Column field="assignedTechnician.name" header="Technician"></Column>
                                <Column field="status" header="Status"></Column>
                                <Column field="startTime" header="Start Time" body={calendar_24Template5} />
                                <Column field="endTime" header="End Time" body={calendar_24Template6} />
                            </DataTable>
                        </TabPanel>
                    </TabView>
                </div>
            )}

            {/* Conditionally render the technician history table */}
            {showTechnicianHistory && (
                <div className="mt-2">
                    <TabView>
                        <TabPanel header="Technician History">
                            <DataTable value={technicianHistory} responsiveLayout="scroll">
                                <Column field="machineId.serialNumber" header="Machine"></Column>
                                <Column field="assignedSupervisor.name" header="Supervisor"></Column>
                                <Column field="status" header="Status"></Column>
                                <Column field="assignedTechnician.name" header="Technician"></Column>
                                <Column field="status" header="Status"></Column>
                                <Column field="startTime" header="Start Time" body={calendar_24Template5} />
                                <Column field="endTime" header="End Time" body={calendar_24Template6} />
                                {/* ... other columns ... */}
                            </DataTable>
                        </TabPanel>
                    </TabView>
                </div>
            )}

            <CommentsSection recordId={urlParams.singleProfilesId} user={props.user} alert={props.alert} serviceName="profiles" />
            <div id="rightsidebar" className={classNames('overlay-auto z-1 surface-overlay shadow-2 absolute right-0 w-20rem animation-duration-150 animation-ease-in-out', { hidden: !isHelpSidebarVisible })} style={{ top: '60px', height: 'calc(100% - 60px)' }}>
                <div className="flex flex-column h-full p-4">
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

export default connect(mapState, mapDispatch)(SingleProfilesPage);
