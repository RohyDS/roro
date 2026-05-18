import React, { useState } from 'react';
import SettingService from '../../service/Admin/SettingService';
import { Settings as SettingsIcon, RefreshCw, CheckCircle2, AlertCircle, Info, Trash2 } from 'lucide-react';

const Settings = () => {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [results, setResults] = useState(null);

    const models = [
        { id: 'products', name: 'Produits', description: 'Supprime tous les produits du catalogue' },
        { id: 'categories', name: 'Catégories', description: 'Supprime toutes les catégories (sauf la racine)' },
        { id: 'attributes', name: 'Attributs', description: 'Supprime les attributs personnalisés' },
        { id: 'customers', name: 'Clients', description: 'Supprime tous les clients enregistrés' },
        { id: 'orders', name: 'Commandes', description: 'Supprime toutes les commandes et transactions' },
        { id: 'invoices', name: 'Factures', description: 'Supprime toutes les factures générées' },
        { id: 'carts', name: 'Paniers', description: 'Vide tous les paniers et paniers abandonnés' },
    ];

    const handleResetAll = async () => {
        if (!window.confirm("Êtes-vous sûr de vouloir tout réinitialiser ? Cette action est irréversible.")) {
            return;
        }

        setLoading(true);
        setMessage(null);
        setResults(null);

        try {
            const response = await SettingService.reset(models.map(m => m.id));
            setMessage({ type: 'success', text: response.message });
            setResults(response.details);
        } catch (error) {
            setMessage({ type: 'error', text: "Une erreur est survenue lors de la réinitialisation." });
        } finally {
            setLoading(false);
        }
    };

    const handleResetSingle = async (modelId) => {
        if (!window.confirm(`Réinitialiser ${modelId} ?`)) return;

        setLoading(true);
        setMessage(null);

        try {
            const response = await SettingService.reset([modelId]);
            setMessage({ type: 'success', text: response.message });
            setResults(response.details);
        } catch (error) {
            setMessage({ type: 'error', text: "Erreur lors de la suppression." });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="settings-container">
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
                <SettingsIcon size={28} /> Paramètres & Réinitialisation
            </h2>

            {message && (
                <div style={{ 
                    padding: '15px', borderRadius: '8px', marginBottom: '25px',
                    background: message.type === 'success' ? '#f0fdf4' : '#fef2f2',
                    color: message.type === 'success' ? '#15803d' : '#ef4444',
                    border: `1px solid ${message.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
                    display: 'flex', alignItems: 'center', gap: '10px'
                }}>
                    {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                    {message.text}
                </div>
            )}

            <div style={{ background: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '1.2rem', color: '#374151' }}>Nettoyage de la base de données</h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {models.map((model) => (
                        <div key={model.id} style={{ 
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                            padding: '15px', borderRadius: '8px', border: '1px solid #f3f4f6',
                            background: '#f9fafb'
                        }}>
                            <div>
                                <strong style={{ display: 'block', color: '#111827' }}>{model.name}</strong>
                                <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>{model.description}</span>
                            </div>
                            <button 
                                onClick={() => handleResetSingle(model.id)}
                                disabled={loading}
                                style={{ 
                                    padding: '8px 15px', borderRadius: '6px', border: '1px solid #d1d5db',
                                    background: 'white', color: '#374151', cursor: 'pointer', fontSize: '0.85rem',
                                    display: 'flex', alignItems: 'center', gap: '5px'
                                }}
                            >
                                <Trash2 size={14} /> Réinitialiser
                            </button>
                        </div>
                    ))}
                </div>

                <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #f3f4f6', textAlign: 'center' }}>
                    <button 
                        onClick={handleResetAll}
                        disabled={loading}
                        style={{ 
                            padding: '15px 40px', borderRadius: '8px', border: 'none',
                            background: loading ? '#fca5a5' : '#ef4444', color: 'white', 
                            cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 'bold', fontSize: '1rem',
                            display: 'inline-flex', alignItems: 'center', gap: '10px'
                        }}
                    >
                        <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                        {loading ? 'RÉINITIALISATION EN COURS...' : 'TOUT RÉINITIALISER'}
                    </button>
                    
                    <p style={{ marginTop: '15px', fontSize: '0.85rem', color: '#6b7280', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                        <Info size={14} /> Attention : Cette action supprimera définitivement les données sélectionnées.
                    </p>
                </div>
            </div>

            {results && (
                <div style={{ marginTop: '30px', background: '#111827', color: '#f9fafb', padding: '20px', borderRadius: '8px', fontFamily: 'monospace', fontSize: '0.9rem' }}>
                    <h4 style={{ marginTop: 0, color: '#60a5fa', borderBottom: '1px solid #1f2937', paddingBottom: '10px' }}>Rapport détaillé</h4>
                    <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{results}</pre>
                </div>
            )}
        </div>
    );
};

export default Settings;
