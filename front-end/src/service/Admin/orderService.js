import api from "../../config/api";

export const getOrders = async () => {
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
};