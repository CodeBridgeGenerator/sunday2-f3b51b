import React, { useState, useEffect } from 'react';
import { Skeleton } from 'primereact/skeleton';
import { Chart } from 'primereact/chart';
import client from '../../../../services/restClient';

export default function CompanyBarChart(props) {
    const [chartData, setChartData] = useState({});
    const [chartOptions, setChartOptions] = useState({});
    const [loading, setLoading] = useState(false);
    const { total, isEdit } = props;
    const [showCard, setShowCard] = useState(false);
    const [departmentLength, setDepartmentLength] = useState(0);

    useEffect(() => {
        setLoading(true);

        // Fetch departments and then fetch corresponding companies
        client
            .service('departments')
            .find({
                query: {
                    $limit: 10000
                }
            })
            .then(async (res) => {
                const departments = res.data;
                setDepartmentLength(departments.length);

                // Create a map of company IDs to department counts
                const companyDeptCounts = departments.reduce((acc, dept) => {
                    if (!acc[dept.companyId]) {
                        acc[dept.companyId] = 0;
                    }
                    acc[dept.companyId] += 1;
                    return acc;
                }, {});

                // Fetch companies data based on the companyIds from departments
                const companyIds = Object.keys(companyDeptCounts);
                const companiesResponse = await client.service('companies').find({
                    query: {
                        _id: { $in: companyIds }
                    }
                });

                const companies = companiesResponse.data;

                // Map companyIds to company names for display
                const companyNameMap = companies.reduce((acc, company) => {
                    acc[company._id] = company.name;
                    return acc;
                }, {});

                // Prepare chart data
                const chartLabels = Object.keys(companyDeptCounts).map((companyId) => companyNameMap[companyId] || 'Unknown');
                const chartValues = Object.values(companyDeptCounts);

                const documentStyle = getComputedStyle(document.documentElement);
                const chartData = {
                    labels: chartLabels,
                    datasets: [
                        {
                            label: 'Number of Departments in Each Company',
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
                ></div>

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
