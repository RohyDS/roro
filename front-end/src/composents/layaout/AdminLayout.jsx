import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';

const AdminLayout = () => {
    return (
        <div className="admin-layout" style={{ display: 'flex', minHeight: '100vh', background: '#f3f4f6' }}>
            <AdminSidebar />
            
            <main className="admin-main" style={{ 
                flex: 1, 
                marginLeft: '260px', 
                padding: '40px',
                width: 'calc(100% - 260px)' 
            }}>
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;
