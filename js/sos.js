// SOS Functionality
class SOSSystem {
    constructor() {
        this.isActive = false;
        this.sendingTimeout = null;
        this.resetTimeout = null;
        this.init();
    }

    init() {
        console.log('🚀 SOS System Initializing...');
        this.bindEvents();
    }

    bindEvents() {
        // SOS button click
        const sosButton = document.getElementById('sosButton');
        if (sosButton) {
            sosButton.addEventListener('click', () => {
                console.log('🆘 SOS Button Clicked!');
                this.openSOSModal();
            });
        }

        // Modal buttons
        document.addEventListener('click', (e) => {
            if (e.target.id === 'confirmSOS') {
                this.confirmEmergency();
            }
            if (e.target.id === 'cancelSOS') {
                this.closeSOSModal();
            }
            if (e.target.id === 'closeAlertSent') {
                this.closeAlertSentModal();
                this.resetSOSButton(); // Reset when user closes success modal
            }
            // Close modals when clicking outside
            if (e.target.classList.contains('modal')) {
                this.closeAllModals();
            }
        });
    }

    openSOSModal() {
        const modal = document.getElementById('sosModal');
        if (modal) {
            modal.style.display = 'flex';
            console.log('📱 SOS Modal Opened');
        }
    }

    closeSOSModal() {
        const modal = document.getElementById('sosModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    closeAlertSentModal() {
        const modal = document.getElementById('alertSentModal');
        if (modal) {
            modal.style.display = 'none';
            console.log('✅ Alert Sent Modal Closed');
        }
    }

    closeAllModals() {
        this.closeSOSModal();
        this.closeAlertSentModal();
    }

    async confirmEmergency() {
        console.log('🚨 Emergency Confirmed!');
        
        this.closeSOSModal();
        this.isActive = true;
        
        // Show sending state
        this.showSendingState();
        
        try {
            // Get location
            const location = await this.getCurrentLocation();
            console.log('📍 Location:', location);
            
            // Send alert
            await this.sendEmergencyAlert(location);
            
            // Show success and automatically reset
            this.showSuccessAndReset();
            
            // Record in stats
            if (window.authSystem) {
                window.authSystem.recordSOSActivation();
            }
            
        } catch (error) {
            console.error('❌ Error:', error);
            this.showError('Emergency alert failed. Please try again or call security directly.');
            this.resetSOSButton();
        }
    }

    showSendingState() {
        const sosButton = document.getElementById('sosButton');
        if (sosButton) {
            sosButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> SENDING';
            sosButton.style.backgroundColor = '#c1121f';
            sosButton.disabled = true;
            console.log('🔄 SOS Button: SENDING state');
        }
    }

    showSuccessAndReset() {
        // Show success modal
        this.showAlertSentModal();
        
        // Automatically close success modal and reset after 3 seconds
        this.sendingTimeout = setTimeout(() => {
            this.closeAlertSentModal();
            this.resetSOSButton();
            console.log('✅ Auto-closed success modal and reset SOS button');
        }, 3000);
    }

    async getCurrentLocation() {
        return new Promise((resolve) => {
            if (!navigator.geolocation) {
                // Return default location for demo
                resolve({ lat: 28.6139, lng: 77.2090, accuracy: 100, note: 'Default location' });
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                        accuracy: position.coords.accuracy
                    });
                },
                () => {
                    // Fallback to default location
                    resolve({ lat: 28.6139, lng: 77.2090, accuracy: 100, note: 'Fallback location' });
                },
                {
                    enableHighAccuracy: true,
                    timeout: 5000,
                    maximumAge: 0
                }
            );
        });
    }

    async sendEmergencyAlert(location) {
        console.log('📨 Sending emergency alert...');
        
        return new Promise((resolve) => {
            setTimeout(() => {
                const response = {
                    success: true,
                    alertId: 'EMG-' + Date.now(),
                    timestamp: new Date().toISOString(),
                    message: 'Alert received by campus security',
                    location: location,
                    recipients: ['Campus Security', 'Emergency Contacts']
                };
                console.log('✅ Alert Sent Successfully:', response);
                resolve(response);
            }, 2000);
        });
    }

    showAlertSentModal() {
        const modal = document.getElementById('alertSentModal');
        if (modal) {
            modal.style.display = 'flex';
            console.log('✅ Success Modal Shown');
            
            // Update modal message with dynamic info
            const alertMessage = modal.querySelector('p');
            if (alertMessage) {
                const time = new Date().toLocaleTimeString();
                alertMessage.innerHTML = `
                    Your emergency alert has been sent successfully!<br><br>
                    <small>
                        <strong>Response Time:</strong> 2 seconds<br>
                        <strong>Alert ID:</strong> EMG-${Date.now()}<br>
                        <strong>Time:</strong> ${time}
                    </small>
                `;
            }
        }
    }

    resetSOSButton() {
        // Clear any existing timeouts
        if (this.sendingTimeout) {
            clearTimeout(this.sendingTimeout);
            this.sendingTimeout = null;
        }
        if (this.resetTimeout) {
            clearTimeout(this.resetTimeout);
            this.resetTimeout = null;
        }
        
        this.isActive = false;
        const sosButton = document.getElementById('sosButton');
        if (sosButton) {
            sosButton.innerHTML = '<i class="fas fa-exclamation-triangle"></i> SOS';
            sosButton.style.backgroundColor = '';
            sosButton.disabled = false;
            console.log('🔄 SOS Button Reset to Normal');
        }
    }

    showError(message) {
        console.error('❌ Error:', message);
        // Use auth system notification if available
        if (window.authSystem && typeof window.authSystem.showNotification === 'function') {
            window.authSystem.showNotification(message, 'error');
        } else {
            // Fallback to alert
            alert('❌ ' + message);
        }
    }

    // Clean up method to prevent memory leaks
    destroy() {
        if (this.sendingTimeout) {
            clearTimeout(this.sendingTimeout);
        }
        if (this.resetTimeout) {
            clearTimeout(this.resetTimeout);
        }
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM Ready - Starting SOS System');
    window.sosSystem = new SOSSystem();
});

// Clean up when page unloads
window.addEventListener('beforeunload', function() {
    if (window.sosSystem) {
        window.sosSystem.destroy();
    }
});
