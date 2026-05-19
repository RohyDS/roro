import api from "../../config/api";

export const getOrders = async () => {
    try {
        const response = await api.get("v1/admin/sales/orders");
        return response.data;
    } catch (error) {
        console.error("Error de recuperation de commandes", error);
        throw error;
    }
};