import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { User, LogIn, ArrowLeft } from 'lucide-react';
import '../../styles/pages/Form.css';

const CustomerLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { loginCustomer } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Rediriger vers la page précédente après connexion, ou vers l'accueil
    const from = location.state?.from?.pathname || "/Accueil";

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const success = await loginCustomer(email, password);
        
        if (success) {
            navigate(from, { replace: true });
        } else {
            setError('Email ou mot de passe incorrect.');
            setLoading(false);
        }
    };

    return (
        <div className="products-container" style={{ maxWidth: '450px', marginTop: '60px' }}>
            <div style={{ background: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', border: '1px solid #eee' }}>
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <div style={{ 
                        background: '#eff6ff', 
                        width: '60px', 
                        height: '60px', 
                        borderRadius: '50%', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        margin: '0 auto 15px'
                    }}>
                        <User size={30} color="#2563eb" />
                    </div>
                    <h2 style={{ margin: 0 }}>Connexion Client</h2>
                    <p style={{ color: '#666', fontSize: '0.9rem', marginTop: '5px' }}>Accédez à votre compte et vos commandes</p>
                </div>
                
                <form onSubmit={handleSubmit} className="checkout-form">
                    <div className="form-group">
                        <label>Adresse Email</label>
                        <input 
                            type="email" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            required 
                            placeholder="votre@email.com"
                        />
                    </div>
                    
                    <div className="form-group">
                        <label>Mot de passe</label>
                        <input 
                            type="password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            required 
                            placeholder="••••••••"
                        />
                    </div>

                    {error && (
                        <p style={{ color: '#ef4444', fontSize: '0.9rem', marginBottom: '20px', textAlign: 'center', padding: '10px', background: '#fef2f2', borderRadius: '6px' }}>
                            {error}
                        </p>
                    )}

                    <button 
                        type="submit" 
                        disabled={loading}
                        style={{ 
                            width: '100%', 
                            background: '#2563eb', 
                            color: 'white', 
                            padding: '14px', 
                            borderRadius: '8px', 
                            border: 'none', 
                            fontWeight: 'bold',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            fontSize: '1rem',
                            opacity: loading ? 0.7 : 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px'
                        }}
                    >
                        {loading ? 'Connexion en cours...' : <><LogIn size={20} /> Se connecter</>}
                    </button>
                </form>
                
                <div style={{ textAlign: 'center', marginTop: '25px', paddingTop: '20px', borderTop: '1px solid #eee' }}>
                    <p style={{ fontSize: '0.9rem', color: '#666' }}>
                        Vous n'avez pas de compte ? <br/>
                        <span style={{ color: '#2563eb', cursor: 'pointer', fontWeight: '500' }}>Inscrivez-vous sur notre boutique</span>
                    </p>
                    <Link to="/Accueil" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '15px', fontSize: '0.85rem', color: '#9ca3af', textDecoration: 'none' }}>
                        <ArrowLeft size={16} /> Retour à la boutique
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default CustomerLogin;
