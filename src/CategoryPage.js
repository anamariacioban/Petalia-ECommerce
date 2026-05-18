import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Heart, ShoppingCart } from 'lucide-react';
import './ClientHomePage.css';
import { useCart } from './CartContext';

function CategoryPage() {
  const { categorie } = useParams();
  const navigate = useNavigate();
  const { cartCount } = useCart();
  const [produse, setProduse] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchProduse(); }, [categorie]);

  const fetchProduse = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/flori/categorie/${encodeURIComponent(categorie)}`);
      const data = await res.json();
      setProduse(data);
    } catch (e) { console.log('Eroare:', e); }
    finally { setLoading(false); }
  };

  const styles = {
    pagina: { minHeight: '100vh', backgroundColor: '#8B1A4A', backgroundImage: 'linear-gradient(135deg, #8B1A4A 0%, #C2185B 50%, #8B1A4A 100%)', color: 'white', fontFamily: 'Georgia, serif' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 30px', backgroundColor: 'rgba(0,0,0,0.2)' },
    butonBack: { backgroundColor: 'transparent', border: '2px solid white', color: 'white', padding: '8px 18px', borderRadius: '20px', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '1em' },
    titlu: { textAlign: 'center', fontSize: '2.2em', fontStyle: 'italic', padding: '30px 20px 10px', margin: 0, fontFamily: 'Georgia, serif' },
    subtitlu: { textAlign: 'center', fontSize: '1em', opacity: 0.7, marginBottom: '30px', marginTop: '5px', fontFamily: 'Georgia, serif', fontStyle: 'italic' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '28px', padding: '20px 40px 50px' },
    card: { backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: '18px', overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.25)', transition: 'transform 0.2s, box-shadow 0.2s', display: 'flex', flexDirection: 'column' },
    imagineContainer: { width: '100%', height: '220px', overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.08)' },
    imagine: { width: '100%', height: '100%', objectFit: 'cover' },
    imagineGoala: { width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '5em', background: 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))' },
    cardBody: { padding: '18px 18px 8px', flexGrow: 1 },
    numeFloare: { fontSize: '1.25em', fontStyle: 'italic', fontWeight: 'bold', marginBottom: '6px', fontFamily: 'Georgia, serif' },
    pret: { fontSize: '1.3em', fontWeight: 'bold', color: '#FFD700', marginBottom: '4px', fontFamily: 'Georgia, serif' },
    stoc: { fontSize: '0.85em', opacity: 0.75, marginBottom: '14px', fontFamily: 'Georgia, serif' },
    cardFooter: { padding: '0 18px 18px' },
    butonSelecteaza: { width: '100%', padding: '12px', backgroundColor: 'white', color: '#8B1A4A', border: 'none', borderRadius: '25px', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '0.95em', fontWeight: 'bold', boxShadow: '0 4px 12px rgba(0,0,0,0.2)', transition: 'background-color 0.2s' },
    goala: { textAlign: 'center', padding: '80px 20px', fontSize: '1.2em', opacity: 0.7, fontFamily: 'Georgia, serif' }
  };

  return (
    <div style={styles.pagina}>
      <div style={styles.header}>
        <button style={styles.butonBack} onClick={() => navigate('/client-home')}>← Înapoi</button>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <Heart color="white" size={28} style={{ cursor: 'pointer' }} onClick={() => navigate('/favorites')} />
          {/* Cart cu badge */}
          <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => navigate('/comenzi')}>
            <ShoppingCart color="white" size={28} />
            {cartCount > 0 && (
              <span style={{ position: 'absolute', top: '-8px', right: '-8px', backgroundColor: '#FFD700', color: '#8B1A4A', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65em', fontWeight: 'bold', boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </div>
        </div>
      </div>

      <h1 style={styles.titlu}>🌸 {categorie}</h1>
      <p style={styles.subtitlu}>🌷 Fiecare floare spune o poveste — alege-o pe a ta</p>

      {loading ? (
        <p style={styles.goala}>Se încarcă...</p>
      ) : produse.length === 0 ? (
        <p style={styles.goala}>Nu există produse în această categorie încă. 🌷</p>
      ) : (
        <div style={styles.grid}>
          {produse.map((produs, i) => (
            <div key={i} style={styles.card}
              onMouseEnter={e => { e.currentTarget.style.transform='translateY(-6px)'; e.currentTarget.style.boxShadow='0 16px 40px rgba(0,0,0,0.35)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='0 8px 32px rgba(0,0,0,0.25)'; }}
            >
              <div style={styles.imagineContainer}>
                {produs.imagine ? <img src={produs.imagine} alt={produs.nume} style={styles.imagine} /> : <div style={styles.imagineGoala}>🌷</div>}
              </div>
              <div style={styles.cardBody}>
                <div style={styles.numeFloare}>{produs.nume}</div>
                <div style={styles.pret}>{produs.pret} RON</div>
                <div style={styles.stoc}>{produs.stoc > 0 ? `Stoc: ${produs.stoc} buc.` : '⚠️ Stoc epuizat'}</div>
              </div>
              <div style={styles.cardFooter}>
                <button
                  style={{ ...styles.butonSelecteaza, opacity: produs.stoc===0?0.5:1, cursor: produs.stoc===0?'not-allowed':'pointer' }}
                  onClick={() => { if (produs.stoc > 0) navigate('/produs-in-lucru', { state: { produs } }); }}
                  onMouseEnter={e => { if (produs.stoc>0) e.target.style.backgroundColor='#f5e6ee'; }}
                  onMouseLeave={e => { e.target.style.backgroundColor='white'; }}
                >
                  {produs.stoc > 0 ? '🛒 Selectează opțiunile' : 'Indisponibil'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CategoryPage;
