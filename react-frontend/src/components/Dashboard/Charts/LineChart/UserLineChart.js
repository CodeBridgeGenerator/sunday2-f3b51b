import React, { useState, useEffect } from 'react';
import { Chart } from 'primereact/chart';
import { Skeleton } from 'primereact/skeleton';
import client from '../../../../services/restClient';

export default function LoginHistoryLineChart(props) {
    const [chartData, setChartData] = useState({});
    const [chartOptions, setChartOptions] = useState({});
    const [loading, setLoading] = useState(false);
    const { name, isEdit } = props;
    const [totalCompanies, setTotalCompanies] = useState(0);
    const [totalProfiles, setTotalProfiles] = useState(0);

    useEffect(() => {
        setLoading(true);

        // Fetch login history data
        client
            .service('loginHistory')
            .find({
                query: {
                    $limit: 10000,
                    $sort: { loginTime: 1 }
                }
            })
            .then((response) => {
                const loginData = response.data;
                setTotalCompanies(loginData.length);
                // Aggregate logins by day
                const loginsByDay = loginData.reduce((acc, login) => {
                    const date = new Date(login.loginTime).toISOString().split('T')[0]; // Extract date in YYYY-MM-DD format
                    acc[date] = (acc[date] || 0) + 1;
                    return acc;
                }, {});

                // Prepare chart data
                const dates = Object.keys(loginsByDay);
                const counts = Object.values(loginsByDay);

                const documentStyle = getComputedStyle(document.documentElement);
                const chartData = {
                    labels: dates,
                    datasets: [
                        {
                            label: 'User Logins by Day',
                            data: counts,
                            fill: false,
                            borderColor: documentStyle.getPropertyValue('--blue-500'),
                            tension: 0.4
                        }
                    ]
                };

                const options = {
                    plugins: {
                        legend: {
                            labels: {
                                color: documentStyle.getPropertyValue('--text-color')
                            }
                        }
                    },
                    scales: {
                        x: {
                            ticks: {
                                color: documentStyle.getPropertyValue('--text-color-secondary')
                            },
                            grid: {
                                color: documentStyle.getPropertyValue('--surface-border')
                            }
                        },
                        y: {
                            ticks: {
                                color: documentStyle.getPropertyValue('--text-color-secondary')
                            },
                            grid: {
                                color: documentStyle.getPropertyValue('--surface-border')
                            }
                        }
                    },
                    responsive: true,
                    maintainAspectRatio: false
                };

                setChartData(chartData);
                setChartOptions(options);
                setLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching login history:', error);
                setLoading(false);
            });
    }, []);

    return (
        <div className="col-6">
            <div
                className="surface-card shadow-2 border-round p-3"
                style={{
                    width: '205%',
                    height: '290px',
                    padding: '30px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    position: 'relative'
                }}
            >
                <div style={{ width: '100%', marginBottom: '10px' }}>
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
                            <span className="block text-900 font-medium mb-1">{name}</span>
                        </div>
                    </div>
                    <div
                        style={{
                            textAlign: 'left',
                            fontSize: '35px',
                            fontWeight: 'bold',
                            color: 'var(--text-color)',
                            marginLeft: '0.5rem',
                            padding: '0.1rem'
                        }}
                    >
                        {totalCompanies}
                    </div>
                    <div
                        style={{
                            textAlign: 'left',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            color: 'rgba(0, 0, 0, 0.5)',
                            marginLeft: '0.5rem',
                            padding: '0.1rem'
                        }}
                    ></div>
                </div>
                <Chart type="line" data={chartData} options={chartOptions} style={{ width: '100%', height: '65%', padding: '1rem' }} />
            </div>
        </div>
    );
}
