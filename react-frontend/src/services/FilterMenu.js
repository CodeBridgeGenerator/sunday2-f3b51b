import React from 'react';
import { SplitButton } from 'primereact/splitbutton';
import { Dialog } from 'primereact/dialog';
import { MultiSelect } from 'primereact/multiselect';
import { Button } from 'primereact/button';
import FilterIcon from '../assets/media/Filter.png'; // adjust path if needed

const FilterMenu = ({ fields, showFilter, setShowFilter, selectedFilterFields, setSelectedFilterFields, onClickSaveFilteredfields, menuButtonClassName = 'ml-1 p-button-text', buttonClassName = 'hidden' }) => {
    const filterMenuItems = [
        {
            label: 'Filter',
            icon: 'pi pi-filter',
            command: () => setShowFilter(true)
        },
        {
            label: 'Clear',
            icon: 'pi pi-filter-slash',
            command: () => setSelectedFilterFields([])
        }
    ];

    return (
        <>
            <SplitButton model={filterMenuItems} dropdownIcon={<img src={FilterIcon} style={{ marginRight: '4px', width: '1em', height: '1em' }} />} buttonClassName={buttonClassName} menuButtonClassName={menuButtonClassName} />

            <Dialog header="Filter Fields" visible={showFilter} onHide={() => setShowFilter(false)} style={{ width: '30rem' }}>
                <div className="card flex flex-column gap-3">
                    <MultiSelect value={selectedFilterFields} onChange={(e) => setSelectedFilterFields(e.value)} options={fields} optionLabel="name" optionValue="value" filter placeholder="Select Fields to Filter" maxSelectedLabels={3} className="w-full" />

                    <Button
                        label="Save"
                        onClick={() => {
                            onClickSaveFilteredfields(selectedFilterFields);
                            setShowFilter(false); // ✅ close dialog
                        }}
                        className="w-full"
                    />
                </div>
            </Dialog>
        </>
    );
};

export default FilterMenu;
