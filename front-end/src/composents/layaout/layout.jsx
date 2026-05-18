import React from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header"; // Assurez-vous que le fichier Header.jsx existe
import Footer from "./Footer"; // Assurez-vous que le fichier Footer.jsx existe

const Layout = () => {
  return (
    <div className="layout-container">
      <Header />
      
      <main>
        {/* L'Outlet sera remplacé par le composant de la route actuelle (Accueil, etc.) */}
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};

export default Layout;