import React, { useRef, useState, useEffect } from 'react';
import { Toast } from 'primereact/toast';
import { FileUpload } from 'primereact/fileupload';
import { ProgressBar } from 'primereact/progressbar';
import { Button } from 'primereact/button';
import { Tooltip } from 'primereact/tooltip';
import { Tag } from 'primereact/tag';
import excelLogo from '../assets/media/excelLogo.svg';
import client from './restClient';
import * as XLSX from 'xlsx';
import axios from 'axios';
import { requestOptions } from '../utils';
import _ from 'lodash';
import { Buffer } from 'buffer';

export default function UploadService({ serviceName, user, onUploadComplete, disabled }) {
    const fileUploadRef = useRef(null);
    const [totalSize, setTotalSize] = useState(0);
    const [fileDetails, setFileDetails] = useState({});
    const [serviceFields, setServiceFields] = useState([]);
    const [requiredFields, setRequiredFields] = useState([]);
    const toast = useRef(null);
    const dateFormat = process.env.REACT_APP_DATE;

    const fetchServiceFields = async (serviceName) => {
        try {
            const exclude = ['_id', 'createdBy', 'updatedBy', 'createdAt', 'updatedAt'];
            const serviceSchema = await axios(requestOptions(`${serviceName}Schema`, {}));
            const schema = serviceSchema.data.filter((field) => !exclude.includes(field.field));
            const req = schema.filter((field) => field.required === true);

            setServiceFields(schema);
            setRequiredFields(req);
        } catch (error) {
            console.error('Failed to fetch service schema:', error);
            toast.current.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to fetch service schema'
            });
        }
    };

    useEffect(() => {
        fetchServiceFields(serviceName);
    }, [serviceName]);

    const onTemplateSelect = (e) => {
        try {
            let _totalSize = totalSize;
            let files = e.files;

            Object.keys(files).forEach(async (key) => {
                _totalSize += files[key].size || 0;
                await fileChecker(files[key]);
            });
            setTotalSize(_totalSize);
        } catch (error) {
            toast.current.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to calculate total size'
            });
        }
    };

    const onTemplateUpload = (e) => {
        try {
            let _totalSize = 0;

            e.files.forEach((file) => {
                _totalSize += file.size || 0;
            });

            setTotalSize(_totalSize);
            toast.current.show({
                severity: 'info',
                summary: 'Success',
                detail: 'File Uploaded'
            });
        } catch (error) {
            toast.current.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to upload file'
            });
        }
    };

    const onTemplateRemove = (file, callback) => {
        try {
            setTotalSize(totalSize - file.size);
            setFileDetails((prev) => {
                const newDetails = { ...prev };
                delete newDetails[file.name];
                return newDetails;
            });
            callback();
        } catch (error) {
            toast.current.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to remove file'
            });
        }
    };

    const onTemplateClear = () => {
        try {
            setTotalSize(0);
            setFileDetails({});
        } catch (error) {
            toast.current.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to clear files'
            });
        }
    };

    const headerTemplate = (options) => {
        const { className, chooseButton, uploadButton, cancelButton } = options;
        const value = totalSize / 10000;
        const formattedValue = fileUploadRef && fileUploadRef.current ? fileUploadRef.current.formatSize(totalSize) : '0 B';

        return (
            <div
                className={className}
                style={{
                    backgroundColor: 'transparent',
                    display: 'flex',
                    alignItems: 'center'
                }}
            >
                {chooseButton}
                {uploadButton}
                {cancelButton}
                <div className="flex align-items-center gap-3 ml-auto">
                    <span>{formattedValue} / 10 MB</span>
                    <ProgressBar value={value} showValue={false} style={{ width: '10rem', height: '12px' }}></ProgressBar>
                </div>
            </div>
        );
    };

    const itemTemplate = (file, props) => {
        return (
            <div className="flex align-items-center flex-wrap">
                <div className="flex align-items-center" style={{ width: '40%' }}>
                    <img alt="Excel Icon" src={excelLogo} width={50} />
                    <span className="flex flex-column text-left ml-3">
                        {file.name}
                        <small>{new Date().toLocaleDateString()}</small>
                    </span>
                </div>

                <div className="ml-auto flex align-items-center">
                    <Tag value={fileDetails[file.name]?.successCount || 0} severity="success" className="px-3 py-2 mr-3" />
                    <Tag value={fileDetails[file.name]?.failRecords?.length || 0} severity="danger" className="px-3 py-2 mr-3" />
                    <Tag value={props.formatSize} severity="warning" className="px-3 py-2 mr-3" />
                    <Button type="button" icon="pi pi-times" className="p-button-outlined p-button-rounded p-button-danger" onClick={() => onTemplateRemove(file, props.onRemove)} />
                </div>
            </div>
        );
    };

    const emptyTemplate = () => {
        return (
            <div className="flex align-items-center flex-column">
                <i
                    className="pi pi-file-excel mt-3 p-5"
                    style={{
                        fontSize: '5em',
                        borderRadius: '50%',
                        backgroundColor: 'var(--surface-b)',
                        color: 'var(--surface-d)'
                    }}
                ></i>
                <span style={{ fontSize: '1.2em', color: 'var(--text-color-secondary)' }} className="my-5">
                    Drag and Drop Excel File Here
                </span>
            </div>
        );
    };

    const validateFieldType = (fieldName, value, schemaType, isArray = false) => {
        if (value === null || value === undefined || value === '') {
            return { isValid: true }; // Empty values are checked by requiredFields
        }

        if (isArray) {
            if (!Array.isArray(value)) {
                return { isValid: false, expectedType: `Array of ${schemaType}` };
            }
            for (let item of value) {
                const result = validateFieldType(fieldName, item, schemaType);
                if (!result.isValid) {
                    return result;
                }
            }
            return { isValid: true };
        }

        switch (schemaType) {
            case 'String':
                return typeof value === 'string' ? { isValid: true } : { isValid: false, expectedType: 'String' };
            case 'Number':
                return !isNaN(value) && typeof value === 'number' ? { isValid: true } : { isValid: false, expectedType: 'Number' };
            case 'Boolean':
                return typeof value === 'boolean' || value === 'true' || value === 'false' ? { isValid: true } : { isValid: false, expectedType: 'Boolean' };
            case 'Date':
                return !isNaN(Date.parse(value)) ? { isValid: true } : { isValid: false, expectedType: 'Date' };
            case 'ObjectId':
                return typeof value === 'string' && /^[0-9a-fA-F]{24}$/.test(value) ? { isValid: true } : { isValid: false, expectedType: 'ObjectId (24-character hex string)' };
            case 'Mixed':
                return { isValid: true }; // Mixed allows any type
            default:
                return { isValid: false, expectedType: schemaType || 'Unknown' };
        }
    };

    const generateErrorCSV = (failRecords, fileName) => {
        // Get all unique column names from the failed records, excluding 'remarks'
        const columns = Array.from(new Set(failRecords.flatMap((record) => Object.keys(record.row)))).filter((col) => col !== 'remarks');

        // Add 'remarks' as the last column
        const orderedColumns = [...columns, 'remarks'];

        // Map failRecords to ensure columns are in the correct order
        const orderedData = failRecords.map((record) => {
            const row = {};
            orderedColumns.forEach((col) => {
                row[col] = col === 'remarks' ? record.remarks || record.errorMessage || '' : record.row[col] || '';
            });
            return row;
        });

        const worksheet = XLSX.utils.json_to_sheet(orderedData, { header: orderedColumns });
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
        const csvBuffer = XLSX.write(workbook, { bookType: 'csv', type: 'array' });
        return { csvBuffer, orderedData };
    };

    const downloadErrorCSV = (failRecords, fileName) => {
        try {
            const { csvBuffer } = generateErrorCSV(failRecords, fileName);
            const csvData = new Blob([csvBuffer], { type: 'text/csv;charset=utf-8;' });
            const csvURL = URL.createObjectURL(csvData);
            const link = document.createElement('a');
            link.href = csvURL;
            link.download = `error_${fileName}.csv`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            toast.current.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to generate error CSV'
            });
        }
    };

    const fileChecker = async (file) => {
        try {
            if (!file) throw new Error('No file selected');

            const reader = new FileReader();
            const blob = await fetch(file.objectURL).then((r) => r.blob());
            reader.readAsDataURL(blob);

            reader.onloadend = async () => {
                const base64data = reader.result.split(',')[1];
                const wb = XLSX.read(base64data, {
                    type: 'base64',
                    dateNF: dateFormat
                });
                const failRecords = [];
                let successCount = 0;
                let data = [];

                for (let i in wb.SheetNames) {
                    const wsname = wb.SheetNames[i];
                    const ws = wb.Sheets[wsname];
                    let sheetData = XLSX.utils.sheet_to_json(ws);

                    sheetData.forEach((row, index) => {
                        let remarks = [];

                        // Check for missing fields
                        const missingFields = serviceFields.filter((field) => !(field.field in row)).map((field) => field.field);
                        if (missingFields.length > 0) {
                            remarks.push(`Missing fields: ${missingFields.join(', ')}`);
                        }

                        // Check for empty required fields
                        const missingRequiredFields = requiredFields.filter((field) => !row[field.field]).map((field) => field.field);
                        if (missingRequiredFields.length > 0) {
                            remarks.push(`Required fields empty: ${missingRequiredFields.join(', ')}`);
                        }

                        // Validate field types
                        serviceFields.forEach((field) => {
                            if (field.field in row && row[field.field] !== null && row[field.field] !== undefined) {
                                const schemaType = Array.isArray(field.type) ? field.type[0] : field.type;
                                const isArray = Array.isArray(field.type);
                                const validation = validateFieldType(field.field, row[field.field], schemaType, isArray);
                                if (!validation.isValid) {
                                    remarks.push(`Field '${field.field}' must be a ${validation.expectedType}`);
                                }
                            }
                        });

                        if (remarks.length > 0) {
                            failRecords.push({
                                id: index,
                                row,
                                remarks: remarks.join('; ')
                            });
                        } else {
                            successCount++;
                        }
                    });

                    if (!_.isEmpty(sheetData)) {
                        if (_.isEmpty(data)) {
                            data = sheetData.map((item) => ({
                                ...item,
                                createdBy: user?._id,
                                updatedBy: user?._id
                            }));
                        } else {
                            data.push(
                                sheetData.map((item) => ({
                                    ...item,
                                    createdBy: user?._id,
                                    updatedBy: user?._id
                                }))
                            );
                        }
                    }
                }

                const details = {};
                details[file.name] = {
                    successCount,
                    failRecords,
                    failedCount: failRecords.length
                };
                setFileDetails(details);

                if (failRecords.length > 0) {
                    try {
                        // Generate error CSV
                        const { csvBuffer } = generateErrorCSV(failRecords, file.name);
                        const csvBase64 = Buffer.from(csvBuffer).toString('base64');

                        // Log attachment details for debugging
                        console.debug('Generating error CSV attachment for email:', {
                            filename: `error_${file.name.split('.')[0]}.csv`,
                            contentLength: csvBase64.length,
                            contentType: 'text/csv'
                        });

                        // Create mailQues record
                        const mailData = {
                            name: 'onUploadFailure',
                            type: 'uploadFailure',
                            from: 'no-reply@EXAMPLE.com.my',
                            recipients: [user.email],
                            status: true,
                            data: {
                                name: user.name || 'User',
                                serviceName,
                                failedCount: failRecords.length,
                                projectLabel: process.env.REACT_APP_PROJECT_LABEL || process.env.REACT_APP_PROJECT_NAME
                            },
                            subject: `CSV Upload Failed for ${serviceName}`,
                            templateId: 'onUploadFailure',
                            attachments: [
                                {
                                    filename: `error_${file.name.split('.')[0]}.csv`,
                                    content: csvBase64,
                                    contentType: 'text/csv'
                                }
                            ]
                        };

                        console.debug('Creating mailQues record:', mailData);

                        await client.service('mailQues').create(mailData);

                        toast.current.show({
                            severity: 'error',
                            summary: `Validation Failed`,
                            detail: `${failRecords.length} records have incorrect field types or missing fields. An email with the error CSV has been sent to ${user.email}. Please correct the issues and re-upload.`
                        });
                        // downloadErrorCSV(failRecords, file.name);
                    } catch (error) {
                        console.error('Failed to queue email:', error);
                        toast.current.show({
                            severity: 'error',
                            summary: 'Error',
                            detail: `Failed to send email with error CSV: ${error.message}`
                        });
                        downloadErrorCSV(failRecords, file.name);
                    }
                }
            };
        } catch (error) {
            toast.current.show({
                severity: 'error',
                summary: 'Error',
                detail: error.message || 'An error occurred during file checking'
            });
        }
    };

    const customBase64Uploader = async (event) => {
        const file = event.files[0];
        if (!file) throw new Error('No file selected');
        const totalFailures = fileDetails[file.name]?.failRecords?.length || 0;
        if (totalFailures > 0) {
            toast.current.show({
                severity: 'error',
                summary: `Total ${totalFailures} records failed`,
                detail: 'Please check your email for the error CSV, correct the failures, and re-upload.'
            });
            return;
        }

        const reader = new FileReader();
        const blob = await fetch(file.objectURL).then((r) => r.blob());
        reader.readAsDataURL(blob);

        reader.onloadend = async () => {
            const base64data = reader.result.split(',')[1];
            const wb = XLSX.read(base64data, { type: 'base64', dateNF: dateFormat });
            let data = [];

            for (let i in wb.SheetNames) {
                const wsname = wb.SheetNames[i];
                const ws = wb.Sheets[wsname];
                const sheetData = XLSX.utils.sheet_to_json(ws);

                if (!_.isEmpty(sheetData)) {
                    if (_.isEmpty(data)) {
                        data = sheetData.map((item) => ({
                            ...item,
                            createdBy: user?._id,
                            updatedBy: user?._id
                        }));
                    } else {
                        data.push(
                            sheetData.map((item) => ({
                                ...item,
                                createdBy: user?._id,
                                updatedBy: user?._id
                            }))
                        );
                    }
                }
            }

            try {
                const currentData = await client.service(serviceName).find({});
                if (currentData.total > 0) {
                    data.forEach((row, index) => {
                        const rowIndexData = _.findIndex(currentData.data, { ...row, createdBy: user?._id, updatedBy: user?._id }, 0);
                        if (rowIndexData >= 0) data.splice(rowIndexData, 1);
                    });
                }
                const results = await client.service(serviceName).create(data);
                toast.current.show({
                    severity: 'info',
                    summary: `Upload Summary`,
                    detail: `Upload succeeded: ${results.length} records`
                });
            } catch (error) {
                toast.current.show({
                    severity: 'error',
                    summary: `Failed records - ${error.message}`,
                    detail: 'A confirmation email has been sent with the failed records.'
                });
            } finally {
                setTimeout(() => onUploadComplete(), 3000);
            }
        };
    };

    return (
        <div className="card flex justify-content-center">
            <Toast ref={toast}></Toast>

            <div>
                <Tooltip target=".custom-choose-btn" content="Choose" position="bottom" />
                <Tooltip target=".custom-upload-btn" content="Upload" position="bottom" />
                <Tooltip target=".custom-cancel-btn" content="Clear" position="bottom" />

                <FileUpload
                    ref={fileUploadRef}
                    name="demo[]"
                    url="/api/upload"
                    accept=".csv, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                    maxFileSize={25000000}
                    onUpload={onTemplateUpload}
                    onSelect={onTemplateSelect}
                    onError={onTemplateClear}
                    onClear={onTemplateClear}
                    headerTemplate={headerTemplate}
                    itemTemplate={itemTemplate}
                    emptyTemplate={emptyTemplate}
                    chooseOptions={{
                        icon: 'pi pi-fw pi-file',
                        iconOnly: true,
                        className: 'custom-choose-btn p-button-rounded p-button-outlined'
                    }}
                    uploadOptions={{
                        icon: 'pi pi-fw pi-cloud-upload',
                        iconOnly: true,
                        className: 'custom-upload-btn p-button-success p-button-rounded p-button-outlined'
                    }}
                    cancelOptions={{
                        icon: 'pi pi-fw pi-times',
                        iconOnly: true,
                        className: 'custom-cancel-btn p-button-danger p-button-rounded p-button-outlined'
                    }}
                    customUpload
                    uploadHandler={customBase64Uploader}
                    disabled={disabled ? disabled : false}
                />
            </div>
        </div>
    );
}
