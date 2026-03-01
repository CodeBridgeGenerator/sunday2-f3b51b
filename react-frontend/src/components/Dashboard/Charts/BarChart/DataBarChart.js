import React, { useState, useEffect } from 'react';
import { Skeleton } from 'primereact/skeleton';
import { Chart } from 'primereact/chart';
import client from '../../../../services/restClient';

export default function UserProfilesBarChart(props) {
    const [chartData, setChartData] = useState({});
    const [chartOptions, setChartOptions] = useState({});
    const [loading, setLoading] = useState(false);
    const { total, isEdit } = props;
    const [departmentLength, setDepartmentLength] = useState(0);

    useEffect(() => {
        const fetchChartData = async () => {
            setLoading(true);
            try {
                // Step 1: Fetch all documents from documentStorages
                const documentResponse = await client.service('dynaLoader').find({
                    query: { $limit: 10000 } // Adjust this limit as necessary
                });
                const documents = documentResponse.data;
                setDepartmentLength(documents.length);
                // console.debug("Documents Response:", documents);

                // Step 2: Extract user IDs from the 'createdBy' field
                const createdByIds = documents
                    .filter((doc) => doc.createdBy) // Only include documents that have 'createdBy' field
                    .map((doc) => {
                        // Handle cases where 'createdBy' is a string or an object
                        if (typeof doc.createdBy === 'string') {
                            return doc.createdBy;
                        } else if (doc.createdBy && doc.createdBy.$oid) {
                            return doc.createdBy.$oid;
                        }
                        return null; // Handle unexpected cases
                    })
                    .filter(Boolean); // Remove null or undefined IDs

                // console.debug("CreatedBy IDs:", createdByIds);

                if (createdByIds.length === 0) {
                    throw new Error('No valid user IDs found in documents.');
                }

                // Step 3: Fetch users based on these IDs
                const usersResponse = await client.service('users').find({
                    query: { _id: { $in: createdByIds } }
                });

                if (usersResponse.data?.length === 0) return;
                const users = usersResponse.data;
                // console.debug("Users Response:", users);

                // Step 4: Map user IDs to names for chart labels
                const userIdToNameMap = users.reduce((acc, user) => {
                    acc[user._id] = user.name || 'Unknown User'; // Adjust as needed
                    return acc;
                }, {});
                // console.debug("User ID to Name Map:", userIdToNameMap);

                // Step 5: Count documents created by each user
                const userDocCount = createdByIds.reduce((acc, userId) => {
                    acc[userId] = (acc[userId] || 0) + 1;
                    return acc;
                }, {});
                // console.debug("Document Count per User:", userDocCount);

                // Step 6: Prepare chart data
                const chartLabels = Object.keys(userDocCount).map((userId) => userIdToNameMap[userId]);
                const chartValues = Object.values(userDocCount);
                // console.debug("Chart Labels:", chartLabels);
                // console.debug("Chart Values:", chartValues);

                // Step 7: Configure the chart's dataset and options
                const documentStyle = getComputedStyle(document.documentElement);
                const newChartData = {
                    labels: chartLabels,
                    datasets: [
                        {
                            label: 'Dynaloader Created by User',
                            backgroundColor: documentStyle.getPropertyValue('--blue-500'),
                            hoverBackgroundColor: documentStyle.getPropertyValue('--blue-400'),
                            data: chartValues,
                            barThickness: 40,
                            maxBarThickness: 60,
                            categoryPercentage: 0.8,
                            barPercentage: 0.9
                        }
                    ]
                };

                const newChartOptions = {
                    plugins: {
                        title: {
                            display: true,
                            color: documentStyle.getPropertyValue('--text-color'),
                            font: { size: 16, weight: 'bold' }
                        },
                        legend: {
                            position: 'bottom',
                            align: 'start',
                            labels: {
                                color: documentStyle.getPropertyValue('--text-color'),
                                usePointStyle: true,
                                boxWidth: 5,
                                boxHeight: 5
                            }
                        }
                    },
                    scales: {
                        y: {
                            ticks: {
                                callback: function (value) {
                                    return Number.isInteger(value) ? value : null; // Only show integers
                                },
                                color: documentStyle.getPropertyValue('--text-color-secondary'),
                                font: { size: 12 }
                            },
                            grid: {
                                color: documentStyle.getPropertyValue('--surface-border')
                            }
                        },
                        x: {
                            ticks: {
                                color: documentStyle.getPropertyValue('--text-color-secondary'),
                                font: { size: 10 }
                            },
                            grid: {
                                color: documentStyle.getPropertyValue('--surface-border')
                            }
                        }
                    },
                    responsive: true,
                    maintainAspectRatio: false
                };

                setChartData(newChartData);
                setChartOptions(newChartOptions);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchChartData();
    }, []);

    return (
        <div className="col-12 flex justify-content-between align-items-center p-2">
            <div className="surface-card shadow-2 border-round p-3" style={{ width: '100%', height: '290px', position: 'relative' }}>
                <div
                    style={{
                        position: 'absolute',
                        top: '1rem',
                        right: '1rem',
                        display: 'flex',
                        alignItems: 'center'
                    }}
                >
                    {/* Removed the static "This week" text */}
                </div>
                {/* <ThisWeek isEdit={isEdit} onClick={handlePopUp} /> */}

                <div className="flex align-items-center">
                    {/* <img
          src={Drag}
          alt="Drag Icon"
          className={classNames("mr-2", { hidden: !isEdit })}
          style={{ width: "1rem", height: "1rem" }}
        /> */}
                    <div
                        style={{
                            textAlign: 'left',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            color: 'var(--text-color)',
                            marginLeft: '0.5rem'
                        }}
                    >
                        <span className="block text-900 font-medium mb-1">{total}</span>
                    </div>
                </div>
                <div
                    style={{
                        textAlign: 'left',
                        fontSize: '25px',
                        fontWeight: 'bold',
                        color: 'var(--text-color)',
                        marginLeft: '0.5rem'
                    }}
                >
                    {departmentLength}
                </div>
                {loading ? (
                    <Skeleton width="100%" height="65px" padding="10px" />
                ) : (
                    <div
                        style={{
                            width: '100%',
                            height: '200px',
                            overflow: 'hidden'
                        }}
                    >
                        <Chart type="bar" data={chartData} options={chartOptions} style={{ width: '100%', height: '100%' }} />
                    </div>
                )}
            </div>
        </div>
    );
}
