import React, { useState, useEffect } from 'react';
import { Chart } from 'primereact/chart';
import { Skeleton } from 'primereact/skeleton';
import client from '../../../../services/restClient';

export default function StockMovementLineChart(props) {
    const [chartData, setChartData] = useState({});
    const [chartOptions, setChartOptions] = useState({});
    const [loading, setLoading] = useState(false);
    const { name } = props;
    const [totalStockMovements, setTotalStockMovements] = useState(0);

    useEffect(() => {
        setLoading(true);

        // Services to fetch stock data
        const services = ['stockInDetails', 'stockOutDetails'];
        const colors = ['--blue-500', '--green-500'];

        const fetchPromises = services.map((service) =>
            client.service(service).find({
                query: {
                    $limit: 10000, // Set limit as needed
                    $sort: { createdAt: 1 } // Sort by createdAt
                }
            })
        );

        Promise.all(fetchPromises)
            .then((responses) => {
                const movementsByDate = {};
                let total = 0;

                responses.forEach((response, index) => {
                    const serviceName = services[index];
                    response.data.forEach((movement) => {
                        total++;
                        const date = new Date(movement.createdAt).toISOString().split('T')[0]; // Extract date in YYYY-MM-DD format
                        movementsByDate[date] = movementsByDate[date] || {};
                        movementsByDate[date][serviceName] = (movementsByDate[date][serviceName] || 0) + 1;
                    });
                });

                setTotalStockMovements(total);

                // Prepare chart data
                const dates = Object.keys(movementsByDate).sort();
                const datasets = services.map((service, idx) => {
                    const counts = dates.map((date) => movementsByDate[date][service] || 0);
                    const documentStyle = getComputedStyle(document.documentElement);
                    return {
                        label: service.replace(/([A-Z])/g, ' $1'),
                        data: counts,
                        fill: false,
                        borderColor: documentStyle.getPropertyValue(colors[idx]),
                        tension: 0.4
                    };
                });

                const chartData = {
                    labels: dates,
                    datasets: datasets
                };

                const options = {
                    plugins: {
                        legend: {
                            labels: {
                                color: getComputedStyle(document.documentElement).getPropertyValue('--text-color')
                            }
                        }
                    },
                    scales: {
                        x: {
                            ticks: {
                                color: getComputedStyle(document.documentElement).getPropertyValue('--text-color-secondary')
                            },
                            grid: {
                                color: getComputedStyle(document.documentElement).getPropertyValue('--surface-border')
                            }
                        },
                        y: {
                            ticks: {
                                color: getComputedStyle(document.documentElement).getPropertyValue('--text-color-secondary'),
                                callback: function (value) {
                                    return Number.isInteger(value) ? value : ''; // Show only integer values
                                }
                            },
                            grid: {
                                color: getComputedStyle(document.documentElement).getPropertyValue('--surface-border')
                            },
                            beginAtZero: true // Ensure Y-axis starts at zero
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
                console.error('Error fetching stock movement data:', error);
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
                        {totalStockMovements}
                    </div>
                </div>
                {loading ? <Skeleton width="100%" height="65%" /> : <Chart type="line" data={chartData} options={chartOptions} style={{ width: '100%', height: '65%', padding: '1rem' }} />}
            </div>
        </div>
    );
}
