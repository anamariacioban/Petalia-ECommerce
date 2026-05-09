import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const CATEGORII_INITIALE = ['Flori', 'Buchete', 'Aranjamente Florale', 'Ghivece'];

const NUME_PE_CATEGORIE = {
  'Flori': ['Trandafir alb', 'Trandafir roz', 'Trandafir roșu', 'Trandafir galben', 'Bujor', 'Lalea', 'Crin', 'Margaretă', 'Orhidee', 'Garoafă'],
  'Buchete': ['Buchet romantic', 'Buchet de mireasă', 'Buchet aniversar', 'Buchet primăvară'],
  'Aranjamente Florale': ['Aranjament masă', 'Aranjament funerar', 'Aranjament nuntă', 'Aranjament birou'],
  'Ghivece': ['Orhidee ghiveci', 'Cactus', 'Ficus', 'Lavandă', 'Violetă']
};

const SUPER_ADMIN_EMAIL = 'anamaria15102004@gmail.com';

function AdminPage() {
  const [flori, setFlori] = useState([]);
  const [utilizatori, setUtilizatori] = useState([]);
  const [sectiune, setSectiune] = useState('flori');
  const [categorii, setCategorii] = useState(CATEGORII_INITIALE);
  const [formFloare, setFormFloare] = useState({
    nume: '', numeCustom: '', categorie: 'Flori', categorieCustom: '', pret: '', stoc: '', imagine: ''
  });
  const [numeCustom, setNumeCustom] = useState(false);
  const [categorieCustom, setCategorieCustom] = useState(false);
  const [mesaj, setMesaj] = useState('');
  const [mesajTip, setMesajTip] = useState('ok');
  const [modifica, setModifica] = useState(null);
  const [imaginePreview, setImaginePreview] = useState('');
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchFlori();
    fetchUtilizatori();
  }, []);

  const afisezMesaj = (text, tip = 'ok') => {
    setMesaj(text);
    setMesajTip(tip);
    setTimeout(() => setMesaj(''), 4000);
  };

  const fetchFlori = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/flori');
      const data = await res.json();
      setFlori(data);
      const categoriiNoi = [...new Set(data.map(f => f.culoare))];
      setCategorii(prev => [...new Set([...prev, ...categoriiNoi])]);
    } catch (e) {
      console.log('Eroare flori:', e);
    }
  };

  const fetchUtilizatori = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/utilizatori');
      const data = await res.json();
      setUtilizatori(data);
    } catch (e) {
      console.log('Eroare utilizatori:', e);
    }
  };

  const handleFisierImagine = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setImaginePreview(reader.result);
      setFormFloare(prev => ({ ...prev, imagine: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleAdaugaFloare = async () => {
    const numeFinal = numeCustom ? formFloare.numeCustom.trim() : formFloare.nume;
    const categorieFinal = categorieCustom ? formFloare.categorieCustom.trim() : formFloare.categorie;

    if (!numeFinal || !categorieFinal || !formFloare.pret || !formFloare.stoc) {
      afisezMesaj('⚠️ Completează toate câmpurile!', 'eroare');
      return;
    }

    const exista = flori.some(
      f => f.nume.toLowerCase().trim() === numeFinal.toLowerCase() &&
           f.culoare.toLowerCase().trim() === categorieFinal.toLowerCase()
    );
    if (exista) {
      afisezMesaj('⚠️ Există deja un produs cu același nume în această categorie!', 'eroare');
      return;
    }

    if (categorieCustom && !categorii.includes(categorieFinal)) {
      setCategorii(prev => [...prev, categorieFinal]);
    }

    try {
      const res = await fetch('http://localhost:5000/api/flori', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nume: numeFinal,
          pret: parseFloat(formFloare.pret),
          culoare: categorieFinal,
          stoc: parseInt(formFloare.stoc),
          imagine: formFloare.imagine || ''
        })
      });
      if (res.ok) {
        afisezMesaj('✅ Produs adăugat cu succes! 🌸');
        setFormFloare({ nume: '', numeCustom: '', categorie: 'Flori', categorieCustom: '', pret: '', stoc: '', imagine: '' });
        setImaginePreview('');
        setNumeCustom(false);
        setCategorieCustom(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
        fetchFlori();
      } else {
        afisezMesaj('⚠️ Eroare la adăugare!', 'eroare');
      }
    } catch (e) {
      afisezMesaj('⚠️ Eroare de conexiune!', 'eroare');
    }
  };

  const handleStergeFloare = async (id) => {
    if (!window.confirm('Ești sigur că vrei să ștergi acest produs?')) return;
    try {
      await fetch(`http://localhost:5000/api/flori/${id}`, { method: 'DELETE' });
      afisezMesaj('🗑️ Produs șters!');
      fetchFlori();
    } catch (e) {
      afisezMesaj('⚠️ Eroare la ștergere!', 'eroare');
    }
  };

  const handleDeschideModifica = (f) => {
    setModifica({ ...f });
  };

  const handleModificaFisier = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setModifica(prev => ({ ...prev, imagine: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSalveazaModificare = async () => {
    if (!modifica.pret || !modifica.stoc) {
      afisezMesaj('⚠️ Completează prețul și stocul!', 'eroare');
      return;
    }
    try {
      const res = await fetch(`http://localhost:5000/api/flori/${modifica.id_floare}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pret: parseFloat(modifica.pret),
          stoc: parseInt(modifica.stoc),
          imagine: modifica.imagine || ''
        })
      });
      if (res.ok) {
        afisezMesaj('✅ Produs modificat cu succes!');
        setModifica(null);
        fetchFlori();
      } else {
        afisezMesaj('⚠️ Eroare la modificare!', 'eroare');
      }
    } catch (e) {
      afisezMesaj('⚠️ Eroare de conexiune!', 'eroare');
    }
  };

  const handleAcordaAdmin = async (idUser) => {
    try {
      const res = await fetch(`http://localhost:5000/api/acorda-admin/${idUser}`, { method: 'PUT' });
      if (res.ok) {
        afisezMesaj('✅ Rol de admin acordat!');
        fetchUtilizatori();
      }
    } catch (e) {
      afisezMesaj('⚠️ Eroare!', 'eroare');
    }
  };

  const handleRevocaAdmin = async (idUser) => {
    if (!window.confirm('Ești sigur că vrei să revoci dreptul de admin?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/revoca-admin/${idUser}`, {
        method: 'PUT'
      });
      if (res.ok) {
        afisezMesaj('✅ Drept de admin revocat!');
        fetchUtilizatori();
      }
    } catch (e) {
      afisezMesaj('⚠️ Eroare!', 'eroare');
    }
  };

  const floriPeCategorie = categorii.reduce((acc, cat) => {
    acc[cat] = flori.filter(f => f.culoare === cat);
    return acc;
  }, {});

  const styles = {
    pagina: {
      minHeight: '100vh',
      backgroundColor: '#8B1A4A',
      backgroundImage: 'linear-gradient(135deg, #8B1A4A 0%, #C2185B 50%, #8B1A4A 100%)',
      color: 'white',
      padding: '30px',
      fontFamily: 'Georgia, serif'
    },
    titlu: { color: 'white', textAlign: 'center', fontSize: '2.2em', marginBottom: '10px', fontStyle: 'italic' },
    butonBack: { backgroundColor: 'transparent', border: '2px solid white', color: 'white', padding: '8px 16px', borderRadius: '20px', cursor: 'pointer', marginBottom: '20px', fontFamily: 'Georgia, serif' },
    butoane: { display: 'flex', gap: '10px', marginBottom: '25px', justifyContent: 'center' },
    buton: { padding: '10px 25px', backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', border: '2px solid white', borderRadius: '20px', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '1em' },
    butonActiv: { padding: '10px 25px', backgroundColor: 'white', color: '#8B1A4A', border: '2px solid white', borderRadius: '20px', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '1em', fontWeight: 'bold' },
    card: { backgroundColor: 'rgba(255,255,255,0.15)', padding: '15px 20px', borderRadius: '12px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' },
    categorieHeader: { fontSize: '1.2em', fontStyle: 'italic', marginTop: '20px', marginBottom: '10px', borderBottom: '1px solid rgba(255,255,255,0.3)', paddingBottom: '5px' },
    select: { padding: '10px', marginRight: '10px', marginBottom: '10px', borderRadius: '20px', border: 'none', fontFamily: 'Georgia, serif', minWidth: '160px' },
    input: { padding: '10px', marginRight: '10px', marginBottom: '10px', borderRadius: '20px', border: 'none', width: '140px', fontFamily: 'Georgia, serif' },
    butonAdauga: { padding: '10px 20px', backgroundColor: 'white', color: '#8B1A4A', border: 'none', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold', fontFamily: 'Georgia, serif' },
    butonCustom: { padding: '6px 14px', backgroundColor: 'transparent', color: 'white', border: '1px solid white', borderRadius: '15px', cursor: 'pointer', fontFamily: 'Georgia, serif', fontSize: '0.85em', marginBottom: '10px', marginRight: '10px' },
    butonSterge: { padding: '7px 15px', backgroundColor: 'rgba(200,50,50,0.4)', color: 'white', border: '1px solid rgba(255,100,100,0.5)', borderRadius: '15px', cursor: 'pointer', fontFamily: 'Georgia, serif', whiteSpace: 'nowrap' },
    butonModifica: { padding: '7px 15px', backgroundColor: 'rgba(255,255,255,0.25)', color: 'white', border: '1px solid rgba(255,255,255,0.5)', borderRadius: '15px', cursor: 'pointer', fontFamily: 'Georgia, serif', whiteSpace: 'nowrap' },
    mesajOk: { color: '#90EE90', textAlign: 'center', marginBottom: '10px', fontSize: '1.05em', fontWeight: 'bold' },
    mesajEroare: { color: '#FFB3B3', textAlign: 'center', marginBottom: '10px', fontSize: '1.05em', fontWeight: 'bold' },
    sectiuneTitlu: { fontSize: '1.4em', marginBottom: '15px', fontStyle: 'italic' },
    label: { display: 'block', marginBottom: '5px', fontSize: '0.9em', opacity: '0.85' },
    overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
    modal: { backgroundColor: '#8B1A4A', border: '2px solid rgba(255,255,255,0.3)', borderRadius: '20px', padding: '30px', minWidth: '340px', color: 'white', fontFamily: 'Georgia, serif' },
    modalTitlu: { fontSize: '1.4em', fontStyle: 'italic', marginBottom: '20px' },
    modalInput: { padding: '10px', borderRadius: '15px', border: 'none', width: '100%', fontFamily: 'Georgia, serif', marginBottom: '12px', boxSizing: 'border-box' },
    modalButoane: { display: 'flex', gap: '10px', marginTop: '10px', justifyContent: 'flex-end' },
    butonSalveaza: { padding: '10px 22px', backgroundColor: 'white', color: '#8B1A4A', border: 'none', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold', fontFamily: 'Georgia, serif' },
    butonAnuleaza: { padding: '10px 22px', backgroundColor: 'transparent', color: 'white', border: '2px solid white', borderRadius: '20px', cursor: 'pointer', fontFamily: 'Georgia, serif' },
    prevImg: { width: '100%', maxHeight: '160px', objectFit: 'cover', borderRadius: '10px', marginBottom: '10px' }
  };

  return (
    <div style={styles.pagina}>
      <button style={styles.butonBack} onClick={() => navigate('/client-home')}>← Înapoi</button>
      <h1 style={styles.titlu}>🌸 Panou Administrator</h1>
      {mesaj && <p style={mesajTip === 'ok' ? styles.mesajOk : styles.mesajEroare}>{mesaj}</p>}

      <div style={styles.butoane}>
        <button style={sectiune === 'flori' ? styles.butonActiv : styles.buton} onClick={() => setSectiune('flori')}>Gestionare Stocuri</button>
        <button style={sectiune === 'utilizatori' ? styles.butonActiv : styles.buton} onClick={() => setSectiune('utilizatori')}>Gestionare Utilizatori</button>
      </div>

      {sectiune === 'flori' && (
        <div>
          <h2 style={styles.sectiuneTitlu}>Adaugă Produs</h2>
          <div>
            <span style={styles.label}>Categorie:</span>
            {!categorieCustom ? (
              <select style={styles.select} value={formFloare.categorie}
                onChange={e => setFormFloare({ ...formFloare, categorie: e.target.value, nume: '' })}>
                {categorii.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            ) : (
              <input style={styles.input} placeholder="Categorie nouă"
                value={formFloare.categorieCustom}
                onChange={e => setFormFloare({ ...formFloare, categorieCustom: e.target.value })} />
            )}
            <button style={styles.butonCustom} onClick={() => { setCategorieCustom(!categorieCustom); setFormFloare(p => ({ ...p, categorieCustom: '' })); }}>
              {categorieCustom ? '← Listă' : '+ Categorie nouă'}
            </button>
            <br />

            <span style={styles.label}>Nume produs:</span>
            {!numeCustom ? (
              <select style={styles.select} value={formFloare.nume}
                onChange={e => setFormFloare({ ...formFloare, nume: e.target.value })}>
                <option value="">-- Selectează --</option>
                {(NUME_PE_CATEGORIE[formFloare.categorie] || []).map(n => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            ) : (
              <input style={styles.input} placeholder="Nume produs"
                value={formFloare.numeCustom}
                onChange={e => setFormFloare({ ...formFloare, numeCustom: e.target.value })} />
            )}
            <button style={styles.butonCustom} onClick={() => { setNumeCustom(!numeCustom); setFormFloare(p => ({ ...p, numeCustom: '' })); }}>
              {numeCustom ? '← Listă' : '+ Nume nou'}
            </button>
            <br />

            <input style={styles.input} placeholder="Preț (RON)" type="number" min="0" value={formFloare.pret}
              onChange={e => setFormFloare({ ...formFloare, pret: e.target.value })} />
            <input style={styles.input} placeholder="Stoc" type="number" min="0" value={formFloare.stoc}
              onChange={e => setFormFloare({ ...formFloare, stoc: e.target.value })} />
            <br />

            <span style={styles.label}>Imagine produs (opțional):</span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFisierImagine}
              style={{ color: 'white', marginBottom: '10px', display: 'block' }}
            />
            {imaginePreview && (
              <div style={{ marginBottom: '10px' }}>
                <img src={imaginePreview} alt="Preview" style={{ height: '100px', borderRadius: '10px', objectFit: 'cover' }} />
                <button style={{ ...styles.butonCustom, marginLeft: '10px', fontSize: '0.8em' }}
                  onClick={() => { setImaginePreview(''); setFormFloare(p => ({ ...p, imagine: '' })); if (fileInputRef.current) fileInputRef.current.value = ''; }}>
                  ✕ Elimină
                </button>
              </div>
            )}
            <br />
            <button style={styles.butonAdauga} onClick={handleAdaugaFloare}>Adaugă 🌷</button>
          </div>

          <h2 style={{ ...styles.sectiuneTitlu, marginTop: '35px' }}>Stocuri existente</h2>
          {flori.length === 0 ? <p>Nu există produse în baza de date.</p> :
            categorii.map(cat => (
              floriPeCategorie[cat] && floriPeCategorie[cat].length > 0 && (
                <div key={cat}>
                  <h3 style={styles.categorieHeader}>🌸 {cat}</h3>
                  {floriPeCategorie[cat].map((f, i) => (
                    <div key={i} style={styles.card}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                        {f.imagine ? (
                          <img src={f.imagine} alt={f.nume} style={{ width: '50px', height: '50px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }} />
                        ) : (
                          <span style={{ fontSize: '2em' }}>🌷</span>
                        )}
                        <span><strong>{f.nume}</strong> — {f.pret} RON — Stoc: {f.stoc}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                        <button style={styles.butonModifica} onClick={() => handleDeschideModifica(f)}>✏️ Modifică</button>
                        <button style={styles.butonSterge} onClick={() => handleStergeFloare(f.id_floare)}>🗑️ Șterge</button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ))
          }
        </div>
      )}

      {sectiune === 'utilizatori' && (
        <div>
          <h2 style={styles.sectiuneTitlu}>Utilizatori</h2>
          {utilizatori.map((u, i) => (
            <div key={i} style={styles.card}>
              <span>👤 {u.nume} — {u.email} — {u.rol}</span>
              <div style={{ display: 'flex', gap: '8px' }}>
                {u.rol !== 'Administrator' && (
                  <button style={styles.butonModifica} onClick={() => handleAcordaAdmin(u.idUser)}>
                    Acordă Admin
                  </button>
                )}
                {u.rol === 'Administrator' && u.email !== SUPER_ADMIN_EMAIL && (
                  <button style={styles.butonSterge} onClick={() => handleRevocaAdmin(u.idUser)}>
                    Revocă Admin
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {modifica && (
        <div style={styles.overlay} onClick={() => setModifica(null)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <h3 style={styles.modalTitlu}>✏️ Modifică: {modifica.nume}</h3>

            {modifica.imagine && (
              <img src={modifica.imagine} alt="preview" style={styles.prevImg} />
            )}

            <label style={{ ...styles.label, marginBottom: '5px' }}>Imagine nouă (opțional):</label>
            <input type="file" accept="image/*" onChange={handleModificaFisier}
              style={{ color: 'white', marginBottom: '14px', display: 'block' }} />

            <label style={styles.label}>Preț (RON):</label>
            <input
              style={styles.modalInput}
              type="number" min="0"
              value={modifica.pret}
              onChange={e => setModifica(prev => ({ ...prev, pret: e.target.value }))}
            />

            <label style={styles.label}>Stoc:</label>
            <input
              style={styles.modalInput}
              type="number" min="0"
              value={modifica.stoc}
              onChange={e => setModifica(prev => ({ ...prev, stoc: e.target.value }))}
            />

            <div style={styles.modalButoane}>
              <button style={styles.butonAnuleaza} onClick={() => setModifica(null)}>Anulează</button>
              <button style={styles.butonSalveaza} onClick={handleSalveazaModificare}>💾 Salvează</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPage;