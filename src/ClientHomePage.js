import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Heart, ShoppingCart, Search, X } from 'lucide-react';
import './ClientHomePage.css';
import { useCart } from './CartContext';

import ImagineFlori from './floare.png';
import ImagineBuchete from './buchet.png';
import ImagineAranjamente from './aranjament.png';
import ImagineGhivece from './ghiveci.png';

function ClientHomePage() {
    const navigate = useNavigate();
    const { cartCount } = useCart();
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

    // SEARCH
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const searchTimeout = useRef(null);
    
    useEffect(() => {
        const numeSalvat = localStorage.getItem('numeUtilizator');
        if (numeSalvat) setNumeUtilizator(numeSalvat);
    }, []);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

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
        setUserData({ nume: data.nume||'', email: data.email||'', parola: data.parola||'', adresa: data.adresa||'', telefon: data.telefon||'' });
      }
    } catch (error) { console.error("Eroare la încărcarea profilului:", error); }
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
      body: JSON.stringify({ Nume: userData.nume, Email: userData.email, Parola: userData.parola, Adresa: userData.adresa, Telefon: userData.telefon })
    });
    if (response.ok) { alert("Modificările au fost salvate!"); localStorage.setItem('numeUtilizator', userData.nume); setIsProfileOpen(false); }
    localStorage.setItem('numeUtilizator', userData.nume);
  };

  // SEARCH LOGIC
  const handleSearch = useCallback(async (query) => {
    if (!query.trim()) { setSearchResults([]); setShowResults(false); return; }
    setSearchLoading(true);
    setShowResults(true);
    try {
      const res = await fetch('http://localhost:5000/api/flori');
      const data = await res.json();
      const filtrate = data.filter(p =>
        p.nume.toLowerCase().includes(query.toLowerCase()) ||
        p.culoare.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(filtrate);
    } catch (e) { console.error('Eroare la cautare:', e); }
    finally { setSearchLoading(false); }
  }, []);

  const handleSearchInput = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => handleSearch(val), 300);
  };

  const handleClearSearch = () => { setSearchQuery(''); setSearchResults([]); setShowResults(false); };

  const handleSelectProdus = (produs) => { setShowResults(false); navigate('/produs-in-lucru', { state: { produs } }); };

  const cardStyles = {
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '22px', padding: '10px 0 50px' },
    card: { backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: '18px', overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.25)', transition: 'transform 0.2s, box-shadow 0.2s', display: 'flex', flexDirection: 'column' },
    imagineContainer: { width: '100%', height: '180px', overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.08)' },
    imagine: { width: '100%', height: '100%', objectFit: 'cover' },
    imagineGoala: { width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4em', background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))' },
    cardBody: { padding: '14px 14px 6px', flexGrow: 1 },
    numeFloare: { fontSize: '1.1em', fontStyle: 'italic', fontWeight: 'bold', marginBottom: '4px', fontFamily: 'Georgia, serif' },
    pret: { fontSize: '1.2em', fontWeight: 'bold', color: '#FFD700', marginBottom: '2px', fontFamily: 'Georgia, serif' },
    stoc: { fontSize: '0.8em', opacity: 0.7, marginBottom: '10px', fontFamily: 'Georgia, serif' },
    cardFooter: { padding: '0 14px 14px' },
    butonSelecteaza: { width: '100%', padding: '10px', backgroundColor: 'white', color: '#8B1A4A', border: 'none', borderRadius: '25px', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '0.9em', fontWeight: 'bold', boxShadow: '0 4px 12px rgba(0,0,0,0.2)', transition: 'background-color 0.2s' }
  };

  return (
    <div className="pagina-container">
      {/* Sidebar menu */}
      <div className={`sidebar ${isMenuOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <Menu className="icon-alb" size={32} onClick={toggleMenu} style={{ cursor: 'pointer' }} />
          <span className="nume-utilizator">{numeUtilizator}</span>
        </div>
        <nav className="sidebar-nav">
          <button className="menu-item" onClick={openProfile}>Profil</button>
          <button className="menu-item" onClick={() => navigate('/favorites')}>Preferate</button>
          <button className="menu-item">Puncte de fidelitate</button>
          <button className="menu-item" onClick={() => { setIsMenuOpen(false); navigate('/comenzi'); }}>Comenzi</button>
          {rol === 'Administrator' && (
            <button className="menu-item" onClick={() => navigate('/admin')}>Administrare</button>
          )}
          <button className="menu-item deconectare" onClick={handleDeconectare}>Deconectare</button>
        </nav>
      </div>

      {/* Sidebar profil */}
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

      {/* Pagina efectiva */}
      <div className={`continut-pagina ${(isMenuOpen || isProfileOpen) ? 'blur-activ' : ''}`}>
        {/* Header */}
        <div className="header-client">
          <Menu color="white" size={34} onClick={toggleMenu} style={{ cursor: 'pointer', zIndex: 100 }} />
          <div className="header-dreapta" style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <Heart className="icon-header" color="white" size={34} onClick={() => navigate('/favorites')} style={{ cursor: 'pointer' }} />
            {/* Cart cu badge */}
            <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => navigate('/comenzi')}>
              <ShoppingCart color="white" size={32} />
              {cartCount > 0 && (
                <span style={{ position: 'absolute', top: '-8px', right: '-8px', backgroundColor: '#FFD700', color: '#8B1A4A', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7em', fontWeight: 'bold', boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Bara de Cautare */}
        <div className="container-search" style={{ position: 'relative' }}>
          <div className="bara-cautare">
            <Search className="icon-search" size={20} />
            <input
              type="text"
              placeholder="Caută flori..."
              value={searchQuery}
              onChange={handleSearchInput}
              onFocus={() => { if (searchQuery) setShowResults(true); }}
            />
            {searchQuery && (
              <X color="rgba(255,255,255,0.7)" size={18} style={{ cursor: 'pointer', flexShrink: 0 }} onClick={handleClearSearch} />
            )}
          </div>

          {/* Rezultate cautare */}
          {showResults && (
            <div style={{ position: 'absolute', top: 'calc(100% + 8px)', left: '5%', right: '5%', zIndex: 500 }}>
              {searchLoading ? (
                <div style={{ background: 'rgba(139,26,74,0.97)', borderRadius: '16px', padding: '20px', textAlign: 'center', color: 'rgba(255,255,255,0.7)', fontStyle: 'italic', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>Se cauta... 🌷</div>
              ) : searchResults.length === 0 ? (
                <div style={{ background: 'rgba(139,26,74,0.97)', borderRadius: '16px', padding: '20px', textAlign: 'center', color: 'rgba(255,255,255,0.7)', fontStyle: 'italic', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>Niciun produs gasit pentru „{searchQuery}" 🌸</div>
              ) : (
                <div style={{ background: 'rgba(139,26,74,0.97)', borderRadius: '20px', padding: '20px', boxShadow: '0 12px 40px rgba(0,0,0,0.35)' }}>
                  <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85em', fontStyle: 'italic', marginBottom: '16px' }}>
                    {searchResults.length} {searchResults.length === 1 ? 'produs gasit' : 'produse gasite'}
                  </p>
                  <div style={cardStyles.grid}>
                    {searchResults.map((produs, i) => (
                      <div key={i} style={cardStyles.card}
                        onMouseEnter={e => { e.currentTarget.style.transform='translateY(-6px)'; e.currentTarget.style.boxShadow='0 16px 40px rgba(0,0,0,0.35)'; }}
                        onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='0 8px 32px rgba(0,0,0,0.25)'; }}
                      >
                        <div style={cardStyles.imagineContainer}>
                          {produs.imagine ? <img src={produs.imagine} alt={produs.nume} style={cardStyles.imagine} /> : <div style={cardStyles.imagineGoala}>🌷</div>}
                        </div>
                        <div style={cardStyles.cardBody}>
                          <div style={cardStyles.numeFloare}>{produs.nume}</div>
                          <div style={cardStyles.pret}>{produs.pret} RON</div>
                          <div style={cardStyles.stoc}>{produs.stoc > 0 ? `Stoc: ${produs.stoc} buc.` : '⚠️ Stoc epuizat'}</div>
                        </div>
                        <div style={cardStyles.cardFooter}>
                          <button
                            style={{ ...cardStyles.butonSelecteaza, opacity: produs.stoc===0?0.5:1, cursor: produs.stoc===0?'not-allowed':'pointer' }}
                            onClick={() => { if (produs.stoc > 0) handleSelectProdus(produs); }}
                            onMouseEnter={e => { if (produs.stoc>0) e.target.style.backgroundColor='#f5e6ee'; }}
                            onMouseLeave={e => { e.target.style.backgroundColor='white'; }}
                          >
                            {produs.stoc > 0 ? '🛒 Selectează opțiunile' : 'Indisponibil'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Grid Categorii */}
        {!showResults && (
          <div className="grid-categorii">
            <div className="categorie-card" onClick={() => navigate('/categorie/Flori')} style={{cursor:'pointer'}}>
              <img src={ImagineFlori} alt="Flori" /><span>Flori</span>
            </div>
            <div className="categorie-card" onClick={() => navigate('/categorie/Buchete')} style={{cursor:'pointer'}}>
              <img src={ImagineBuchete} alt="Buchete" /><span>Buchete</span>
            </div>
            <div className="categorie-card" onClick={() => navigate('/categorie/Aranjamente Florale')} style={{cursor:'pointer'}}>
              <img src={ImagineAranjamente} alt="Aranjamente" /><span>Aranjamente florale</span>
            </div>
            <div className="categorie-card" onClick={() => navigate('/categorie/Ghivece')} style={{cursor:'pointer'}}>
              <img src={ImagineGhivece} alt="Ghivece" /><span>Ghivece</span>
            </div>
          </div>
        )}
      </div>
      {isMenuOpen && <div className="overlay-click" onClick={toggleMenu}></div>}
    </div>
  );
}

export default ClientHomePage;
