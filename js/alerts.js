// Alert System Functionality
class AlertSystem {
    constructor() {
        this.alerts = [];
        this.init();
    }

    init() {
        this.closeAlertBtn = document.getElementById('closeAlertBtn');
        this.activeAlertBanner = document.getElementById('activeAlertBanner');
        this.sendAlertBtn = document.getElementById('sendAlertBtn');
        this.alertType = document.getElementById('alertType');
        this.alertTitle = document.getElementById('alertTitle');
        this.alertMessageInput = document.getElementById('alertMessageInput');

        this.bindEvents();
        this.loadSampleAlerts();
    }

    bindEvents() {
        if (this.closeAlertBtn) {
            this.closeAlertBtn.addEventListener('click', () => this.closeActiveAlert());
        }

        if (this.sendAlertBtn) {
            this.sendAlertBtn.addEventListener('click', () => this.sendAlert());
        }
    }

    closeActiveAlert() {
        if (this.activeAlertBanner) {
            this.activeAlertBanner.classList.add('hidden');
        }
    }

    async sendAlert() {
    const type = this.alertType.value;
    const title = this.alertTitle.value.trim();
    const message = this.alertMessageInput.value.trim();

    if (!title || !message) {
        alert('Please fill in both the title and message fields.');
        return;
    }

    const alertData = {
        id: 'ALT-' + Date.now(),
        type: type,
        title: title,
        message: message,
        timestamp: new Date().toISOString(),
        status: 'broadcast'
    };

    try {
        // Simulate sending alert to backend
        const response = await this.broadcastAlert(alertData);
        
        // Record alert in user stats
        if (window.authSystem && window.authSystem.isAuthenticated()) {
            window.authSystem.recordAlertSent();
        }
        
        // Add to local alerts
        this.alerts.unshift(alertData);
        
        // Update UI
        this.addAlertToHistory(alertData);
        this.showAlertSuccess(alertData);
        
        // Reset form
        this.resetForm();

    } catch (error) {
        console.error('Failed to send alert:', error);
        alert('Failed to send alert. Please try again.');
    }
}

    async broadcastAlert(alertData) {
        // Simulate API call to broadcast alert
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    success: true,
                    alertId: alertData.id,
                    recipients: 1250, // Simulated number of recipients
                    broadcastTime: new Date().toISOString()
                });
            }, 1500);
        });
    }

    addAlertToHistory(alertData) {
        const alertHistory = document.querySelector('.alert-history');
        if (!alertHistory) return;

        const alertItem = document.createElement('div');
        alertItem.className = `alert-item ${alertData.type === 'emergency' ? 'emergency' : ''}`;
        
        alertItem.innerHTML = `
            <h4>${alertData.title}</h4>
            <p>${alertData.message}</p>
            <div class="alert-meta">
                <span>${this.formatDate(alertData.timestamp)}</span>
                <span>By: You</span>
            </div>
        `;

        // Insert at the beginning of alert history
        const firstChild = alertHistory.querySelector('.alert-item');
        if (firstChild) {
            alertHistory.insertBefore(alertItem, firstChild);
        } else {
            alertHistory.appendChild(alertItem);
        }
    }

    showAlertSuccess(alertData) {
        alert(`Alert sent to all campus users!\n\nTitle: ${alertData.title}\nMessage: ${alertData.message}\nType: ${alertData.type.toUpperCase()}`);
        
        // Log the alert broadcast
        this.logAlertBroadcast(alertData);
    }

    resetForm() {
        if (this.alertTitle) this.alertTitle.value = '';
        if (this.alertMessageInput) this.alertMessageInput.value = '';
        if (this.alertType) this.alertType.value = 'info';
    }

    loadSampleAlerts() {
        // Sample alerts for demonstration
        const sampleAlerts = [
            {
                id: 'ALT-001',
                type: 'emergency',
                title: 'Emergency: Building Evacuation',
                message: 'Please evacuate the Science Building immediately due to a fire alarm. Proceed to the designated assembly area.',
                timestamp: new Date().toISOString(),
                author: 'Campus Security'
            },
            {
                id: 'ALT-002',
                type: 'warning',
                title: 'Weather Advisory',
                message: 'Severe weather expected this afternoon. All outdoor activities are cancelled until further notice.',
                timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Yesterday
                author: 'Administration'
            }
        ];

        this.alerts = sampleAlerts;
    }

    formatDate(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} minutes ago`;
        if (diffHours < 24) return `${diffHours} hours ago`;
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        
        return date.toLocaleDateString();
    }

    logAlertBroadcast(alertData) {
        const eventData = {
            type: 'ALERT_BROADCAST',
            alertId: alertData.id,
            alertType: alertData.type,
            title: alertData.title,
            timestamp: new Date().toISOString()
        };
        
        logEmergencyEvent(eventData);
    }
}

// Initialize alert system when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    new AlertSystem();
});
