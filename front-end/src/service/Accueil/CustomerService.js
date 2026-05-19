import api from '../../config/api';

const CustomerService = {
    /**
     * Authentification client via l'API Bagisto
     */
    login: async (email, password) => {
        try {
            const response = await api.post('v1/customer/login', {
                email: email,
                password: password,
                device_name: 'React Storefront'
            });
            
            // Bagisto retourne généralement le token et les données du client
            if (response.data && response.data.token) {
                // Configurer le token pour les futures requêtes
                api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
                localStorage.setItem('customer_token', response.data.token);
                return response.data.data || response.data;
            }
            throw new Error("Identifiants incorrects");
        } catch (error) {
            console.error("Erreur CustomerService.login:", error);
            throw error;
        }
    },

    /**
     * Déconnexion client
     */
    logout: async () => {
        try {
            await api.post('v1/customer/logout');
            delete api.defaults.headers.common['Authorization'];
            localStorage.removeItem('customer_token');
        } catch (error) {
            console.error("Erreur CustomerService.logout:", error);
        }
    }
};

export const getCustomerOrders = async () => {
    const response = await api.get("v1/customer/orders");
    return response.data;
};

export default CustomerService;
