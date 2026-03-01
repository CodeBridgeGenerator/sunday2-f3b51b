import React, { useState, useEffect } from 'react';
import { Skeleton } from 'primereact/skeleton';
import { Chart } from 'primereact/chart';
import { classNames } from 'primereact/utils';
import client from '../../../../services/restClient';

export default function EmailStatusBarChart(props) {
    const [chartData, setChartData] = useState({});
    const [chartOptions, setChartOptions] = useState({});
    const [loading, setLoading] = useState(false);
    const { total, isEdit } = props;
    const [showCard, setShowCard] = useState(false);
    const [emailData, setEmailData] = useState([]);

    useEffect(() => {
        setLoading(true);

        // Fetch email data
        client
            .service('mailQues')
            .find({
                query: {
                    $limit: 10000 // Adjust as needed for pagination or filtering
                }
            })
            .then((res) => {
                const emails = res.data;
                setEmailData(emails);

                // Count the number of successful and failed emails
                const successfulEmails = emails.filter((email) => email.status === true).length;
                const failedEmails = emails.filter((email) => email.status === false).length;

                // Prepare chart data
                const chartData = {
                    labels: ['Successful', 'Failed'],
                    datasets: [
                        {
                            label: 'Email Status',
                            backgroundColor: ['#28a745', '#dc3545'], // Green for success, Red for failure
                            hoverBackgroundColor: ['#218838', '#c82333'],
                            data: [successfulEmails, failedEmails],
                            barThickness: 40,
                            maxBarThickness: 60,
                            categoryPercentage: 0.8,
                            barPercentage: 0.9
                        }
                    ]
                };

                const documentStyle = getComputedStyle(document.documentElement);
                const options = {
                    plugins: {
                        title: {
                            display: true,
                            color: documentStyle.getPropertyValue('--text-color'),
                            font: {
                                size: 16,
                                weight: 'bold'
                            }
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
                        },
                        tooltip: {
                            mode: 'index',
                            intersect: false
                        },
                        interaction: {
                            mode: 'nearest',
                            axis: 'x',
                            intersect: false
                        }
                    },
                    scales: {
                        y: {
                            ticks: {
                                color: documentStyle.getPropertyValue('--text-color-secondary'),
                                font: {
                                    size: 12
                                }
                            },
                            grid: {
                                color: documentStyle.getPropertyValue('--surface-border')
                            }
                        },
                        x: {
                            ticks: {
                                color: documentStyle.getPropertyValue('--text-color-secondary'),
                                font: {
                                    size: 10
                                }
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
                console.debug({ error });
                setLoading(false);
            });
    }, []);

    const handlePopUp = () => {
        setShowCard(!showCard);
    };

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
                    {emailData.length}
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
