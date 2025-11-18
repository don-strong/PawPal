/**
 * PawPal Dashboard Page - JavaScript
 * Handles dashboard functionality and logout
 */

// Initialize auth
let auth = new PawPalAuth({
  storageKey: 'example_app_user',
  usersKey: 'example_app_users'
});

// Check if user is logged in
const currentUser = auth.getCurrentUser();
if (!currentUser) {
  // Redirect to login if not authenticated
  window.location.href = 'modular-login.html';
}

// Logout function
async function handleLogout() {
  const result = await auth.logout();
  if (result.success) {
    window.location.href = 'modular-login.html';
  }
}
