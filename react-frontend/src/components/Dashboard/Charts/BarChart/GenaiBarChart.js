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
                // Step 1: Fetch all prompts data from the "prompt service"
                const promptResponse = await client.service('prompts').find({
                    query: { $limit: 10000 } // Adjust the limit as needed
                });
                const prompts = promptResponse.data;

                console.debug('Fetched Prompts:', prompts);

                // Step 2: Extract user IDs from the 'createdBy' field in prompts
                const createdByIds = prompts
                    .filter((prompt) => prompt.createdBy) // Only include prompts that have 'createdBy'
                    .map((prompt) => prompt.createdBy); // Extract ObjectId of the creator
                console.debug('CreatedBy IDs:', createdByIds);

                if (createdByIds.length === 0) {
                    throw new Error('No valid user IDs found in prompts.');
                }

                // Step 3: Fetch user data based on these IDs
                const usersResponse = await client.service('users').find({
                    query: { _id: { $in: createdByIds } }
                });
                const users = usersResponse.data;
                setDepartmentLength(users.length);
                console.debug('Fetched Users:', users);

                // Step 4: Map user IDs to names for chart labels
                const userIdToNameMap = users.reduce((acc, user) => {
                    acc[user._id] = user.name || 'Unknown User'; // Adjust as needed
                    return acc;
                }, {});
                console.debug('User ID to Name Map:', userIdToNameMap);

                // Step 5: Count how many prompts were created by each user
                const userPromptCount = createdByIds.reduce((acc, userId) => {
                    acc[userId] = (acc[userId] || 0) + 1;
                    return acc;
                }, {});
                console.debug('Prompt Count per User:', userPromptCount);

                // Step 6: Prepare chart data
                const chartLabels = Object.keys(userPromptCount).map((userId) => userIdToNameMap[userId]);
                const chartValues = Object.values(userPromptCount);
                console.debug('Chart Labels:', chartLabels);
                console.debug('Chart Values:', chartValues);

                // Step 7: Configure the chart's dataset and options
                const documentStyle = getComputedStyle(document.documentElement);
                const newChartData = {
                    labels: chartLabels,
                    datasets: [
                        {
                            label: 'Prompts Created by User',
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
                                    return Number.isInteger(value) ? value : ''; // Only show integers
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
                <div className="flex align-items-center">
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
