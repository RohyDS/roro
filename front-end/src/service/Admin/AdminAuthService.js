import api from '../../config/api';

const AdminAuthService = {
    /**
     * Connecte l'utilisateur administrateur via l'API REST v1
     * Utilise multipart/form-data comme requis par la documentation
     */
    login: async (email, password) => {
        try {
            console.log("Tentative de connexion API pour:", email);
            const formData = new FormData();
            formData.append('email', email);
            formData.append('password', password);
            formData.append('device_name', 'ReactAdminApp');

            const response = await api.post('v1/admin/login', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            console.log("Réponse API reçue:", response.data);

            const token = response.data.token || response.data.access_token;
            
            if (token) {
                console.log("Token récupéré avec succès. Stockage dans localStorage...");
                localStorage.setItem('admin_token', token);
                localStorage.setItem('admin_user', JSON.stringify(response.data.data));
            } else {
                console.warn("Aucun token trouvé dans la réponse API !");
            }

            return response.data;
        } catch (error) {
            console.error('Détails de l\'erreur Login API:', {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message
            });
            throw error;
        }
    },

    /**
     * Déconnecte l'administrateur
     */
    logout: async () => {
        try {
            await api.post('v1/admin/logout');
        } catch (error) {
            console.error('Erreur Logout Admin API:', error);
        } finally {
            localStorage.removeItem('admin_token');
            localStorage.removeItem('admin_user');
        }
    },

    /**
     * Vérifie si un administrateur est connecté localement
     */
    isAuthenticated: () => {
        return !!localStorage.getItem('admin_token');
    }
};

export default AdminAuthService;
