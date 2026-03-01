import React, { useState, useEffect } from 'react';
import { Chart } from 'primereact/chart';
import { Skeleton } from 'primereact/skeleton';
import client from '../../../../services/restClient';

export default function PurchaseOrdersByDateLineChart(props) {
    const [chartData, setChartData] = useState({});
    const [chartOptions, setChartOptions] = useState({});
    const [loading, setLoading] = useState(false);
    const { name } = props;
    const [totalPurchaseOrders, setTotalPurchaseOrders] = useState(0);

    useEffect(() => {
        setLoading(true);

        // Fetch purchase order data from the customer_purchase_orders service
        const fetchPurchaseOrderData = async () => {
            try {
                const response = await client.service('customerPurchaseOrders').find({
                    query: {
                        $limit: 10000, // Set limit as needed
                        $sort: { purchaseOrderDate: 1 } // Sort by purchaseOrderDate
                    }
                });
                return response.data;
            } catch (error) {
                console.error('Error fetching purchase order data:', error);
                return [];
            }
        };

        fetchPurchaseOrderData()
            .then((purchaseOrders) => {
                setTotalPurchaseOrders(purchaseOrders.length);

                // Aggregate purchase orders by date
                const purchaseOrdersByDate = {};
                purchaseOrders.forEach((order) => {
                    const date = new Date(order.purchaseOrderDate).toISOString().split('T')[0]; // Extract date in YYYY-MM-DD format
                    purchaseOrdersByDate[date] = (purchaseOrdersByDate[date] || 0) + 1; // Increment count for the date
                });

                // Prepare chart data
                const dates = Object.keys(purchaseOrdersByDate).sort();
                const purchaseOrderCounts = dates.map((date) => purchaseOrdersByDate[date]);

                const documentStyle = getComputedStyle(document.documentElement);
                const chartData = {
                    labels: dates,
                    datasets: [
                        {
                            label: 'Purchase Orders',
                            data: purchaseOrderCounts,
                            fill: false,
                            borderColor: documentStyle.getPropertyValue('--green-500'), // Use a color for the line
                            tension: 0.4
                        }
                    ]
                };

                const options = {
                    plugins: {
                        legend: {
                            labels: {
                                color: getComputedStyle(document.documentElement).getPropertyValue('--text-color')
                            }
                        },
                        title: {
                            display: true,
                            text: 'Purchase Orders by Date',
                            color: getComputedStyle(document.documentElement).getPropertyValue('--text-color'),
                            font: {
                                size: 16,
                                weight: 'bold'
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
                console.error('Error fetching purchase order data:', error);
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
                        {totalPurchaseOrders}
                    </div>
                </div>
                {loading ? <Skeleton width="100%" height="65%" /> : <Chart type="line" data={chartData} options={chartOptions} style={{ width: '100%', height: '65%', padding: '1rem' }} />}
            </div>
        </div>
    );
}
