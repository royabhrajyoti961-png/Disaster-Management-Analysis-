// // SafeCampus API Integration
// const API_BASE_URL = 'http://localhost:5000/api'; // Change to your backend URL

// class SafeCampusAPI {
//   constructor() {
//     this.token = localStorage.getItem('safecampus_token');
//     this.user = JSON.parse(localStorage.getItem('safecampus_user') || 'null');
//   }

//   setToken(token) {
//     this.token = token;
//     localStorage.setItem('safecampus_token', token);
//   }

//   setUser(user) {
//     this.user = user;
//     localStorage.setItem('safecampus_user', JSON.stringify(user));
//   }

//   clearAuth() {
//     this.token = null;
//     this.user = null;
//     localStorage.removeItem('safecampus_token');
//     localStorage.removeItem('safecampus_user');
//   }

//   getHeaders() {
//     const headers = {
//       'Content-Type': 'application/json',
//     };
    
//     if (this.token) {
//       headers['Authorization'] = `Bearer ${this.token}`;
//     }
    
//     return headers;
//   }

//   async request(endpoint, options = {}) {
//     const url = `${API_BASE_URL}${endpoint}`;
//     const config = {
//       headers: this.getHeaders(),
//       ...options
//     };

//     // Add body for POST, PUT, PATCH requests
//     if (['POST', 'PUT', 'PATCH'].includes(options.method) && options.body) {
//       config.body = typeof options.body === 'string' ? options.body : JSON.stringify(options.body);
//     }

//     try {
//       console.log(`🔄 API Call: ${options.method || 'GET'} ${url}`);
//       const response = await fetch(url, config);
//       const data = await response.json();
      
//       if (!response.ok) {
//         throw new Error(data.message || `API request failed with status ${response.status}`);
//       }
      
//       console.log(`✅ API Success: ${endpoint}`, data);
//       return data;
//     } catch (error) {
//       console.error(`❌ API Error: ${endpoint}`, error);
      
//       // Auto logout if token is invalid
//       if (error.message.includes('401') || error.message.includes('token')) {
//         this.clearAuth();
//         window.location.reload();
//       }
      
//       throw error;
//     }
//   }

//   // ==================== AUTHENTICATION APIs ====================

//   async login(email, password) {
//     const result = await this.request('/auth/login', {
//       method: 'POST',
//       body: JSON.stringify({ email, password })
//     });
    
//     if (result.success) {
//       this.setToken(result.token);
//       this.setUser(result.user);
//     }
    
//     return result;
//   }

//   async register(userData) {
//     const result = await this.request('/auth/register', {
//       method: 'POST',
//       body: JSON.stringify(userData)
//     });
    
//     if (result.success) {
//       this.setToken(result.token);
//       this.setUser(result.user);
//     }
    
//     return result;
//   }

//   async getProfile() {
//     return this.request('/auth/profile');
//   }

//   logout() {
//     this.clearAuth();
//     return { success: true, message: 'Logged out successfully' };
//   }

//   // ==================== SOS EMERGENCY APIs ====================

//   async sendSOSAlert(emergencyData) {
//     return this.request('/sos/emergency', {
//       method: 'POST',
//       body: emergencyData
//     });
//   }

//   async getActiveEmergencies() {
//     return this.request('/sos/campus/active');
//   }

//   async getEmergencyDetails(emergencyId) {
//     return this.request(`/sos/emergency/${emergencyId}`);
//   }

//   async updateEmergencyStatus(emergencyId, status, note = '') {
//     return this.request(`/sos/emergency/${emergencyId}/status`, {
//       method: 'PATCH',
//       body: { status, note }
//     });
//   }

//   // ==================== ALERT SYSTEM APIs ====================

//   async broadcastAlert(alertData) {
//     return this.request('/alerts/broadcast', {
//       method: 'POST',
//       body: alertData
//     });
//   }

//   async getAlerts(page = 1, limit = 20, type = 'all') {
//     return this.request(`/alerts?page=${page}&limit=${limit}&type=${type}`);
//   }

//   async getAlertById(alertId) {
//     return this.request(`/alerts/${alertId}`);
//   }

//   async updateAlertStatus(alertId, isActive) {
//     return this.request(`/alerts/${alertId}/status`, {
//       method: 'PATCH',
//       body: { isActive }
//     });
//   }

//   async deleteAlert(alertId) {
//     return this.request(`/alerts/${alertId}`, {
//       method: 'DELETE'
//     });
//   }

//   async getAlertStats() {
//     return this.request('/alerts/stats/overview');
//   }

//   // ==================== USER MANAGEMENT APIs ====================

//   async updateProfile(profileData) {
//     const result = await this.request('/users/profile', {
//       method: 'PUT',
//       body: profileData
//     });
    
//     if (result.success && result.user) {
//       this.setUser(result.user);
//     }
    
//     return result;
//   }

//   async updateLocation(locationData) {
//     return this.request('/users/location', {
//       method: 'PATCH',
//       body: locationData
//     });
//   }

//   async getSecurityPersonnel() {
//     return this.request('/users/security');
//   }

//   async getUserStats() {
//     return this.request('/users/stats');
//   }

//   async updateEmergencyContacts(contacts) {
//     return this.request('/users/emergency-contacts', {
//       method: 'PUT',
//       body: { emergencyContacts: contacts }
//     });
//   }

//   async searchUsers(query, role = '') {
//     return this.request(`/users/search?query=${encodeURIComponent(query)}&role=${role}`);
//   }

//   // ==================== LOCATION SERVICES ====================

//   async getCurrentLocation() {
//     return new Promise((resolve, reject) => {
//       if (!navigator.geolocation) {
//         reject(new Error('Geolocation is not supported by this browser.'));
//         return;
//       }

//       navigator.geolocation.getCurrentPosition(
//         (position) => {
//           resolve({
//             lat: position.coords.latitude,
//             lng: position.coords.longitude,
//             accuracy: position.coords.accuracy,
//             timestamp: new Date().toISOString()
//           });
//         },
//         (error) => {
//           let errorMessage = 'Unable to retrieve your location.';
          
//           switch (error.code) {
//             case error.PERMISSION_DENIED:
//               errorMessage = 'Location access denied. Please enable location services.';
//               break;
//             case error.POSITION_UNAVAILABLE:
//               errorMessage = 'Location information unavailable.';
//               break;
//             case error.TIMEOUT:
//               errorMessage = 'Location request timed out.';
//               break;
//           }
          
//           reject(new Error(errorMessage));
//         },
//         {
//           enableHighAccuracy: true,
//           timeout: 10000,
//           maximumAge: 0
//         }
//       );
//     });
//   }

//   // ==================== UTILITY METHODS ====================

//   isAuthenticated() {
//     return !!this.token && !!this.user;
//   }

//   getUser() {
//     return this.user;
//   }

//   getUserRole() {
//     return this.user ? this.user.role : null;
//   }

//   hasPermission(requiredRole) {
//     if (!this.user) return false;
    
//     const roleHierarchy = {
//       'student': 1,
//       'faculty': 2,
//       'staff': 3,
//       'security': 4,
//       'admin': 5
//     };
    
//     const userLevel = roleHierarchy[this.user.role] || 0;
//     const requiredLevel = roleHierarchy[requiredRole] || 0;
    
//     return userLevel >= requiredLevel;
//   }

//   // ==================== NOTIFICATION SYSTEM ====================

//   showNotification(message, type = 'info', duration = 5000) {
//     // Remove existing notification
//     const existingNotification = document.querySelector('.api-notification');
//     if (existingNotification) {
//       existingNotification.remove();
//     }

//     const notification = document.createElement('div');
//     notification.className = `api-notification notification-${type}`;
    
//     const icons = {
//       success: 'fas fa-check-circle',
//       error: 'fas fa-exclamation-circle',
//       warning: 'fas fa-exclamation-triangle',
//       info: 'fas fa-info-circle'
//     };

//     notification.innerHTML = `
//       <div class="notification-content">
//         <i class="${icons[type] || icons.info}"></i>
//         <span>${message}</span>
//         <button class="notification-close">&times;</button>
//       </div>
//     `;

//     // Add styles
//     notification.style.cssText = `
//       position: fixed;
//       top: 20px;
//       right: 20px;
//       background: ${this.getNotificationColor(type)};
//       color: white;
//       padding: 15px 20px;
//       border-radius: 8px;
//       box-shadow: 0 4px 12px rgba(0,0,0,0.15);
//       z-index: 10000;
//       max-width: 400px;
//       animation: slideInRight 0.3s ease-out;
//     `;

//     notification.querySelector('.notification-close').addEventListener('click', () => {
//       notification.remove();
//     });

//     document.body.appendChild(notification);

//     // Auto remove after duration
//     setTimeout(() => {
//       if (notification.parentNode) {
//         notification.remove();
//       }
//     }, duration);

//     return notification;
//   }

//   getNotificationColor(type) {
//     const colors = {
//       success: '#2a9d8f',
//       error: '#e63946',
//       warning: '#e9c46a',
//       info: '#457b9d'
//     };
//     return colors[type] || colors.info;
//   }

//   // ==================== ERROR HANDLER ====================

//   handleAPIError(error, fallbackMessage = 'Something went wrong') {
//     console.error('API Error Handler:', error);
    
//     const message = error.message || fallbackMessage;
    
//     // Show notification
//     this.showNotification(message, 'error');
    
//     // Special handling for common errors
//     if (message.includes('Network') || message.includes('Failed to fetch')) {
//       this.showNotification('Network error. Please check your connection.', 'error');
//     }
    
//     return { success: false, message };
//   }
// }

// // Add notification styles
// const addAPIStyles = () => {
//   const styles = `
//     @keyframes slideInRight {
//       from {
//         transform: translateX(100%);
//         opacity: 0;
//       }
//       to {
//         transform: translateX(0);
//         opacity: 1;
//       }
//     }
    
//     .notification-content {
//       display: flex;
//       align-items: center;
//       gap: 12px;
//     }
    
//     .notification-close {
//       background: none;
//       border: none;
//       color: white;
//       font-size: 1.2rem;
//       cursor: pointer;
//       padding: 0;
//       width: 20px;
//       height: 20px;
//       display: flex;
//       align-items: center;
//       justify-content: center;
//       margin-left: auto;
//     }
    
//     .api-notification i {
//       font-size: 1.2rem;
//     }
//   `;
  
//   if (!document.querySelector('#api-styles')) {
//     const styleSheet = document.createElement('style');
//     styleSheet.id = 'api-styles';
//     styleSheet.textContent = styles;
//     document.head.appendChild(styleSheet);
//   }
// };

// // Initialize API and styles when DOM loads
// document.addEventListener('DOMContentLoaded', function() {
//   addAPIStyles();
// });

// // Create global API instance
// window.safeCampusAPI = new SafeCampusAPI();

// // Export for module systems
// if (typeof module !== 'undefined' && module.exports) {
//   module.exports = SafeCampusAPI;
// }
