import api from '../../config/api';

const ProductService = {
    /**
     * Récupère les produits d'une catégorie spécifique
     * Essaye l'URL fournie par l'utilisateur, puis l'URL standard Bagisto en cas d'échec.
     */
    getProductsByCategory: async (categoryId) => {
        let productsList = [];
        try {
            // 1. Essai avec l'URL spécifique demandée (api/v1/product/get?category_id=)
            try {
                const response = await api.get(`v1/product/get`, {
                    params: { category_id: categoryId }
                });
                if (response.data) {
                    const resData = response.data.data || response.data;
                    productsList = Array.isArray(resData) ? resData : (resData?.data && Array.isArray(resData.data) ? resData.data : []);
                }
            } catch (e) {
                console.warn("L'URL personnalisée v1/product/get a échoué, tentative avec l'URL standard Bagisto...");
            }

            // 2. Essai avec l'URL standard Bagisto REST API v1 (api/v1/products?category_id=)
            if (!productsList || productsList.length === 0) {
                try {
                    const standardV1Response = await api.get('v1/products', {
                        params: { category_id: categoryId }
                    });
                    if (standardV1Response.data) {
                        const resData = standardV1Response.data.data || standardV1Response.data;
                        productsList = Array.isArray(resData) ? resData : (resData?.data && Array.isArray(resData.data) ? resData.data : []);
                    }
                } catch (e) {
                    console.warn("L'URL standard v1/products a échoué, tentative avec l'URL héritée...");
                }
            }

            // 3. Repli sur l'URL standard Bagisto (api/products?category_id=)
            if (!productsList || productsList.length === 0) {
                try {
                    const standardResponse = await api.get('products', {
                        params: { category_id: categoryId }
                    });
                    const resData = standardResponse.data.data || standardResponse.data;
                    productsList = Array.isArray(resData) ? resData : (resData?.data && Array.isArray(resData.data) ? resData.data : []);
                } catch (e) {
                    console.warn("L'URL standard products a échoué.");
                }
            }

            // 4. Repli ultime de secours : récupérer TOUS les produits et filtrer en Front-end
            // Cela garantit l'affichage même si l'indexation de catégorie de Bagisto est défaillante ou incomplète.
            if (!productsList || productsList.length === 0) {
                console.warn("Aucun produit retourné par filtre API. Tentative de récupération globale et filtrage en frontend...");
                let allProducts = [];
                try {
                    const allRes = await api.get('v1/products');
                    const resData = allRes.data?.data || allRes.data;
                    allProducts = Array.isArray(resData) ? resData : (resData?.data && Array.isArray(resData.data) ? resData.data : []);
                } catch (err) {
                    try {
                        const allRes = await api.get('products');
                        const resData = allRes.data?.data || allRes.data;
                        allProducts = Array.isArray(resData) ? resData : (resData?.data && Array.isArray(resData.data) ? resData.data : []);
                    } catch (e) {}
                }

                if (Array.isArray(allProducts) && allProducts.length > 0) {
                    productsList = allProducts.filter(p => {
                        if (Array.isArray(p.categories)) {
                            return p.categories.some(cat => String(cat.id) === String(categoryId));
                        }
                        return false;
                    });
                    console.log(`Filtrage frontend réussi : ${productsList.length} produits trouvés pour la catégorie ${categoryId}`);
                }
            }

            return productsList;
        } catch (error) {
            console.error(`Erreur finale dans ProductService.getProductsByCategory(${categoryId}):`, error);
            throw error;
        }
    },

    /**
     * Récupère les détails d'un produit spécifique par son ID
     */
    getProductById: async (productId) => {
        try {
            // 1. Tentative avec l'URL standard Bagisto REST API v1
            try {
                const response = await api.get(`v1/products/${productId}`);
                if (response.data && response.data.data) {
                    return response.data.data;
                }
            } catch (e) {
                console.warn(`L'URL v1/products/${productId} a échoué.`);
            }

            // 2. Tentative avec l'URL directe products/:id
            try {
                const directResponse = await api.get(`products/${productId}`);
                if (directResponse.data) {
                    return directResponse.data.data || directResponse.data;
                }
            } catch (e) {
                console.warn(`L'URL directe products/${productId} a échoué.`);
            }
            
            // 3. Tentative avec filtrage (Certaines versions de Bagisto)
            try {
                const listV1Response = await api.get('v1/products');
                const data = listV1Response.data.data || listV1Response.data;
                if (Array.isArray(data)) {
                    const found = data.find(p => String(p.id) === String(productId));
                    if (found) return found;
                }
            } catch (e) {}

            const listResponse = await api.get('products');
            const data = listResponse.data.data || listResponse.data;
            
            if (Array.isArray(data)) {
                // Recherche rigoureuse du produit par ID (en comparant les types)
                const found = data.find(p => String(p.id) === String(productId));
                if (found) return found;
            }

            // Si on arrive ici, le produit n'a vraiment pas été trouvé
            throw new Error("Produit non trouvé");
        } catch (error) {
            console.error(`Erreur dans ProductService.getProductById(${productId}):`, error);
            throw error;
        }
    }
};

export default ProductService;
