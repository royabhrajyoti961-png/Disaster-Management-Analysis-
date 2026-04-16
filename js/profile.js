// Profile Management System
class ProfileSystem {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        console.log('👤 Initializing Profile System...');
        this.bindEvents();
    }

    bindEvents() {
        // Profile modal events
        document.addEventListener('click', (e) => {
            if (e.target.id === 'editProfileBtn' || e.target.closest('#editProfileBtn')) {
                this.openEditProfileModal();
            }
            
            if (e.target.id === 'refreshProfileBtn' || e.target.closest('#refreshProfileBtn')) {
                this.refreshProfileData();
            }
            
            if (e.target.id === 'manageContactsBtn' || e.target.closest('#manageContactsBtn')) {
                this.openManageContactsModal();
            }
            
            if (e.target.id === 'cancelEditProfile' || e.target.closest('#cancelEditProfile')) {
                this.closeEditProfileModal();
            }
            
            if (e.target.id === 'closeContactsModal' || e.target.closest('#closeContactsModal')) {
                this.closeManageContactsModal();
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

        // Close modals when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target.id === 'editProfileModal') {
                this.closeEditProfileModal();
            }
            if (e.target.id === 'manageContactsModal') {
                this.closeManageContactsModal();
            }
        });
    }

    async showProfileModal() {
        if (!window.authSystem || !window.authSystem.isAuthenticated()) {
            window.safeCampusAPI.showNotification('Please login to view profile', 'warning');
            return;
        }

        await this.loadProfileData();
        document.getElementById('profileModal').style.display = 'flex';
    }

    async loadProfileData() {
        try {
            console.log('📥 Loading profile data...');
            
            // Get user profile from API
            const profileResult = await window.safeCampusAPI.getProfile();
            const statsResult = await window.safeCampusAPI.getUserStats();
            
            if (profileResult.success && statsResult.success) {
                this.currentUser = profileResult.user;
                this.updateProfileUI(profileResult.user, statsResult);
            } else {
                throw new Error('Failed to load profile data');
            }
            
        } catch (error) {
            console.error('❌ Error loading profile:', error);
            window.safeCampusAPI.handleAPIError(error, 'Failed to load profile data');
        }
    }

    updateProfileUI(user, statsResult) {
        // Basic info
        document.getElementById('profileName').textContent = user.name;
        document.getElementById('profileEmail').textContent = user.email;
        document.getElementById('profilePhone').textContent = user.phone;
        document.getElementById('profileRole').textContent = this.formatRole(user.role);
        document.getElementById('profileCampusID').textContent = user.campusId || 'Not assigned';
        
        // Member since
        const memberSince = new Date(user.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long'
        });
        document.getElementById('profileMemberSince').textContent = `Member since ${memberSince}`;
        
        // Stats
        document.getElementById('sosCount').textContent = user.stats?.sosCount || 0;
        document.getElementById('alertsSent').textContent = user.stats?.alertsSent || 0;
        
        const avgResponse = user.stats?.sosCount > 0 
            ? Math.round(user.stats.totalResponseTime / user.stats.sosCount)
            : 0;
        document.getElementById('responseTime').textContent = `${avgResponse}s`;
        
        // Update avatar based on role
        this.updateProfileAvatar(user.role);
        
        // Load emergency contacts
        this.loadEmergencyContacts(user.emergencyContacts);
        
        console.log('✅ Profile UI updated');
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
        
        avatar.innerHTML = `<i class="${icons[role] || 'fas fa-user'}"></i>`;
    }

    formatRole(role) {
        const roleNames = {
            'student': 'Student',
            'faculty': 'Faculty',
            'staff': 'Staff',
            'security': 'Security Personnel',
            'admin': 'Administrator'
        };
        return roleNames[role] || role;
    }

    loadEmergencyContacts(contacts) {
        const contactsList = document.getElementById('emergencyContactsList');
        
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

    closeEditProfileModal() {
        document.getElementById('editProfileModal').style.display = 'none';
        document.getElementById('editProfileForm').reset();
    }

    async handleEditProfile(e) {
        e.preventDefault();
        
        const name = document.getElementById('editName').value.trim();
        const phone = document.getElementById('editPhone').value.trim();

        if (!name || !phone) {
            window.safeCampusAPI.showNotification('Please fill all fields', 'warning');
            return;
        }

        try {
            const result = await window.safeCampusAPI.updateProfile({ name, phone });
            
            if (result.success) {
                window.safeCampusAPI.showNotification('Profile updated successfully!', 'success');
                this.closeEditProfileModal();
                await this.refreshProfileData();
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            window.safeCampusAPI.handleAPIError(error, 'Failed to update profile');
        }
    }

    openManageContactsModal() {
        this.loadCurrentContacts();
        document.getElementById('manageContactsModal').style.display = 'flex';
    }

    closeManageContactsModal() {
        document.getElementById('manageContactsModal').style.display = 'none';
        document.getElementById('addContactForm').reset();
    }

    loadCurrentContacts() {
        if (!this.currentUser || !this.currentUser.emergencyContacts) return;
        
        const currentContactsList = document.getElementById('currentContactsList');
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
            window.safeCampusAPI.showNotification('Please fill all fields', 'warning');
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
            
            const result = await window.safeCampusAPI.updateEmergencyContacts(updatedContacts);
            
            if (result.success) {
                window.safeCampusAPI.showNotification('Emergency contact added successfully!', 'success');
                document.getElementById('addContactForm').reset();
                await this.refreshProfileData();
                this.loadCurrentContacts();
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            window.safeCampusAPI.handleAPIError(error, 'Failed to add contact');
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
            
            const result = await window.safeCampusAPI.updateEmergencyContacts(updatedContacts);
            
            if (result.success) {
                window.safeCampusAPI.showNotification('Contact removed successfully', 'success');
                await this.refreshProfileData();
                
                // Reload contacts in manage modal if it's open
                if (document.getElementById('manageContactsModal').style.display === 'flex') {
                    this.loadCurrentContacts();
                }
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            window.safeCampusAPI.handleAPIError(error, 'Failed to remove contact');
        }
    }

    async refreshProfileData() {
        await this.loadProfileData();
        window.safeCampusAPI.showNotification('Profile data refreshed', 'info');
    }

    closeProfileModal() {
        document.getElementById('profileModal').style.display = 'none';
    }
}

// Initialize profile system
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Initializing Profile System...');
    window.profileSystem = new ProfileSystem();
});
