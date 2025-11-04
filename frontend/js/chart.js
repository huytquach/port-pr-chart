// Chart management
class ChartManager {
    constructor() {
        this.chart = null;
        this.canvas = document.getElementById('chartCanvas');
        this.ctx = this.canvas.getContext('2d');
    }

    createChart(data, chartType = 'bar', metric = 'hours', statistic = 'median') {
        // Destroy existing chart
        if (this.chart) {
            this.chart.destroy();
        }

        const labels = data.map(item => item.date);
        // Use statistic value for hours metric, otherwise use metric directly
        const values = data.map(item => {
            if (metric === 'hours' || metric === 'avgHours') {
                return item.value || item[statistic] || item.median;
            }
            return item[metric];
        });

        const config = {
            type: chartType,
            data: {
                labels: labels,
                datasets: [{
                    label: this.getMetricLabel(metric, statistic),
                    data: values,
                    backgroundColor: chartType === 'bar' ? 
                        'rgba(52, 152, 219, 0.8)' : 
                        'rgba(52, 152, 219, 0.2)',
                    borderColor: 'rgba(52, 152, 219, 1)',
                    borderWidth: 2,
                    fill: chartType === 'line'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: `Port PR Analytics - ${this.getMetricLabel(metric, statistic)}`,
                        font: {
                            size: 16,
                            weight: 'bold'
                        }
                    },
                    legend: {
                        display: true,
                        position: 'top'
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Date'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: this.getMetricLabel(metric, statistic)
                        },
                        beginAtZero: true
                    }
                },
                animation: {
                    duration: 1000,
                    easing: 'easeInOutQuart'
                }
            }
        };

        this.chart = new Chart(this.ctx, config);
    }

    updateChart(data, chartType, metric, statistic = 'median') {
        if (!this.chart) {
            this.createChart(data, chartType, metric, statistic);
            return;
        }

        // Check if chart type has changed
        if (this.chart.config.type !== chartType) {
            console.log(`Chart type changed from ${this.chart.config.type} to ${chartType}`);
            this.createChart(data, chartType, metric, statistic);
            return;
        }

        const labels = data.map(item => item.date);
        // Use statistic value for hours metric, otherwise use metric directly
        const values = data.map(item => {
            if (metric === 'hours' || metric === 'avgHours') {
                return item.value || item[statistic] || item.median;
            }
            return item[metric];
        });

        this.chart.data.labels = labels;
        this.chart.data.datasets[0].data = values;
        this.chart.data.datasets[0].label = this.getMetricLabel(metric, statistic);
        this.chart.options.plugins.title.text = `Port PR Analytics - ${this.getMetricLabel(metric, statistic)}`;
        this.chart.options.scales.y.title.text = this.getMetricLabel(metric, statistic);

        this.chart.update('active');
    }

    getMetricLabel(metric, statistic = 'median') {
        const metricLabels = {
            'hours': 'Hours',
            'count': 'Count',
            'avgHours': 'Hours'
        };
        
        const statisticLabels = {
            'median': 'Median',
            'average': 'Average',
            'p50': 'p50 (50th percentile)',
            'p95': 'p95 (95th percentile)'
        };
        
        const metricName = metricLabels[metric] || metric;
        const statisticName = statisticLabels[statistic] || statistic;
        
        // For hours-based metrics, include the statistic
        if (metric === 'hours' || metric === 'avgHours') {
            return `${statisticName} ${metricName}`;
        }
        
        return metricName;
    }

    showEmptyChart() {
        if (this.chart) {
            this.chart.destroy();
        }

        this.chart = new Chart(this.ctx, {
            type: 'bar',
            data: {
                labels: ['No Data'],
                datasets: [{
                    label: 'No Data Available',
                    data: [0],
                    backgroundColor: 'rgba(200, 200, 200, 0.5)',
                    borderColor: 'rgba(200, 200, 200, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'No Data Available',
                        font: {
                            size: 16,
                            weight: 'bold'
                        }
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Date'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Value'
                        },
                        beginAtZero: true
                    }
                }
            }
        });
    }
}

// Global chart manager instance
const chartManager = new ChartManager();
