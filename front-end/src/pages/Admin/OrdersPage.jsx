import React, { useEffect, useState } from "react";
import {getOrders, createInvoice, createShipment} from "../../service/Admin/orderService";

const OrdersPage = () => {
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const data = await getOrders();
            setOrders(data.data || []);
        } catch (error) {
            console.error("Erreur :", error);
        }
    };

    const handleCreateInvoice = async (orderId) => {
        try {
            await createInvoice(orderId);
            fetchOrders();
        } catch (error) {
            console.error("Erreur facture :", error);
        }
    };

    const handleCreateShipment = async (orderId) => {
        try {
            await createShipment(orderId);
            fetchOrders();
        } catch (error) {
            console.error("Erreur expédition :", error);
        }
    };

    return (
        <div>
            <h2>Liste des commandes</h2>

            <table border="1" cellPadding="10">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Client</th>
                        <th>Total</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>

                <tbody>
                    {orders.map((order) => (
                        <tr key={order.id}>
                            <td>{order.increment_id}</td>
                            <td>{order.customer_full_name}</td>
                            <td>{order.grand_total}</td>
                            <td>{order.status}</td>
                            <td>
                                <button
                                    onClick={() => handleCreateInvoice(order.id)}
                                >
                                    Payé
                                </button>

                                <button
                                    onClick={() => handleCreateShipment(order.id)}
                                    style={{ marginLeft: "10px" }}
                                >
                                    Expédier
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default OrdersPage;