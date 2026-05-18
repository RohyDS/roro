import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, FolderTree, Rocket, Settings, LogOut } from 'lucide-react';

const AdminSidebar = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = async () => {
        await logout();
        navigate('/admin/login');
    };

    const menuItems = [
        { path: '/admin/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
        { path: '/admin/categories', icon: <FolderTree size={20} />, label: 'Catégories' },
        { path: '/admin/importer', icon: <Rocket size={20} />, label: 'Importateur' },
        { path: '/admin/settings', icon: <Settings size={20} />, label: 'Paramètres' },
    ];

    return (
        <aside className="admin-sidebar" style={{
            width: '260px',
            height: '100vh',
            background: '#111827',
            color: 'white',
            position: 'fixed',
            left: 0,
            top: 0,
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '4px 0 10px rgba(0,0,0,0.1)',
            zIndex: 1000
        }}>
            <div className="sidebar-header" style={{
                padding: '30px 20px',
                borderBottom: '1px solid #1f2937',
                textAlign: 'center'
            }}>
                <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold', color: '#60a5fa' }}>ADMIN PANEL</h2>
            </div>

            <nav className="sidebar-menu" style={{ flex: 1, padding: '20px 0' }}>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {menuItems.map((item) => (
                        <li key={item.path} style={{ marginBottom: '5px' }}>
                            <Link 
                                to={item.path} 
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '12px 25px',
                                    textDecoration: 'none',
                                    color: location.pathname === item.path ? 'white' : '#9ca3af',
                                    background: location.pathname === item.path ? '#1f2937' : 'transparent',
                                    borderLeft: location.pathname === item.path ? '4px solid #3b82f6' : '4px solid transparent',
                                    transition: 'all 0.2s',
                                    fontWeight: location.pathname === item.path ? 'bold' : 'normal'
                                }}
                            >
                                <span style={{ marginRight: '15px', display: 'flex', alignItems: 'center' }}>{item.icon}</span>
                                {item.label}
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>

            <div className="sidebar-footer" style={{
                padding: '20px',
                borderTop: '1px solid #1f2937'
            }}>
                <button 
                    onClick={handleLogout}
                    style={{
                        width: '100%',
                        padding: '12px',
                        background: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px'
                    }}
                >
                    <LogOut size={20} /> Déconnexion
                </button>
            </div>
        </aside>
    );
};

export default AdminSidebar;
