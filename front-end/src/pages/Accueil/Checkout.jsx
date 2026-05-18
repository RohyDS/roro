import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import CartService from '../../service/Accueil/CartService';
import { CheckCircle2, ShoppingBag } from 'lucide-react';
import '../../styles/pages/Form.css';

const Checkout = () => {
    const { cart, getCartTotal, clearCart, addOrder } = useCart();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [orderId, setOrderId] = useState(null);

    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        address1: '',
        city: '',
        state: '',
        postcode: '',
        country: 'FR',
        phone: ''
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Lancer le flux d'achat de A à Z via l'API Bagisto
            const res = await CartService.processCheckout(cart, formData);
            const apiOrder = res?.data?.order || res?.order;
            
            // Enregistrement de la commande dans l'historique local pour l'affichage
            const newOrder = addOrder({
                api_id: apiOrder?.id || `ORD-${Date.now()}`,
                items: [...cart],
                total: getCartTotal(),
                address: { ...formData },
                payment_method: 'Paiement à la livraison',
                shipping_method: 'Livraison Standard (Gratuit)'
            });
            
            setOrderId(apiOrder?.id || newOrder.id);
            setSuccess(true);
            clearCart();
        } catch (err) {
            console.error("Erreur commande:", err);
            const msg = err.response?.data?.message || err.response?.data?.error || err.message;
            setError(`Une erreur est survenue lors de la validation : ${msg}`);
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="products-container" style={{ textAlign: 'center', padding: '50px' }}>
                <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'center' }}>
                    <CheckCircle2 size={80} color="#10b981" />
                </div>
                <h2>Commande validée !</h2>
                <p style={{ marginTop: '10px', color: '#666' }}>
                    Merci pour votre achat. Numéro de commande : <strong>{orderId}</strong>
                </p>
                <p style={{ color: '#666' }}>
                    Votre commande sera payée à la livraison.
                </p>
                <div style={{ marginTop: '30px', display: 'flex', gap: '15px', justifyContent: 'center' }}>
                    <Link to="/orders" className="btn-back" style={{ display: 'inline-block', background: '#2563eb', color: 'white', border: 'none' }}>
                        Voir mes commandes
                    </Link>
                    <Link to="/Accueil" className="btn-back" style={{ display: 'inline-block' }}>
                        Retourner à l'accueil
                    </Link>
                </div>
            </div>
        );
    }

    if (cart.length === 0) {
        return (
            <div className="products-container" style={{ textAlign: 'center', padding: '50px' }}>
                <ShoppingBag size={64} color="#d1d5db" style={{ marginBottom: '20px' }} />
                <h2>Votre panier est vide</h2>
                <Link to="/Accueil" className="btn-back" style={{ display: 'inline-block', marginTop: '20px' }}>
                    Retourner à l'accueil
                </Link>
            </div>
        );
    }

    return (
        <div className="products-container">
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <ShoppingBag size={28} /> Validation de la commande
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '40px', marginTop: '30px' }}>
                <div className="checkout-form-section">
                    <h3>Adresse de livraison</h3>
                    <form onSubmit={handleSubmit} className="checkout-form" style={{ marginTop: '20px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                            <div className="form-group">
                                <label>Prénom</label>
                                <input type="text" name="first_name" required value={formData.first_name} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label>Nom</label>
                                <input type="text" name="last_name" required value={formData.last_name} onChange={handleChange} />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Email</label>
                            <input type="email" name="email" required value={formData.email} onChange={handleChange} />
                        </div>

                        <div className="form-group">
                            <label>Adresse</label>
                            <input type="text" name="address1" required value={formData.address1} onChange={handleChange} />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
                            <div className="form-group">
                                <label>Ville</label>
                                <input type="text" name="city" required value={formData.city} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label>Code Postal</label>
                                <input type="text" name="postcode" required value={formData.postcode} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label>Téléphone</label>
                                <input type="text" name="phone" required value={formData.phone} onChange={handleChange} />
                            </div>
                        </div>

                        <div style={{ marginTop: '30px', padding: '20px', background: '#f0f9ff', borderRadius: '8px', border: '1px solid #bae6fd' }}>
                            <h4 style={{ color: '#0369a1' }}>Méthode de paiement</h4>
                            <div style={{ display: 'flex', alignItems: 'center', marginTop: '10px' }}>
                                <input type="radio" checked readOnly style={{ marginRight: '10px' }} />
                                <span>Paiement à la livraison (Cash on Delivery)</span>
                            </div>
                        </div>

                        <div style={{ marginTop: '20px', padding: '20px', background: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                            <h4 style={{ color: '#15803d' }}>Mode de livraison</h4>
                            <div style={{ display: 'flex', alignItems: 'center', marginTop: '10px' }}>
                                <input type="radio" checked readOnly style={{ marginRight: '10px' }} />
                                <span>Livraison Standard - Gratuit</span>
                            </div>
                        </div>

                        {error && <p style={{ color: '#ef4444', marginTop: '20px' }}>{error}</p>}

                        <button 
                            type="submit" 
                            disabled={loading}
                            style={{ 
                                width: '100%', 
                                marginTop: '30px', 
                                background: '#2563eb', 
                                color: 'white', 
                                border: 'none', 
                                padding: '15px', 
                                borderRadius: '6px', 
                                fontSize: '1.1rem', 
                                fontWeight: 'bold',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                opacity: loading ? 0.7 : 1
                            }}
                        >
                            {loading ? 'Traitement en cours...' : 'Confirmer la commande'}
                        </button>
                    </form>
                </div>

                <div className="order-summary" style={{ background: '#f9fafb', padding: '25px', borderRadius: '8px', height: 'fit-content' }}>
                    <h3>Résumé de la commande</h3>
                    <div style={{ marginTop: '20px' }}>
                        {cart.map(item => (
                            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '0.9rem' }}>
                                <span>{item.name} x {item.quantity}</span>
                                <span>{(parseFloat(item.price || item.min_price) * item.quantity).toFixed(2)} €</span>
                            </div>
                        ))}
                        <hr style={{ margin: '20px 0', border: 'none', borderTop: '1px solid #ddd' }} />
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                            <span>Sous-total</span>
                            <span>{getCartTotal().toFixed(2)} €</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', color: '#15803d' }}>
                            <span>Livraison</span>
                            <span>Gratuit</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', fontSize: '1.2rem', fontWeight: 'bold' }}>
                            <span>Total</span>
                            <span>{getCartTotal().toFixed(2)} €</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
