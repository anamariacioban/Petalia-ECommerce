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
    const [showParolaProfil, setShowParolaProfil] = useState(false);
    const [profileErrors, setProfileErrors] = useState({});
    const idUser = localStorage.getItem('idUser');
    const rol = localStorage.getItem('rol');
    const [numeUtilizator, setNumeUtilizator] = useState("Utilizator");
    
    useEffect(() => {
        const numeSalvat = localStorage.getItem('numeUtilizator');
        if (numeSalvat) {
          setNumeUtilizator(numeSalvat);
        }
      }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleDeconectare = () => {
    localStorage.removeItem('numeUtilizator');
    localStorage.removeItem('idUser');
    localStorage.removeItem('rol');
    localStorage.removeItem('emailUser');
    window.location.href = '/'; 
  };

  const openProfile = async () => {
    setIsMenuOpen(false);
    setIsProfileOpen(true);
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

  const handleSaveProfile = async () => {
    const newErrors = {};
    const cuvinte = userData.nume.trim().split(/\s+/);
    if (!userData.nume.trim()) {
      newErrors.nume = 'Numele complet este obligatoriu.';
    } else if (cuvinte.length < 2) {
      newErrors.nume = 'Introduceți cel puțin prenume și nume (2 cuvinte).';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email)) {
      newErrors.email = 'Emailul nu are un format valid (ex: nume@domeniu.com).';
    }
    if (userData.parola && userData.parola.length < 6) {
      newErrors.parola = 'Parola trebuie să aibă cel puțin 6 caractere.';
    } else if (userData.parola && !/[A-Z]/.test(userData.parola)) {
      newErrors.parola = 'Parola trebuie să conțină cel puțin o literă mare.';
    } else if (userData.parola && !/[0-9]/.test(userData.parola)) {
      newErrors.parola = 'Parola trebuie să conțină cel puțin o cifră.';
    }
    if (userData.telefon) {
      const telRegex = /^[0-9]{10}$/;
      if (!telRegex.test(userData.telefon.replace(/\s/g, ''))) {
        newErrors.telefon = 'Numărul de telefon trebuie să aibă 10 cifre.';
      }
    }
    if (userData.adresa && userData.adresa.trim().length < 10) {
      newErrors.adresa = 'Adresa este prea scurtă.';
    }
    if (Object.keys(newErrors).length > 0) {
      setProfileErrors(newErrors);
      return;
    }
    setProfileErrors({});
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
      localStorage.setItem('numeUtilizator', userData.nume);
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

          {rol === 'Administrator' && (
            <button className="menu-item" onClick={() => navigate('/admin')}>
              Administrare
            </button>
          )}
        
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
            <label>Nume <span className="obligatoriu-profil">*</span></label>
            <input type="text" value={userData.nume} onChange={(e) => { setUserData({...userData, nume: e.target.value}); setProfileErrors({...profileErrors, nume: ''}); }} />
            {profileErrors.nume && <span className="eroare-profil">{profileErrors.nume}</span>}
          </div>
          <div className="input-group">
            <label>Email <span className="obligatoriu-profil">*</span></label>
            <input type="text" value={userData.email} onChange={(e) => { setUserData({...userData, email: e.target.value}); setProfileErrors({...profileErrors, email: ''}); }} />
            {profileErrors.email && <span className="eroare-profil">{profileErrors.email}</span>}
          </div>
          <div className="input-group">
            <label>Parola</label>
            <p className="cerinte-profil">Minim 6 caractere, o literă mare și o cifră.</p>
            <div className="input-parola-profil">
              <input type={showParolaProfil ? "text" : "password"} value={userData.parola} onChange={(e) => { setUserData({...userData, parola: e.target.value}); setProfileErrors({...profileErrors, parola: ''}); }} />
              <button type="button" className="buton-show-parola-profil" onClick={() => setShowParolaProfil(!showParolaProfil)}>
                {showParolaProfil ? "Ascunde" : "Arată"}
              </button>
            </div>
            {profileErrors.parola && <span className="eroare-profil">{profileErrors.parola}</span>}
          </div>
          <div className="input-group">
            <label>Adresa <span className="optional-profil">(opțional)</span></label>
            <input type="text" value={userData.adresa} onChange={(e) => { setUserData({...userData, adresa: e.target.value}); setProfileErrors({...profileErrors, adresa: ''}); }} />
            {profileErrors.adresa && <span className="eroare-profil">{profileErrors.adresa}</span>}
          </div>
          <div className="input-group">
            <label>Telefon <span className="optional-profil">(opțional)</span></label>
            <input type="text" value={userData.telefon} onChange={(e) => { setUserData({...userData, telefon: e.target.value}); setProfileErrors({...profileErrors, telefon: ''}); }} />
            {profileErrors.telefon && <span className="eroare-profil">{profileErrors.telefon}</span>}
          </div>
          <p className="legenda-profil"><span className="obligatoriu-profil">*</span> câmpuri obligatorii</p>
          <button className="btn-save" onClick={handleSaveProfile}>Salveaza modificari</button>
        </div>
      </div>

      {/*pagina efectiva*/}
      <div className={`continut-pagina ${(isMenuOpen || isProfileOpen) ? 'blur-activ' : ''}`}>
        {/* Header cu Iconițe */}
        <div className="header-client">
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
  <div className="categorie-card" onClick={() => navigate('/categorie/Flori')} style={{cursor:'pointer'}}>
    <img src={ImagineFlori} alt="Flori" />
    <span>Flori</span>
  </div>
  <div className="categorie-card" onClick={() => navigate('/categorie/Buchete')} style={{cursor:'pointer'}}>
    <img src={ImagineBuchete} alt="Buchete" />
    <span>Buchete</span>
  </div>
  <div className="categorie-card" onClick={() => navigate('/categorie/Aranjamente Florale')} style={{cursor:'pointer'}}>
    <img src={ImagineAranjamente} alt="Aranjamente" />
    <span>Aranjamente florale</span>
  </div>
  <div className="categorie-card" onClick={() => navigate('/categorie/Ghivece')} style={{cursor:'pointer'}}>
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