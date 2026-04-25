import React,{useState,useEffect} from 'react';
import { Menu, Heart, ShoppingCart, Search } from 'lucide-react';
import './ClientHomePage.css';

import ImagineFlori from './floare.png';
import ImagineBuchete from './buchet.png';
import ImagineAranjamente from './aranjament.png';
import ImagineGhivece from './ghiveci.png';

function ClientHomePage() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [numeUtilizator, setNumeUtilizator] = useState("Utilizator"); // Aici poți lua numele din login
    useEffect(() => {
        // Citim numele salvat la pasul 1
        const numeSalvat = localStorage.getItem('numeUtilizator');
        
        // Dacă am găsit un nume în memorie, actualizăm state-ul
        if (numeSalvat) {
          setNumeUtilizator(numeSalvat);
        }
      }, []);
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  const handleDeconectare = () => {
    // 1. Ștergem datele din memoria browserului
    localStorage.removeItem('numeUtilizator');
    // Aici mai poți adăuga și ștergerea token-ului dacă folosești așa ceva
    // localStorage.removeItem('token');

    // 2. Trimitem utilizatorul înapoi la pagina de SignIn
    window.location.href = '/login'; 
  };
  return (
    <div className="pagina-container">
      {/* 1. Meniul Lateral (Sidebar) */}
      <div className={`sidebar ${isMenuOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
          <Menu className="icon-alb" size={32} onClick={toggleMenu} style={{ cursor: 'pointer' }} />
          <span className="nume-utilizator">{numeUtilizator}</span>
        </div>
        
        <nav className="sidebar-nav">
          <button className="menu-item">Profil</button>
          <button className="menu-item">Preferate</button>
          <button className="menu-item">Puncte de fidelitate</button>
          <button className="menu-item">Comenzi</button>
          <button className="menu-item deconectare">Deconectare</button>
        
          <button className="menu-item deconectare" onClick={handleDeconectare}>
            Deconectare
          </button>

        </nav>
      </div>

      {/*pagina efectiva*/}
      <div className={`continut-pagina ${isMenuOpen ? 'blur-activ' : ''}`}>
      {/* Header cu Iconițe */}
      <div className="header-client">
          {/* Iconița principală - i-am dat color="white" și un z-index prin style dacă e nevoie */}
          <Menu color="white" size={34} onClick={toggleMenu} style={{ cursor: 'pointer', zIndex: 100 }} />
          
          <div className="header-dreapta" style={{ display: 'flex', gap: '20px' }}>
            <Heart color="white" size={32} style={{ cursor: 'pointer' }} />
            <ShoppingCart color="white" size={32} style={{ cursor: 'pointer' }} />
          </div>
        </div>

      {/* Bara de Căutare */}
      <div className="container-search">
        <div className="bara-cautare">
          <Search className="icon-search" size={20} />
          <input type="text" placeholder="Caută flori..." />
        </div>
      </div>

      {/* Grid Categorii */}
      <div className="grid-categorii">
        <div className="categorie-card">
          <img src={ImagineFlori} alt="Flori" />
          <span>Flori</span>
        </div>
        <div className="categorie-card">
          <img src={ImagineBuchete} alt="Buchete" />
          <span>Buchete</span>
        </div>
        <div className="categorie-card">
          <img src={ImagineAranjamente} alt="Aranjamente" />
          <span>Aranjamente florale</span>
        </div>
        <div className="categorie-card">
          <img src={ImagineGhivece} alt="Ghivece" />
          <span>Ghivece</span>
        </div>
        </div>
        </div>
        {isMenuOpen && <div className="overlay-click" onClick={toggleMenu}></div>}
    </div>
  );
}

export default ClientHomePage;