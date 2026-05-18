import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import WishlistService from '../../service/Accueil/WishlistService';
import { Heart, ShoppingCart, Trash2, Package } from 'lucide-react';
import '../../styles/pages/Form.css';

const Wishlist = () => {
    const { wishlist, setWishlist, toggleWishlistItem, addToCart } = useCart();
    const { customer } = useAuth();

    // Charger la wishlist depuis l'API si le client est connecté
    useEffect(() => {
        const fetchWishlist = async () => {
            if (customer) {
                try {
                    const data = await WishlistService.getWishlist();
                    setWishlist(data || []);
                } catch (error) {
                    console.error("Erreur lors du chargement de la wishlist API:", error);
                }
            }
        };
        fetchWishlist();
    }, [customer, setWishlist]);

    const handleRemove = async (productId) => {
        if (customer) {
            try {
                await WishlistService.removeWishlistItem(productId);
            } catch (error) {
                console.error("Erreur suppression API wishlist:", error);
            }
        }
        toggleWishlistItem({ id: productId });
    };

    const handleAddToCart = (product) => {
        addToCart(product, 1);
    };

    return (
        <div className="cart-container" style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ marginBottom: '20px' }}>
                <Link to="/Accueil" style={{ color: '#2563eb', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    ← Continuer mes achats
                </Link>
            </div>

            <h2 style={{ marginBottom: '30px', fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '15px' }}>
                Ma Wishlist <Heart size={32} fill="#ef4444" color="#ef4444" />
            </h2>

            {wishlist.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', background: '#f9fafb', borderRadius: '12px' }}>
                    <p style={{ fontSize: '1.2rem', color: '#6b7280', marginBottom: '20px' }}>Votre liste de favoris est vide.</p>
                    <Link to="/Accueil" style={{ 
                        display: 'inline-block',
                        background: '#2563eb', 
                        color: 'white', 
                        padding: '12px 24px', 
                        borderRadius: '8px', 
                        textDecoration: 'none',
                        fontWeight: 'bold'
                    }}>
                        Découvrir nos produits
                    </Link>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '25px' }}>
                    {wishlist.map((item) => {
                        const product = item.product || item;
                        return (
                            <div key={product.id} style={{ 
                                background: 'white', 
                                borderRadius: '12px', 
                                border: '1px solid #eee', 
                                overflow: 'hidden',
                                transition: 'transform 0.2s',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                            }}>
                                <Link to={`/produits/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                    <div style={{ height: '200px', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}>
                                        <Package size={64} color="#d1d5db" />
                                    </div>
                                    <div style={{ padding: '15px' }}>
                                        <h3 style={{ margin: '0 0 10px', fontSize: '1.1rem' }}>{product.name || product.nom}</h3>
                                        <p style={{ fontWeight: 'bold', color: '#2563eb', fontSize: '1.2rem', margin: '0 0 15px' }}>
                                            {product.price || product.prix_vente} €
                                        </p>
                                    </div>
                                </Link>
                                
                                <div style={{ padding: '0 15px 15px', display: 'flex', gap: '10px' }}>
                                    <button 
                                        onClick={() => handleAddToCart(product)}
                                        style={{ 
                                            flex: 2,
                                            background: '#2563eb', 
                                            color: 'white', 
                                            border: 'none', 
                                            padding: '10px', 
                                            borderRadius: '6px', 
                                            cursor: 'pointer',
                                            fontWeight: 'bold',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '8px'
                                        }}
                                    >
                                        <ShoppingCart size={18} /> Panier
                                    </button>
                                    <button 
                                        onClick={() => handleRemove(product.id)}
                                        style={{ 
                                            flex: 1,
                                            background: '#fee2e2', 
                                            color: '#ef4444', 
                                            border: 'none', 
                                            padding: '10px', 
                                            borderRadius: '6px', 
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                        title="Retirer des favoris"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Wishlist;
