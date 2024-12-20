const socket = io.connect('http://127.0.0.1:5000'); // Connect to the Flask server via Socket.IO

const ctxTemperature = document.getElementById('temperatureChart').getContext('2d');
const ctxPressure = document.getElementById('pressureChart').getContext('2d');
const ctxGas = document.getElementById('gasChart').getContext('2d');

// Initialize empty data for the charts
let temperatureData = [];
let pressureData = [];
let gasData = [];
let labels = [];

// Chart.js Configuration
const temperatureChart = new Chart(ctxTemperature, {
    type: 'line',
    data: {
        labels: labels, // Time/Period labels
        datasets: [{
            label: 'Temperature (°C)',
            data: temperatureData,
            borderColor: 'rgb(255, 99, 132)',
            fill: false,
            tension: 0.1
        }]
    },
    options: {
        responsive: true,
        interaction: {
            mode: 'nearest',
            axis: 'x',
            intersect: false,
        },
        plugins: {
            tooltip: {
                callbacks: {
                    label: function(tooltipItem) {
                        return `Temperature: ${tooltipItem.raw}°C`;
                    }
                }
            }
        }
    }
});

const pressureChart = new Chart(ctxPressure, {
    type: 'bar',
    data: {
        labels: labels,
        datasets: [{
            label: 'Pressure (PSI)',
            data: pressureData,
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1
        }]
    },
    options: {
        responsive: true,
        interaction: {
            mode: 'index',
            intersect: false,
        },
        plugins: {
            tooltip: {
                callbacks: {
                    label: function(tooltipItem) {
                        return `Pressure: ${tooltipItem.raw} PSI`;
                    }
                }
            }
        }
    }
});

const gasChart = new Chart(ctxGas, {
    type: 'radar',
    data: {
        labels: labels,
        datasets: [{
            label: 'Gas Level (ppm)',
            data: gasData,
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1
        }]
    },
    options: {
        responsive: true,
        scales: {
            r: {
                angleLines: { display: false },
                suggestedMin: 0,
                suggestedMax: 20
            }
        },
        plugins: {
            tooltip: {
                callbacks: {
                    label: function(tooltipItem) {
                        return `Gas Level: ${tooltipItem.raw} ppm`;
                    }
                }
            }
        }
    }
});

// Listen for 'sensor_data' from the Flask backend
socket.on('sensor_data', function(data) {
    // Update the data arrays with the new sensor data
    temperatureData.push(data.temperature);
    pressureData.push(data.pressure);
    gasData.push(data.gas);

    // Update the labels for time/period
    labels.push(new Date().toLocaleTimeString());

    // Limit the data arrays to the latest 7 data points
    if (temperatureData.length > 7) {
        temperatureData.shift();
        pressureData.shift();
        gasData.shift();
        labels.shift();
    }

    // Update the charts with the new data
    temperatureChart.update();
    pressureChart.update();
    gasChart.update();
});
