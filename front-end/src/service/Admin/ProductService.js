import api from '../../config/api';

export const getProducts = async () => {
    try {
        const response = await api.get('v1/admin/catalog/products');
        return response.data;
    } catch (error) {
        console.error("Error fetching products:", error);
        throw error;
    }
};

export const updateProductInventory = async (productId, payload) => {
    try {
        const response = await api.put(`v1/admin/catalog/products/${productId}`, payload);
        return response.data;
    } catch (error) {
        console.error(`Error updating product ${productId}:`, error);
        throw error;
    }
};
