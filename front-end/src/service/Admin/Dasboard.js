import api from '../../config/api';

const DashboardService = {
    getDashboardOrders: async () => {
        let rawOrders = [];
        try {
            // 1. Essai avec l'URL standard Bagisto Admin REST API
            const response = await api.get('v1/admin/sales/orders');
            rawOrders = response.data?.data || response.data || [];
        } catch (error) {
            console.warn("L'URL v1/admin/sales/orders a échoué, tentative avec v1/orders...");
            try {
                // 2. Repli sur v1/orders (peut nécessiter des droits différents selon la configuration)
                const fallbackResponse = await api.get('v1/orders');
                rawOrders = fallbackResponse.data?.data || fallbackResponse.data || [];
            } catch (err) {
                console.error("Impossible de récupérer les commandes.", err);
                throw err;
            }
        }

        // Assurons-nous que c'est un tableau
        if (!Array.isArray(rawOrders)) {
            if (rawOrders.data && Array.isArray(rawOrders.data)) {
                rawOrders = rawOrders.data;
            } else {
                rawOrders = [];
            }
        }

        // Normalisation des données pour correspondre aux attentes du composant dashboard.jsx
        return rawOrders.map(order => {
            // Essayer de récupérer l'adresse de facturation ou d'expédition
            const address = order.billing_address || order.shipping_address || {};
            
            return {
                id: order.id,
                total: parseFloat(order.grand_total || order.base_grand_total || 0),
                status: order.status || order.status_label || 'En attente',
                date: order.created_at || order.date || new Date().toISOString(),
                address: {
                    first_name: order.customer_first_name || address.first_name || 'Client',
                    last_name: order.customer_last_name || address.last_name || '',
                    email: order.customer_email || address.email || 'N/A'
                }
            };
        });
    }
};

export default DashboardService;
