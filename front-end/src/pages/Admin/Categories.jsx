import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import ProductImport from '../../service/Admin/import/ProductImport.js';
import { ArrowLeft, PlusCircle, Trash2, FolderPlus } from 'lucide-react';
import '../../styles/pages/Form.css';

const AdminCategories = () => {
    const { customCategories, addCategory, deleteCategory } = useCart();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [apiCategories, setApiCategories] = useState([]);

    // Charger les catégories depuis l'API au chargement
    useEffect(() => {
        fetchApiCategories();
    }, []);

    const fetchApiCategories = async () => {
        try {
            const data = await ProductImport.getCategories();
            setApiCategories(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Erreur chargement catégories API:", error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!name.trim()) return;

        setLoading(true);
        setMessage(null);

        try {
            // 1. Enregistrement dans la base de données via l'API Bagisto
            const newApiCategory = await ProductImport.createCategory(name);
            console.log("Catégorie créée dans Bagisto:", newApiCategory);

            // 2. Mise à jour de la liste locale (affichage en haut)
            addCategory({
                name: name,
                description: description,
                status: 1,
                api_id: newApiCategory.id // On stocke l'ID réel de la DB
            });

            // 3. Rafraîchir la liste globale
            await fetchApiCategories();

            setName('');
            setDescription('');
            setMessage({ type: 'success', text: 'Catégorie enregistrée dans la base de données avec succès !' });
        } catch (error) {
            console.error("Erreur création catégorie:", error);
            setMessage({ type: 'error', text: "Erreur lors de l'enregistrement dans la base de données." });
        } finally {
            setLoading(false);
        }

        setTimeout(() => setMessage(null), 5000);
    };

    return (
        <div className="products-container">
            <div style={{ marginBottom: '20px' }}>
                <Link to="/admin/dashboard" style={{ color: '#2563eb', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ArrowLeft size={18} /> Retour au Dashboard
                </Link>
            </div>

            <h2 style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <FolderPlus size={28} /> Gestion des Catégories
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', marginTop: '30px' }}>
                {/* Formulaire d'ajout */}
                <div style={{ background: 'white', padding: '25px', borderRadius: '8px', border: '1px solid #eee' }}>
                    <h3>Ajouter une nouvelle catégorie</h3>
                    
                    {message && (
                        <div style={{ 
                            background: message.type === 'success' ? '#f0fdf4' : '#fef2f2', 
                            color: message.type === 'success' ? '#15803d' : '#ef4444', 
                            padding: '10px', 
                            borderRadius: '6px', 
                            margin: '15px 0', 
                            border: `1px solid ${message.type === 'success' ? '#bbf7d0' : '#fecaca'}` 
                        }}>
                            {message.text}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="checkout-form" style={{ marginTop: '20px' }}>
                        <div className="form-group">
                            <label>Nom de la catégorie</label>
                            <input 
                                type="text" 
                                value={name} 
                                onChange={(e) => setName(e.target.value)} 
                                required 
                                disabled={loading}
                                placeholder="Ex: Informatique, Mode..."
                            />
                        </div>

                        <div className="form-group">
                            <label>Description (optionnelle)</label>
                            <textarea 
                                value={description} 
                                onChange={(e) => setDescription(e.target.value)}
                                disabled={loading}
                                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', minHeight: '100px' }}
                                placeholder="Décrivez la catégorie..."
                            ></textarea>
                        </div>

                        <button 
                            type="submit"
                            disabled={loading}
                            style={{ 
                                width: '100%', 
                                background: loading ? '#93c5fd' : '#2563eb', 
                                color: 'white', 
                                border: 'none', 
                                padding: '12px', 
                                borderRadius: '6px', 
                                fontWeight: 'bold',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                marginTop: '10px'
                            }}
                        >
                            {loading ? 'Création en cours...' : 'Créer la catégorie'}
                        </button>
                    </form>
                </div>

                {/* Liste des catégories */}
                <div>
                    <h3>Catégories enregistrées dans la base ({apiCategories.length})</h3>
                    <div style={{ marginTop: '20px', maxHeight: '500px', overflowY: 'auto', paddingRight: '10px' }}>
                        {apiCategories.length === 0 ? (
                            <p style={{ color: '#6b7280', fontStyle: 'italic' }}>Aucune catégorie trouvée dans la base de données.</p>
                        ) : (
                            <ul style={{ listStyle: 'none', padding: 0 }}>
                                {apiCategories.map((cat) => (
                                    <li key={cat.id} style={{ 
                                        background: 'white', 
                                        padding: '12px', 
                                        borderRadius: '8px', 
                                        marginBottom: '10px', 
                                        border: '1px solid #eee',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}>
                                        <div>
                                            <strong style={{ display: 'block' }}>{cat.name}</strong>
                                            <small style={{ color: '#6b7280' }}>ID: {cat.id} | Slug: {cat.slug}</small>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                        <p style={{ marginTop: '20px', fontSize: '0.85rem', color: '#6b7280', padding: '10px', background: '#f9fafb', borderRadius: '6px' }}>
                            💡 Ces catégories proviennent directement de la base de données Bagisto via l'API.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminCategories;
