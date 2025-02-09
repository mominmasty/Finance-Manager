export class BudgetManager {
    constructor() {
        this.budget = 0;
        this.totalExpenses = 0;
        this.budgetBar = document.getElementById('budget-bar');
        this.budgetPercentage = document.getElementById('budget-percentage');
        this.budgetSpent = document.getElementById('budget-spent');
        this.budgetRemaining = document.getElementById('budget-remaining');
        this.budgetWarning = document.getElementById('budget-warning');

        // Get input elements
        this.budgetInput = document.getElementById('budget-input');
        this.setBudgetBtn = document.getElementById('set-budget-btn');

        // Load saved budget and expenses from localStorage
        this.initializeBudget();

        // Event listener for setting budget
        this.setBudgetBtn.addEventListener('click', () => {
            const budgetAmount = this.budgetInput.value;
            if (budgetAmount && !isNaN(budgetAmount) && budgetAmount > 0) {
                this.setBudget(budgetAmount);
                this.budgetInput.value = ''; // Clear input after setting budget
            } else {
                alert('Please enter a valid budget amount.');
            }
        });

        // Add event listener for expense updates
        window.addEventListener('expensesUpdated', () => {
            this.recalculateExpenses();
        });
    }

    initializeBudget() {
        const savedBudget = localStorage.getItem('monthlyBudget');
        const savedExpenses = localStorage.getItem('totalExpenses');

        if (savedBudget) {
            this.budget = parseFloat(savedBudget);
        }

        if (savedExpenses) {
            this.totalExpenses = parseFloat(savedExpenses);
        }

        this.updateBudgetDisplay();
    }

    setBudget(amount) {
        this.budget = parseFloat(amount);
        localStorage.setItem('monthlyBudget', this.budget.toString());
        this.updateBudgetDisplay();
    }

    addExpense(amount) {
        this.totalExpenses += parseFloat(amount);
        localStorage.setItem('totalExpenses', this.totalExpenses.toString()); // Save to localStorage
        this.updateBudgetDisplay();
    }

    updateBudgetDisplay() {
        if (!this.budgetBar) return;

        if (this.budget === 0) {
            this.budgetBar.style.width = '0%';
            this.budgetPercentage.textContent = '0%';
            return;
        }

        const percentage = (this.totalExpenses / this.budget) * 100;
        const isOverBudget = this.totalExpenses > this.budget;

        // Update progress bar width (max 100%)
        this.budgetBar.style.width = `${Math.min(percentage, 100)}%`;

        // Update percentage text
        this.budgetPercentage.textContent = `${percentage.toFixed(1)}%`;

        // Update budget numbers
        this.budgetSpent.textContent = `Spent: ₹${this.totalExpenses.toLocaleString()}`;
        const remaining = this.budget - this.totalExpenses;
        this.budgetRemaining.textContent = `${isOverBudget ? 'Over Budget: ' : 'Remaining: '}₹${Math.abs(remaining).toLocaleString()}`;

        // Update warning message
        if (this.budgetWarning) {
            if (isOverBudget) {
                this.budgetWarning.textContent = `⚠️ You are ₹${Math.abs(remaining).toLocaleString()} over budget!`;
                this.budgetWarning.style.display = 'block';
                this.budgetWarning.className = 'budget-warning danger shake';
            } else if (percentage >= 90) {
                this.budgetWarning.textContent = '⚠️ Warning: Nearly at budget limit!';
                this.budgetWarning.style.display = 'block';
                this.budgetWarning.className = 'budget-warning warning';
            } else if (percentage >= 75) {
                this.budgetWarning.textContent = '⚠️ Note: Approaching budget limit';
                this.budgetWarning.style.display = 'block';
                this.budgetWarning.className = 'budget-warning caution';
            } else {
                this.budgetWarning.style.display = 'none';
            }
        }

        // Update colors based on budget usage
        if (isOverBudget) {
            this.budgetBar.className = 'budget-progress-bar danger shake';
            this.budgetRemaining.className = 'budget-remaining danger';
        } else if (percentage >= 75) {
            this.budgetBar.className = 'budget-progress-bar warning';
            this.budgetRemaining.className = 'budget-remaining warning';
            if (percentage >= 90) {
                this.budgetBar.classList.add('pulse-warning');
            }
        } else {
            this.budgetBar.className = 'budget-progress-bar safe';
            this.budgetRemaining.className = 'budget-remaining';
        }
    }

    reset() {
        this.totalExpenses = 0;
        localStorage.removeItem('totalExpenses'); // Clear stored expenses
        this.updateBudgetDisplay();
    }

    recalculateExpenses() {
        const currentUser = localStorage.getItem('currentUser');
        const expenses = JSON.parse(localStorage.getItem(`expenses_${currentUser}`)) || [];
        this.totalExpenses = expenses.reduce((total, expense) => total + expense.amount, 0);
        localStorage.setItem('totalExpenses', this.totalExpenses.toString()); // Save to localStorage
        this.updateBudgetDisplay();
    }
}

// Initialize the BudgetManager class
const budget = new BudgetManager();