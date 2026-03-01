import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import React, { useState, useRef, useEffect } from 'react';
import client from '../../../services/restClient';
import _ from 'lodash';
import { Button } from 'primereact/button';
import { useParams } from 'react-router-dom';
import moment from 'moment';
import UploadService from '../../../services/UploadService';
import { Dialog } from 'primereact/dialog';
import { MultiSelect } from 'primereact/multiselect';
import DownloadCSV from '../../../utils/DownloadCSV';
import { Tag } from 'primereact/tag';
import { Checkbox } from 'primereact/checkbox';
import { SplitButton } from 'primereact/splitbutton';
import './InboxDataTable.css';
import DeleteIcon from '../../../assets/media/Trash.png';
import Flag0Icon from '../../../assets/media/Flag O.png';
import FlagIcon from '../../../assets/media/Flag.png';
import ReadIcon from '../../../assets/media/Read.png';
import UnreadIcon from '../../../assets/media/Unread.png';
import Trash from '../../../assets/icons/Trash';
import SortIcon from '../../../assets/media/Sort.png';
import FilterIcon from '../../../assets/media/Filter.png';

// NavItem Component (Keep this as it might be useful for other navigation)
const NavItem = ({ label, isActive }) => {
    const textColor = isActive ? 'text-red-500' : 'text-slate-700';
    const underlineColor = isActive ? 'bg-red-500' : 'bg-zinc-200';
    const underlineHeight = isActive ? 'min-h-[4px]' : 'min-h-[1px]';

    return (
        <div className={`flex flex-col items-center font-semibold ${textColor} w-[74px]`}>
            <span className="mb-2">{label}</span>
            <div className={`gap-2.5 self-stretch px-2 py-1 ${underlineColor} ${underlineHeight}`}></div>
        </div>
    );
};

const InboxDataTable = ({
    items,
    setItems,
    flaggedItems,
    setFlaggedItems,
    selectedDelete,
    setSelectedDelete,
    fields, // This might be used for column visibility, keep it.
    onEditRow, // Keep this, even if not used in the snippet, it's a common prop
    onRowDelete,
    onRowClick,
    searchDialog,
    setSearchDialog,
    showUpload,
    setShowUpload,
    showFilter, // keep, might be used later
    setShowFilter, // keep, might be used later
    showColumns,
    setShowColumns,
    onClickSaveFilteredfields, //keep it
    selectedFilterFields, //keep it
    setSelectedFilterFields, //keep it
    selectedHideFields, //keep it
    setSelectedHideFields, //keep it
    onClickSaveHiddenfields, //keep it
    loading,
    user, // Keep the user prop, even if not used in the snippet, in case it is needed later
    markAllAsRead, //keep
    markAllAsUnread, //keep
    onDeleteAll, //keep
    onDeleteSelected // keep
}) => {
    const dt = useRef(null);
    const urlParams = useParams();
    const [data, setData] = useState([]); // Not used directly, but good for consistency
    // const [view, setView] = useState("inbox"); // Removed inbox sent
    const [globalFilter, setGlobalFilter] = useState(''); // Keep for potential future use
    const [selectedItems, setSelectedItems] = useState([]);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false); // Keep for consistency
    // const [filteredData, setFilteredData] = useState(items); // Replaced

    useEffect(() => {
        // Directly use 'items' without filtering.
        setData(items); //keep all data in the data
    }, [items]);

    const serviceColors = {
        companies: { background: '#FCE3E5', color: '#C51322' }, // red
        branches: { background: '#FCE3E5', color: '#C51322' },
        departments: { background: '#FCE3E5', color: '#C51322' },
        sections: { background: '#FCE3E5', color: '#C51322' },
        notifications: { background: '#FFF6E0', color: '#E9A100' }, // yellow
        dynaLoader: { background: '#E1F6FF', color: '#017AAD' }, // blue
        common: { background: '#E9E7FD', color: '#6A0DAD' }, // purple
        Messaging: { background: '#FFE5F5', color: '#E91E63' }, // pink
        users: { background: '#E7F8EC', color: '#33AF56' } // green
    };

    const serviceTemplate = (rowData) => {
        const service = rowData.service;
        const serviceStyle = serviceColors[service] || {
            background: '#F5F5F5',
            color: '#000'
        }; // Default colors

        return (
            <Tag
                value={service}
                className="service-tag"
                style={{
                    backgroundColor: serviceStyle.background,
                    color: serviceStyle.color
                }}
            />
        );
    };

    const handleDelete = async () => {
        if (!selectedItems || selectedItems.length === 0) return;

        try {
            const promises = selectedItems.map((item) => client.service('inbox').remove(item._id));
            await Promise.all(promises);
            // Update local state after successful deletion.
            const updatedItems = items.filter((item) => !selectedItems.find((selected) => selected._id === item._id));
            setItems(updatedItems); // Update parent component state
            setSelectedDelete(selectedItems.map((item) => item._id)); // Assuming this is needed
            deselectAllRows();
        } catch (error) {
            console.error('Failed to delete selected records', error);
        }
    };

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

    const toggleFlag = async (rowData) => {
        const updatedFlagStatus = !rowData.flagged;

        try {
            // Update the item in the parent's state
            setItems((prevItems) => prevItems.map((item) => (item._id === rowData._id ? { ...item, flagged: updatedFlagStatus } : item)));

            await client.service('inbox').patch(rowData._id, {
                flagged: updatedFlagStatus
            });

            // Update flaggedItems
            if (updatedFlagStatus) {
                setFlaggedItems((prevFlaggedItems) => [...prevFlaggedItems, rowData._id]);
            } else {
                setFlaggedItems((prevFlaggedItems) => prevFlaggedItems.filter((id) => id !== rowData._id));
            }
        } catch (error) {
            console.error('Error updating flag status:', error);
            // Handle error, potentially revert the change in the UI
        }
    };

    const flagTemplate = (rowData) => {
        const isFlagged = rowData.flagged;
        return (
            <i
                className={`pi ${isFlagged ? 'pi-flag-fill' : 'pi-flag'} flag-icon`}
                style={{ color: isFlagged ? '#d30000' : 'gray', cursor: 'pointer' }}
                onClick={(e) => {
                    e.stopPropagation();
                    toggleFlag(rowData);
                }}
            />
        );
    };

    const dropdownTemplate0 = (rowData, { rowIndex }) => <p>{rowData.from?.name}</p>;

    const dropdownTemplate1 = (rowData, { rowIndex }) => <p>{rowData.toUser?.name}</p>;
    const pTemplate2 = (rowData, { rowIndex }) => (
        // <p dangerouslySetInnerHTML={{ __html: rowData?.content }}></p>
        <p>{rowData.subject}</p>
    );
    const p_booleanTemplate3 = (rowData, { rowIndex }) => <p>{String(rowData.read)}</p>;
    const calendar_12Template4 = (rowData, { rowIndex }) => <p>{new Date(rowData.sent).toLocaleDateString()}</p>;
    const editTemplate = (rowData, { rowIndex }) => <Button onClick={() => onEditRow(rowData, rowIndex)} icon={`pi ${rowData.isEdit ? 'pi-check' : 'pi-pencil'}`} className={`p-button-rounded p-button-text ${rowData.isEdit ? 'p-button-success' : 'p-button-warning'}`} />;
    const deleteTemplate = (rowData) => <Button onClick={() => onRowDelete(rowData._id)} icon="pi pi-trash" className="p-button-danger p-button-text" style={{ fontSize: '0.6rem', padding: '0.2rem 0.4rem' }} />;

    const stripHtmlTags = (html) => {
        let doc = new DOMParser().parseFromString(html, 'text/html');
        return doc.body.textContent || '';
    };

    const subjectTemplate = (rowData) => {
        const fullText = `${rowData.subject} - ${stripHtmlTags(rowData.content)}`;

        const displayText = fullText.length > 70 ? `${fullText.slice(0, 70)}...` : fullText;

        return (
            <div>
                <span>{displayText}</span>
            </div>
        );
    };

    const handleFilterUnread = () => {
        const unreadItems = items.filter((item) => !item.read); // Filter on full items
        setData(unreadItems); // Use setData to update the displayed data
    };

    const handleFilterFlagged = () => {
        const flaggedItems = items.filter((item) => item.flagged); // Filter on full items
        setData(flaggedItems); // Use setData
    };

    const clearFilters = () => {
        setData(items); // Reset to all items.
        setSelectedFilterFields([]);
    };

    const paginatorLeft = <Button type="button" icon="pi pi-upload" text onClick={() => setShowUpload(true)} disabled={!false} />;

    const menuItems = [
        {
            label: 'Mark all as read',
            icon: (
                <img
                    src={ReadIcon}
                    style={{
                        marginRight: '8px',
                        width: '1em',
                        height: '1em',
                        color: 'red'
                    }}
                />
            ),
            command: markAllAsRead
        },
        {
            label: 'Mark all as unread',
            icon: <img src={UnreadIcon} style={{ marginRight: '8px', width: '1em', height: '1em' }} />,
            command: markAllAsUnread
        },
        {
            label: 'Delete',
            icon: <img src={DeleteIcon} style={{ marginRight: '8px', width: '1em', height: '1em' }} />,
            command: onDeleteAll
        }
    ];

    const filterMenuItems = [
        {
            label: 'Filter by',
            template: (item) => (
                <div
                    style={{
                        fontWeight: 'bold',
                        padding: '8px 16px',
                        backgroundColor: '#ffffff',
                        fontSize: '16px'
                    }}
                >
                    {item.label}
                </div>
            ),
            command: () => {}
        },
        { separator: true },
        {
            label: 'Unread',
            icon: <img src={UnreadIcon} style={{ marginRight: '8px', width: '1em', height: '1em' }} />,
            command: handleFilterUnread
        },
        {
            label: 'Flagged',
            icon: <img src={FlagIcon} style={{ marginRight: '8px', width: '1em', height: '1em' }} />,
            command: handleFilterFlagged
        },

        // {
        //  label: "Has attachement / links",
        //  icon: (
        //      <img
        //          src={AttachmentIcon}
        //          style={{ marginRight: "8px", width: "1em", height: "1em" }}
        //      />
        //  ),
        //  command: () => setSearchDialog(true),
        // },
        {
            label: 'Clear Filters',
            template: (item) => (
                <div
                    style={{
                        color: '#d30000',
                        textAlign: 'center',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        fontWeight: 'bold',
                        padding: '8px 16px',
                        fontSize: '13px'
                    }}
                >
                    {item.label}
                </div>
            ),
            command: () => clearFilters()
        }
    ];

    const onMenuSort = (sortOption) => {
        let sortedData;
        switch (sortOption) {
            case 'dateAsc':
                sortedData = _.orderBy(items, ['sent'], ['asc']); // Sort the full 'items'
                break;
            case 'dateDesc':
                sortedData = _.orderBy(items, ['sent'], ['desc']); // Sort the full 'items'
                break;
            case 'subjectAsc':
                sortedData = _.orderBy(items, ['subject'], ['asc']); // Sort the full 'items'
                break;
            case 'subjectDesc':
                sortedData = _.orderBy(items, ['subject'], ['desc']); // Sort the full 'items'
                break;
            default:
                sortedData = items; // Use full 'items'
        }
        setData(sortedData); // Update the displayed data.
    };

    const sortMenuItems = [
        {
            label: 'Sort by',
            template: (item) => (
                <div
                    style={{
                        fontWeight: 'bold',
                        padding: '8px 16px',
                        backgroundColor: '#ffffff',
                        fontSize: '16px'
                    }}
                >
                    {item.label}
                </div>
            ),
            command: () => {}
        },
        { separator: true },
        { label: 'Date Ascending', command: () => onMenuSort('dateAsc') },
        { label: 'Date Descending', command: () => onMenuSort('dateDesc') },
        { label: 'Subject Ascending', command: () => onMenuSort('subjectAsc') },
        { label: 'Subject Descending', command: () => onMenuSort('subjectDesc') },
        {
            label: 'Reset',
            command: clearFilters, // This should reset to the original unfiltered data
            template: (item) => (
                <div
                    style={{
                        color: '#d30000',
                        textAlign: 'center',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        fontWeight: 'bold',
                        padding: '8px 16px',
                        fontSize: '13px'
                    }}
                >
                    {item.label}
                </div>
            )
        }
    ];

    const deselectAllRows = () => {
        setSelectedItems([]);
    };

    return (
        <>
            <div className="mb-5 flex gap-0">
                <h4 className="mb-0 ml-2">
                    <span> Communication / </span>
                    <strong>Mails </strong>
                </h4>
                <SplitButton model={menuItems.filter((m) => !(m.icon === 'pi pi-trash' && items?.length === 0))} dropdownIcon="pi pi-ellipsis-h" buttonClassName="hidden" menuButtonClassName="ml-1 p-button-text" style={{ marginTop: '-10px' }} menuStyle={{ width: '200px' }} />
                <div className="ml-auto flex">
                    <SplitButton
                        model={filterMenuItems.filter((m) => !(m.icon === 'pi pi-trash' && data?.length === 0))}
                        dropdownIcon={<img src={FilterIcon} style={{ marginRight: '4px', width: '1em', height: '1em' }} />}
                        buttonClassName="hidden"
                        menuButtonClassName="ml-1 p-button-text"
                        menuStyle={{ width: '250px' }}
                    ></SplitButton>

                    <SplitButton model={sortMenuItems.filter((m) => !(m.icon === 'pi pi-trash' && data?.length === 0))} dropdownIcon={<img src={SortIcon} style={{ marginRight: '4px', width: '1em', height: '1em' }} />} buttonClassName="hidden" menuButtonClassName="ml-1 p-button-text"></SplitButton>
                </div>
            </div>
            <DataTable
                value={data} // Use 'data' (which contains all items or filtered data)
                selectionMode="multiple"
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
                // paginatorLeft={paginatorLeft}
                alwaysShowPaginator={!urlParams.singleUsersId}
                loading={loading}
                selection={selectedItems}
                onSelectionChange={(e) => setSelectedItems(e.value)}
            >
                <Column selectionMode="multiple" headerStyle={{ width: '3rem' }} body={checkboxTemplate} />

                {/* <Column
                    // header="Flag"
                    body={flagTemplate}
                    style={{ width: "3rem" }}
                /> */}

                <Column field="from" header="From" body={dropdownTemplate0} filter={selectedFilterFields.includes('from')} hidden={selectedHideFields?.includes('from')} style={{ minWidth: '15rem' }} />

                <Column field="toUser" header="To" body={dropdownTemplate1} filter={selectedFilterFields.includes('toUser')} hidden={selectedHideFields?.includes('toUser')} style={{ minWidth: '15rem' }} />

                {/* <Column
                    field="subject"
                    header="Subject"
                    body={pTemplate2}
                    filter={selectedFilterFields.includes("subject")}
                    hidden={selectedHideFields?.includes("subject")}
                    // sortable
                    style={{ minWidth: "16rem" }}
                /> */}

                <Column field="subject" header="Message" body={subjectTemplate} />

                <Column field="service" header="Service" body={serviceTemplate} filter={selectedFilterFields.includes('service')} hidden={selectedHideFields?.includes('service')} style={{ minWidth: '8rem' }} />

                <Column
                    field="sent"
                    header="Sent"
                    body={calendar_12Template4}
                    filter={selectedFilterFields.includes('sent')}
                    // hidden={selectedHideFields?.includes("sent")}
                    // sortable
                    style={{ minWidth: '8rem' }}
                />

                {/* Conditionally render Edit column only for sent messages */}
                {/* No Sent View Column */}

                <Column body={deleteTemplate} style={{ width: '4rem' }} />
            </DataTable>

            {selectedItems.length > 0 ? (
                <div
                    className="card center"
                    style={{
                        width: '18rem',
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
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <Button
                            label="Delete"
                            icon={<img src={DeleteIcon} style={{ marginRight: '4px', width: '1em', height: '1em' }} />}
                            onClick={handleDelete}
                            style={{
                                backgroundColor: 'white',
                                color: '#2A4454',
                                border: '1px solid transparent',
                                transition: 'border-color 0.3s',
                                fontSize: '14px',
                                fontFamily: 'Arial, sans-serif'
                            }}
                        />
                    </div>
                </div>
            ) : null}

            <Dialog header="Search Inbox" visible={searchDialog} onHide={() => setSearchDialog(false)}>
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

export default InboxDataTable;
