// Complete Authentication System
class AuthSystem {
    constructor() {
        this.isLoggedIn = false;
        this.currentUser = null;
        this.users = this.loadUsers();
        this.init();
    }

    init() {
        this.checkExistingSession();
        this.bindAuthEvents();
    }

    loadUsers() {
        const storedUsers = localStorage.getItem('safecampus_users');
        if (storedUsers) {
            return JSON.parse(storedUsers);
        }
        
        // Default demo users
        return [
            {
                id: 1,
                name: 'Demo Student',
                email: 'student@campus.edu',
                phone: '+1 (555) 123-4567',
                password: this.hashPassword('password123'),
                role: 'student',
                memberSince: '2024-01-15',
                emergencyContacts: [
                    {
                        name: 'Parent',
                        phone: '+1 (555) 111-2222',
                        relationship: 'parent'
                    }
                ],
                stats: {
                    sosCount: 0,
                    alertsSent: 0,
                    totalResponseTime: 0
                }
            },
            {
                id: 2,
                name: 'Campus Security',
                email: 'security@campus.edu',
                phone: '+1 (555) 987-6543',
                password: this.hashPassword('secure123'),
                role: 'security',
                memberSince: '2024-01-10',
                emergencyContacts: [
                    {
                        name: 'Security Head',
                        phone: '+1 (555) 333-4444',
                        relationship: 'colleague'
                    }
                ],
                stats: {
                    sosCount: 12,
                    alertsSent: 8,
                    totalResponseTime: 45
                }
            }
        ];
    }

    saveUsers() {
        localStorage.setItem('safecampus_users', JSON.stringify(this.users));
    }

    hashPassword(password) {
        // Simple hash for demo purposes - in production use proper hashing
        return btoa(password);
    }

    checkExistingSession() {
        const session = localStorage.getItem('safecampus_session');
        if (session) {
            const sessionData = JSON.parse(session);
            if (sessionData.expires > Date.now()) {
                this.currentUser = sessionData.user;
                this.isLoggedIn = true;
                this.updateUI();
            } else {
                localStorage.removeItem('safecampus_session');
            }
        }
    }

    bindAuthEvents() {
        // Login form submission
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Signup form submission
        const signupForm = document.getElementById('signupForm');
        if (signupForm) {
            signupForm.addEventListener('submit', (e) => this.handleSignup(e));
            
            // Password strength checker
            const passwordInput = document.getElementById('signupPassword');
            if (passwordInput) {
                passwordInput.addEventListener('input', (e) => this.checkPasswordStrength(e.target.value));
            }

            // Confirm password validation
            const confirmPasswordInput = document.getElementById('signupConfirmPassword');
            if (confirmPasswordInput) {
                confirmPasswordInput.addEventListener('input', () => this.validatePasswordMatch());
            }
        }

        // Modal switching
        document.addEventListener('click', (e) => {
            if (e.target.id === 'switchToSignup' || e.target.closest('#switchToSignup')) {
                e.preventDefault();
                this.switchToSignup();
            }
            
            if (e.target.id === 'switchToLogin' || e.target.closest('#switchToLogin')) {
                e.preventDefault();
                this.switchToLogin();
            }
            
            if (e.target.id === 'closeLogin' || e.target.closest('#closeLogin')) {
                e.preventDefault();
                this.closeLoginModal();
            }
            
            if (e.target.id === 'closeSignup' || e.target.closest('#closeSignup')) {
                e.preventDefault();
                this.closeSignupModal();
            }

            // Profile modal close buttons
            if (e.target.id === 'closeProfileModal' || e.target.closest('#closeProfileModal')) {
                e.preventDefault();
                this.closeProfileModal();
            }

            if (e.target.id === 'cancelEditProfile' || e.target.closest('#cancelEditProfile')) {
                e.preventDefault();
                this.closeEditProfileModal();
            }

            if (e.target.id === 'closeContactsModal' || e.target.closest('#closeContactsModal')) {
                e.preventDefault();
                this.closeManageContactsModal();
            }
            
            // Close modals when clicking outside
            if (e.target.classList.contains('modal')) {
                this.closeAllModals();
            }
        });

        // Logout
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }

        // Profile editing
        const editProfileBtn = document.getElementById('editProfileBtn');
        if (editProfileBtn) {
            editProfileBtn.addEventListener('click', () => this.openEditProfileModal());
        }

        // Refresh profile
        const refreshProfileBtn = document.getElementById('refreshProfileBtn');
        if (refreshProfileBtn) {
            refreshProfileBtn.addEventListener('click', () => this.refreshProfileData());
        }

        // Manage contacts
        const manageContactsBtn = document.getElementById('manageContactsBtn');
        if (manageContactsBtn) {
            manageContactsBtn.addEventListener('click', () => this.openManageContactsModal());
        }

        // User avatar click
        document.addEventListener('click', (e) => {
            if (e.target.closest('.user-avatar')) {
                this.showProfileModal();
            }
        });

        // Edit profile form submission
        const editProfileForm = document.getElementById('editProfileForm');
        if (editProfileForm) {
            editProfileForm.addEventListener('submit', (e) => this.handleEditProfile(e));
        }

        // Add contact form submission
        const addContactForm = document.getElementById('addContactForm');
        if (addContactForm) {
            addContactForm.addEventListener('submit', (e) => this.handleAddContact(e));
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        const rememberMe = document.getElementById('rememberMe').checked;

        try {
            const result = await this.login(email, password, rememberMe);
            if (result.success) {
                this.showNotification('Login successful!', 'success');
                this.closeLoginModal();
                this.updateUI();
            } else {
                this.showNotification(result.message, 'error');
            }
        } catch (error) {
            this.showNotification('Login failed. Please try again.', 'error');
        }
    }

    async handleSignup(e) {
        e.preventDefault();
        
        const name = document.getElementById('signupName').value;
        const email = document.getElementById('signupEmail').value;
        const phone = document.getElementById('signupPhone').value;
        const password = document.getElementById('signupPassword').value;
        const confirmPassword = document.getElementById('signupConfirmPassword').value;
        const userType = document.getElementById('userType').value;
        const agreeTerms = document.getElementById('agreeTerms').checked;

        // Validation
        if (password !== confirmPassword) {
            this.showNotification('Passwords do not match!', 'error');
            return;
        }

        if (!agreeTerms) {
            this.showNotification('Please agree to the terms and conditions.', 'error');
            return;
        }

        const userData = {
            name,
            email,
            phone,
            password,
            role: userType
        };

        try {
            const result = await this.signup(userData);
            if (result.success) {
                this.showNotification('Account created successfully!', 'success');
                this.closeSignupModal();
                this.updateUI();
            } else {
                this.showNotification(result.message, 'error');
            }
        } catch (error) {
            this.showNotification('Signup failed. Please try again.', 'error');
        }
    }

    async login(email, password, rememberMe = false) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const user = this.users.find(u => u.email === email && u.password === this.hashPassword(password));
                
                if (user) {
                    this.isLoggedIn = true;
                    this.currentUser = { ...user };
                    delete this.currentUser.password; // Don't store password in session
                    
                    // Create session
                    const sessionData = {
                        user: this.currentUser,
                        expires: rememberMe ? Date.now() + (30 * 24 * 60 * 60 * 1000) : Date.now() + (2 * 60 * 60 * 1000) // 30 days or 2 hours
                    };
                    
                    localStorage.setItem('safecampus_session', JSON.stringify(sessionData));
                    
                    resolve({ success: true, user: this.currentUser });
                } else {
                    resolve({ success: false, message: 'Invalid email or password' });
                }
            }, 1000);
        });
    }

    async signup(userData) {
        return new Promise((resolve) => {
            setTimeout(() => {
                // Check if email already exists
                if (this.users.find(u => u.email === userData.email)) {
                    resolve({ success: false, message: 'Email already registered' });
                    return;
                }

                const newUser = {
                    id: Date.now(),
                    name: userData.name,
                    email: userData.email,
                    phone: userData.phone,
                    password: this.hashPassword(userData.password),
                    role: userData.role,
                    memberSince: new Date().toISOString().split('T')[0],
                    emergencyContacts: [],
                    stats: {
                        sosCount: 0,
                        alertsSent: 0,
                        totalResponseTime: 0
                    }
                };

                this.users.push(newUser);
                this.saveUsers();

                // Auto-login after signup
                this.isLoggedIn = true;
                this.currentUser = { ...newUser };
                delete this.currentUser.password;

                const sessionData = {
                    user: this.currentUser,
                    expires: Date.now() + (2 * 60 * 60 * 1000) // 2 hours
                };
                
                localStorage.setItem('safecampus_session', JSON.stringify(sessionData));

                resolve({ success: true, user: this.currentUser });
            }, 1500);
        });
    }

    logout() {
        this.isLoggedIn = false;
        this.currentUser = null;
        localStorage.removeItem('safecampus_session');
        this.showNotification('Logged out successfully', 'success');
        this.updateUI();
        this.closeAllModals();
    }

    checkPasswordStrength(password) {
        const strengthBar = document.querySelector('.password-strength');
        const strengthText = document.querySelector('.strength-text');
        
        if (!password) {
            strengthBar.className = 'password-strength';
            strengthText.textContent = 'Password strength';
            return;
        }

        let strength = 0;
        if (password.length >= 8) strength++;
        if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength++;
        if (password.match(/\d/)) strength++;
        if (password.match(/[^a-zA-Z\d]/)) strength++;

        switch (strength) {
            case 0:
            case 1:
                strengthBar.className = 'password-strength weak';
                strengthText.textContent = 'Weak password';
                break;
            case 2:
                strengthBar.className = 'password-strength medium';
                strengthText.textContent = 'Medium strength';
                break;
            case 3:
            case 4:
                strengthBar.className = 'password-strength strong';
                strengthText.textContent = 'Strong password';
                break;
        }
    }

    validatePasswordMatch() {
        const password = document.getElementById('signupPassword').value;
        const confirmPassword = document.getElementById('signupConfirmPassword').value;
        const confirmInput = document.getElementById('signupConfirmPassword');
        
        if (confirmPassword && password !== confirmPassword) {
            confirmInput.style.borderColor = '#e63946';
            confirmInput.title = 'Passwords do not match';
        } else {
            confirmInput.style.borderColor = '#ddd';
            confirmInput.title = '';
        }
    }

    switchToSignup() {
        this.closeLoginModal();
        setTimeout(() => {
            this.openSignupModal();
        }, 300);
    }

    switchToLogin() {
        this.closeSignupModal();
        setTimeout(() => {
            this.openLoginModal();
        }, 300);
    }

    openLoginModal() {
        const loginModal = document.getElementById('loginModal');
        if (loginModal) {
            loginModal.style.display = 'flex';
            document.getElementById('loginForm').reset();
            setTimeout(() => {
                const emailInput = document.getElementById('loginEmail');
                if (emailInput) emailInput.focus();
            }, 100);
        }
    }

    closeLoginModal() {
        const loginModal = document.getElementById('loginModal');
        if (loginModal) {
            loginModal.style.display = 'none';
        }
    }

    openSignupModal() {
        const signupModal = document.getElementById('signupModal');
        if (signupModal) {
            signupModal.style.display = 'flex';
            document.getElementById('signupForm').reset();
            const strengthBar = document.querySelector('.password-strength');
            if (strengthBar) {
                strengthBar.className = 'password-strength';
                const strengthText = strengthBar.querySelector('.strength-text');
                if (strengthText) strengthText.textContent = 'Password strength';
            }
            setTimeout(() => {
                const nameInput = document.getElementById('signupName');
                if (nameInput) nameInput.focus();
            }, 100);
        }
    }

    closeSignupModal() {
        const signupModal = document.getElementById('signupModal');
        if (signupModal) {
            signupModal.style.display = 'none';
        }
    }

    showProfileModal() {
        if (!this.isLoggedIn) {
            this.showNotification('Please login to view profile', 'warning');
            return;
        }
        
        this.updateProfileModal();
        document.getElementById('profileModal').style.display = 'flex';
    }

    closeProfileModal() {
        document.getElementById('profileModal').style.display = 'none';
    }

    closeEditProfileModal() {
        document.getElementById('editProfileModal').style.display = 'none';
        document.getElementById('editProfileForm').reset();
    }

    closeManageContactsModal() {
        document.getElementById('manageContactsModal').style.display = 'none';
        document.getElementById('addContactForm').reset();
    }

    closeAllModals() {
        this.closeLoginModal();
        this.closeSignupModal();
        this.closeProfileModal();
        this.closeEditProfileModal();
        this.closeManageContactsModal();
    }

    updateProfileModal() {
        if (!this.currentUser) return;

        document.getElementById('profileName').textContent = this.currentUser.name;
        document.getElementById('profileRole').textContent = this.currentUser.role.charAt(0).toUpperCase() + this.currentUser.role.slice(1);
        document.getElementById('profileEmail').textContent = this.currentUser.email;
        document.getElementById('profilePhone').textContent = this.currentUser.phone;
        document.getElementById('profileCampusID').textContent = this.currentUser.campusId || 'Not assigned';
        
        const memberSince = new Date(this.currentUser.memberSince).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long' 
        });
        document.getElementById('profileMemberSince').textContent = `Member since ${memberSince}`;
        
        document.getElementById('sosCount').textContent = this.currentUser.stats.sosCount;
        document.getElementById('alertsSent').textContent = this.currentUser.stats.alertsSent;
        
        const avgResponse = this.currentUser.stats.sosCount > 0 
            ? Math.round(this.currentUser.stats.totalResponseTime / this.currentUser.stats.sosCount)
            : 0;
        document.getElementById('responseTime').textContent = `${avgResponse}s`;

        // Update avatar based on role
        this.updateProfileAvatar(this.currentUser.role);
        
        // Load emergency contacts
        this.loadEmergencyContacts(this.currentUser.emergencyContacts);
    }

    updateProfileAvatar(role) {
        const avatar = document.getElementById('profileAvatar');
        const icons = {
            'student': 'fas fa-user-graduate',
            'faculty': 'fas fa-chalkboard-teacher',
            'staff': 'fas fa-briefcase',
            'security': 'fas fa-shield-alt',
            'admin': 'fas fa-crown'
        };
        
        if (avatar) {
            avatar.innerHTML = `<i class="${icons[role] || 'fas fa-user'}"></i>`;
        }
    }

    loadEmergencyContacts(contacts) {
        const contactsList = document.getElementById('emergencyContactsList');
        if (!contactsList) return;
        
        if (!contacts || contacts.length === 0) {
            contactsList.innerHTML = `
                <div class="no-contacts">
                    <i class="fas fa-address-book"></i>
                    <p>No emergency contacts added</p>
                    <small>Add contacts to be notified during emergencies</small>
                </div>
            `;
            return;
        }

        contactsList.innerHTML = contacts.map(contact => `
            <div class="contact-item">
                <div class="contact-info">
                    <strong>${contact.name}</strong>
                    <span>${contact.phone}</span>
                    <small>${contact.relationship}</small>
                </div>
                <button class="btn-remove-contact" data-contact-id="${contact._id || contact.name}">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');

        // Add remove contact event listeners
        contactsList.querySelectorAll('.btn-remove-contact').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const contactId = e.target.closest('.btn-remove-contact').dataset.contactId;
                this.removeEmergencyContact(contactId);
            });
        });
    }

    openEditProfileModal() {
        if (!this.currentUser) return;
        
        document.getElementById('editName').value = this.currentUser.name;
        document.getElementById('editPhone').value = this.currentUser.phone;
        document.getElementById('editEmail').value = this.currentUser.email;
        
        document.getElementById('editProfileModal').style.display = 'flex';
    }

    async handleEditProfile(e) {
        e.preventDefault();
        
        const name = document.getElementById('editName').value.trim();
        const phone = document.getElementById('editPhone').value.trim();

        if (!name || !phone) {
            this.showNotification('Please fill all fields', 'warning');
            return;
        }

        try {
            this.currentUser.name = name;
            this.currentUser.phone = phone;
            this.updateSession();
            
            this.showNotification('Profile updated successfully!', 'success');
            this.closeEditProfileModal();
            this.updateProfileModal();
            this.updateUI();
        } catch (error) {
            this.showNotification('Failed to update profile', 'error');
        }
    }

    openManageContactsModal() {
        this.loadCurrentContacts();
        document.getElementById('manageContactsModal').style.display = 'flex';
    }

    loadCurrentContacts() {
        if (!this.currentUser || !this.currentUser.emergencyContacts) return;
        
        const currentContactsList = document.getElementById('currentContactsList');
        if (!currentContactsList) return;
        
        const contacts = this.currentUser.emergencyContacts;

        if (contacts.length === 0) {
            currentContactsList.innerHTML = '<p class="no-contacts">No contacts added yet</p>';
            return;
        }

        currentContactsList.innerHTML = contacts.map(contact => `
            <div class="managed-contact-item">
                <div class="contact-details">
                    <strong>${contact.name}</strong>
                    <span>${contact.phone}</span>
                    <small>${contact.relationship}</small>
                </div>
                <button class="btn-remove-managed-contact" data-contact-name="${contact.name}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `).join('');

        // Add remove event listeners
        currentContactsList.querySelectorAll('.btn-remove-managed-contact').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const contactName = e.target.closest('.btn-remove-managed-contact').dataset.contactName;
                this.removeEmergencyContact(contactName);
            });
        });
    }

    async handleAddContact(e) {
        e.preventDefault();
        
        const name = document.getElementById('contactName').value.trim();
        const phone = document.getElementById('contactPhone').value.trim();
        const relationship = document.getElementById('contactRelationship').value;

        if (!name || !phone || !relationship) {
            this.showNotification('Please fill all fields', 'warning');
            return;
        }

        try {
            // Get current contacts
            const currentContacts = this.currentUser.emergencyContacts || [];
            
            // Add new contact
            const newContact = {
                name,
                phone,
                relationship,
                _id: `contact-${Date.now()}`
            };
            
            const updatedContacts = [...currentContacts, newContact];
            this.currentUser.emergencyContacts = updatedContacts;
            this.updateSession();
            
            this.showNotification('Emergency contact added successfully!', 'success');
            document.getElementById('addContactForm').reset();
            this.updateProfileModal();
            this.loadCurrentContacts();
        } catch (error) {
            this.showNotification('Failed to add contact', 'error');
        }
    }

    async removeEmergencyContact(contactIdentifier) {
        if (!confirm('Are you sure you want to remove this emergency contact?')) {
            return;
        }

        try {
            const currentContacts = this.currentUser.emergencyContacts || [];
            const updatedContacts = currentContacts.filter(contact => 
                contact._id !== contactIdentifier && contact.name !== contactIdentifier
            );
            
            this.currentUser.emergencyContacts = updatedContacts;
            this.updateSession();
            
            this.showNotification('Contact removed successfully', 'success');
            this.updateProfileModal();
            
            // Reload contacts in manage modal if it's open
            if (document.getElementById('manageContactsModal').style.display === 'flex') {
                this.loadCurrentContacts();
            }
        } catch (error) {
            this.showNotification('Failed to remove contact', 'error');
        }
    }

    refreshProfileData() {
        this.updateProfileModal();
        this.showNotification('Profile data refreshed', 'info');
    }

    updateUI() {
        const authButtons = document.querySelector('.auth-buttons');
        const userMenu = document.querySelector('.user-menu');
        
        if (this.isLoggedIn) {
            // Show user menu
            if (!userMenu) {
                const newUserMenu = document.createElement('div');
                newUserMenu.className = 'user-menu';
                newUserMenu.innerHTML = `
                    <span class="user-greeting">Hello, ${this.currentUser.name.split(' ')[0]}</span>
                    <div class="user-avatar">
                        <i class="fas fa-user"></i>
                    </div>
                `;
                if (authButtons) {
                    authButtons.parentNode.replaceChild(newUserMenu, authButtons);
                }
            } else {
                const greeting = userMenu.querySelector('.user-greeting');
                if (greeting) {
                    greeting.textContent = `Hello, ${this.currentUser.name.split(' ')[0]}`;
                }
            }
            
            // Update feature accessibility based on role
            this.updateFeatureAccess();
        } else {
            // Show auth buttons
            if (!authButtons) {
                const newAuthButtons = document.createElement('div');
                newAuthButtons.className = 'auth-buttons';
                newAuthButtons.innerHTML = `
                    <button class="btn btn-outline" id="loginBtn">Log In</button>
                    <button class="btn btn-primary" id="signupBtn">Sign Up</button>
                `;
                if (userMenu) {
                    userMenu.parentNode.replaceChild(newAuthButtons, userMenu);
                }
                
                // Re-bind events for new buttons
                setTimeout(() => {
                    const loginBtn = document.getElementById('loginBtn');
                    const signupBtn = document.getElementById('signupBtn');
                    if (loginBtn) loginBtn.addEventListener('click', () => this.openLoginModal());
                    if (signupBtn) signupBtn.addEventListener('click', () => this.openSignupModal());
                }, 100);
            }
            
            // Reset feature accessibility
            this.resetFeatureAccess();
        }
    }

    updateFeatureAccess() {
        // Enable/disable features based on user role
        const sendAlertBtn = document.getElementById('sendAlertBtn');
        if (sendAlertBtn) {
            if (this.currentUser.role === 'security' || this.currentUser.role === 'staff') {
                sendAlertBtn.disabled = false;
                sendAlertBtn.title = '';
            } else {
                sendAlertBtn.disabled = true;
                sendAlertBtn.title = 'Only security and staff can send alerts';
            }
        }
    }

    resetFeatureAccess() {
        const sendAlertBtn = document.getElementById('sendAlertBtn');
        if (sendAlertBtn) {
            sendAlertBtn.disabled = true;
            sendAlertBtn.title = 'Please login to send alerts';
        }
    }

    recordSOSActivation() {
        if (this.isLoggedIn) {
            this.currentUser.stats.sosCount++;
            this.updateSession();
        }
    }

    recordAlertSent() {
        if (this.isLoggedIn) {
            this.currentUser.stats.alertsSent++;
            this.updateSession();
        }
    }

    recordResponseTime(responseTime) {
        if (this.isLoggedIn) {
            this.currentUser.stats.totalResponseTime += responseTime;
            this.updateSession();
        }
    }

    updateSession() {
        const session = localStorage.getItem('safecampus_session');
        if (session) {
            const sessionData = JSON.parse(session);
            sessionData.user = this.currentUser;
            localStorage.setItem('safecampus_session', JSON.stringify(sessionData));
        }
        
        // Update user in users array
        const userIndex = this.users.findIndex(u => u.id === this.currentUser.id);
        if (userIndex !== -1) {
            this.users[userIndex] = { ...this.currentUser, password: this.users[userIndex].password };
            this.saveUsers();
        }
    }

    showNotification(message, type = 'info') {
        // Remove existing notification
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <span>${message}</span>
            <button class="notification-close">&times;</button>
        `;

        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#2a9d8f' : type === 'error' ? '#e63946' : '#457b9d'};
            color: white;
            padding: 15px 20px;
            border-radius: 5px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            display: flex;
            align-items: center;
            gap: 15px;
            max-width: 400px;
            animation: slideIn 0.3s ease-out;
        `;

        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.remove();
        });

        document.body.appendChild(notification);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }

    isAuthenticated() {
        return this.isLoggedIn;
    }

    getCurrentUser() {
        return this.currentUser;
    }

    getUserRole() {
        return this.currentUser ? this.currentUser.role : null;
    }
}

// Create global auth instance
window.authSystem = new AuthSystem();
