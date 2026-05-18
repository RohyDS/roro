import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import ProductService from '../../service/Accueil/ProductService';
import WishlistService from '../../service/Accueil/WishlistService';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { ArrowLeft, AlertTriangle, Heart, Plus, Minus, ShoppingCart } from 'lucide-react';
import '../../styles/pages/ProductDetail.css';

const ProductDetail = () => {
    const { productId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const { addToCart, toggleWishlistItem, isInWishlist } = useCart();
    const { customer } = useAuth();

    useEffect(() => {
        const fetchProductDetail = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await ProductService.getProductById(productId);
                
                if (data) {
                    setProduct(data);
                } else {
                    setError("Produit non trouvé.");
                }
            } catch (err) {
                console.error("Erreur fetchProductDetail:", err);
                setError("Impossible de charger les détails du produit. Vérifiez que l'API est accessible.");
            } finally {
                setLoading(false);
            }
        };

        if (productId) {
            fetchProductDetail();
        }
    }, [productId]);

    const handleQuantityChange = (e) => {
        const val = parseInt(e.target.value);
        if (val > 0) setQuantity(val);
    };

    const handleAddToCart = () => {
        if (!customer) {
            // Rediriger vers login si non connecté
            navigate('/login', { state: { from: location } });
            return;
        }
        addToCart(product, quantity);
        alert(`Ajouté au panier : ${product.name} (Quantité: ${quantity})`);
    };

    const handleToggleWishlist = async () => {
        if (!customer) {
            navigate('/login', { state: { from: location } });
            return;
        }

        try {
            await WishlistService.toggleWishlist(product.id);
            toggleWishlistItem(product);
        } catch (error) {
            console.error("Erreur toggle wishlist:", error);
            alert("Erreur lors de la mise à jour de la wishlist.");
        }
    };

    if (loading) return <div className="loading-text">Chargement du produit...</div>;
    if (error) return (
        <div className="products-container" style={{ textAlign: 'center', padding: '50px' }}>
            <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'center' }}>
                <AlertTriangle size={64} color="#ef4444" />
            </div>
            <h2>{error}</h2>
            <button className="btn-back" onClick={() => navigate(-1)} style={{ marginTop: '20px', display: 'flex', alignItems: 'center', gap: '8px', margin: '20px auto' }}>
                <ArrowLeft size={18} /> Retour
            </button>
        </div>
    );
    if (!product) return <div className="error-message">Produit non trouvé.</div>;

    return (
        <div className="product-detail-container">
            <button className="btn-back" onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ArrowLeft size={18} /> Retour
            </button>

            <div className="product-detail-content">
                <div className="product-detail-image">
                    {product.base_image?.large_image_url ? (
                        <img src={product.base_image.large_image_url} alt={product.name} />
                    ) : product.images && product.images.length > 0 ? (
                        <img src={product.images[0].url || product.images[0].medium_image_url} alt={product.name} />
                    ) : (
                        <div className="no-image-placeholder">Pas d'image disponible</div>
                    )}
                </div>

                <div className="product-detail-info">
                    <h1 className="product-title">{product.name}</h1>
                    <p className="product-sku">SKU: {product.sku}</p>
                    
                    <div className="product-price-section">
                        <span className="current-price">
                            {product.min_price || product.prices?.final?.formatted_price || product.formatted_price || (product.price ? `${product.price} €` : 'Prix non disponible')}
                        </span>
                    </div>

                    {product.description && (
                        <div className="product-description" dangerouslySetInnerHTML={{ __html: product.description }} />
                    )}

                    <div className="product-purchase-section">
                        <div className="quantity-control">
                            <label htmlFor="qty">Quantité :</label>
                            <div className="qty-input-wrapper">
                                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Minus size={16} />
                                </button>
                                <input 
                                    id="qty"
                                    type="number" 
                                    value={quantity} 
                                    onChange={handleQuantityChange}
                                    min="1"
                                />
                                <button onClick={() => setQuantity(q => q + 1)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Plus size={16} />
                                </button>
                            </div>
                        </div>

                        <button className="btn-add-cart-large" onClick={handleAddToCart} style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center' }}>
                            <ShoppingCart size={20} /> Ajouter au panier
                        </button>

                        <button 
                            className="btn-wishlist-detail" 
                            onClick={handleToggleWishlist}
                            style={{
                                background: 'none',
                                border: '1px solid #d1d5db',
                                borderRadius: '8px',
                                padding: '12px 20px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.2s'
                            }}
                            title={isInWishlist(product.id) ? "Retirer des favoris" : "Ajouter aux favoris"}
                        >
                            <Heart 
                                size={24} 
                                color={isInWishlist(product.id) ? "#ef4444" : "#9ca3af"} 
                                fill={isInWishlist(product.id) ? "#ef4444" : "none"} 
                            />
                        </button>
                    </div>

                    {product.short_description && (
                        <div className="product-short-desc">
                            <h3>En bref</h3>
                            <div dangerouslySetInnerHTML={{ __html: product.short_description }} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;
