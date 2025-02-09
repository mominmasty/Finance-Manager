export class ExportManager {
    constructor() {
        this.csvBtn = document.getElementById('export-csv');
        this.pdfBtn = document.getElementById('export-pdf');
        
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        this.csvBtn.addEventListener('click', () => this.exportToCSV());
    }

    exportToCSV() {
        const currentUser = localStorage.getItem('currentUser');
        const expenses = JSON.parse(localStorage.getItem(`expenses_${currentUser}`)) || [];
        
        const csvContent = [
            ['Date', 'Category', 'Amount'],
            ...expenses.map(expense => [
                new Date(expense.date).toLocaleDateString(),
                expense.category,
                expense.amount
            ])
        ].map(row => row.join(',')).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'expenses.csv';
        a.click();
        window.URL.revokeObjectURL(url);
    }

    exportToPDF() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        const currentUser = localStorage.getItem('currentUser');
        const expenses = JSON.parse(localStorage.getItem(`expenses_${currentUser}`)) || [];
        
        doc.text('Expense Report', 20, 20);
        
        let yPos = 40;
        expenses.forEach(expense => {
            const line = `${new Date(expense.date).toLocaleDateString()} - ${expense.category}: ₹${expense.amount}`;
            doc.text(line, 20, yPos);
            yPos += 10;
            
            if (yPos > 280) {
                doc.addPage();
                yPos = 20;
            }
        });

        doc.save('expense_report.pdf');
    }
}

// Initialize export manager
const exportManager = new ExportManager();
