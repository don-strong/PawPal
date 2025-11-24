/**
 * PawPal Auth Module - Reusable Authentication Library
 * Can be used with localStorage (demo) or API backend (production)
 */
class PawPalAuth {
  constructor(options = {}) {
    this.config = {
      apiEndpoint: options.apiEndpoint || null, // Set to enable API mode
      storageKey: options.storageKey || 'pawpal_user',
      usersKey: options.usersKey || 'pawpal_users',
      onAuthChange: options.onAuthChange || (() => {}),
      apiHeaders: options.apiHeaders || {},
      validatePassword: options.validatePassword || this.defaultPasswordValidator,
      validateEmail: options.validateEmail || this.defaultEmailValidator
    };
    
    this.currentUser = this.getCurrentUser();
    this.isApiMode = !!this.config.apiEndpoint;
  }

  // ==================== PUBLIC API ====================

  /**
   * Sign up a new user
   * @param {Object} userData - {name, email, password, confirmPassword}
   * @returns {Promise<Object>} - {success: boolean, user?: Object, error?: string}
   */
  async signup(userData) {
    try {
      // Validation
      const validation = this.validateSignupData(userData);
      if (!validation.isValid) {
        return { success: false, error: validation.error };
      }

      if (this.isApiMode) {
        return await this.apiSignup(userData);
      } else {
        return this.localSignup(userData);
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Log in an existing user
   * @param {Object} credentials - {email, password}
   * @returns {Promise<Object>} - {success: boolean, user?: Object, error?: string}
   */
  async login(credentials) {
    try {
      const { email, password } = credentials;
      
      if (!email || !password) {
        return { success: false, error: 'Email and password are required.' };
      }

      if (this.isApiMode) {
        return await this.apiLogin(credentials);
      } else {
        return this.localLogin(credentials);
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Log out the current user
   * @returns {Promise<Object>} - {success: boolean}
   */
  async logout() {
    try {
      if (this.isApiMode) {
        await this.apiLogout();
      }
      
      this.clearLocalUser();
      this.currentUser = null;
      this.config.onAuthChange(null);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Get current authenticated user
   * @returns {Object|null} - User object or null
   */
  getCurrentUser() {
    try {
      const userData = localStorage.getItem(this.config.storageKey);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Check if user is authenticated
   * @returns {boolean}
   */
  isAuthenticated() {
    return !!this.getCurrentUser();
  }

  /**
   * Refresh user data from API (if in API mode)
   * @returns {Promise<Object>} - {success: boolean, user?: Object, error?: string}
   */
  async refreshUser() {
    if (!this.isApiMode || !this.currentUser) {
      return { success: true, user: this.currentUser };
    }

    try {
      const response = await this.apiRequest('/auth/me', 'GET');
      if (response.ok) {
        const userData = await response.json();
        this.saveLocalUser(userData);
        this.currentUser = userData;
        this.config.onAuthChange(userData);
        return { success: true, user: userData };
      } else {
        await this.logout();
        return { success: false, error: 'Session expired' };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // ==================== VALIDATION ====================

  validateSignupData(userData) {
    const { name, email, password, confirmPassword } = userData;

    if (!name || !email || !password || !confirmPassword) {
      return { isValid: false, error: 'All fields are required.' };
    }

    const emailValidation = this.config.validateEmail(email);
    if (!emailValidation.isValid) {
      return emailValidation;
    }

    const passwordValidation = this.config.validatePassword(password);
    if (!passwordValidation.isValid) {
      return passwordValidation;
    }

    if (password !== confirmPassword) {
      return { isValid: false, error: 'Passwords do not match.' };
    }

    return { isValid: true };
  }

  defaultEmailValidator(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { isValid: false, error: 'Please enter a valid email address.' };
    }
    return { isValid: true };
  }

  defaultPasswordValidator(password) {
    if (password.length < 6) {
      return { isValid: false, error: 'Password must be at least 6 characters long.' };
    }
    return { isValid: true };
  }

  // ==================== LOCAL STORAGE MODE ====================

  localSignup(userData) {
    const { name, email, password } = userData;
    
    // Check if user already exists
    const existingUsers = this.getStoredUsers();
    if (existingUsers.find(u => u.email === email)) {
      return { success: false, error: 'An account with this email already exists.' };
    }

    // Create new user
    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      createdAt: new Date().toISOString()
    };

    // Save to users list (password stored separately for demo)
    existingUsers.push({ ...newUser, password });
    localStorage.setItem(this.config.usersKey, JSON.stringify(existingUsers));

    // Log in the user
    this.saveLocalUser(newUser);
    this.currentUser = newUser;
    this.config.onAuthChange(newUser);

    return { success: true, user: newUser };
  }

  localLogin(credentials) {
    const { email, password } = credentials;
    
    const existingUsers = this.getStoredUsers();
    const user = existingUsers.find(u => u.email === email && u.password === password);

    if (user) {
      const { password: _, ...userWithoutPassword } = user;
      this.saveLocalUser(userWithoutPassword);
      this.currentUser = userWithoutPassword;
      this.config.onAuthChange(userWithoutPassword);
      return { success: true, user: userWithoutPassword };
    } else {
      return { success: false, error: 'Invalid email or password.' };
    }
  }

  getStoredUsers() {
    try {
      return JSON.parse(localStorage.getItem(this.config.usersKey)) || [];
    } catch (error) {
      return [];
    }
  }

  // ==================== API MODE ====================

  async apiSignup(userData) {
    const response = await this.apiRequest('/auth/signup', 'POST', userData);
    const result = await response.json();
    
    if (response.ok) {
      this.saveLocalUser(result.user);
      this.currentUser = result.user;
      this.config.onAuthChange(result.user);
      return { success: true, user: result.user };
    } else {
      return { success: false, error: result.error || 'Signup failed' };
    }
  }

  async apiLogin(credentials) {
    const response = await this.apiRequest('/auth/login', 'POST', credentials);
    const result = await response.json();
    
    if (response.ok) {
      this.saveLocalUser(result.user);
      this.currentUser = result.user;
      this.config.onAuthChange(result.user);
      return { success: true, user: result.user };
    } else {
      return { success: false, error: result.error || 'Login failed' };
    }
  }

  async apiLogout() {
    try {
      await this.apiRequest('/auth/logout', 'POST');
    } catch (error) {
      console.warn('Logout API call failed:', error);
    }
  }

  async apiRequest(endpoint, method = 'GET', data = null) {
    const url = `${this.config.apiEndpoint}${endpoint}`;
    
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...this.config.apiHeaders
      }
    };

    // Add auth token if available
    const user = this.getCurrentUser();
    if (user && user.token) {
      options.headers.Authorization = `Bearer ${user.token}`;
    }

    if (data) {
      options.body = JSON.stringify(data);
    }

    // Log the outgoing API request, including method, URL, and any dataor headers bneing sent.
    // This helps with debugging and monitoring API interactions.
    console.log(`🔵 [API Request] ${method} ${url}`, { data, headers: options.headers });
    
    try {
      const response = await fetch(url, options);
      console.log(`🟢 [API Response] ${method} ${url} - Status: ${response.status}`, response);
      
      // returns the raw response for further processing
      return response;
    } catch (error) {
      
      // Log the error details for debugging
      console.error(`🔴 [API Error] ${method} ${url} - ${error.message}`, error);
      throw error;
    }
  }

  // ==================== HELPERS ====================

  saveLocalUser(user) {
    localStorage.setItem(this.config.storageKey, JSON.stringify(user));
  }

  clearLocalUser() {
    localStorage.removeItem(this.config.storageKey);
  }

  // ==================== UI HELPERS ====================

  /**
   * Create a simple notification system
   * @param {string} message 
   * @param {string} type - 'success' | 'error' | 'info'
   */
  showMessage(message, type = 'info') {
    // Remove existing message
    const existingMessage = document.querySelector('.auth-message-toast');
    if (existingMessage) {
      existingMessage.remove();
    }

    // Create message element
    const messageEl = document.createElement('div');
    messageEl.className = `auth-message-toast auth-message-${type}`;
    messageEl.textContent = message;
    
    // Add styles
    Object.assign(messageEl.style, {
      position: 'fixed',
      top: '20px',
      right: '20px',
      padding: '16px 20px',
      borderRadius: '8px',
      color: 'white',
      fontWeight: '500',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      zIndex: '1100',
      transform: 'translateX(100%)',
      transition: 'transform 0.3s ease',
      maxWidth: '400px',
      wordWrap: 'break-word',
      background: type === 'success' ? '#51cf66' : type === 'error' ? '#ff6b6b' : '#3b5998'
    });
    
    // Add to page
    document.body.appendChild(messageEl);
    
    // Show with animation
    setTimeout(() => {
      messageEl.style.transform = 'translateX(0)';
    }, 100);
    
    // Auto-remove after 4 seconds
    setTimeout(() => {
      messageEl.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (messageEl.parentNode) {
          messageEl.remove();
        }
      }, 300);
    }, 4000);
  }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PawPalAuth;
} else if (typeof window !== 'undefined') {
  window.PawPalAuth = PawPalAuth;
}