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
                // Fetch profiles
                const profilesResponse = await client.service('profiles').find({
                    query: { $limit: 10000 }
                });
                const profiles = profilesResponse.data;
                setDepartmentLength(profiles.length);

                // Aggregate profiles by userId
                const profileCounts = profiles.reduce((acc, profile) => {
                    const userId = profile.userId.$oid || profile.userId;
                    acc[userId] = (acc[userId] || 0) + 1;
                    return acc;
                }, {});

                // Fetch users to resolve names
                const userIds = Object.keys(profileCounts);
                const usersResponse = await client.service('users').find({
                    query: { _id: { $in: userIds } }
                });
                const users = usersResponse.data;

                // Map userIds to user names
                const userNameMap = users.reduce((acc, user) => {
                    acc[user._id] = user.name || 'Unknown User';
                    return acc;
                }, {});

                // Prepare chart data
                const chartLabels = userIds.map((id) => userNameMap[id]);
                const chartValues = userIds.map((id) => profileCounts[id]);

                const documentStyle = getComputedStyle(document.documentElement);
                const newChartData = {
                    labels: chartLabels,
                    datasets: [
                        {
                            label: 'Number of Profiles per User',
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
