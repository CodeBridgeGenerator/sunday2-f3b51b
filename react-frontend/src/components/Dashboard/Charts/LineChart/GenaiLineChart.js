import React, { useState, useEffect } from 'react';
import { Chart } from 'primereact/chart';
import { Skeleton } from 'primereact/skeleton';
import client from '../../../../services/restClient';

export default function DocumentsCreatedLineChart(props) {
    const [chartData, setChartData] = useState({});
    const [chartOptions, setChartOptions] = useState({});
    const [loading, setLoading] = useState(false);
    const { name, isEdit } = props;
    const [totalDocuments, setTotalDocuments] = useState(0);
    const [totalCost, setTotalCost] = useState(0);

    useEffect(() => {
        setLoading(true);

        // Fetch document data from documentStorages service
        client
            .service('prompts')
            .find({
                query: {
                    $limit: 10000, // Set limit as needed
                    $sort: { createdAt: 1 } // Sort by createdAt
                }
            })
            .then((response) => {
                const documentData = response.data;
                setTotalDocuments(documentData.length);

                // Aggregate total cost by creation date
                const costByDate = documentData.reduce((acc, doc) => {
                    const date = new Date(doc.createdAt).toISOString().split('T')[0]; // Extract date in YYYY-MM-DD format
                    const cost = doc.cost || 0; // Assuming cost is a field in your data
                    acc[date] = (acc[date] || 0) + cost;
                    return acc;
                }, {});

                // Calculate total cost for all prompts
                const totalCostValue = documentData.reduce((sum, doc) => sum + (doc.cost || 0), 0);
                setTotalCost(totalCostValue); // Set the total cost

                // Prepare chart data
                const dates = Object.keys(costByDate);
                const costs = Object.values(costByDate);

                const documentStyle = getComputedStyle(document.documentElement);
                const chartData = {
                    labels: dates,
                    datasets: [
                        {
                            label: 'Total Cost per Day',
                            data: costs,
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
                                color: documentStyle.getPropertyValue('--text-color-secondary'),
                                callback: function (value) {
                                    return Number.isInteger(value) ? value : ''; // Show only integer values
                                }
                            },
                            grid: {
                                color: documentStyle.getPropertyValue('--surface-border')
                            },
                            stepSize: 1
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
                console.error('Error fetching document data:', error);
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
                        {totalCost}
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
                {loading ? <Skeleton width="100%" height="65px" padding="10px" /> : <Chart type="line" data={chartData} options={chartOptions} style={{ width: '100%', height: '65%', padding: '1rem' }} />}
            </div>
        </div>
    );
}
