import React,{useState,useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Heart, ShoppingCart, Search, X } from 'lucide-react';
import './ClientHomePage.css';

import ImagineFlori from './floare.png';
import ImagineBuchete from './buchet.png';
import ImagineAranjamente from './aranjament.png';
import ImagineGhivece from './ghiveci.png';

function ClientHomePage() {
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [userData, setUserData] = useState({
      nume: '', email: '', parola: '', adresa: '', telefon: ''
    }); 
    const idUser = localStorage.getItem('idUser');
    const [numeUtilizator, setNumeUtilizator] = useState("Utilizator");// Aici poți lua numele din login
    
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

    // 2. Trimitem utilizatorul înapoi la pagina de Login
    window.location.href = '/login'; 
  };
  // Funcție pentru a deschide profilul și a încărca datele
  const openProfile = async () => {
    setIsMenuOpen(false); // Închidem meniul principal
    setIsProfileOpen(true);
    console.log("ID Utilizator din memorie este:", idUser);
    try {
      const response = await fetch(`http://localhost:5000/api/user-details/${idUser}`);
      if (response.ok) {
        const data = await response.json();
        setUserData({
          nume: data.nume || '',
          email: data.email || '',
          parola: data.parola || '',
          adresa: data.adresa || '',
          telefon: data.telefon || ''
        });
      }
    } catch (error) {
      console.error("Eroare la încărcarea profilului:", error);
    }
  };

  // Funcție pentru a salva datele
  const handleSaveProfile = async () => {
    const response = await fetch(`http://localhost:5000/api/user-update/${idUser}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        Nume: userData.nume,
        Email: userData.email,
        Parola: userData.parola,
        Adresa: userData.adresa,
        Telefon: userData.telefon
      })
    });

    if (response.ok) {
      alert("Modificările au fost salvate!");
      localStorage.setItem('numeUtilizator', userData.nume); // Update nume în meniu
      setIsProfileOpen(false);
    }
    localStorage.setItem('numeUtilizator', userData.nume);
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
          <button className="menu-item" onClick={openProfile}>Profil</button>
          <button className="menu-item" onClick={()=>navigate('/favorites')}>Preferate</button>
          <button className="menu-item">Puncte de fidelitate</button>
          <button className="menu-item">Comenzi</button>
        
          <button className="menu-item deconectare" onClick={handleDeconectare}>
            Deconectare
          </button>

        </nav>
      </div>
      {/* 2. SIDEBAR PROFIL */}
      <div className={`sidebar profile-sidebar ${isProfileOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2 className="profile-title">Profil utilizator</h2>
          <X color="white" size={30} onClick={() => setIsProfileOpen(false)} style={{cursor:'pointer', marginLeft: 'auto'}} />
        </div>
        
        <div className="profile-form">
          <div className="input-group">
            <label>Nume</label>
            <input type="text" value={userData.nume} onChange={(e) => setUserData({...userData, nume: e.target.value})} />
          </div>
          <div className="input-group">
            <label>Email</label>
            <input type="email" value={userData.email} onChange={(e) => setUserData({...userData, email: e.target.value})} />
          </div>
          <div className="input-group">
            <label>Parola</label>
            <input type="password" value={userData.parola} onChange={(e) => setUserData({...userData, parola: e.target.value})} />
          </div>
          <div className="input-group">
            <label>Adresa</label>
            <input type="text" value={userData.adresa} onChange={(e) => setUserData({...userData, adresa: e.target.value})} />
          </div>
          <div className="input-group">
            <label>Telefon</label>
            <input type="text" value={userData.telefon} onChange={(e) => setUserData({...userData, telefon: e.target.value})} />
          </div>
          
          <button className="btn-save" onClick={handleSaveProfile}>Salveaza modificari</button>
        </div>
      </div>

      {/*pagina efectiva*/}
      <div className={`continut-pagina ${(isMenuOpen ||isProfileOpen) ? 'blur-activ' : ''}`}>
      {/* Header cu Iconițe */}
      <div className="header-client">
          {/* Iconița principală - i-am dat color="white" și un z-index prin style dacă e nevoie */}
          <Menu color="white" size={34} onClick={toggleMenu} style={{ cursor: 'pointer', zIndex: 100 }} />
          
          <div className="header-dreapta" style={{ display: 'flex', gap: '20px' }}>
            <Heart className="icon-header" color="white" size={34} onClick={() => navigate('/favorites')} style={{ cursor: 'pointer' }} />
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