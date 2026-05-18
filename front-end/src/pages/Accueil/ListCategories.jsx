import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ListeCategorieService from '../../service/Accueil/ListCategorieService';
import '../../styles/pages/Form.css';

const ListeCategorie = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setLoading(true);
                const data = await ListeCategorieService.getCategories();
                
                // Vérification si data est bien un tableau
                if (Array.isArray(data)) {
                    setCategories(data);
                } else {
                    console.error("Les données reçues ne sont pas un tableau:", data);
                    setError("Format de données invalide.");
                }
            } catch (err) {
                console.error("Erreur fetchCategories:", err);
                setError("Impossible de charger les catégories. Vérifiez la connexion à l'API.");
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    if (loading) return <p className="loading-text">Chargement des catégories...</p>;
    if (error) return <p className="error-message">{error}</p>;

    return (
        <div className="category-container">
            <h2>Nos Catégories</h2>
            {categories.length === 0 ? (
                <p>Aucune catégorie trouvée.</p>
            ) : (
                <ul>
                    {categories.map((cat) => (
                        <li key={cat.id} className="category-item">
                            <Link 
                                to={`/categories/${cat.id}/produits`} 
                                style={{ 
                                    textDecoration: 'none', 
                                    color: 'inherit', 
                                    display: 'block',
                                    width: '100%' 
                                }}
                            >
                                <span className="category-name">
                                    {cat.name || cat.nom || `Catégorie ${cat.id}`}
                                </span>
                                {cat.description && (
                                    <p className="category-description">
                                        {cat.description.replace(/<[^>]*>/g, '').substring(0, 100)}...
                                    </p>
                                )}
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default ListeCategorie;
