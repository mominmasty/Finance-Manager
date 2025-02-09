export class Auth {
    constructor() {
        this.loginForm = document.getElementById('login-form');
        this.signupForm = document.getElementById('signup-form');
        this.showSignupLink = document.getElementById('show-signup');
        this.showLoginLink = document.getElementById('show-login');
        this.logoutBtn = document.getElementById('logout-btn');
        
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        this.loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        this.signupForm.addEventListener('submit', (e) => this.handleSignup(e));
        this.showSignupLink.addEventListener('click', () => this.toggleForms());
        this.showLoginLink.addEventListener('click', () => this.toggleForms());
        this.logoutBtn.addEventListener('click', () => this.handleLogout());
    }

    toggleForms() {
        this.loginForm.style.display = 
            this.loginForm.style.display === 'none' ? 'block' : 'none';
        this.signupForm.style.display = 
            this.signupForm.style.display === 'none' ? 'block' : 'none';
    }

    handleLogin(e) {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        
        const users = JSON.parse(localStorage.getItem('users')) || {};
        
        if (users[email] && users[email].password === password) {
            localStorage.setItem('currentUser', email);
            this.showApp();
        } else {
            alert('Invalid credentials');
        }
    }

    handleSignup(e) {
        e.preventDefault();
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        const confirmPassword = document.getElementById('signup-confirm-password').value;

        if (password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }

        const users = JSON.parse(localStorage.getItem('users')) || {};
        
        if (users[email]) {
            alert('User already exists');
            return;
        }

        users[email] = { password };
        localStorage.setItem('users', JSON.stringify(users));
        alert('Signup successful! Please login.');
        this.toggleForms();
    }

    handleLogout() {
        localStorage.removeItem('currentUser');
        document.getElementById('auth-container').style.display = 'block';
        document.getElementById('app-container').style.display = 'none';
    }

    showApp() {
        document.getElementById('auth-container').style.display = 'none';
        document.getElementById('app-container').style.display = 'block';
    }

    checkAuth() {
        const currentUser = localStorage.getItem('currentUser');
        if (currentUser) {
            this.showApp();
        }
    }
}

// Initialize auth
const auth = new Auth();
auth.checkAuth();