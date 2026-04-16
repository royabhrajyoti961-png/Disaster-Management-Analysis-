// Main application functionality
document.addEventListener('DOMContentLoaded', function() {
    console.log('SafeCampus Emergency System initialized');
    
    // Initialize all modules
    initSmoothScrolling();
    initAuthButtons();
    initHeroButtons();
});

// Smooth scrolling for navigation links
function initSmoothScrolling() {
    const navLinks = document.querySelectorAll('.nav-links a');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                window.scrollTo({
                    top: targetSection.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Initialize authentication buttons
function initAuthButtons() {
    const loginBtn = document.getElementById('loginBtn');
    const signupBtn = document.getElementById('signupBtn');
    
    if (loginBtn) {
        loginBtn.addEventListener('click', () => authSystem.openLoginModal());
    }
    
    if (signupBtn) {
        signupBtn.addEventListener('click', () => authSystem.openSignupModal());
    }
}

// Add notification styles to head
function addNotificationStyles() {
    const styles = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        .notification-close {
            background: none;
            border: none;
            color: white;
            font-size: 1.2rem;
            cursor: pointer;
            padding: 0;
            width: 20px;
            height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
    `;
    
    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
}

// Update main initialization
document.addEventListener('DOMContentLoaded', function() {
    console.log('SafeCampus Emergency System initialized');
    
    // Initialize all modules
    initSmoothScrolling();
    initAuthButtons();
    initHeroButtons();
    addNotificationStyles();
});

// Initialize hero section buttons
function initHeroButtons() {
    const downloadBtn = document.getElementById('downloadBtn');
    const learnMoreBtn = document.getElementById('learnMoreBtn');
    
    if (downloadBtn) {
        downloadBtn.addEventListener('click', function() {
            alert('App download functionality would be implemented here.\nRedirecting to app store...');
        });
    }
    
    if (learnMoreBtn) {
        learnMoreBtn.addEventListener('click', function() {
            alert('Learn more about the SafeCampus system and its features.');
        });
    }
}

// Utility function for logging emergency events
function logEmergencyEvent(eventData) {
    const logEntry = {
        timestamp: new Date().toISOString(),
        ...eventData
    };
    
    console.log('Emergency Event Logged:', logEntry);
    
    // In a real application, this would be sent to a backend service
    // sendToBackend('/api/emergency-logs', logEntry);
}

// Utility function for making API calls
async function makeAPICall(endpoint, data) {
    try {
        // Simulate API call
        const response = await new Promise((resolve) => {
            setTimeout(() => {
                resolve({ success: true, data: { id: Date.now(), ...data } });
            }, 1000);
        });
        
        return response;
    } catch (error) {
        console.error('API call failed:', error);
        throw error;
    }
}
