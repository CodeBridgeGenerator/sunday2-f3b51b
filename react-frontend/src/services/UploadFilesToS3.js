import React, { useState, useRef } from 'react';
import { FileUpload } from 'primereact/fileupload';
import { ProgressBar } from 'primereact/progressbar';
import { Button } from 'primereact/button';
import { Tooltip } from 'primereact/tooltip';
import { Tag } from 'primereact/tag';

export const UploadFilesToS3 = (props) => {
    const [totalSize, setTotalSize] = useState(0);
    const [files, setFiles] = useState([]);
    const [returnedIds, setReturnedIds] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const fileUploadRef = useRef(null);
    const uploadURL = `${process.env.REACT_APP_SERVER_URL}/s3uploader`;
    const [uploadedFileCount, setUploadedFileCount] = useState(0);

    const allowedFileTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'application/pdf', 'text/plain'];
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.pdf', '.txt'];
    const maxFileSize = 100 * 1024 * 1024;

    const validateFile = (file) => {
        if (!allowedFileTypes.includes(file.type)) {
            return {
                valid: false,
                message: `File type ${file.type} is not allowed. Only images, PDFs, and text files are accepted.`
            };
        }
        const fileName = file.name.toLowerCase();
        const isValidExtension = allowedExtensions.some((ext) => fileName.endsWith(ext));
        if (!isValidExtension) {
            return {
                valid: false,
                message: `File extension not allowed. Only ${allowedExtensions.join(', ')} are accepted.`
            };
        }
        if (file.size > maxFileSize) {
            return {
                valid: false,
                message: `File is too large. Maximum size is ${maxFileSize / 1000000}MB.`
            };
        }
        return { valid: true };
    };

    const onTemplateSelect = (e) => {
        let currentTotalSize = totalSize;
        let currentFilesInList = [...files];
        const validFilesFromThisSelection = [];

        e.files.forEach((file) => {
            const validation = validateFile(file);
            if (!validation.valid) {
                props.parentToastRef?.current?.show({
                    severity: 'error',
                    summary: 'Invalid File Skipped',
                    detail: `${file.name}: ${validation.message}`,
                    life: 5000
                });
                return;
            }

            const isAlreadySelected = currentFilesInList.some((f) => f.name === file.name && f.size === file.size) || validFilesFromThisSelection.some((f) => f.name === file.name && f.size === file.size);

            if (!isAlreadySelected) {
                validFilesFromThisSelection.push(file);
            } else {
                props.parentToastRef?.current?.show({
                    severity: 'warn',
                    summary: 'Duplicate File',
                    detail: `File "${file.name}" is already in the list.`,
                    life: 3000
                });
            }
        });

        if (validFilesFromThisSelection.length > 0) {
            const updatedFiles = [...currentFilesInList, ...validFilesFromThisSelection];
            setFiles(updatedFiles);
            setTotalSize(updatedFiles.reduce((acc, file) => acc + (file.size || 0), 0));
        }
    };

    const onTemplateRemove = (fileToRemove, callback) => {
        const index = files.findIndex((f) => f.name === fileToRemove.name && f.size === fileToRemove.size);

        if (index > -1) {
            const removedFileSize = files[index].size || 0;
            const fileInfoToRemoveFromParent = {
                documentStorageId: returnedIds[index],
                name: files[index].name
            };

            setFiles((prevFiles) => {
                const newFiles = [...prevFiles];
                newFiles.splice(index, 1);
                setTotalSize((prevTotalSize) => Math.max(0, prevTotalSize - removedFileSize));
                return newFiles;
            });

            setReturnedIds((prevIds) => {
                const updatedIds = [...prevIds];
                if (index < updatedIds.length) {
                    updatedIds.splice(index, 1);
                }
                if (props.onRemoveComplete && fileInfoToRemoveFromParent.documentStorageId) {
                    props.onRemoveComplete(fileInfoToRemoveFromParent);
                }
                return updatedIds;
            });

            setUploadedFileCount((prevCount) => Math.max(0, prevCount - 1));
        } else {
            console.warn('File not found in state for removal:', fileToRemove);
        }

        if (callback) {
            callback();
        }
    };

    const onTemplateClear = () => {
        const idsToRemove = [...returnedIds];
        setTotalSize(0);
        setFiles([]);
        setReturnedIds([]);
        setUploadedFileCount(0);
        if (props.onClearComplete && idsToRemove.length > 0) {
            props.onClearComplete(idsToRemove);
        }
    };

    const headerTemplate = (options) => {
        const { className, chooseButton, uploadButton, cancelButton } = options;
        const value = (totalSize / maxFileSize) * 100;
        const formatedValue = fileUploadRef?.current?.formatSize(totalSize) || '0 B';
        const maxFormattedValue = fileUploadRef?.current?.formatSize(maxFileSize) || '100MB';

        return (
            <div className={className} style={{ backgroundColor: 'transparent', display: 'flex', alignItems: 'center', width: '100%' }}>
                {chooseButton}
                {uploadButton}
                {cancelButton}
                <div className="flex align-items-center gap-3 ml-auto">
                    <span>
                        {formatedValue} / {maxFormattedValue}
                    </span>
                    <ProgressBar value={value} showValue={false} style={{ width: '10rem', height: '12px' }}></ProgressBar>
                </div>
            </div>
        );
    };

    const getFileIcon = (file) => {
        if (file.type.startsWith('image/')) {
            return file.objectURL;
        }
        if (file.type === 'application/pdf') {
            return 'https://cdn-icons-png.flaticon.com/512/337/337946.png';
        }
        if (file.type === 'text/plain') {
            return 'https://cdn-icons-png.flaticon.com/512/281/281760.png';
        }
        return 'https://cdn-icons-png.flaticon.com/512/2965/2965300.png';
    };

    const itemTemplate = (file, itemProps) => {
        const isImage = file.type.startsWith('image/');

        return (
            <div className="flex align-items-center flex-wrap" style={{ width: '100%' }}>
                <div className="flex align-items-center" style={{ width: '60%' }}>
                    {isImage ? (
                        <img
                            alt={file.name}
                            role="presentation"
                            src={file.objectURL}
                            width={60}
                            height={60}
                            style={{ marginRight: '1rem', objectFit: 'cover', borderRadius: '4px' }}
                            onError={(e) => {
                                e.target.src = 'https://cdn-icons-png.flaticon.com/512/2965/2965300.png';
                            }}
                        />
                    ) : (
                        <img
                            alt={file.name}
                            src={getFileIcon(file)}
                            width={60}
                            height={60}
                            style={{
                                marginRight: '1rem',
                                objectFit: 'contain',
                                padding: '10px',
                                backgroundColor: '#f8f9fa',
                                borderRadius: '4px'
                            }}
                            onError={(e) => {
                                e.target.src = 'https://cdn-icons-png.flaticon.com/512/2965/2965300.png';
                            }}
                        />
                    )}
                    <span className="flex flex-column text-left ml-2">
                        <span className="font-bold" style={{ wordBreak: 'break-word' }}>
                            {file.name}
                        </span>
                        <small className="text-sm text-gray-500">{itemProps.formatSize}</small>
                    </span>
                </div>
                <div style={{ width: '20%', textAlign: 'center' }}>
                    <Tag value={file.type.split('/')[1] || 'file'} severity="info" className="px-3 py-2" />
                </div>
                <div style={{ width: '20%', textAlign: 'right' }}>
                    <Button type="button" icon="pi pi-times" className="p-button-outlined p-button-rounded p-button-danger" onClick={() => onTemplateRemove(file, itemProps.onRemove)} />
                </div>
            </div>
        );
    };

    const emptyTemplate = () => {
        return (
            <div className="flex align-items-center flex-column">
                <i className="pi pi-cloud-upload mt-3 p-5" style={{ fontSize: '5em', borderRadius: '50%', backgroundColor: 'var(--surface-b)', color: 'var(--surface-d)' }}></i>
                <span style={{ fontSize: '1.2em', color: 'var(--text-color-secondary)' }} className="my-5">
                    Drag and Drop Files Here
                </span>
            </div>
        );
    };

    const chooseOptions = {
        icon: 'pi pi-fw pi-folder-open',
        iconOnly: true,
        className: 'custom-choose-btn p-button-rounded p-button-outlined'
    };

    const uploadOptions = {
        icon: 'pi pi-fw pi-cloud-upload',
        iconOnly: true,
        className: 'custom-upload-btn p-button-success p-button-rounded p-button-outlined'
    };

    const cancelOptions = {
        icon: 'pi pi-fw pi-times',
        iconOnly: true,
        className: 'custom-cancel-btn p-button-danger p-button-rounded p-button-outlined'
    };

    const uploadFile = async (e) => {
        const filesToUpload = e.files;

        if (filesToUpload.length > 0) {
            setIsUploading(true);
            let successfulUploads = 0;
            const newDocumentIds = [];

            try {
                const validFiles = filesToUpload.filter((file) => {
                    const validation = validateFile(file);
                    if (!validation.valid) {
                        props.parentToastRef?.current?.show({
                            severity: 'error',
                            summary: 'Upload Aborted',
                            detail: `Skipping invalid file: ${file.name}. ${validation.message}`,
                            life: 5000
                        });
                        return false;
                    }
                    return true;
                });

                if (validFiles.length === 0) {
                    props.parentToastRef?.current?.show({
                        severity: 'warn',
                        summary: 'No Valid Files',
                        detail: 'No valid files selected for upload.',
                        life: 3000
                    });
                    if (fileUploadRef.current) {
                        fileUploadRef.current.clear();
                    }
                    return;
                }

                for (const file of validFiles) {
                    const formData = new FormData();
                    formData.append('files', file);
                    formData.append('tableId', props.id || '');
                    formData.append('tableName', props.serviceName || '');
                    formData.append('user', JSON.stringify(props.user ? props.user : {}));

                    try {
                        console.log(`Uploading file: ${file.name}, size: ${(file.size / 1000000).toFixed(2)}MB`);
                        const response = await fetch(uploadURL, {
                            method: 'POST',
                            body: formData
                        });

                        if (!response.ok) {
                            let errorDetail = `HTTP error! status: ${response.status}`;
                            if (response.status === 413) {
                                errorDetail = `File "${file.name}" is too large. Maximum size allowed by the server is 100MB.`;
                            } else {
                                try {
                                    const errorResult = await response.json();
                                    errorDetail = errorResult.message || errorResult.error || JSON.stringify(errorResult);
                                } catch (jsonError) {
                                    errorDetail = response.statusText || errorDetail;
                                }
                            }
                            throw new Error(errorDetail);
                        }

                        const result = await response.json();

                        if (result?.status && result.results?.length > 0) {
                            const successfulResults = result.results.filter((res) => res.status && res.documentId);
                            successfulResults.forEach((res) => {
                                newDocumentIds.push(res.documentId);
                                setReturnedIds((prevIds) => {
                                    const currentIds = [...prevIds];
                                    const fileIndex = files.findIndex((f) => f.name === file.name && f.size === file.size);
                                    if (fileIndex !== -1) {
                                        currentIds.push(res.documentId);
                                    }
                                    return [...new Set(currentIds)];
                                });
                                successfulUploads++;
                                setUploadedFileCount((prevCount) => prevCount + 1);
                                props.parentToastRef?.current?.show({
                                    severity: 'success',
                                    summary: 'Upload Successful',
                                    detail: `File "${file.name}" uploaded successfully. Document ID: ${res.documentId}`,
                                    life: 3000
                                });
                            });

                            const failedResults = result.results.filter((res) => !res.status);
                            failedResults.forEach((res) => {
                                console.error(`Upload failed for file "${file.name}": ${res.message}`);
                                props.parentToastRef?.current?.show({
                                    severity: 'error',
                                    summary: 'Upload Failed',
                                    detail: res.message || `Failed to upload "${file.name}".`,
                                    life: 5000
                                });
                            });
                        } else {
                            throw new Error(`Upload completed but received unexpected response for file "${file.name}".`);
                        }
                    } catch (error) {
                        console.error(`Upload error for file "${file.name}":`, error);
                        props.parentToastRef?.current?.show({
                            severity: 'error',
                            summary: 'Upload Failed',
                            detail: `Failed to upload "${file.name}": ${error.message || 'Please try again.'}`,
                            life: 5000
                        });
                    }
                }

                if (successfulUploads > 0 && props.onUploadComplete) {
                    console.log(`Calling onUploadComplete with IDs:`, JSON.stringify(newDocumentIds, null, 2));
                    props.onUploadComplete(newDocumentIds);
                }

                if (successfulUploads === 0) {
                    props.parentToastRef?.current?.show({
                        severity: 'error',
                        summary: 'Upload Failed',
                        detail: 'All files failed to upload.',
                        life: 5000
                    });
                } else if (successfulUploads < validFiles.length) {
                    props.parentToastRef?.current?.show({
                        severity: 'warn',
                        summary: 'Partial Upload',
                        detail: `Uploaded ${successfulUploads} out of ${validFiles.length} files.`,
                        life: 5000
                    });
                }
            } catch (error) {
                console.error('Unexpected error during upload process:', error);
                props.parentToastRef?.current?.show({
                    severity: 'error',
                    summary: 'Upload Failed',
                    detail: error.message || 'An unexpected error occurred. Please try again.',
                    life: 5000
                });
            } finally {
                setIsUploading(false);
                if (fileUploadRef.current) {
                    fileUploadRef.current.clear();
                }
            }
        }
    };

    return (
        <div>
            <Tooltip target=".custom-choose-btn" content="Choose File" position="bottom" />
            <Tooltip target=".custom-upload-btn" content="Upload File" position="bottom" />
            <Tooltip target=".custom-cancel-btn" content="Clear" position="bottom" />

            <FileUpload
                ref={fileUploadRef}
                name="files"
                mode="advanced"
                multiple={props.multiple === undefined ? true : props.multiple}
                customUpload
                uploadHandler={uploadFile}
                onSelect={onTemplateSelect}
                onRemove={(file, callback) => onTemplateRemove(file, callback)}
                onClear={onTemplateClear}
                headerTemplate={headerTemplate}
                itemTemplate={itemTemplate}
                emptyTemplate={emptyTemplate}
                chooseOptions={chooseOptions}
                uploadOptions={uploadOptions}
                cancelOptions={cancelOptions}
                accept="image/*,.pdf,.txt"
                maxFileSize={maxFileSize}
                className="custom-file-upload"
                style={{ width: '100%' }}
                disabled={props.disabled || isUploading}
                invalidFileTypeMessageSummary="Invalid file type"
                invalidFileTypeMessageDetail={`Allowed: ${allowedExtensions.join(', ')}`}
                invalidFileSizeMessageSummary="File too large"
                invalidFileSizeMessageDetail={`Maximum file size is ${maxFileSize / 1000000}MB.`}
            />
            {isUploading && <ProgressBar mode="indeterminate" style={{ height: '6px', marginTop: '10px' }} />}
        </div>
    );
};

export default UploadFilesToS3;
