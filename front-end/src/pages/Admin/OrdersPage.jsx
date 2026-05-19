import React, { useEffect, useState } from "react";
import { getOrders } from "../../service/Admin/OrderService";

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

    return (
        <div>
            <h2>Liste des commandes</h2>

            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Client</th>
                        <th>Total</th>
                        <th>Status</th>
                    </tr>
                </thead>

                <tbody>
                    {orders.map((order) => (
                        <tr key={order.id}>
                            <td>{order.increment_id}</td>
                            <td>{order.customer_full_name}</td>
                            <td>{order.grand_total}</td>
                            <td>{order.status}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Orders;