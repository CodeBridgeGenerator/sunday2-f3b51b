import { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import client from '../services/restClient';
import exportConfig from './exportConfig';

const DownloadExcel = ({ data, fileName, triggerDownload, setTriggerDownload, selectedData }) => {
    const [schema, setSchema] = useState(null);

    useEffect(() => {
        const fetchSchema = async () => {
            try {
                const schemaResponse = await client.service(`${fileName}Schema`).find();
                const schemaMap = {};
                schemaResponse.forEach((item) => {
                    schemaMap[item.field] = { type: item.type, comment: item.comment };
                });
                setSchema(schemaMap);
            } catch (error) {
                console.error('Failed to fetch schema:', error);
                setSchema(null);
            }
        };

        fetchSchema();
    }, [fileName]);

    const getRelevantFieldAndService = (fieldName) => {
        if (!schema || !schema[fieldName] || schema[fieldName].type !== 'ObjectId') {
            return { relevantField: null, refService: null };
        }

        const commentParts = schema[fieldName].comment?.split(',') || [];
        const refService = commentParts[9]?.trim();
        const relevantField = commentParts[12]?.trim();

        return { relevantField, refService };
    };

    const convertToExcel = async (objArray) => {
        if (!objArray || !Array.isArray(objArray) || objArray.length === 0) {
            return null;
        }

        const formattedData = await Promise.all(
            objArray.map(async (item) => {
                const newItem = {};
                for (const key in item) {
                    if (key === '_id' || key === '__v') {
                        continue;
                    }

                    const config = exportConfig.fields[key];
                    if (config) {
                        // Use field-specific formatting from exportConfig
                        newItem[config.displayName || key] = config.format ? await config.format(item[key]) : item[key];
                    } else {
                        // Fallback for fields not in config
                        const { relevantField, refService } = getRelevantFieldAndService(key);
                        if (relevantField && refService && item[key] && typeof item[key] === 'object' && item[key]._id) {
                            newItem[key] = item[key][relevantField] || 'Unknown';
                        } else if (item[key] && typeof item[key] === 'object') {
                            newItem[key] = JSON.stringify(item[key]).replace(/,/g, ' ');
                        } else {
                            newItem[key] = item[key];
                        }
                    }
                }
                return newItem;
            })
        );

        const worksheet = XLSX.utils.json_to_sheet(formattedData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

        return workbook;
    };

    const downloadExcel = async () => {
        const dataToDownload = selectedData && selectedData.length > 0 ? selectedData : data;
        const workbook = await convertToExcel(dataToDownload);

        if (!workbook) {
            console.error('Invalid or empty data provided');
            return;
        }

        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        const excelData = new Blob([excelBuffer], { type: 'application/octet-stream' });
        const excelURL = URL.createObjectURL(excelData);
        const link = document.createElement('a');
        link.href = excelURL;
        link.download = `${fileName}.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    useEffect(() => {
        if (triggerDownload) {
            downloadExcel();
            setTriggerDownload(false);
        }
    }, [triggerDownload, data, selectedData, schema]);

    return null;
};

export default DownloadExcel;
