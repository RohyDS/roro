import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import DashboardService from '../../service/Admin/Dasboard';
import { FolderTree, Rocket, Settings, LogOut } from 'lucide-react';

const Dashboard = () => {
    const { logout } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                const data = await DashboardService.getDashboardOrders();
                setOrders(data);
            } catch (err) {
                console.error("Erreur dashboard:", err);
                setError("Erreur lors du chargement des données.");
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) {
        return <div style={{ padding: '50px', textAlign: 'center' }}>Chargement des données du tableau de bord...</div>;
    }

    if (error) {
        return <div style={{ padding: '50px', textAlign: 'center', color: 'red' }}>{error}</div>;
    }

    return (
        <div className="products-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h2>Tableau de bord Admin</h2>
                <div style={{ display: 'flex', gap: '15px' }}>
                    <Link 
                        to="/admin/categories"
                        style={{ background: '#111827', color: 'white', textDecoration: 'none', padding: '10px 20px', borderRadius: '6px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        <FolderTree size={18} /> Catégories
                    </Link>
                    <Link 
                        to="/admin/importer"
                        style={{ background: '#2563eb', color: 'white', textDecoration: 'none', padding: '10px 20px', borderRadius: '6px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        <Rocket size={18} /> Centre d'Importation
                    </Link>
                    <Link 
                        to="/admin/settings"
                        style={{ background: '#6b7280', color: 'white', textDecoration: 'none', padding: '10px 20px', borderRadius: '6px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        <Settings size={18} /> Paramètres
                    </Link>
                    <button 
                        onClick={logout}
                        style={{ background: '#ef4444', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        <LogOut size={18} /> Déconnexion
                    </button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '40px' }}>
                <div style={{ background: '#f0f9ff', padding: '20px', borderRadius: '8px', border: '1px solid #bae6fd' }}>
                    <h3 style={{ color: '#0369a1', fontSize: '0.9rem', textTransform: 'uppercase' }}>Commandes totales</h3>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{orders.length}</p>
                </div>
                <div style={{ background: '#f0fdf4', padding: '20px', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                    <h3 style={{ color: '#15803d', fontSize: '0.9rem', textTransform: 'uppercase' }}>Chiffre d'affaires</h3>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>
                        {orders.reduce((sum, order) => sum + order.total, 0).toFixed(2)} €
                    </p>
                </div>
                <div style={{ background: '#fff7ed', padding: '20px', borderRadius: '8px', border: '1px solid #ffedd5' }}>
                    <h3 style={{ color: '#9a3412', fontSize: '0.9rem', textTransform: 'uppercase' }}>Clients (Demo)</h3>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{new Set(orders.map(o => o.address.email)).size}</p>
                </div>
            </div>

            <h3>Dernières commandes</h3>
            <div style={{ marginTop: '20px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: '8px', overflow: 'hidden' }}>
                    <thead style={{ background: '#f9fafb' }}>
                        <tr>
                            <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #eee' }}>ID</th>
                            <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #eee' }}>Client</th>
                            <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #eee' }}>Date</th>
                            <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #eee' }}>Total</th>
                            <th style={{ padding: '15px', textAlign: 'left', borderBottom: '1px solid #eee' }}>Statut</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.length === 0 ? (
                            <tr>
                                <td colSpan="5" style={{ padding: '30px', textAlign: 'center', color: '#6b7280' }}>
                                    Aucune commande à afficher
                                </td>
                            </tr>
                        ) : (
                            orders.map(order => (
                                <tr key={order.id}>
                                    <td style={{ padding: '15px', borderBottom: '1px solid #eee' }}>{order.id}</td>
                                    <td style={{ padding: '15px', borderBottom: '1px solid #eee' }}>
                                        {order.address.first_name} {order.address.last_name}<br/>
                                        <small style={{ color: '#6b7280' }}>{order.address.email}</small>
                                    </td>
                                    <td style={{ padding: '15px', borderBottom: '1px solid #eee' }}>
                                        {new Date(order.date).toLocaleDateString()}
                                    </td>
                                    <td style={{ padding: '15px', borderBottom: '1px solid #eee' }}>{order.total.toFixed(2)} €</td>
                                    <td style={{ padding: '15px', borderBottom: '1px solid #eee' }}>
                                        <span style={{ background: '#fef3c7', color: '#92400e', padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem' }}>
                                            {order.status}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Dashboard;
