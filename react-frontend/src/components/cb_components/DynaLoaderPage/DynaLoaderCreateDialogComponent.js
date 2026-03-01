import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import client from '../../../services/restClient';
import _, { isNull } from 'lodash';
import axios from 'axios';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { AutoComplete } from 'primereact/autocomplete';
import { InputText } from 'primereact/inputtext';
import { Checkbox } from 'primereact/checkbox';
import { Calendar } from 'primereact/calendar';
import { FileUpload } from 'primereact/fileupload';
import { Divider } from 'primereact/divider';
import * as XLSX from 'xlsx';
import { getCommentSchema, requestOptions, getReferenceData, getAllService, getSchemaValidationErrorsStrings } from '../../../utils';

const DynaLoaderCreateDialogComponent = (props) => {
    const ops = [
        { name: 'insert', key: 'a', description: 'insert only' },
        { name: 'update', key: 'b', description: 'update only' },
        { name: 'upsert', key: 'c', description: 'both' }
    ];

    const [_entity, set_entity] = useState({});
    const [data, setData] = useState({});
    const [fileData, setFileData] = useState([]);
    const [fileName, setFileName] = useState(null);
    const [items, setItems] = useState([]);
    const [allServicesLimited, setAllItems] = useState([]);
    const [_field, set_field] = useState({});
    const [_value, set_value] = useState({});
    const [fields, setFields] = useState([]);
    const [error, setError] = useState({});
    const [loading, setLoading] = useState(false);
    const [disableSave, setDisableSave] = useState(true);
    const [isFile, setIsFile] = useState(false);
    const [isKey, setIsKey] = useState(null);

    const [selectedOp, setSelectedOps] = useState(ops[2]);
    const [selectedToUpdates, setSelectedToUpdates] = useState([]);
    const [exitingRecords, setExitingRecords] = useState({});
    const [currentRecords, setCurrentRecords] = useState({});
    const [showMissingDataDialog, setShowMissingDataDialog] = useState(false);
    const dateFormat = process.env.REACT_APP_DATE;

    useEffect(() => {
        getAllService(setAllItems);
    }, [loading]);

    useEffect(() => {
        setFields([]);
        set_field({});
        set_value({});
        setError({});
        setItems([]);
        set_entity({});
        setShowMissingDataDialog(false);
        setDisableSave(true);
        setSelectedOps(ops[2]);
        setSelectedToUpdates([]);
        setCurrentRecords({});
        setExitingRecords({});
        setIsKey(null);
        setIsFile(false);
    }, [props.show]);

    const validateCollection = (collection) => {
        let ret = true;
        const error = {};
        if (Array.isArray(collection)) {
            collection.forEach(async (toField) => {
                if (toField?.type === 'ObjectId') {
                    if (!toField?.comment) {
                        ret = false;
                        error[toField.field] = `Error: In field ${toField.field}, comment not found.`;
                        props.alert({
                            message: error[toField.field],
                            type: 'error',
                            title: 'Solution, run the code gen again.'
                        });
                    } else {
                        const schema = getCommentSchema(toField.comment);
                        if (_.isEmpty(schema.identifierFieldName)) {
                            ret = false;
                            error[toField.field] = `Error: In ref collection ${schema.refServiceName}, ${toField.field} missing select fields. ${schema.identifierFieldName}`;
                            props.alert({
                                message: error[toField.field],
                                type: 'error',
                                title: 'Solution, run the code gen again.'
                            });
                        } else {
                            // console.log(schema.identifierFieldName);
                            getReferenceData(schema).then((res) => {
                                // console.log("res", res);
                                const filtered = _.map(res, schema.identifierFieldName[0]?.trim());
                                // console.log("existing", filtered);
                                setExitingRecords((prev) => {
                                    return {
                                        ...prev,
                                        [toField.field]: filtered
                                    };
                                });
                            });
                        }
                    }
                }
            });
        }

        if (!ret) {
            setError(error);
            setDisableSave(true);
        }
        return ret;
    };

    const validate = () => {
        let ret = true;
        const error = {};

        if (_.isEmpty(_entity?.from)) {
            error['from'] = `Source service field is required`;
            ret = false;
        }

        if (_.isEmpty(_entity?.to2)) {
            error['to2'] = `Destination service field is required`;
            ret = false;
        }

        if (!ret) setError(error);
        return ret;
    };

    const toUpdate = (e) => {
        let _selectedToUpdate = [...selectedToUpdates];

        if (e.checked) {
            _selectedToUpdate.push(e.value);
        } else _selectedToUpdate = _selectedToUpdate.filter((s) => s.field !== e.value.field);

        // console.log(
        //   "selectedOp",
        //   selectedOp,
        //   "toUpdate",
        //   _selectedToUpdate,
        //   "isKey",
        //   isKey,
        // );
        if ((selectedOp.name === 'update' || selectedOp.name === 'upsert') && !_.isEmpty(_selectedToUpdate) && !_.isEmpty(isKey)) {
            setDisableSave(false);
        } else if (selectedOp.name === 'insert' && !_.isEmpty(isKey)) {
            setDisableSave(false);
        }
        setSelectedToUpdates(_selectedToUpdate);
    };

    const onSaveFields = async (result) => {
        if (_.isEmpty(_field)) return;
        if (_.isEmpty(data?.to2)) return;
        const create = [];

        Object.entries(_field).forEach(async (k) => {
            const toField = _.find(data?.to2, { field: k[0] });
            console.log(k, toField);
            if (k[1]?.value && k[0] !== null && toField?.comment) {
                let schema = {};
                if (toField.type === 'ObjectId') {
                    schema = getCommentSchema(toField.comment);
                    // console.log(schema);
                    // console.log(toField);
                }
                const _data = {
                    dynaLoader: result?._id,
                    from: k[1]?.value,
                    fromType: _.startCase(k[1]?.type),
                    fromService: _entity?.from,
                    to2: k[0],
                    toType: toField.type,
                    toService: _entity?.to2,
                    toRefService: schema?.refServiceName,
                    toRefRelationship: schema?.relationshipType,
                    toRefDatabaseName: toField?.ref,
                    identifierFieldName: Array.isArray(schema?.identifierFieldName) ? schema?.identifierFieldName : schema?.identifierFieldName ? [schema?.identifierFieldName] : ['name'],
                    duplicates: _entity?.duplicates || false,
                    createdBy: props.user._id,
                    updatedBy: props.user._id
                };
                create.push(_data);
            } else {
                if (k[0] === null) {
                    let _defValue = k[1]?.value;
                    if (toField.type === 'Boolean') _defValue = String(k[1]?.value);
                    const _data = {
                        dynaLoader: result?._id,
                        from: k[1]?.value,
                        fromType: _.startCase(k[1]?.type),
                        fromService: _entity?.from,
                        to2: k[0],
                        toType: toField.type,
                        toService: _entity?.to2,
                        defaultValue: _defValue,
                        duplicates: _entity?.duplicates || false,
                        createdBy: props.user._id,
                        updatedBy: props.user._id
                    };
                    console.log(_data);
                    create.push(_data);
                }
            }
        });

        try {
            const result = await client.service('dynaFields').create(create);
            // console.debug(result);
            props.onHide();
            props.alert({
                type: 'success',
                title: 'Create info',
                message: 'Info DynaFields created successfully'
            });
        } catch (error) {
            setLoading(false);
            setError(getSchemaValidationErrorsStrings(error) || 'Failed to create');
            props.alert({
                type: 'error',
                title: 'Create',
                message: 'Failed to create in DynaFields'
            });
        }
    };

    const onSave = async () => {
        if (!validate()) return;

        const fileUpload = await client.service('fileUploadedImportStore').create({
            filename: fileName,
            data: fileData,
            description: '',
            createdBy: props.user._id,
            updatedBy: props.user._id
        });

        // console.debug(fileUpload);

        if (!fileUpload._id) {
            props.alert({
                type: 'warn',
                title: 'File Uploder',
                message: 'File Id not found'
            });
            return;
        }
        if (_.isEmpty(isKey)) {
            props.alert({
                type: 'warn',
                title: 'Key to update is not defined',
                message: 'Select key field to update'
            });
            return;
        }
        if (selectedOp.key === 'c' || selectedOp.key === 'b') {
            if (_.isEmpty(selectedToUpdates)) {
                props.alert({
                    type: 'warn',
                    title: 'Fields to update is empty',
                    message: 'Select fields to update'
                });
                return;
            }
        }

        let _data = {
            from: _entity?.from,
            to2: _entity?.to2,
            fileUploadedId: fileUpload._id,
            isFile: isFile,
            isKey: isKey,
            upsert: selectedOp.name,
            toUpdate: _.map(selectedToUpdates, 'field'),
            name: `${_entity?.from} => ${_entity?.to2}`,
            createdBy: props.user._id,
            updatedBy: props.user._id
        };

        console.log(_data);

        setLoading(true);

        try {
            const result = await client.service('dynaLoader').create(_data);
            // console.debug(result);
            props.onHide();
            props.onCreateResult(result);
            onSaveFields(result);
        } catch (error) {
            console.debug('error', error);
            setLoading(false);
            setError(getSchemaValidationErrorsStrings(error) || 'Failed to create');
            props.alert({
                type: 'error',
                title: 'Create',
                message: 'Failed to create in DynaLoader'
            });
        } finally {
            setLoading(false);
        }
    };

    const search = (event, label) => {
        setTimeout(() => {
            let _filtered = allServicesLimited;

            if (!event.query.trim().length) {
                _filtered = allServicesLimited;
            } else {
                _filtered = allServicesLimited.filter((i) => {
                    return i.toLowerCase().startsWith(event.query.toLowerCase());
                });
            }
            if (label === 'to2' && _entity?.from) {
                _filtered = _filtered.filter((s) => s.value !== _entity?.from);
            }
            setItems(_filtered);
        }, 250);
    };

    const searchFields = (event) => {
        setTimeout(() => {
            const fromSchema = isFile ? Object.keys(fileData[0]) : data?.from;
            // console.log(isFile, fromSchema);
            if (!Array.isArray(fromSchema)) return null;

            const allFields = fromSchema?.map((f) => {
                const isFieldTypeSame = fileData.slice(1).every((row) => typeof row[f] === typeof fileData[0][f] || !isNaN(Date.parse(fileData[0][f])));
                // console.log(
                //   f,
                //   isFieldTypeSame,
                //   fileData[0][f],
                //   Date.parse(fileData[0][f]),
                //   typeof fileData[0][f]
                // );

                let theType = isFieldTypeSame ? _.startCase(typeof fileData[0][f]) : 'String';
                theType = !isNaN(Date.parse(fileData[0][f])) ? 'Date' : theType;
                return {
                    name: f.field ?? f,
                    value: f.field ?? f,
                    type: theType
                };
            });

            let _filtered;
            if (!event?.query?.trim()?.length) {
                _filtered = allFields;
            } else {
                _filtered = allFields?.filter((i) => {
                    return i?.name?.toLowerCase()?.startsWith(event?.query?.toLowerCase());
                });
            }

            if (_filtered?.length === 0) {
                _filtered = allFields?.filter((i) => {
                    return i?.name?.toLowerCase()?.startsWith(event?.query?.toLowerCase());
                });
            }

            setFields(_filtered || [event?.query]);
        }, 250);
    };

    const setDataByKey = async (key, val) => {
        if (!allServicesLimited.includes(val)) return null;
        let fieldSchema = await axios(requestOptions(`${val}Schema`));
        if (!Array.isArray(fieldSchema?.data)) return null;

        const excludedFields = ['_id', 'createdBy', 'updatedBy', 'createdAt', 'updatedAt'];

        fieldSchema = fieldSchema.data.filter((f) => !excludedFields.includes(f.field));
        // console.log(key, fieldSchema);
        if (key === 'to2' && !validateCollection(fieldSchema)) return null;
        if (key === 'to2' && isFile) {
            const fromSchema = Object.keys(fileData[0]);
            // console.log(key, fromSchema);
            let new_field = {};
            if (Array.isArray(fromSchema)) {
                fromSchema.forEach((field) => {
                    const isAllFieldTypeSame = fileData.slice(1).every((row) => typeof row[field] === typeof fileData[0][field]);

                    if (_.find(fieldSchema, { field: field })) {
                        new_field = {
                            ...new_field,
                            [field]: {
                                value: field,
                                name: field,
                                type: isAllFieldTypeSame ? _.startCase(typeof fileData[0][field]) : 'String'
                            }
                        };
                    }
                });
                set_field(new_field);
            }
        }

        setData((prev) => {
            if (prev && typeof prev === 'object') return { ...prev, [key]: fieldSchema };
            else return { [key]: fieldSchema };
        });
        let new_entity = { ..._entity, [key]: val };
        set_entity(new_entity);
        setError({});
    };

    const checkIfAllfields = (missingRecords, isKey) => {
        const obj = Object.entries(_field);
        // console.log("from", obj?.length, "to2", data["to2"]?.length);
        // console.log("_field", _field);
        if (obj?.length !== data['to2']?.length) return null;

        let showMissing = false;
        Object.entries(missingRecords).forEach((k) => {
            if (k[1].length > 0) {
                showMissing = true;
            }
        });
        // console.log("showMissing", showMissing, "isKey", isKey);
        if (showMissing) {
            setShowMissingDataDialog(true);
        } else if (isNull(isKey)) {
            props.alert({
                type: 'warn',
                title: 'Key field required',
                message: 'Set the key field'
            });
        } else {
            setDisableSave(false);
        }
    };

    const setValBySourceField = (key, val) => {
        if (!_.find(Object.keys(_field), { key: val })) {
            set_field({ ..._field, [key]: val });
        }
        setError({});
        const to2FieldSchema = _.find(data.to2, { field: key });
        const getFieldComments = getCommentSchema(to2FieldSchema.comment);
        if (!_.isEmpty(getFieldComments.refServiceName) && val.value) {
            // console.log(key, val.value, getFieldComments.refServiceName);
            const filtered = _.map(_.uniqBy(fileData[0], val.value), val.value);
            // console.log("from new data",filtered);
            // console.log("existing data",exitingRecords[key]);
            const missing = filtered.filter((v) => !exitingRecords[key].includes(v));
            // console.log("missing",missing);
            const missingRecords = {
                ...currentRecords,
                [key]: missing
            };
            setCurrentRecords(missingRecords);
            checkIfAllfields(missingRecords, null);
        }
    };

    const setValForKeyField = (key, val) => {
        let new_entity = { ..._value, [key]: val };
        set_value(new_entity);
        setError({});
    };

    const sourceField = (fieldName) => {
        return (
            <AutoComplete
                size="20"
                id="from"
                key={fieldName}
                className="p-inputtext-sm"
                field="name"
                value={_field[fieldName]}
                suggestions={fields}
                placeholder={`field for ${fieldName}`}
                content="content"
                completeMethod={searchFields}
                onChange={(e) => setValBySourceField(fieldName, e.value)}
                dropdown
            />
        );
    };

    const renderDynaLoaderTable = () => {
        if (_.isEmpty(_entity?.from) || !allServicesLimited.includes(_entity?.from)) {
            if (_.isEmpty(fileData)) {
                return null;
            }
        }

        if (_.isEmpty(_entity?.to2) || !allServicesLimited.includes(_entity?.to2)) return null;

        const fixedValueTemplate = (rowData, { rowIndex }) => {
            switch (rowData.type) {
                case 'String':
                    return <InputText value={_value[rowData.field]} onChange={(e) => setValForKeyField(rowData?.field, e.target.value)} disabled={_entity?.isKey === rowData.field} />;
                case 'Boolean':
                    return (
                        <>
                            <label>false</label>
                            <input
                                type="radio"
                                className="mt-3"
                                id={rowData?.field}
                                name={rowData?.field}
                                onChange={() => {
                                    setValForKeyField(rowData?.field, false);
                                    set_field({ ...new_field, [rowData?.field]: false });
                                }}
                                checked={_value[rowData?.field] ? _value[rowData?.field] === false : true}
                            />
                            <label>true</label>
                            <input
                                type="radio"
                                className="mt-3"
                                id={rowData?.field}
                                name={rowData?.field}
                                onChange={() => {
                                    setValForKeyField(rowData?.field, true);
                                    set_field({ ...new_field, [rowData?.field]: true });
                                }}
                                checked={_value[rowData?.field]}
                            />
                        </>
                    );
                case 'Number':
                    return <p>Reject it</p>;
                case 'Date':
                    return <Calendar showIcon dateFormat="dd/mm/yy" value={Date.parse(_value[rowData.field]) || new Date()} onChange={(e) => setValForKeyField(rowData?.field, e.value)} />;
                case 'ObjectId':
                    return <label>{`${getCommentSchema(rowData?.comment)?.refServiceName} - ${getCommentSchema(rowData?.comment)?.identifierFieldName?.join(',')} `}</label>;
                default:
                    return null;
            }
        };

        return (
            <DataTable key="dataTable" value={data['to2']} className="w-full">
                <Column header="#" body={(rowData, { rowIndex }) => rowIndex + 1} style={{ minWidth: '2rem' }} />
                <Column header={`${_entity?.from}`} body={(rowData) => sourceField(rowData?.field)} />
                <Column field="Type" header="Type" body={(rowData) => _field[rowData?.field]?.type} style={{ minWidth: '4rem' }} />

                <Column
                    header="&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;mapping"
                    body={
                        <div className="flex align-items-center justify-content-center">
                            <i className="pi pi-arrows-h" style={{ fontSize: '2rem' }}></i>{' '}
                        </div>
                    }
                    style={{ minWidth: '4rem' }}
                />
                <Column
                    field="fieldName"
                    header="isKey"
                    body={(rowData, rowIndex) => (
                        <input
                            type="radio"
                            id={`radio-${rowIndex}`}
                            name="isKey"
                            onChange={() => {
                                setIsKey(rowData?.field);
                                checkIfAllfields(currentRecords, rowData?.field);
                            }}
                            checked={isKey === rowData?.field}
                        />
                    )}
                />
                <Column field="fieldName" header="toUpdate" body={(rowData, rowIndex) => <Checkbox inputId={rowIndex} name="toUpdate" value={rowData} onChange={toUpdate} checked={selectedToUpdates.some((item) => item.field === rowData.field)} disabled={rowData.field === isKey} />} />

                <Column field="fieldName" header={`${_entity?.to2}`} body={(rowData) => rowData?.field} />
                <Column field="Type" header="Type" body={(rowData) => rowData?.type} style={{ minWidth: '8rem' }} />
                <Column field="Type" header="default value" body={fixedValueTemplate} style={{ minWidth: '8rem' }} />

                {/* <Column
          field="Type"
          header="Type"
          body={(rowData) => _field[rowData.fieldName]?.type}
          style={{ minWidth: "8rem" }}
        /> */}
            </DataTable>
        );
    };

    const customBase64Uploader = async (event) => {
        try {
            const file = event.files[0];
            if (!file) throw new Error('No file selected');
            let new_entity = { ..._entity, from: file.name };
            const reader = new FileReader();
            const blob = await fetch(file.objectURL).then((r) => r.blob());
            reader.readAsDataURL(blob);
            reader.onloadend = async () => {
                const base64data = reader.result.split(',')[1];
                const wb = XLSX.read(base64data, {
                    type: 'base64',
                    dateNF: dateFormat
                });
                let data = [];

                for (let i in wb.SheetNames) {
                    const wsname = wb.SheetNames[i];
                    const ws = wb.Sheets[wsname];
                    const sheetData = XLSX.utils.sheet_to_json(ws, { raw: false });
                    if (!_.isEmpty(sheetData)) {
                        if (!_.isEmpty(data)) {
                            data.push(sheetData);
                        } else data = sheetData;
                    }
                }
                set_entity(new_entity);
                setIsFile(true);
                setFileName(file.name);
                setFileData(data);
            };
        } catch (error) {
            props.alert({
                severity: 'error',
                summary: 'Error',
                detail: error.message || 'An error occurred during file upload'
            });

            // Delay the closing of the dialog box in case of an error
            setTimeout(() => {
                if (onUploadComplete) {
                    onUploadComplete();
                }
            }, 2000); // Adjust the delay time as needed
        }
    };

    const renderFooter = () => (
        <div className="flex justify-content-end">
            <Button label="save" className="p-button-text no-focus-effect" onClick={onSave} loading={loading} disabled={disableSave} />
            <Button label="close" className="p-button-text no-focus-effect p-button-secondary" onClick={props.onHide} />
        </div>
    );

    const renderMissingValues = () => {
        let showMissing = false;
        const missingFields = () =>
            Object.entries(currentRecords).map((k, index) => (
                <div className="mt-2" key={index}>
                    <label>service name:</label>
                    <h3>{k[0]}</h3>
                    <label>missing data:</label>
                    {k[1].map((v, i) => {
                        showMissing = true;
                        return (
                            <ul key={i}>
                                <li key={i * 10}>
                                    <h5 key={i}>{v}</h5>
                                </li>
                            </ul>
                        );
                    })}
                    <label>create the missing data to continue.</label>
                </div>
            ));

        return (
            <Dialog header="DynaLoader missing data" visible={showMissingDataDialog} onHide={() => setShowMissingDataDialog(false)}>
                <div className="grid no-gutter p-fluid overflow-y-auto" style={{ maxWidth: '40vw' }} role="dynaLoader-missing-dialog-component">
                    {missingFields()}
                </div>
            </Dialog>
        );
    };

    return (
        <Dialog header="DynaLoader for dynamic data transfer" visible={props.show} closable={false} onHide={props.onHide} modal style={{ width: '90vw' }} className="min-w-max" footer={renderFooter()} resizable={false}>
            <div className="grid no-gutter p-fluid overflow-y-auto" style={{ maxWidth: '80vw' }} role="dynaLoader-create-dialog-component">
                <div className="flex align-items-center justify-content-center col-12 md:col-6">
                    <span className="align-items-center">
                        <label htmlFor="from">Source Data:</label>
                        <FileUpload
                            id="uploadOfPictureBeforeRepair"
                            mode="basic"
                            name="uploadOfPictureBeforeRepair"
                            accept=".csv,.xls,.json,application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                            customUpload
                            onSelect={customBase64Uploader}
                            chooseLabel="Upload a file"
                            className="mt-2"
                        />
                        <Divider>or</Divider>
                        <AutoComplete id="from" className="w-full mb-3 p-inputtext-sm" value={_entity?.from} suggestions={items} placeholder="type service name here" completeMethod={search} onChange={(e) => setDataByKey('from', e.value)} dropdown disabled={true} />
                        <small className="p-error">
                            {!_.isEmpty(error['from']) ? (
                                <p className="m-0" key="error-from">
                                    {error['from']}
                                </p>
                            ) : null}
                        </small>
                    </span>
                </div>
                <div className="flex align-items-center justify-content-center col-12 md:col-6">
                    <span className="align-items-center">
                        <label htmlFor="to2">Destination Collection:</label>
                        <AutoComplete id="to2" className="w-full mb-3 p-inputtext-sm" value={_entity?.to2} suggestions={items} placeholder="type service name here" completeMethod={(e) => search(e, 'to2')} onChange={(e) => setDataByKey('to2', e.value)} dropdown />
                    </span>
                    <small className="p-error">
                        {!_.isEmpty(error['to2']) ? (
                            <p className="m-0" key="error-from">
                                {error['to2']}
                            </p>
                        ) : null}
                    </small>
                    <div className="card flex justify-content-center ml-3">
                        <div className="flex flex-column gap-3">
                            {ops.map((op) => (
                                <div key={`upsert-${op.key}`} className="flex align-items-center">
                                    <input type="radio" id={op.key} name="selectedOp" onChange={() => setSelectedOps(op)} checked={selectedOp.key === op.key} />
                                    <label htmlFor={op.key} className="ml-2">
                                        {op.name}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="flex align-items-center justify-content-center col-12 md:col-12">{renderDynaLoaderTable()}</div>
                <div className="flex align-items-center justify-content-center col-12 md:col-12">{renderMissingValues()}</div>
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

export default connect(mapState, mapDispatch)(DynaLoaderCreateDialogComponent);
