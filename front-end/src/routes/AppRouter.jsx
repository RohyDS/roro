import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom'; 
import Layout from '../composents/layaout/layout';
import AdminLayout from '../composents/layaout/AdminLayout';
import Accueil from '../pages/Accueil/ListCategories'; 
import ListProducts from '../pages/Accueil/ListProducts';
import ProductDetail from '../pages/Accueil/ProductDetail';
import CustomerLogin from '../pages/Accueil/CustomerLogin';
import Wishlist from '../pages/Accueil/Wishlist';
import Cart from '../pages/Accueil/Cart';
import Checkout from '../pages/Accueil/Checkout';
import Orders from '../pages/Accueil/Orders';
import Login from '../pages/Admin/login';
import Dashboard from '../pages/Admin/dashboard';
import Categories from '../pages/Admin/Categories';
import Settings from '../pages/Admin/Settings';
import UnifiedImporter from '../pages/Admin/UnifiedImporter';
import ProtectedRoute from '../composents/ProtectedRoute';
import OrdersPage from '../pages/Admin/OrdersPage';

const AppRouter = () => {
    return (
        <Routes>
            {/* Routes Clients avec Navbar/Footer standard */}
            <Route path="/" element={<Layout />}>
                <Route index element={<Navigate to="/Accueil" />} />
                <Route path="Accueil" element={<Accueil />} />
                <Route path="Accueil/ListeCategories" element={<Accueil />} />
                <Route path="categories/:categoryId/produits" element={<ListProducts />} />
                <Route path="produits/:productId" element={<ProductDetail />} />
                <Route path="login" element={<CustomerLogin />} />
                <Route path="wishlist" element={<Wishlist />} />
                <Route path="cart" element={<Cart />} />
                <Route path="checkout" element={<Checkout />} />
                <Route path="orders" element={<Orders />} />
            </Route>

            {/* Route Login Admin (sans sidebar) */}
            <Route path="/admin/login" element={<Login />} />

            {/* Routes Admin protégées avec Sidebar */}
            <Route path="/admin" element={
                <ProtectedRoute>
                    <AdminLayout />
                </ProtectedRoute>
            }>
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="categories" element={<Categories />} />
                <Route path="importer" element={<UnifiedImporter />} />
                <Route path="settings" element={<Settings />} />
                <Route path="orders" element={<OrdersPage />} />
            </Route>
        </Routes>
    );
};

export default AppRouter;