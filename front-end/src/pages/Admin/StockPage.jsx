import React, { useEffect, useState } from "react";
import { getProducts, updateProductInventory } from "../../service/Admin/ProductService";

const StockPage = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [rows, setRows] = useState([{ productId: '', qty: 5 }]);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const data = await getProducts();
            setProducts(data.data || []);
        } catch (error) {
            console.error("Erreur lors du chargement des produits :", error);
            setMessage({ text: "Erreur lors du chargement des produits", type: "error" });
        } finally {
            setLoading(false);
        }
    };

    const handleAddRow = () => {
        setRows([...rows, { productId: '', qty: 5 }]);
    };

    const handleRemoveRow = (index) => {
        if (rows.length === 1) {
            setRows([{ productId: '', qty: 5 }]);
            return;
        }
        const newRows = [...rows];
        newRows.splice(index, 1);
        setRows(newRows);
    };

    const handleRowChange = (index, field, value) => {
        const newRows = [...rows];
        newRows[index][field] = value;
        setRows(newRows);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setMessage({ text: '', type: '' });

        // Filter valid rows (where a product has been selected)
        const validRows = rows.filter(row => row.productId !== '');
        if (validRows.length === 0) {
            setMessage({ text: "Veuillez choisir au moins un produit.", type: "error" });
            return;
        }

        // Validate quantities
        for (const row of validRows) {
            const qty = parseInt(row.qty);
            if (isNaN(qty) || qty < 1 || qty > 5) {
                setMessage({ text: "La quantité de chaque produit doit être entre 1 et 5.", type: "error" });
                return;
            }
        }

        setSaving(true);
        let successCount = 0;
        let errors = [];

        for (const row of validRows) {
            const product = products.find(p => p.id === parseInt(row.productId));
            if (!product) {
                errors.push(`Produit ID ${row.productId} non trouvé.`);
                continue;
            }

            try {
                let currentStock = 0;
                let sourceId = 1;

                if (product.inventories && product.inventories.length > 0) {
                    currentStock = product.inventories[0].qty || 0;
                    sourceId = product.inventories[0].inventory_source_id || 1;
                }

                const addedStock = parseInt(row.qty);
                const newTotalStock = parseInt(currentStock) + addedStock;

                // Prepare payload
                const payload = {};
                for (const key in product) {
                    if (product[key] !== null && typeof product[key] !== 'object') {
                        payload[key] = product[key];
                    }
                }

                payload.channel = product.channel || 'default';
                payload.locale = product.locale || 'fr';
                payload.inventories = {
                    [sourceId]: newTotalStock
                };

                if (product.categories && Array.isArray(product.categories)) {
                    payload.categories = product.categories.map(c => c.id || c);
                }

                await updateProductInventory(product.id, payload);
                successCount++;
            } catch (error) {
                console.error(`Erreur lors de l'enregistrement du stock pour le produit ${product.name || product.id} :`, error);
                errors.push(`${product.name || product.id}`);
            }
        }

        setSaving(false);

        if (errors.length > 0) {
            setMessage({
                text: `${successCount} produit(s) mis à jour. Échec pour : ${errors.join(', ')}`,
                type: "error"
            });
        } else {
            setMessage({
                text: `Succès : ${successCount} produit(s) mis à jour.`,
                type: "success"
            });
            // Reset to a single empty row
            setRows([{ productId: '', qty: 5 }]);
            // Refresh local products list to show new stock numbers if needed
            fetchProducts();
        }
    };

    return (
        <div>
            <h1>
                Saisie Multiple de Stock
            </h1>

            {message.text && (
                <div>
                    {message.text}
                </div>
            )}

            {loading && products.length === 0 ? (
                <p>Chargement des produits...</p>
            ) : (
                <form onSubmit={handleSave}>
                    <table>
                        <thead>
                            <tr>
                                <th>Produit</th>
                                <th>Quantité (Max 5)</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row, index) => (
                                <tr key={index}>
                                    <td>
                                        <select
                                            value={row.productId}
                                            onChange={(e) => handleRowChange(index, "productId", e.target.value)}
                                            required
                                        >
                                            <option value="">-- Choisir un produit --</option>
                                            {products.map(p => {
                                                // Find current stock if available
                                                const qty = p.inventories && p.inventories[0] ? p.inventories[0].qty : 0;
                                                return (
                                                    <option key={p.id} value={p.id}>
                                                        {p.sku} - {p.name} (Stock actuel: {qty})
                                                    </option>
                                                );
                                            })}
                                        </select>
                                    </td>
                                    <td>
                                        <input
                                            type="number"
                                            min="1"
                                            max="5"
                                            value={row.qty}
                                            onChange={(e) => handleRowChange(index, "qty", parseInt(e.target.value) || "")}
                                            required
                                        />
                                    </td>
                                    <td>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveRow(index)}
                                        >
                                            Supprimer
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div>
                        <button
                            type="button"
                            onClick={handleAddRow}
                        >
                            + Ajouter un produit
                        </button>

                        <button
                            type="submit"
                            disabled={saving}
                        >
                            {saving ? "Enregistrement..." : "Enregistrer"}
                        </button>
                    </div>
                </form>
            )}

            <div>
                <h3>Stock actuel en base :</h3>
                {products.length === 0 ? (
                    <p>Aucun produit disponible.</p>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>SKU</th>
                                <th>Nom</th>
                                <th>Quantité</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map(p => {
                                const qty = p.inventories && p.inventories[0] ? p.inventories[0].qty : 0;
                                return (
                                    <tr key={p.id}>
                                        <td>{p.id}</td>
                                        <td>{p.sku}</td>
                                        <td>{p.name}</td>
                                        <td>{qty}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default StockPage;

