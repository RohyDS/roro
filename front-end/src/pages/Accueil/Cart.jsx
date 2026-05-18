import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { ArrowLeft, Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import '../../styles/pages/List.css'; // On réutilise certains styles de liste

const Cart = () => {
    const { cart, removeFromCart, updateQuantity, getCartTotal } = useCart();
    const navigate = useNavigate();

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
            <div style={{ marginBottom: '20px' }}>
                <Link to="/Accueil" style={{ color: '#2563eb', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ArrowLeft size={18} /> Continuer mes achats
                </Link>
            </div>

            <h2 style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <ShoppingBag size={28} /> Votre Panier
            </h2>

            <div className="cart-content" style={{ marginTop: '30px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left' }}>
                            <th style={{ padding: '10px' }}>Produit</th>
                            <th style={{ padding: '10px' }}>Prix</th>
                            <th style={{ padding: '10px' }}>Quantité</th>
                            <th style={{ padding: '10px' }}>Total</th>
                            <th style={{ padding: '10px' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {cart.map((item) => (
                            <tr key={item.id} style={{ borderBottom: '1px solid #eee' }}>
                                <td style={{ padding: '15px 10px', display: 'flex', alignItems: 'center' }}>
                                    <div style={{ width: '50px', height: '50px', marginRight: '15px' }}>
                                        {item.base_image?.small_image_url || item.images?.[0]?.url ? (
                                            <img 
                                                src={item.base_image?.small_image_url || item.images[0].url} 
                                                alt={item.name} 
                                                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }}
                                            />
                                        ) : (
                                            <div style={{ background: '#eee', width: '100%', height: '100%', borderRadius: '4px' }}></div>
                                        )}
                                    </div>
                                    <span>{item.name}</span>
                                </td>
                                <td style={{ padding: '10px' }}>
                                    {item.price || item.min_price} €
                                </td>
                                <td style={{ padding: '10px' }}>
                                    <div className="qty-input-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        <button 
                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '5px' }}
                                        >
                                            <Minus size={14} />
                                        </button>
                                        <input 
                                            type="number" 
                                            value={item.quantity} 
                                            onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                                            style={{ width: '40px', textAlign: 'center' }}
                                        />
                                        <button 
                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '5px' }}
                                        >
                                            <Plus size={14} />
                                        </button>
                                    </div>
                                </td>
                                <td style={{ padding: '10px' }}>
                                    {(parseFloat(item.price || item.min_price) * item.quantity).toFixed(2)} €
                                </td>
                                <td style={{ padding: '10px' }}>
                                    <button 
                                        onClick={() => removeFromCart(item.id)}
                                        style={{ background: '#ef4444', color: 'white', border: 'none', padding: '8px', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
                                        title="Supprimer"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'flex-end' }}>
                    <div style={{ textAlign: 'right', background: '#f9fafb', padding: '20px', borderRadius: '8px', minWidth: '250px' }}>
                        <div style={{ fontSize: '1.2rem', marginBottom: '10px' }}>
                            <strong>Total: {getCartTotal().toFixed(2)} €</strong>
                        </div>
                        <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '20px' }}>Frais de livraison: Gratuit</p>
                        <button 
                            onClick={() => navigate('/checkout')}
                            style={{ background: '#2563eb', color: 'white', border: 'none', padding: '12px 25px', borderRadius: '6px', cursor: 'pointer', width: '100%', fontSize: '1rem', fontWeight: 'bold' }}
                        >
                            Passer à la commande
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
