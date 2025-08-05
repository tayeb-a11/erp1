/**
 * Subscription Checker pour ERP
 * Vérifie le statut d'abonnement et affiche des alertes
 */

class SubscriptionChecker {
    constructor() {
        this.checkInterval = null;
        this.warningDays = 7; // Afficher un avertissement 7 jours avant expiration
        this.init();
    }

    init() {
        // Vérifier immédiatement au chargement
        this.checkSubscription();
        
        // Vérifier toutes les 30 minutes
        this.checkInterval = setInterval(() => {
            this.checkSubscription();
        }, 30 * 60 * 1000);
    }

    async checkSubscription() {
        try {
            const response = await fetch('/subscription/check');
            const data = await response.json();

            if (data.success) {
                this.handleSubscriptionStatus(data.data);
            } else {
                console.error('Erreur lors de la vérification:', data.message);
            }
        } catch (error) {
            console.error('Erreur réseau:', error);
        }
    }

    handleSubscriptionStatus(subscriptionData) {
        const { is_expired, days_until_expiry, status } = subscriptionData;

        if (is_expired) {
            this.showExpiredAlert();
        } else if (days_until_expiry !== null && days_until_expiry <= this.warningDays) {
            this.showWarningAlert(days_until_expiry);
        } else {
            this.hideAlerts();
        }
    }

    showExpiredAlert() {
        this.hideAlerts();
        
        const alert = document.createElement('div');
        alert.id = 'subscription-expired-alert';
        alert.className = 'subscription-alert expired';
        alert.innerHTML = `
            <div class="alert-content">
                <h3>⚠️ Abonnement expiré</h3>
                <p>Votre abonnement a expiré. Veuillez le renouveler pour continuer à utiliser l'application.</p>
                <button onclick="window.location.href='https://cokitana.ddnsfree.com/tenant/subscription-expired'" class="btn-renew">
                    Renouveler l'abonnement
                </button>
            </div>
        `;
        
        document.body.appendChild(alert);
    }

    showWarningAlert(daysLeft) {
        this.hideAlerts();
        
        const alert = document.createElement('div');
        alert.id = 'subscription-warning-alert';
        alert.className = 'subscription-alert warning';
        alert.innerHTML = `
            <div class="alert-content">
                <h3>⚠️ Abonnement expirant bientôt</h3>
                <p>Votre abonnement expire dans ${Math.ceil(daysLeft)} jour(s).</p>
                <button onclick="window.location.href='https://cokitana.ddnsfree.com/tenant/subscription-expired'" class="btn-renew">
                    Renouveler maintenant
                </button>
                <button onclick="this.parentElement.parentElement.remove()" class="btn-dismiss">
                    Fermer
                </button>
            </div>
        `;
        
        document.body.appendChild(alert);
    }

    hideAlerts() {
        const existingAlerts = document.querySelectorAll('.subscription-alert');
        existingAlerts.forEach(alert => alert.remove());
    }

    destroy() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval);
        }
        this.hideAlerts();
    }
}

// Styles CSS pour les alertes
const styles = `
    .subscription-alert {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        max-width: 400px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: slideIn 0.3s ease-out;
    }

    .subscription-alert.expired {
        background: linear-gradient(135deg, #ff6b6b, #ee5a52);
        color: white;
    }

    .subscription-alert.warning {
        background: linear-gradient(135deg, #ffa726, #ff9800);
        color: white;
    }

    .alert-content {
        padding: 20px;
    }

    .alert-content h3 {
        margin: 0 0 10px 0;
        font-size: 18px;
    }

    .alert-content p {
        margin: 0 0 15px 0;
        font-size: 14px;
        line-height: 1.4;
    }

    .btn-renew, .btn-dismiss {
        padding: 8px 16px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
        margin-right: 10px;
        transition: all 0.2s;
    }

    .btn-renew {
        background: rgba(255,255,255,0.2);
        color: white;
    }

    .btn-renew:hover {
        background: rgba(255,255,255,0.3);
    }

    .btn-dismiss {
        background: rgba(255,255,255,0.1);
        color: white;
    }

    .btn-dismiss:hover {
        background: rgba(255,255,255,0.2);
    }

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
`;

// Injecter les styles
const styleSheet = document.createElement('style');
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);

// Initialiser le vérificateur d'abonnement
let subscriptionChecker;

document.addEventListener('DOMContentLoaded', function() {
    subscriptionChecker = new SubscriptionChecker();
});

// Exposer globalement pour utilisation
window.SubscriptionChecker = SubscriptionChecker; 
