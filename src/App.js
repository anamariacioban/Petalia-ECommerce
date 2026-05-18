import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import SignInPage from './SignInPage';
import LoginPage from './LoginPage';
import ClientHomePage from './ClientHomePage';
import FavoritesPage from './FavoritesPage';
import AdminPage from './AdminPage';
import CategoryPage from './CategoryPage';
import ProdusInLucru from './ProdusInLucru';
import ComenziPage from './ComenziPage';
import { CartProvider } from './CartContext';

function Home() {
  return (
    <div className="container-centrat">
      <h1 className="titlu">Bine ați venit la Petalia, doriți să vă conectați?</h1>
      <div className="grup-butoane">
        <Link to="/login" className="buton-transparent">log-in</Link>
        <Link to="/signin" className="buton-transparent">sign-in</Link>
      </div>
    </div>
  );
}

function App() {
  return (
    <CartProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/client-home" element={<ClientHomePage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/categorie/:categorie" element={<CategoryPage />} />
          <Route path="/produs-in-lucru" element={<ProdusInLucru />} />
          <Route path="/comenzi" element={<ComenziPage />} />
        </Routes>
      </Router>
    </CartProvider>
  );
}

export default App;