import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { ArrowLeft, Package, Clock, CreditCard, Truck } from 'lucide-react';
import '../../styles/pages/List.css';

const Orders = () => {
    const { orders } = useCart();

    if (orders.length === 0) {
        return (
            <div className="products-container" style={{ textAlign: 'center', padding: '50px' }}>
                <Package size={64} color="#d1d5db" style={{ marginBottom: '20px' }} />
                <h2>Vous n'avez pas encore passé de commande</h2>
                <Link to="/Accueil" className="btn-back" style={{ display: 'inline-block', marginTop: '20px' }}>
                    Commencer mes achats
                </Link>
            </div>
        );
    }

    return (
        <div className="products-container">
            <div style={{ marginBottom: '20px' }}>
                <Link to="/Accueil" style={{ color: '#2563eb', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ArrowLeft size={18} /> Retour à l'accueil
                </Link>
            </div>

            <h2 style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <Package size={28} /> Mes Commandes
            </h2>

            <div className="orders-list" style={{ marginTop: '30px' }}>
                {orders.map((order) => (
                    <div key={order.id} style={{ 
                        background: 'white', 
                        border: '1px solid #eee', 
                        borderRadius: '8px', 
                        padding: '20px', 
                        marginBottom: '20px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '15px', marginBottom: '15px' }}>
                            <div>
                                <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{order.id}</span>
                                <div style={{ color: '#666', fontSize: '0.9rem', marginTop: '5px' }}>
                                    Passée le {new Date(order.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                            <div style={{ 
                                background: '#fef3c7', 
                                color: '#92400e', 
                                padding: '5px 12px', 
                                borderRadius: '20px', 
                                fontSize: '0.85rem', 
                                fontWeight: 'bold' 
                            }}>
                                {order.status}
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                            <div>
                                <h4 style={{ marginBottom: '10px', fontSize: '0.9rem', textTransform: 'uppercase', color: '#9ca3af' }}>Articles</h4>
                                {order.items.map((item, index) => (
                                    <div key={index} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.95rem' }}>
                                        <span>{item.name} x {item.quantity}</span>
                                        <span>{(parseFloat(item.price || item.min_price) * item.quantity).toFixed(2)} €</span>
                                    </div>
                                ))}
                                <div style={{ borderTop: '1px solid #eee', marginTop: '10px', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                                    <span>Total</span>
                                    <span>{order.total.toFixed(2)} €</span>
                                </div>
                            </div>

                            <div>
                                <h4 style={{ marginBottom: '10px', fontSize: '0.9rem', textTransform: 'uppercase', color: '#9ca3af' }}>Livraison & Paiement</h4>
                                <div style={{ fontSize: '0.95rem', color: '#4b5563' }}>
                                    <p><strong>Destinataire:</strong> {order.address.first_name} {order.address.last_name}</p>
                                    <p><strong>Adresse:</strong> {order.address.address1}, {order.address.postcode} {order.address.city}</p>
                                    <p style={{ marginTop: '10px' }}><strong>Méthode:</strong> {order.payment_method}</p>
                                    <p><strong>Expédition:</strong> {order.shipping_method}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Orders;
