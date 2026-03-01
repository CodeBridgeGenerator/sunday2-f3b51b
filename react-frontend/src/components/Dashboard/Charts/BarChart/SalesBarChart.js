import React, { useState, useEffect } from 'react';
import { Skeleton } from 'primereact/skeleton';
import { Chart } from 'primereact/chart';
import client from '../../../../services/restClient';

export default function TotalSalesByCompanyBarChart(props) {
    const [chartData, setChartData] = useState({});
    const [chartOptions, setChartOptions] = useState({});
    const [loading, setLoading] = useState(false);
    const [totalSales, setTotalSales] = useState(0);

    useEffect(() => {
        setLoading(true);

        // Fetch sales data from the customer_sales_orders service
        const fetchSalesData = async () => {
            try {
                const res = await client.service('customerSalesOrders').find({
                    query: {
                        $limit: 10000,
                        $populate: ['company'] // Populate the company details
                    }
                });
                return res.data;
            } catch (error) {
                console.error('Error fetching sales data:', error);
                return [];
            }
        };

        fetchSalesData()
            .then((salesData) => {
                setTotalSales(salesData.length);

                // Aggregate sales by company
                const salesByCompany = {};
                salesData.forEach((sale) => {
                    const companyName = sale.company?.name || 'Unknown Company'; // Use company name or fallback
                    salesByCompany[companyName] = (salesByCompany[companyName] || 0) + 1; // Increment count for the company
                });

                // Prepare chart data
                const companies = Object.keys(salesByCompany);
                const salesCounts = companies.map((company) => salesByCompany[company]);

                const documentStyle = getComputedStyle(document.documentElement);
                const data = {
                    labels: companies,
                    datasets: [
                        {
                            label: 'Sales by Company',
                            data: salesCounts,
                            backgroundColor: getRandomColor(),
                            hoverBackgroundColor: getRandomColor(),
                            barThickness: 40,
                            maxBarThickness: 60,
                            categoryPercentage: 0.8,
                            barPercentage: 0.9
                        }
                    ]
                };

                const options = {
                    plugins: {
                        title: {
                            display: true,
                            text: 'Total Sales by Company',
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
                                },
                                callback: function (value) {
                                    return Number.isInteger(value) ? value : null;
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

                setChartData(data);
                setChartOptions(options);
                setLoading(false);
            })
            .catch((error) => {
                console.error('Error fetching sales data:', error);
                setLoading(false);
            });
    }, []);

    // Helper function to generate random colors
    const getRandomColor = () => {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    };

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
                        <span className="block text-900 font-medium mb-1">Total Sales</span>
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
                    {totalSales}
                </div>
                {loading ? (
                    <Skeleton width="100%" height="65px" padding="10px" />
                ) : (
                    <div style={{ width: '100%', height: '200px', overflow: 'hidden' }}>
                        <Chart type="bar" data={chartData} options={chartOptions} style={{ width: '100%', height: '100%' }} />
                    </div>
                )}
            </div>
        </div>
    );
}
