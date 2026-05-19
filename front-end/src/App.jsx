import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRouter from './routes/AppRouter';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';

function App() {
  // S'assurer que le token client et ses données sont enregistrés localement pour s'authentifier auprès de l'API
  if (!localStorage.getItem('customer_token')) {
    localStorage.setItem('customer_token', '2|znl67ZVyW1BW8TkEOchBkLFyXzHufPj90KZ3HCHI87423eeb');
  }
  if (!localStorage.getItem('customer_data')) {
    localStorage.setItem('customer_data', JSON.stringify({
      id: 2,
      first_name: " ",
      last_name: " ",
      email: " "
    }));
  }

  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <AppRouter/>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;