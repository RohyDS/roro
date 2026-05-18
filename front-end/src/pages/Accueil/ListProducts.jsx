import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import ProductService from '../../service/Accueil/ProductService';
import WishlistService from '../../service/Accueil/WishlistService';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { ArrowLeft, Heart } from 'lucide-react';
import '../../styles/pages/List.css';

const ListProducts = () => {
    const { categoryId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [quantities, setQuantities] = useState({});
    const { addToCart, toggleWishlistItem, isInWishlist } = useCart();
    const { customer } = useAuth();

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await ProductService.getProductsByCategory(categoryId);
                
                // Sécurisation : vérifier que data est un tableau
                const productsList = Array.isArray(data) ? data : (data?.data && Array.isArray(data.data) ? data.data : []);
                
                setProducts(productsList);
                
                // Initialiser les quantités à 1 pour chaque produit
                const initialQuantities = {};
                productsList.forEach(product => {
                    initialQuantities[product.id] = 1;
                });
                setQuantities(initialQuantities);
            } catch (err) {
                console.error("Erreur fetchProducts:", err);
                setError("Impossible de charger les produits. Vérifiez que votre API Bagisto est lancée et que l'URL est correcte.");
            } finally {
                setLoading(false);
            }
        };

        if (categoryId) {
            fetchProducts();
        }
    }, [categoryId]);

    const handleQuantityChange = (productId, value) => {
        const qty = parseInt(value);
        if (qty > 0) {
            setQuantities(prev => ({
                ...prev,
                [productId]: qty
            }));
        }
    };

    const handleAddToCart = (product) => {
        if (!customer) {
            // Rediriger vers login si non connecté
            navigate('/login', { state: { from: location } });
            return;
        }
        const quantity = quantities[product.id] || 1;
        addToCart(product, quantity);
        alert(`Ajouté au panier : ${product.name} (Quantité: ${quantity})`);
    };

    const handleToggleWishlist = async (product) => {
        if (!customer) {
            navigate('/login', { state: { from: location } });
            return;
        }

        try {
            // Appel API Bagisto
            await WishlistService.toggleWishlist(product.id);
            // Mise à jour locale du context
            toggleWishlistItem(product);
        } catch (error) {
            console.error("Erreur toggle wishlist:", error);
            alert("Erreur lors de la mise à jour de la wishlist.");
        }
    };

    if (loading) return <p className="loading-text">Chargement des produits...</p>;
    
    return (
        <div className="products-container">
            <div style={{ marginBottom: '20px' }}>
                <Link to="/Accueil" style={{ color: '#2563eb', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ArrowLeft size={18} /> Retour aux catégories
                </Link>
            </div>
            
            <h2>Produits de la catégorie</h2>

            {error && (
                <div className="error-message" style={{ marginBottom: '20px' }}>
                    {error}
                </div>
            )}
            
            {!error && products.length === 0 ? (
                <p>Aucun produit trouvé dans cette catégorie.</p>
            ) : (
                <div className="products-grid">
                    {products.map((product) => (
                        <div key={product.id} className="product-card" style={{ position: 'relative' }}>
                            {/* Bouton Wishlist flottant */}
                            <button 
                                onClick={() => handleToggleWishlist(product)}
                                style={{
                                    position: 'absolute',
                                    top: '10px',
                                    right: '10px',
                                    background: 'white',
                                    border: '1px solid #eee',
                                    borderRadius: '50%',
                                    width: '35px',
                                    height: '35px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    zIndex: 2,
                                    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                                }}
                                title={isInWishlist(product.id) ? "Retirer des favoris" : "Ajouter aux favoris"}
                            >
                                <Heart 
                                    size={20} 
                                    color={isInWishlist(product.id) ? "#ef4444" : "#9ca3af"} 
                                    fill={isInWishlist(product.id) ? "#ef4444" : "none"} 
                                />
                            </button>

                            <Link to={`/produits/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                <div className="product-image">
                                    {product.base_image?.medium_image_url ? (
                                        <img src={product.base_image.medium_image_url} alt={product.name} />
                                    ) : product.images && product.images.length > 0 ? (
                                        <img src={product.images[0].url || product.images[0].medium_image_url} alt={product.name} />
                                    ) : (
                                        <div className="no-image">Pas d'image</div>
                                    )}
                                </div>
                                
                                <div className="product-info">
                                    <span className="product-sku-badge">{product.sku}</span>
                                    <h3>{product.name}</h3>
                                    <p className="product-price">
                                        {product.min_price || product.prices?.final?.formatted_price || product.formatted_price || (product.price ? `${product.price} €` : 'Prix non disponible')}
                                    </p>
                                    {product.short_description && (
                                        <div 
                                            className="product-short-desc-list" 
                                            dangerouslySetInnerHTML={{ __html: product.short_description.substring(0, 80) + '...' }} 
                                        />
                                    )}
                                </div>
                            </Link>

                            <div className="product-actions">
                                <div className="qty-selector">
                                    <label htmlFor={`qty-${product.id}`}>Qté:</label>
                                    <input 
                                        id={`qty-${product.id}`}
                                        type="number" 
                                        min="1" 
                                        value={quantities[product.id] || 1}
                                        onChange={(e) => handleQuantityChange(product.id, e.target.value)}
                                    />
                                </div>
                                <button 
                                    className="btn-add-to-cart"
                                    onClick={() => handleAddToCart(product)}
                                >
                                    Ajouter au panier
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ListProducts;
