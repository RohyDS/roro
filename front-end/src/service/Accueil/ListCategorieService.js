import api from '../../config/api';

const ListeCategorieService = {
    /**
     * Récupère la liste des catégories depuis l'API Bagisto
     */
    getCategories: async () => {
        try {
            // 1. Récupérer les catégories depuis l'API
            let apiCategories = [];
            try {
                const response = await api.get('categories');
                apiCategories = response.data.data || response.data;
            } catch (e) {
                console.warn("Impossible de charger les catégories de l'API, utilisation des données locales uniquement.");
            }
            
            // 2. Récupérer les catégories locales depuis le localStorage
            const savedCustom = localStorage.getItem('custom_categories');
            const customCategories = savedCustom ? JSON.parse(savedCustom) : [];
            
            // 3. Fusionner les deux (locales en premier)
            return [...customCategories, ...apiCategories];
        } catch (error) {
            console.error("Erreur dans ListeCategorieService.getCategories:", error);
            throw error;
        }
    }
};

export default ListeCategorieService;
