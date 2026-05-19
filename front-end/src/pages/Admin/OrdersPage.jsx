import React, { useEffect, useState } from "react";
<<<<<<< HEAD
import { getOrders, invoiceOrder, shipOrder } from "../../service/Admin/orderService";
=======
import {getOrders, createInvoice, createShipment} from "../../service/Admin/orderService";
>>>>>>> origin/eval1.0

const OrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [loadingAction, setLoadingAction] = useState(null);
    const [message, setMessage] = useState({ text: '', type: '' });

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

<<<<<<< HEAD
    const handleInvoice = async (orderId) => {
        setLoadingAction(orderId);
        try {
            await invoiceOrder(orderId);
            setMessage({ text: `Commande #${orderId} facturée avec succès.`, type: 'success' });
            fetchOrders();
        } catch (error) {
            setMessage({ text: `Erreur lors de la facturation de la commande #${orderId}.`, type: 'error' });
        } finally {
            setLoadingAction(null);
        }
    };

    const handleShip = async (orderId) => {
        setLoadingAction(orderId);
        try {
            await shipOrder(orderId);
            setMessage({ text: `Commande #${orderId} expédiée avec succès.`, type: 'success' });
            fetchOrders();
        } catch (error) {
            setMessage({ text: `Erreur lors de l'expédition de la commande #${orderId}.`, type: 'error' });
        } finally {
            setLoadingAction(null);
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <h2 style={{ marginBottom: '20px' }}>Liste des commandes</h2>

            {message.text && (
                <div style={{
                    padding: '10px',
                    marginBottom: '15px',
                    borderRadius: '5px',
                    backgroundColor: message.type === 'success' ? '#dcfce7' : '#fee2e2',
                    color: message.type === 'success' ? '#166534' : '#991b1b'
                }}>
                    {message.text}
                </div>
            )}

            <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: '8px', overflow: 'hidden' }}>
                <thead style={{ background: '#f9fafb' }}>
                    <tr>
                        <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #eee' }}>ID</th>
                        <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #eee' }}>Client</th>
                        <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #eee' }}>Total</th>
                        <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #eee' }}>Status</th>
                        <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #eee' }}>Actions</th>
=======
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
>>>>>>> origin/eval1.0
                    </tr>
                </thead>

                <tbody>
                    {orders.map((order) => (
                        <tr key={order.id}>
<<<<<<< HEAD
                            <td style={{ padding: '15px', borderBottom: '1px solid #eee' }}>{order.increment_id}</td>
                            <td style={{ padding: '15px', borderBottom: '1px solid #eee' }}>{order.customer_full_name}</td>
                            <td style={{ padding: '15px', borderBottom: '1px solid #eee' }}>{order.grand_total}</td>
                            <td style={{ padding: '15px', borderBottom: '1px solid #eee' }}>
                                <span style={{ background: '#fef3c7', color: '#92400e', padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem' }}>
                                    {order.status}
                                </span>
                            </td>
                            <td style={{ padding: '15px', borderBottom: '1px solid #eee' }}>
                                <button 
                                    onClick={() => handleInvoice(order.id)}
                                    disabled={loadingAction === order.id || order.status === 'completed' || order.status === 'closed'}
                                    style={{
                                        marginRight: '10px',
                                        padding: '5px 10px',
                                        backgroundColor: '#3b82f6',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        opacity: (loadingAction === order.id || order.status === 'completed' || order.status === 'closed') ? 0.5 : 1
                                    }}
                                >
                                    {loadingAction === order.id ? '...' : 'Facturer'}
                                </button>
                                <button 
                                    onClick={() => handleShip(order.id)}
                                    disabled={loadingAction === order.id || order.status === 'completed' || order.status === 'closed'}
                                    style={{
                                        padding: '5px 10px',
                                        backgroundColor: '#10b981',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        opacity: (loadingAction === order.id || order.status === 'completed' || order.status === 'closed') ? 0.5 : 1
                                    }}
                                >
                                    {loadingAction === order.id ? '...' : 'Expédier'}
=======
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
>>>>>>> origin/eval1.0
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