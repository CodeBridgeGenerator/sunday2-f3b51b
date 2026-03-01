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
        const fetchData = async () => {
            try {
                // Fetch companies data
                const companiesResponse = await client.service('companies').find();
                const companies = companiesResponse.data || [];
                setTotalCompanies(companies.length);

                // Prepare chart data: Map company IDs to names and employee counts
                const labels = [];
                const data = [];
                companies.forEach((company) => {
                    const companyId = company._id;
                });

                // Construct chart data
                const chartData = {
                    labels,
                    datasets: [
                        {
                            label: 'Number of Employees per Company',
                            data,
                            fill: true,
                            tension: 0.4,
                            borderColor: '#42A5F5',
                            backgroundColor: 'rgba(66, 165, 245, 0.2)'
                        }
                    ]
                };

                const documentStyle = getComputedStyle(document.documentElement);
                const textColor = documentStyle.getPropertyValue('--text-color');
                const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
                const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

                const chartOptions = {
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            align: 'start',
                            labels: {
                                color: textColor,
                                usePointStyle: true
                            }
                        },
                        tooltip: {
                            mode: 'index',
                            intersect: false
                        }
                    },
                    interaction: {
                        mode: 'nearest',
                        axis: 'x',
                        intersect: false
                    },
                    scales: {
                        x: {
                            ticks: { color: textColorSecondary },
                            grid: { color: surfaceBorder }
                        },
                        y: {
                            ticks: {
                                color: textColorSecondary,
                                callback: function (value) {
                                    return Number.isInteger(value) ? value : null; // Show only integers
                                },
                                stepSize: 1 // Ensure the interval is 1
                            },
                            grid: { color: surfaceBorder }
                        }
                    }
                };

                setChartData(chartData);
                setChartOptions(chartOptions);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);

    const handlePopUp = () => {
        setShowCard(!showCard);
    };

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
