import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Heart, ShoppingCart, ArrowLeft, Minus, Plus } from 'lucide-react';
import { useCart } from './CartContext';

function ProdusInLucru() {
  const navigate = useNavigate();
  const location = useLocation();
  const produs = location.state?.produs;
  const { addToCart, cartCount } = useCart();

  const idUser = localStorage.getItem('idUser');

  const [cantitate, setCantitate] = useState(1);
  const [isFavorit, setIsFavorit] = useState(false);
  const [heartAnim, setHeartAnim] = useState(false);
  const [addedAnim, setAddedAnim] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [mesajAdaugat, setMesajAdaugat] = useState(false);

  useEffect(() => {
    if (!produs) { navigate(-1); return; }
    if (idUser && produs.id_floare) {
      fetch(`http://localhost:5000/api/favorite/check/${idUser}/${produs.id_floare}`)
        .then(res => res.json())
        .then(data => setIsFavorit(data.isFavorit))
        .catch(() => {});
    }
  }, [produs, idUser, navigate]);

  if (!produs) return null;

  const handleDecremente = () => { if (cantitate > 1) setCantitate(c => c - 1); };
  const handleIncremente = () => { if (cantitate < produs.stoc) setCantitate(c => c + 1); };

  const handleToggleFavorit = async () => {
    if (!idUser) return;
    setHeartAnim(true);
    setTimeout(() => setHeartAnim(false), 300);
    if (isFavorit) {
      try { await fetch(`http://localhost:5000/api/favorite/${idUser}/${produs.id_floare}`, { method: 'DELETE' }); setIsFavorit(false); }
      catch (e) { console.error(e); }
    } else {
      try { await fetch('http://localhost:5000/api/favorite', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: parseInt(idUser), flowareId: produs.id_floare }) }); setIsFavorit(true); }
      catch (e) { console.error(e); }
    }
  };

  const handleAdaugaInCos = () => {
    addToCart(produs, cantitate);
    setAddedAnim(true);
    setMesajAdaugat(true);
    setTimeout(() => { setAddedAnim(false); setMesajAdaugat(false); }, 2000);
  };

  const totalPret = (produs.pret * cantitate).toFixed(2);

  return (
    <div style={styles.pagina}>
      <button style={styles.butonBack} onClick={() => navigate(-1)}
        onMouseEnter={e => e.currentTarget.style.backgroundColor='rgba(255,255,255,0.25)'}
        onMouseLeave={e => e.currentTarget.style.backgroundColor='rgba(255,255,255,0.15)'}
      >
        <ArrowLeft size={16} style={{ marginRight: '6px' }} />Înapoi
      </button>

      {/* Cart badge in colt */}
      <div style={{ position: 'fixed', top: '24px', right: '28px', zIndex: 100, cursor: 'pointer' }} onClick={() => navigate('/comenzi')}>
        <div style={{ position: 'relative' }}>
          <ShoppingCart color="white" size={28} />
          {cartCount > 0 && (
            <span style={{ position: 'absolute', top: '-8px', right: '-8px', backgroundColor: '#FFD700', color: '#8B1A4A', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65em', fontWeight: 'bold' }}>
              {cartCount > 99 ? '99+' : cartCount}
            </span>
          )}
        </div>
      </div>

      <div style={styles.continut}>
        {/* Stanga: Imagine */}
        <div style={styles.partaStanga}>
          {produs.imagine ? (
            <>
              {!imageLoaded && <div style={styles.imagineLoading}>🌸</div>}
              <img src={produs.imagine} alt={produs.nume} style={{ ...styles.imagine, opacity: imageLoaded ? 1 : 0 }} onLoad={() => setImageLoaded(true)} />
            </>
          ) : (
            <div style={styles.imagineGoala}>🌷</div>
          )}
          {produs.stoc <= 5 && produs.stoc > 0 && (
            <div style={styles.badgeStoc}>Ultimele {produs.stoc} buc!</div>
          )}
          <div style={styles.gradientOverlay} />
        </div>

        {/* Dreapta: Detalii */}
        <div style={styles.partaDreapta}>
          <button style={{ ...styles.butonInima, transform: heartAnim ? 'scale(1.4)' : 'scale(1)' }} onClick={handleToggleFavorit} title={isFavorit ? 'Șterge din preferate' : 'Adaugă la preferate'}>
            <Heart size={30} fill={isFavorit ? '#e63946' : 'none'} color={isFavorit ? '#e63946' : 'rgba(255,255,255,0.6)'} style={{ transition: 'fill 0.2s, color 0.2s' }} />
          </button>

          <div style={styles.categorie}>{produs.culoare || 'Flori'}</div>
          <h1 style={styles.numeFloare}>{produs.nume}</h1>

          <div style={styles.pretRow}>
            <span style={styles.pret}>{totalPret}</span>
            <span style={styles.valuta}> RON</span>
          </div>
          {cantitate > 1 && <div style={styles.pretPerBuc}>{produs.pret} RON / bucată</div>}

          <div style={styles.separator} />

          <div style={styles.stocInfo}>
            <span style={{ ...styles.stocDot, backgroundColor: produs.stoc > 0 ? '#4caf7d' : '#e63946' }} />
            {produs.stoc > 0 ? `În stoc (${produs.stoc} disponibile)` : 'Stoc epuizat'}
          </div>

          <div style={styles.cantitateSection}>
            <span style={styles.cantitateLabel}>Cantitate</span>
            <div style={styles.cantitateControl}>
              <button style={{ ...styles.butonCantitate, opacity: cantitate<=1?0.35:1, cursor: cantitate<=1?'not-allowed':'pointer' }} onClick={handleDecremente} disabled={cantitate<=1}>
                <Minus size={15} />
              </button>
              <span style={styles.cantitateValoare}>{cantitate}</span>
              <button style={{ ...styles.butonCantitate, opacity: cantitate>=produs.stoc?0.35:1, cursor: cantitate>=produs.stoc?'not-allowed':'pointer' }} onClick={handleIncremente} disabled={cantitate>=produs.stoc}>
                <Plus size={15} />
              </button>
            </div>
          </div>

          <button
            style={{ ...styles.butonCos, transform: addedAnim?'scale(0.97)':'scale(1)', opacity: produs.stoc===0?0.45:1, cursor: produs.stoc===0?'not-allowed':'pointer' }}
            onClick={produs.stoc > 0 ? handleAdaugaInCos : undefined}
            disabled={produs.stoc === 0}
            onMouseEnter={e => { if (produs.stoc>0) e.currentTarget.style.backgroundColor='#f5e6ee'; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor='white'; }}
          >
            <ShoppingCart size={19} style={{ marginRight: '10px' }} />
            {produs.stoc === 0 ? 'Indisponibil' : 'Adaugă în coș'}
          </button>

          {mesajAdaugat && (
            <div style={styles.mesajCos}>
              ✓ Adăugat în coș cu succes!{' '}
              <span style={{ cursor: 'pointer', textDecoration: 'underline', opacity: 0.8 }} onClick={() => navigate('/comenzi')}>
                Vezi coșul →
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  pagina: { minHeight: '100vh', backgroundColor: '#8B1A4A', backgroundImage: 'linear-gradient(135deg, #8B1A4A 0%, #C2185B 50%, #8B1A4A 100%)', color: 'white', fontFamily: 'Georgia, serif', position: 'relative', overflow: 'hidden' },
  butonBack: { position: 'fixed', top: '24px', left: '28px', backgroundColor: 'rgba(255,255,255,0.15)', border: '1.5px solid rgba(255,255,255,0.35)', color: 'white', padding: '9px 20px', borderRadius: '25px', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '0.9em', display: 'flex', alignItems: 'center', backdropFilter: 'blur(8px)', zIndex: 100, transition: 'background-color 0.2s' },
  continut: { display: 'flex', minHeight: '100vh' },
  partaStanga: { width: '50%', position: 'relative', overflow: 'hidden', backgroundColor: 'rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' },
  imagine: { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transition: 'opacity 0.5s ease' },
  imagineLoading: { fontSize: '6em', opacity: 0.3, position: 'relative', zIndex: 1 },
  imagineGoala: { fontSize: '9em', opacity: 0.25 },
  gradientOverlay: { position: 'absolute', right: 0, top: 0, bottom: 0, width: '80px', background: 'linear-gradient(to right, transparent, rgba(139,26,74,0.5))', zIndex: 2 },
  badgeStoc: { position: 'absolute', bottom: '30px', left: '20px', backgroundColor: '#e63946', color: 'white', padding: '7px 16px', borderRadius: '20px', fontSize: '0.85em', fontWeight: 'bold', fontStyle: 'italic', boxShadow: '0 4px 15px rgba(0,0,0,0.3)', zIndex: 5 },
  partaDreapta: { width: '50%', padding: '100px 64px 60px', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative' },
  butonInima: { position: 'absolute', top: '32px', right: '40px', background: 'rgba(255,255,255,0.08)', border: '1.5px solid rgba(255,255,255,0.2)', cursor: 'pointer', padding: '10px', transition: 'transform 0.2s ease', borderRadius: '50%', width: '52px', height: '52px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  categorie: { fontSize: '0.8em', letterSpacing: '4px', textTransform: 'uppercase', opacity: 0.55, marginBottom: '12px' },
  numeFloare: { fontSize: '3.2em', fontStyle: 'italic', fontWeight: 'bold', margin: '0 0 26px 0', lineHeight: 1.1, textShadow: '0 2px 16px rgba(0,0,0,0.2)' },
  pretRow: { display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '4px' },
  pret: { fontSize: '3em', fontWeight: 'bold', color: '#FFD700', lineHeight: 1, textShadow: '0 2px 10px rgba(0,0,0,0.2)', transition: 'all 0.2s ease' },
  valuta: { fontSize: '1.5em', color: '#FFD700', opacity: 0.8 },
  pretPerBuc: { fontSize: '0.88em', opacity: 0.5, fontStyle: 'italic', marginBottom: '4px' },
  separator: { width: '50px', height: '2px', backgroundColor: 'rgba(255,255,255,0.2)', margin: '26px 0', borderRadius: '2px' },
  stocInfo: { display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9em', opacity: 0.75, marginBottom: '30px', fontStyle: 'italic' },
  stocDot: { display: 'inline-block', width: '9px', height: '9px', borderRadius: '50%', flexShrink: 0 },
  cantitateSection: { marginBottom: '30px' },
  cantitateLabel: { display: 'block', fontSize: '0.78em', letterSpacing: '3px', textTransform: 'uppercase', opacity: 0.55, marginBottom: '12px' },
  cantitateControl: { display: 'inline-flex', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '50px', border: '1.5px solid rgba(255,255,255,0.2)', overflow: 'hidden' },
  butonCantitate: { background: 'none', border: 'none', color: 'white', width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Georgia, serif', transition: 'opacity 0.15s, background-color 0.15s' },
  cantitateValoare: { fontSize: '1.25em', fontWeight: 'bold', minWidth: '48px', textAlign: 'center', userSelect: 'none' },
  butonCos: { padding: '17px 36px', backgroundColor: 'white', color: '#8B1A4A', border: 'none', borderRadius: '50px', fontFamily: 'Georgia, serif', fontSize: '1.05em', fontWeight: 'bold', boxShadow: '0 8px 30px rgba(0,0,0,0.25)', transition: 'transform 0.15s ease, background-color 0.2s, opacity 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', maxWidth: '360px' },
  mesajCos: { marginTop: '14px', color: '#a8e6bc', fontSize: '0.95em', fontStyle: 'italic' },
};

export default ProdusInLucru;
