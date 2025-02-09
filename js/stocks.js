export class StockManager {
    constructor() {
        this.apiKey = 'e5f7948fc2msh686590e3490ead7p1c1efbjsn4e7298afa7c4';
        this.searchBtn = document.getElementById('search-stock-btn');
        this.stockSymbolInput = document.getElementById('stock-symbol');
        this.stockData = document.getElementById('stock-data');
        this.stockChart = document.getElementById('stock-chart');
        
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        if (this.searchBtn) {
            this.searchBtn.addEventListener('click', () => this.searchStock());
        } else {
            console.error('Search button not found');
        }
    }

    async searchStock() {
        const symbol = this.stockSymbolInput.value.toUpperCase();
        if (!symbol) return;

        try {
            this.stockData.innerHTML = `
                <div class="loader-container">
                    <div class="loader">
                        <span class="flask" style="--i:0"></span>
                        <span class="flask" style="--i:1"></span>
                        <span class="flask" style="--i:2"></span>
                        <span class="flask" style="--i:3"></span>
                        <span class="flask" style="--i:4"></span>
                    </div>
                </div>
            `;
            
            const url = `https://alpha-vantage.p.rapidapi.com/query?function=TIME_SERIES_DAILY&symbol=${symbol}&outputsize=compact&datatype=json`;
            const options = {
                method: 'GET',
                headers: {
                    'x-rapidapi-key': this.apiKey,
                    'x-rapidapi-host': 'alpha-vantage.p.rapidapi.com'
                }
            };

            const response = await fetch(url, options);
            if (!response.ok) {
                throw new Error('Failed to fetch stock data');
            }
            const data = await response.json();

            if (data['Error Message']) {
                throw new Error('Invalid stock symbol');
            }

            if (data['Note']) {
                throw new Error('API call frequency limit reached. Please try again later.');
            }

            this.displayStockData(data);
            this.createStockChart(data);
        } catch (error) {
            this.stockData.innerHTML = `<div class="error">${error.message}</div>`;
            if (window.stockLineChart) {
                window.stockLineChart.destroy();
            }
        }
    }

    displayStockData(data) {
        const timeSeries = data['Time Series (Daily)'];
        const metadata = data['Meta Data'];
        if (!timeSeries || !metadata) {
            throw new Error('No data available for this stock symbol');
        }

        const latestDate = metadata['3. Last Refreshed'];
        const latestData = timeSeries[latestDate];
        const previousDate = Object.keys(timeSeries)[1];
        const previousData = timeSeries[previousDate];

        const currentPrice = parseFloat(latestData['4. close']);
        const previousPrice = parseFloat(previousData['4. close']);
        const priceChange = currentPrice - previousPrice;
        const percentChange = (priceChange / previousPrice) * 100;
        const volume = parseInt(latestData['5. volume']);
        const formattedVolume = volume >= 1000000 
            ? (volume / 1000000).toFixed(2) + 'M' 
            : volume >= 1000 
                ? (volume / 1000).toFixed(2) + 'K' 
                : volume;

        this.stockData.innerHTML = `
            <div class="stock-card">
                <div class="stock-header">
                    <div class="stock-title">
                        <h2>${metadata['2. Symbol']}</h2>
                        <span class="stock-date">Last Updated: ${new Date(latestDate).toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                        })}</span>
                    </div>
                    <div class="stock-price-container">
                        <div class="main-price">
                            <h1>₹${currentPrice.toFixed(2)}</h1>
                            <div class="price-change ${priceChange >= 0 ? 'positive' : 'negative'}">
                                <span class="change-amount">₹${Math.abs(priceChange).toFixed(2)}</span>
                                <span class="change-percent">(${Math.abs(percentChange).toFixed(2)}%)</span>
                                <span class="change-icon">${priceChange >= 0 ? '↑' : '↓'}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="stock-metrics">
                    <div class="metric-card">
                        <span class="metric-label">Open</span>
                        <span class="metric-value">₹${parseFloat(latestData['1. open']).toFixed(2)}</span>
                    </div>
                    <div class="metric-card">
                        <span class="metric-label">High</span>
                        <span class="metric-value">₹${parseFloat(latestData['2. high']).toFixed(2)}</span>
                    </div>
                    <div class="metric-card">
                        <span class="metric-label">Low</span>
                        <span class="metric-value">₹${parseFloat(latestData['3. low']).toFixed(2)}</span>
                    </div>
                    <div class="metric-card">
                        <span class="metric-label">Volume</span>
                        <span class="metric-value">${formattedVolume}</span>
                    </div>
                </div>
            </div>
        `;
    }

    createStockChart(data) {
        const timeSeries = data['Time Series (Daily)'];
        if (!timeSeries) {
            throw new Error('No historical data available');
        }

        const dates = Object.keys(timeSeries).slice(0, 30).reverse();
        const prices = dates.map(date => ({
            close: parseFloat(timeSeries[date]['4. close']),
            high: parseFloat(timeSeries[date]['2. high']),
            low: parseFloat(timeSeries[date]['3. low'])
        }));

        if (window.stockLineChart) {
            window.stockLineChart.destroy();
        }

        window.stockLineChart = new Chart(this.stockChart, {
            type: 'line',
            data: {
                labels: dates.map(date => new Date(date).toLocaleDateString()),
                datasets: [{
                    label: 'Stock Price',
                    data: prices.map(price => price.close),
                    borderColor: '#007bff',
                    backgroundColor: 'rgba(0, 123, 255, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const price = prices[context.dataIndex];
                                return [
                                    `Close: ₹${price.close.toFixed(2)}`,
                                    `High: ₹${price.high.toFixed(2)}`,
                                    `Low: ₹${price.low.toFixed(2)}`
                                ];
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        ticks: {
                            maxRotation: 45,
                            minRotation: 45
                        }
                    },
                    y: {
                        beginAtZero: false,
                        ticks: {
                            callback: function(value) {
                                return '₹' + value.toFixed(2);
                            }
                        }
                    }
                }
            }
        });
    }
}

// Initialize stock manager after DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    const stockManager = new StockManager();
});
