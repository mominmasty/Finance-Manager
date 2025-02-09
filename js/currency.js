class CurrencyConverter {
    constructor() {
        this.API_KEY = 'cur_live_hG84kRlaxy2IzHm3Bd5zwMQyp6elfRduzr2zvUdF';
        this.BASE_URL = 'https://api.currencyapi.com/v3';
        
        // Get DOM elements
        this.amountInput = document.getElementById('amount');
        this.fromCurrency = document.getElementById('fromCurrency');
        this.toCurrency = document.getElementById('toCurrency');
        this.convertBtn = document.getElementById('convert-btn');
        this.resultDisplay = document.getElementById('result');

        // Ensure all required elements are available
        if (this.amountInput && this.fromCurrency && this.toCurrency && this.convertBtn && this.resultDisplay) {
            this.initializeEventListeners();
        } else {
            console.error('Missing required DOM elements for currency conversion');
        }
    }

    initializeEventListeners() {
        this.convertBtn.addEventListener('click', () => this.convertCurrency());
        this.amountInput.addEventListener('input', () => {
            if (this.amountInput.value) {
                this.convertCurrency();
            }
        });
    }

    async convertCurrency() {
        try {
            const amount = parseFloat(this.amountInput.value);
            if (isNaN(amount) || amount <= 0) {
                this.resultDisplay.innerHTML = `
                    <span class="amount">0.00</span>
                    <span class="currency">${this.toCurrency.value}</span>
                `;
                return;
            }

            const response = await fetch(`${this.BASE_URL}/latest?apikey=${this.API_KEY}&base_currency=${this.fromCurrency.value}&currencies=${this.toCurrency.value}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('API request failed');
            }

            const data = await response.json();
            
            if (data && data.data && data.data[this.toCurrency.value]) {
                const rate = data.data[this.toCurrency.value].value;
                const convertedAmount = (amount * rate).toFixed(2);
                
                // Update result display
                this.resultDisplay.innerHTML = `
                    <span class="amount">${convertedAmount}</span>
                    <span class="currency">${this.toCurrency.value}</span>
                `;
            } else {
                throw new Error('Invalid API response format');
            }
        } catch (error) {
            console.error('Currency conversion error:', error);
            this.resultDisplay.innerHTML = `
                <span class="amount error">Error</span>
            `;
        }
    }
}

// Initialize currency converter after DOM content is loaded
document.addEventListener('DOMContentLoaded', function () {
    const currencyConverter = new CurrencyConverter();
});
