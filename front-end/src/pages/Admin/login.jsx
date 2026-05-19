import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Lock, LogIn } from 'lucide-react';
import '../../styles/pages/Form.css';

const Login = () => {
    const [email, setEmail] = useState('admin@example.com');
    const [password, setPassword] = useState('admin123');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { loginAdmin } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("Formulaire soumis avec l'email:", email);
        setError('');
        setLoading(true);

        try {
            console.log("Appel de loginAdmin via AuthContext...");
            const success = await loginAdmin(email, password);
            
            if (success) {
                console.log("Connexion réussie et état context mis à jour ! Redirection...");
                navigate('/admin/dashboard');
            } else {
                setError('Identifiants incorrects.');
            }
        } catch (err) {
            console.error("Échec de la connexion dans le composant Login:", err);
            setError(err.response?.data?.message || 'Une erreur est survenue lors de la connexion.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="products-container" style={{ maxWidth: '400px', marginTop: '100px' }}>
            <div style={{ background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <div style={{ 
                        background: '#f3f4f6', 
                        width: '60px', 
                        height: '60px', 
                        borderRadius: '50%', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        margin: '0 auto 15px'
                    }}>
                        <Lock size={30} color="#111827" />
                    </div>
                    <h2 style={{ margin: 0 }}>Connexion Admin</h2>
                    <p style={{ color: '#6b7280', fontSize: '0.9rem', marginTop: '5px' }}>Accès sécurisé au panneau</p>
                </div>
                
                <form onSubmit={handleSubmit} className="checkout-form">
                    <div className="form-group">
                        <label>Email Admin</label>
                        <input 
                            type="email" 
                            required 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="admin@example.com"
                        />
                    </div>
                    
                    <div className="form-group">
                        <label>Mot de passe</label>
                        <input 
                            type="password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required 
                        />
                    </div>

                    {error && (
                        <p style={{ color: '#ef4444', fontSize: '0.9rem', marginBottom: '15px', textAlign: 'center' }}>
                            {error}
                        </p>
                    )}

                    <button 
                        type="submit" 
                        disabled={loading}
                        style={{ 
                            width: '100%', 
                            background: loading ? '#374151' : '#111827', 
                            color: 'white', 
                            padding: '12px', 
                            borderRadius: '6px', 
                            border: 'none', 
                            fontWeight: 'bold',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px'
                        }}
                    >
                        {loading ? 'Connexion...' : <><LogIn size={20} /> Se connecter</>}
                    </button>
                </form>
                
                <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.8rem', color: '#6b7280' }}>
                    <p>Utilise les identifiants de votre boutique Bagisto.</p>
                </div>
            </div>
        </div>
    );
};

export default Login;
