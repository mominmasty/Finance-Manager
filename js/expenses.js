export class ExpenseManager {
    constructor() {
        this.expenseForm = document.getElementById('expense-form');
        this.expensesTable = document.getElementById('expenses-table');
        
        this.initializeEventListeners();
        this.displayExpenses();
    }

    initializeEventListeners() {
        this.expenseForm.addEventListener('submit', (e) => this.addExpense(e));
    }

    addExpense(e) {
        e.preventDefault();
        const amount = parseFloat(document.getElementById('expense-amount').value);
        const category = document.getElementById('expense-category').value;
        const date = document.getElementById('expense-date').value;

        const expense = {
            id: Date.now(),
            amount,
            category,
            date,
        };

        const currentUser = localStorage.getItem('currentUser');
        const expenses = JSON.parse(localStorage.getItem(`expenses_${currentUser}`)) || [];
        expenses.push(expense);
        localStorage.setItem(`expenses_${currentUser}`, JSON.stringify(expenses));

        this.displayExpenses();
        this.expenseForm.reset();
        
        // Trigger budget update
        window.dispatchEvent(new CustomEvent('expensesUpdated'));
    }

    displayExpenses() {
        const currentUser = localStorage.getItem('currentUser');
        const expenses = JSON.parse(localStorage.getItem(`expenses_${currentUser}`)) || [];
        
        this.expensesTable.innerHTML = `
            <div class="expense-row expense-header">
                <div>Date</div>
                <div>Category</div>
                <div>Amount</div>
                <div>Actions</div>
            </div>
            ${expenses.map(expense => `
                <div class="expense-row" data-id="${expense.id}">
                    <div>${new Date(expense.date).toLocaleDateString()}</div>
                    <div>${expense.category}</div>
                    <div>₹${expense.amount.toFixed(2)}</div>
                    <div>
                        <button onclick="expenseManager.editExpense(${expense.id})">Edit</button>
                        <button onclick="expenseManager.deleteExpense(${expense.id})">Delete</button>
                    </div>
                </div>
            `).join('')}
        `;
    }

    editExpense(id) {
        const currentUser = localStorage.getItem('currentUser');
        const expenses = JSON.parse(localStorage.getItem(`expenses_${currentUser}`)) || [];
        const expense = expenses.find(e => e.id === id);

        if (!expense) return;

        const newAmount = prompt('Enter new amount:', expense.amount);
        if (newAmount === null) return;

        expense.amount = parseFloat(newAmount);
        localStorage.setItem(`expenses_${currentUser}`, JSON.stringify(expenses));
        this.displayExpenses();
        window.dispatchEvent(new CustomEvent('expensesUpdated'));
    }

    deleteExpense(id) {
        if (!confirm('Are you sure you want to delete this expense?')) return;

        const currentUser = localStorage.getItem('currentUser');
        let expenses = JSON.parse(localStorage.getItem(`expenses_${currentUser}`)) || [];
        expenses = expenses.filter(e => e.id !== id);
        localStorage.setItem(`expenses_${currentUser}`, JSON.stringify(expenses));
        
        this.displayExpenses();
        window.dispatchEvent(new CustomEvent('expensesUpdated'));
    }
}

// Initialize expense manager
window.expenseManager = new ExpenseManager();
