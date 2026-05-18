import api from '../../config/api';

const WishlistService = {
    /**
     * Récupère la liste des produits en wishlist du client connecté
     */
    getWishlist: async () => {
        try {
            const response = await api.get('v1/customer/wishlist');
            return response.data.data || response.data;
        } catch (error) {
            console.error('Erreur récupération wishlist:', error);
            throw error;
        }
    },

    /**
     * Ajoute ou retire un produit de la wishlist
     */
    toggleWishlist: async (productId) => {
        try {
            const response = await api.post(`v1/customer/wishlist/add/${productId}`);
            return response.data;
        } catch (error) {
            console.error(`Erreur toggle wishlist pour produit ${productId}:`, error);
            throw error;
        }
    },

    /**
     * Supprime un produit spécifique de la wishlist
     */
    removeWishlistItem: async (productId) => {
        try {
            // Note: Certaines versions utilisent DELETE v1/customer/wishlist/remove/${productId}
            const response = await api.delete(`v1/customer/wishlist/remove/${productId}`);
            return response.data;
        } catch (error) {
            console.error(`Erreur suppression wishlist pour produit ${productId}:`, error);
            throw error;
        }
    },

    /**
     * Vide toute la wishlist
     */
    removeAll: async () => {
        try {
            const response = await api.delete('v1/customer/wishlist/remove-all');
            return response.data;
        } catch (error) {
            console.error('Erreur vidage wishlist:', error);
            throw error;
        }
    }
};

export default WishlistService;
