/**
 * PawPal Login Page - JavaScript
 * Handles user authentication (login/signup) and UI updates
 */

// Initialize auth with API mode to connect to Flask backend
let auth = new PawPalAuth({
    storageKey: 'example_app_user',
    usersKey: 'example_app_users',
    onAuthChange: updateUI,
    // Connect to Flask backend on port 5001
    apiEndpoint: 'http://localhost:5001'
});

// Initialize UI
updateUI(auth.getCurrentUser());

function updateUI(user) {
    const loginView = document.getElementById('loginView');
    const signupView = document.getElementById('signupView');
    const loggedIn = document.getElementById('loggedIn');

    if (user) {
        // User is logged in
        loginView.classList.add('hidden');
        signupView.classList.add('hidden');
        loggedIn.classList.remove('hidden');

        // Update user info
        document.getElementById('userName').textContent = user.name;
        document.getElementById('userEmail').textContent = user.email;
        document.getElementById('userSince').textContent = new Date(user.createdAt).toLocaleDateString();
    } else {
        // User is not logged in
        loginView.classList.remove('hidden');
        signupView.classList.add('hidden');
        loggedIn.classList.add('hidden');
    }
}

// Form event listeners
document.getElementById('signupForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const userData = {
        name: document.getElementById('signupName').value,
        email: document.getElementById('signupEmail').value,
        password: document.getElementById('signupPassword').value,
        confirmPassword: document.getElementById('signupConfirm').value
    };

    console.log('📝 [Signup] Starting signup...');
    const result = await auth.signup(userData);
    console.log('📝 [Signup] Result:', result);

    if (result.success) {
        auth.showMessage(`Welcome ${result.user.name}! Account created successfully.`, 'success');
        this.reset();
        // Redirect to dashboard after short delay to show success message
        setTimeout(() => {
            window.location.href = 'home.html';
        }, 1000);
    } else {
        auth.showMessage(result.error || 'Signup failed', 'error');
        console.error('📝 [Signup] Error:', result.error);
    }
});

document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const credentials = {
        email: document.getElementById('loginEmail').value,
        password: document.getElementById('loginPassword').value
    };
    
    console.log('🔑 [Login] Starting login...');
    const result = await auth.login(credentials);
    console.log('🔑 [Login] Result:', result);

    if (result.success) {
        auth.showMessage(`Welcome back, ${result.user.name}!`, 'success');
        this.reset();
        // Redirect to dashboard after short delay to show success message
        setTimeout(() => {
            window.location.href = 'home.html';
        }, 1000);
    } else {
        auth.showMessage(result.error || 'Login failed', 'error');
        console.error('🔑 [Login] Error:', result.error);
    }
});

async function handleLogout() {
    const result = await auth.logout();
    if (result.success) {
        auth.showMessage('Logged out successfully!', 'success');
    }
}

async function refreshUserData() {
    const result = await auth.refreshUser();
    if (result.success) {
        auth.showMessage('User data refreshed!', 'info');
    } else {
        auth.showMessage(result.error, 'error');
    }
}

function switchToApiMode() {
    if (confirm('Switch to API mode? This will require a Flask server running on localhost:5000')) {
        auth = new PawPalAuth({
            apiEndpoint: 'http://localhost:5000',
            onAuthChange: updateUI
        });
        document.getElementById('currentMode').textContent = 'API Mode';
        auth.showMessage('Switched to API mode. Make sure Flask server is running!', 'info');
        updateUI(null); // Reset UI
    }
}

// Demo: Log auth state changes
auth.config.onAuthChange = function(user) {
    console.log('Auth state changed:', user ? `Logged in as ${user.name}` : 'Logged out');
    updateUI(user);
};

// View switching functions
function showSignup() {
    document.getElementById('loginView').classList.add('hidden');
    document.getElementById('signupView').classList.remove('hidden');
}

function showLogin() {
    document.getElementById('signupView').classList.add('hidden');
    document.getElementById('loginView').classList.remove('hidden');
}
