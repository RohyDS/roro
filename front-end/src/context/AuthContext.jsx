import React, { createContext, useContext, useState, useEffect } from 'react';
import CustomerService from '../service/Accueil/CustomerService';
import AdminAuthService from '../service/Admin/AdminAuthService';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [isAdmin, setIsAdmin] = useState(() => {
        // Initialisation basée sur la présence du token API ou de l'ancien flag
        return localStorage.getItem('admin_authenticated') === 'true' || !!localStorage.getItem('admin_token');
    });

    const [customer, setCustomer] = useState(() => {
        const savedCustomer = localStorage.getItem('customer_data');
        return savedCustomer ? JSON.parse(savedCustomer) : null;
    });

    // Nouvelle méthode de connexion Admin via API
    const loginAdmin = async (email, password) => {
        try {
            await AdminAuthService.login(email, password);
            setIsAdmin(true);
            localStorage.setItem('admin_authenticated', 'true');
            return true;
        } catch (error) {
            console.error("Erreur de connexion admin API:", error);
            return false;
        }
    };

    const loginCustomer = async (email, password) => {
        try {
            const userData = await CustomerService.login(email, password);
            setCustomer(userData);
            localStorage.setItem('customer_data', JSON.stringify(userData));
            return true;
        } catch (error) {
            console.error("Erreur de connexion client:", error);
            return false;
        }
    };

    const logout = async () => {
        if (customer) {
            await CustomerService.logout();
        }
        // Logout admin API
        if (isAdmin) {
            await AdminAuthService.logout();
        }
        
        setIsAdmin(false);
        setCustomer(null);
        localStorage.removeItem('admin_authenticated');
        localStorage.removeItem('customer_data');
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
    };

    return (
        <AuthContext.Provider value={{ 
            isAdmin, 
            customer, 
            login: loginAdmin, 
            loginAdmin, 
            loginCustomer, 
            logout 
        }}>
            {children}
        </AuthContext.Provider>
    );
};
