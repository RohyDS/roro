import React, { useEffect, useState } from "react";
import { getProducts, updateProductInventory } from "../../service/Admin/ProductService";

const StockPage = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [stockToAdd, setStockToAdd] = useState({});

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const data = await getProducts();
            setProducts(data.data || []);
        } catch (error) {
            console.error("Erreur :", error);
            setMessage({ text: "Erreur lors du chargement des produits", type: "error" });
        } finally {
            setLoading(false);
        }
    };

    const handleStockChange = (productId, value) => {
        setStockToAdd({
            ...stockToAdd,
            [productId]: value
        });
    };

    const handleAddStock = async (product) => {
        const addedStock = parseInt(stockToAdd[product.id] || 0);
        if (addedStock <= 0 || isNaN(addedStock)) {
            setMessage({ text: "Veuillez entrer une quantité valide à ajouter.", type: "error" });
            return;
        }

        try {
            // Find current stock. If the user exposed 'inventories' via $with, we try to use it.
            // Also need inventory_source_id, default to 1 if not found.
            let currentStock = 0;
            let sourceId = 1;

            if (product.inventories && product.inventories.length > 0) {
                currentStock = product.inventories[0].qty || 0;
                sourceId = product.inventories[0].inventory_source_id || 1;
            }

            const newTotalStock = parseInt(currentStock) + addedStock;

            // Prepare the payload by extracting only primitive attributes 
            // to avoid SQL errors from nested relational data (like inventory_sources, images, etc.)
            const payload = {};
            for (const key in product) {
                if (product[key] !== null && typeof product[key] !== 'object') {
                    payload[key] = product[key];
                }
            }

            // Manually add the required fields and correctly formatted relations
            payload.channel = product.channel || 'default';
            payload.locale = product.locale || 'fr';
            payload.inventories = {
                [sourceId]: newTotalStock
            };
            
            if (product.categories && Array.isArray(product.categories)) {
                payload.categories = product.categories.map(c => c.id || c);
            }

            await updateProductInventory(product.id, payload);

            setMessage({ text: `Stock ajouté avec succès pour le produit ${product.name || product.id}.`, type: "success" });
            setStockToAdd({ ...stockToAdd, [product.id]: '' });
            fetchProducts();
        } catch (error) {
            setMessage({ text: `Erreur lors de l'ajout de stock pour le produit ${product.id}.`, type: "error" });
        }
    };

    const calculateTotalStock = (product) => {
        if (!product.inventories || product.inventories.length === 0) return 0;
        return product.inventories.reduce((total, inv) => total + (parseInt(inv.qty) || 0), 0);
    };

    return (
        <div style={{ padding: '20px' }}>
            <h2 style={{ marginBottom: '20px' }}>Gestion des Stocks</h2>

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

            {loading ? (
                <p>Chargement des produits...</p>
            ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: '8px', overflow: 'hidden' }}>
                    <thead style={{ background: '#f9fafb' }}>
                        <tr>
                            <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #eee' }}>ID</th>
                            <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #eee' }}>SKU / Nom</th>
                            <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #eee' }}>Stock Actuel</th>
                            <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #eee' }}>Ajouter au Stock</th>
                            <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #eee' }}>Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {products.map((product) => (
                            <tr key={product.id}>
                                <td style={{ padding: '15px', borderBottom: '1px solid #eee' }}>{product.id}</td>
                                <td style={{ padding: '15px', borderBottom: '1px solid #eee' }}>
                                    <strong>{product.sku}</strong><br />
                                    {product.name}
                                </td>
                                <td style={{ padding: '15px', borderBottom: '1px solid #eee' }}>
                                    <span style={{ 
                                        background: '#e0e7ff', 
                                        color: '#3730a3', 
                                        padding: '4px 10px', 
                                        borderRadius: '12px', 
                                        fontWeight: 'bold' 
                                    }}>
                                        {calculateTotalStock(product)}
                                    </span>
                                </td>
                                <td style={{ padding: '15px', borderBottom: '1px solid #eee' }}>
                                    <input 
                                        type="number" 
                                        min="1"
                                        placeholder="Quantité"
                                        value={stockToAdd[product.id] || ''}
                                        onChange={(e) => handleStockChange(product.id, e.target.value)}
                                        style={{
                                            padding: '8px',
                                            borderRadius: '4px',
                                            border: '1px solid #d1d5db',
                                            width: '100px'
                                        }}
                                    />
                                </td>
                                <td style={{ padding: '15px', borderBottom: '1px solid #eee' }}>
                                    <button 
                                        onClick={() => handleAddStock(product)}
                                        style={{
                                            padding: '8px 15px',
                                            backgroundColor: '#4f46e5',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Ajouter
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default StockPage;
