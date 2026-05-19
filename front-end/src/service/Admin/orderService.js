import api from "../../config/api";

export const getOrders = async () => {
<<<<<<< HEAD
    try {
        const response = await api.get("v1/admin/sales/orders");
        return response.data;
    } catch (error) {
        console.error("Error de recuperation de commandes", error);
        throw error;
    }
};

export const getOrderDetails = async (id) => {
    try {
        const response = await api.get(`v1/admin/sales/orders/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Erreur lors de la récupération de la commande ${id} :`, error);
        throw error;
    }
};

export const invoiceOrder = async (orderId) => {
    try {
        const orderResponse = await getOrderDetails(orderId);
        const orderData = orderResponse.data;
        
        const items = orderData.items || [];
        const invoiceItems = {};
        
        items.forEach(item => {
            const qty = item.qty_to_invoice || item.qty_ordered || 1;
            if (qty > 0) {
                invoiceItems[item.id] = qty;
            }
        });

        const response = await api.post(`v1/admin/sales/invoices/${orderId}`, {
            invoice: { items: invoiceItems }
        });
        return response.data;
    } catch (error) {
        console.error(`Erreur lors de la facturation de la commande ${orderId} :`, error);
        throw error;
    }
};

export const shipOrder = async (orderId) => {
    try {
        const orderResponse = await getOrderDetails(orderId);
        const orderData = orderResponse.data;
        
        const items = orderData.items || [];
        const shipmentItems = {};
        
        items.forEach(item => {
            const qty = item.qty_to_ship || item.qty_ordered || 1;
            if (qty > 0) {
                shipmentItems[item.id] = qty;
            }
        });

        const response = await api.post(`v1/admin/sales/shipments/${orderId}`, {
            shipment: {
                carrier_title: "Livraison Standard",
                track_number: "TRK-" + orderId + "-" + Date.now(),
                items: shipmentItems
            }
        });
        return response.data;
    } catch (error) {
        console.error(`Erreur lors de l'expédition de la commande ${orderId} :`, error);
        throw error;
    }
=======
    const response = await api.get("v1/admin/sales/orders");
    return response.data;
};

export const createInvoice = async (orderId) => {
    const response = await api.post(
        `v1/admin/sales/invoices/${orderId}`,
        {
            invoice: {
                capture: true
            }
        }
    );

    return response.data;
};

export const createShipment = async (orderId) => {
    const response = await api.post(
        `v1/admin/sales/shipments/${orderId}`,
        {
            shipment: {
                source: "default"
            }
        }
    );

    return response.data;
>>>>>>> origin/eval1.0
};