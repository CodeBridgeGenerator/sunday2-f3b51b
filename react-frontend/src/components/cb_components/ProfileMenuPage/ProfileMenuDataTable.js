import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import React, { useState, useRef, useEffect } from 'react';
import _ from 'lodash';
import { Button } from 'primereact/button';
import { useParams, useNavigate } from 'react-router-dom';
import moment from 'moment';
import UploadService from '../../../services/UploadService';
import { InputText } from 'primereact/inputtext';
import { Dialog } from 'primereact/dialog';
import { MultiSelect } from 'primereact/multiselect';
import { Checkbox } from 'primereact/checkbox';
import DownloadCSV from '../../../utils/DownloadCSV';
import InboxCreateDialogComponent from '../InboxPage/InboxCreateDialogComponent';
import InviteIcon from '../../../assets/media/Invite.png';
import ExportIcon from '../../../assets/media/Export & Share.png';
import CopyIcon from '../../../assets/media/Clipboard.png';
import DuplicateIcon from '../../../assets/media/Duplicate.png';
import DeleteIcon from '../../../assets/media/Trash.png';
import client from '../../../services/restClient';

const ProfileMenuDataTable = ({
    items,
    fields,
    onEditRow,
    onRowDelete,
    onRowClick,
    searchDialog,
    setSearchDialog,
    showUpload,
    setShowUpload,
    showFilter,
    setShowFilter,
    showColumns,
    setShowColumns,
    onClickSaveFilteredfields,
    selectedFilterFields,
    setSelectedFilterFields,
    selectedHideFields,
    setSelectedHideFields,
    onClickSaveHiddenfields,
    loading,
    user,
    selectedDelete,
    setSelectedDelete,
    onCreateResult
}) => {
    const dt = useRef(null);
    const urlParams = useParams();
    const [globalFilter, setGlobalFilter] = useState('');
    const [selectedItems, setSelectedItems] = useState([]);
    const [showDialog, setShowDialog] = useState(false);
    const [data, setData] = useState([]); // You might not need this if 'items' is sufficient
    const [roles, setRoles] = useState([]);
    const [positions, setPositions] = useState([]);
    const [profiles, setProfiles] = useState([]);
    const navigate = useNavigate();

    // Use 'items' directly, but initialize 'data' for local operations if necessary
    useEffect(() => {
        setData(items);
    }, [items]);

    useEffect(() => {
        // Fetch roles
        client
            .service('roles')
            .find({ query: { $limit: 10000 } })
            .then((res) => setRoles(res.data))
            .catch((error) => console.error('Failed to fetch roles:', error));

        // Fetch positions
        client
            .service('positions')
            .find({ query: { $limit: 10000 } })
            .then((res) => setPositions(res.data))
            .catch((error) => console.error('Failed to fetch positions:', error));

        // Fetch profiles
        client
            .service('profiles')
            .find({ query: { $limit: 10000 } })
            .then((res) => setProfiles(res.data))
            .catch((error) => console.error('Failed to fetch profiles:', error));
    }, []);

    // Template for Roles (array of objects)
    const pTemplate0 = (rowData, { rowIndex }) => {
        if (!rowData.roles || rowData.roles.length === 0) return <p>N/A</p>;
        const roleLabels = rowData.roles.map((roleId) => {
            const role = roles.find((r) => r._id === roleId);
            return role ? role.name : 'Unknown';
        });
        return <p>{roleLabels.join(', ')}</p>;
    };

    // Template for Positions (array of objects)
    const pTemplate1 = (rowData, { rowIndex }) => {
        if (!rowData.positions || rowData.positions.length === 0) return <p>N/A</p>;
        const positionLabels = rowData.positions.map((positionId) => {
            const position = positions.find((p) => p._id === positionId);
            return position ? position.name : 'Unknown';
        });
        return <p>{positionLabels.join(', ')}</p>;
    };

    // Template for Profiles (array of objects)
    const pTemplate2 = (rowData, { rowIndex }) => {
        if (!rowData.profiles || rowData.profiles.length === 0) return <p>N/A</p>;
        const profileLabels = rowData.profiles.map((profileId) => {
            const profile = profiles.find((p) => p._id === profileId);
            return profile ? profile.name : 'Unknown';
        });
        return <p>{profileLabels.join(', ')}</p>;
    };

    const dropdownTemplate3 = (rowData, { rowIndex }) => <p>{rowData.user?.name}</p>;

    const pTemplate4 = (rowData, { rowIndex }) => <p>{rowData.company}</p>;
    const pTemplate5 = (rowData, { rowIndex }) => <p>{rowData.branch}</p>;
    const pTemplate6 = (rowData, { rowIndex }) => <p>{rowData.department}</p>;
    const pTemplate7 = (rowData, { rowIndex }) => <p>{rowData.section}</p>;

    // Menu Items Display (within a cell)
    const menuItemsTemplate = (rowData) => {
        if (!rowData.menuItems || rowData.menuItems.length === 0) {
            return <span>No menu items</span>;
        }

        return (
            <div>
                {rowData.menuItems.map((menuItem, index) => (
                    <div key={index} className="menu-item">
                        <strong>{menuItem.name}</strong>
                        <p>Route: {menuItem.routePage}</p>
                        {menuItem.submenus && menuItem.submenus.length > 0 && (
                            <div className="submenus">
                                {menuItem.submenus.map((submenu, subIndex) => (
                                    <div key={subIndex} className="submenu-item">
                                        {submenu.name} - Route: {submenu.routePage}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        );
    };

    const editTemplate = (rowData) => {
        return <Button icon="pi pi-pencil" className="p-button-rounded p-button-success p-button-text" onClick={() => navigate(`/cbAdmin/profileMenu/${rowData._id}/edit`)} />;
    };

    const deleteTemplate = (rowData, { rowIndex }) => <Button onClick={() => onRowDelete(rowData._id)} icon="pi pi-trash" className="p-button-rounded p-button-danger p-button-text" />;

    const checkboxTemplate = (rowData) => (
        <Checkbox
            checked={selectedItems.some((item) => item._id === rowData._id)}
            onChange={(e) => {
                let _selectedItems = [...selectedItems];
                if (e.checked) {
                    _selectedItems.push(rowData);
                } else {
                    _selectedItems = _selectedItems.filter((item) => item._id !== rowData._id);
                }
                setSelectedItems(_selectedItems);
            }}
        />
    );

    const deselectAllRows = () => {
        setSelectedItems([]);
    };

    const handleDelete = async () => {
        if (!selectedItems || selectedItems.length === 0) return;

        try {
            const promises = selectedItems.map((item) => client.service('profileMenu').remove(item._id));
            await Promise.all(promises);
            const updatedData = data.filter((item) => !selectedItems.find((selected) => selected._id === item._id));
            setData(updatedData);
            setSelectedDelete(selectedItems.map((item) => item._id));
            deselectAllRows();
        } catch (error) {
            console.error('Failed to delete selected records', error);
        }
    };

    const handleMessage = () => {
        setShowDialog(true);
    };

    const handleHideDialog = () => {
        setShowDialog(false);
    };

    return (
        <>
            <DataTable
                value={data}
                ref={dt}
                removableSort
                onRowClick={onRowClick}
                scrollable
                rowHover
                stripedRows
                paginator
                rows={10}
                rowsPerPageOptions={[10, 50, 250, 500]}
                size={'small'}
                paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
                currentPageReportTemplate="{first} to {last} of {totalRecords}"
                rowClassName="cursor-pointer"
                alwaysShowPaginator={!urlParams.singleUsersId}
                selection={selectedItems}
                onSelectionChange={(e) => setSelectedItems(e.value)}
                onCreateResult={onCreateResult}
            >
                <Column selectionMode="multiple" headerStyle={{ width: '3rem' }} body={checkboxTemplate} />
                <Column field="roles" header="Roles" body={pTemplate0} filter={selectedFilterFields.includes('roles')} hidden={selectedHideFields?.includes('roles')} sortable style={{ minWidth: '8rem' }} />
                <Column field="positions" header="Positions" body={pTemplate1} filter={selectedFilterFields.includes('positions')} hidden={selectedHideFields?.includes('positions')} sortable style={{ minWidth: '8rem' }} />
                <Column field="profiles" header="Profiles" body={pTemplate2} filter={selectedFilterFields.includes('profiles')} hidden={selectedHideFields?.includes('profiles')} sortable style={{ minWidth: '8rem' }} />
                <Column field="menuItems" header="Menu Items" body={menuItemsTemplate} style={{ minWidth: '12rem' }} />
                <Column header="Delete" body={deleteTemplate} />
            </DataTable>

            {selectedItems.length > 0 ? (
                <div
                    className="card center"
                    style={{
                        width: '51rem',
                        margin: '20px auto 0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px',
                        fontSize: '14px',
                        fontFamily: 'Arial, sans-serif',
                        color: '#2A4454'
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            border: '1px solid #2A4454',
                            padding: '5px',
                            borderRadius: '5px'
                        }}
                    >
                        {selectedItems.length} selected
                        <span
                            className="pi pi-times"
                            style={{
                                cursor: 'pointer',
                                marginLeft: '10px',
                                color: '#2A4454'
                            }}
                            onClick={() => {
                                deselectAllRows();
                            }}
                        />
                    </div>

                    {/* New buttons section */}
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        {/* Copy button */}
                        <Button
                            label="Copy"
                            labelposition="right"
                            icon={<img src={CopyIcon} style={{ marginRight: '4px', width: '1em', height: '1em' }} />}
                            // tooltip="Copy"
                            // onClick={handleCopy}
                            className="p-button-rounded p-button-text"
                            style={{
                                backgroundColor: 'white',
                                color: '#2A4454',
                                border: '1px solid transparent',
                                transition: 'border-color 0.3s',
                                fontSize: '14px',
                                fontFamily: 'Arial, sans-serif',
                                marginRight: '8px',
                                gap: '4px'
                            }}
                        />

                        {/* Duplicate button */}
                        <Button
                            label="Duplicate"
                            labelposition="right"
                            icon={<img src={DuplicateIcon} style={{ marginRight: '4px', width: '1em', height: '1em' }} />}
                            // tooltip="Duplicate"
                            // onClick={handleDuplicate}
                            className="p-button-rounded p-button-text"
                            style={{
                                backgroundColor: 'white',
                                color: '#2A4454',
                                border: '1px solid transparent',
                                transition: 'border-color 0.3s',
                                fontSize: '14px',
                                fontFamily: 'Arial, sans-serif',
                                marginRight: '8px',
                                gap: '4px'
                            }}
                        />

                        {/* Export button */}
                        <Button
                            label="Export"
                            labelposition="right"
                            icon={<img src={ExportIcon} style={{ marginRight: '4px', width: '1em', height: '1em' }} />}
                            // tooltip="Export"
                            // onClick={handleExport}
                            className="p-button-rounded p-button-text"
                            style={{
                                backgroundColor: 'white',
                                color: '#2A4454',
                                border: '1px solid transparent',
                                transition: 'border-color 0.3s',
                                fontSize: '14px',
                                fontFamily: 'Arial, sans-serif',
                                marginRight: '8px',
                                gap: '4px'
                            }}
                        />

                        {/* Message button */}
                        <Button
                            label="Message"
                            labelposition="right"
                            icon={<img src={InviteIcon} style={{ marginRight: '4px', width: '1em', height: '1em' }} />}
                            onClick={handleMessage}
                            className="p-button-rounded p-button-text"
                            style={{
                                backgroundColor: 'white',
                                color: '#2A4454',
                                border: '1px solid transparent',
                                transition: 'border-color 0.3s',
                                fontSize: '14px',
                                fontFamily: 'Arial, sans-serif',
                                marginRight: '8px',
                                gap: '4px'
                            }}
                        />

                        {/* InboxCreateDialogComponent */}
                        <InboxCreateDialogComponent
                            show={showDialog}
                            onHide={handleHideDialog}
                            serviceInbox="profileMenu" // Correct service name
                            onCreateResult={onCreateResult}
                            // selectedItemsId={selectedItems.map(item => item._id)}
                            selectedItemsId={selectedItems}
                        />

                        {/* <div style={{ display: 'flex', alignItems: 'center' }}> */}
                        <Button
                            label="Delete"
                            labelposition="right"
                            icon={<img src={DeleteIcon} style={{ marginRight: '4px', width: '1em', height: '1em' }} />}
                            onClick={handleDelete}
                            style={{
                                backgroundColor: 'white',
                                color: '#2A4454',
                                border: '1px solid transparent',
                                transition: 'border-color 0.3s',
                                fontSize: '14px',
                                fontFamily: 'Arial, sans-serif',
                                gap: '4px'
                            }}
                        />
                    </div>
                </div>
            ) : null}

            <Dialog header="Upload ProfileMenu Data" visible={showUpload} onHide={() => setShowUpload(false)}>
                <UploadService
                    user={user}
                    serviceName="profileMenu"
                    onUploadComplete={() => {
                        setShowUpload(false); // Close the dialog after upload
                    }}
                />
            </Dialog>

            <Dialog header="Search ProfileMenu" visible={searchDialog} onHide={() => setSearchDialog(false)}>
                Search
            </Dialog>
            <Dialog header="Filter Users" visible={showFilter} onHide={() => setShowFilter(false)}>
                <div className="card flex justify-content-center">
                    <MultiSelect value={selectedFilterFields} onChange={(e) => setSelectedFilterFields(e.value)} options={fields} optionLabel="name" optionValue="value" filter placeholder="Select Fields" maxSelectedLabels={6} className="w-full md:w-20rem" />
                </div>
                <Button
                    text
                    label="save as pref"
                    onClick={() => {
                        console.debug(selectedFilterFields);
                        onClickSaveFilteredfields(selectedFilterFields);
                        setSelectedFilterFields(selectedFilterFields);
                        setShowFilter(false);
                    }}
                ></Button>
            </Dialog>

            <Dialog header="Hide Columns" visible={showColumns} onHide={() => setShowColumns(false)}>
                <div className="card flex justify-content-center">
                    <MultiSelect value={selectedHideFields} onChange={(e) => setSelectedHideFields(e.value)} options={fields} optionLabel="name" optionValue="value" filter placeholder="Select Fields" maxSelectedLabels={6} className="w-full md:w-20rem" />
                </div>
                <Button
                    text
                    label="save as pref"
                    onClick={() => {
                        console.debug(selectedHideFields);
                        onClickSaveHiddenfields(selectedHideFields);
                        setSelectedHideFields(selectedHideFields);
                        setShowColumns(false);
                    }}
                ></Button>
            </Dialog>
        </>
    );
};

export default ProfileMenuDataTable;
