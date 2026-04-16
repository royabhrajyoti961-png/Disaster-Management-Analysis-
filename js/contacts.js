// Emergency Contacts Functionality
class ContactSystem {
    constructor() {
        this.contacts = {
            'Campus Security': { number: '9123017777', type: 'security' },
            'Medical Emergency': { number: '112', type: 'medical' },
            'Harassment Help': { number: '112', type: 'support' },
            'Fire Department': { number: '112', type: 'emergency' }
        };
        this.init();
    }

    init() {
        this.bindContactEvents();
    }

    bindContactEvents() {
        const contactButtons = document.querySelectorAll('.contact-btn');
        
        contactButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const contact = e.target.getAttribute('data-contact');
                this.initiateCall(contact);
            });
        });
    }

    initiateCall(contactName) {
        const contact = this.contacts[contactName];
        if (!contact) return;

        if (confirm(`Call ${contactName} at ${contact.number}?`)) {
            this.simulatePhoneCall(contactName, contact.number, contact.type);
        }
    }

    simulatePhoneCall(contactName, number, type) {
        const callModal = this.createCallModal(contactName, number, type);
        document.body.appendChild(callModal);

        // Auto-end call after 15 seconds for demo
        setTimeout(() => {
            if (document.body.contains(callModal)) {
                document.body.removeChild(callModal);
                this.logCallEnd(contactName, 'auto_timeout');
            }
        }, 15000);
    }

    createCallModal(contactName, number, type) {
        const callModal = document.createElement('div');
        callModal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, var(--dark) 0%, var(--secondary) 100%);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 1000;
            color: white;
        `;
        
        callModal.innerHTML = `
            <div style="text-align: center; padding: 20px;">
                <div style="font-size: 1.5rem; margin-bottom: 10px;">Calling...</div>
                <div style="font-size: 1.8rem; margin-bottom: 5px; font-weight: bold;">${contactName}</div>
                <div style="font-size: 1.2rem; margin-bottom: 30px;">${number}</div>
                <div style="font-size: 5rem; margin: 30px 0;">
                    <i class="fas fa-phone"></i>
                </div>
                <div style="margin-top: 40px;">
                    <button id="endCall" style="padding: 12px 40px; background: #e63946; color: white; border: none; border-radius: 50px; font-size: 1.1rem; cursor: pointer;">
                        <i class="fas fa-phone-slash"></i> End Call
                    </button>
                </div>
            </div>
        `;

        // Add end call functionality
        const endCallBtn = callModal.querySelector('#endCall');
        endCallBtn.addEventListener('click', () => {
            document.body.removeChild(callModal);
            this.logCallEnd(contactName, 'user_ended');
        });

        // Log the call initiation
        this.logCallInitiation(contactName, number, type);

        return callModal;
    }

    logCallInitiation(contactName, number, type) {
        const eventData = {
            type: 'CONTACT_CALL_INITIATED',
            contact: contactName,
            number: number,
            contactType: type,
            timestamp: new Date().toISOString()
        };
        
        logEmergencyEvent(eventData);
    }

    logCallEnd(contactName, endReason) {
        const eventData = {
            type: 'CONTACT_CALL_ENDED',
            contact: contactName,
            endReason: endReason,
            timestamp: new Date().toISOString()
        };
        
        logEmergencyEvent(eventData);
    }
}

// Initialize contact system when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    new ContactSystem();
});
