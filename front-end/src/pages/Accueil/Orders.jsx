import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Package } from 'lucide-react';
import '../../styles/pages/List.css';
import {getCustomerOrders} from '../../service/Accueil/CustomerService';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);

            const res = await getCustomerOrders();

            // Bagisto renvoie souvent { data: [...] }
            setOrders(res?.data || res || []);

        } catch (error) {
            console.error("Erreur chargement commandes:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <p style={{ textAlign: "center" }}>Chargement des commandes...</p>;
    }

    if (!orders.length) {
        return (
            <div className="products-container" style={{ textAlign: 'center', padding: '50px' }}>
                <Package size={64} color="#d1d5db" />
                <h2>Aucune commande trouvée</h2>
                <Link to="/Accueil" className="btn-back">
                    Commencer mes achats
                </Link>
            </div>
        );
    }

    return (
        <div className="products-container">

            <div style={{ marginBottom: '20px' }}>
                <Link to="/Accueil" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <ArrowLeft size={18} /> Retour
                </Link>
            </div>

            <h2>
                <Package size={28} /> Mes commandes
            </h2>

            <div style={{ marginTop: '30px' }}>
                {orders.map((order) => (
                    <div key={order.id} style={{
                        background: 'white',
                        border: '1px solid #eee',
                        padding: '20px',
                        borderRadius: '8px',
                        marginBottom: '15px'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <div>
                                <strong>{order.increment_id || order.id}</strong>
                                <div style={{ fontSize: 12, color: '#666' }}>
                                    {order.created_at}
                                </div>
                            </div>

                            <span style={{
                                padding: '5px 10px',
                                borderRadius: '20px',
                                background: '#fef3c7',
                                color: '#92400e'
                            }}>
                                {order.status}
                            </span>
                        </div>

                        <div style={{ marginTop: 10 }}>
                            <p>Total: {order.base_grand_total || order.grand_total}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Orders;