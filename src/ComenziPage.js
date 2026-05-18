import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Trash2, Plus, Minus, Package, CheckCircle, Clock, XCircle } from 'lucide-react';
import { useCart } from './CartContext';
import './ComenziPage.css';

function ComenziPage() {
  const navigate = useNavigate();
  const { cartItems, removeFromCart, updateQuantity, clearCart, cartTotal } = useCart();
  const [tab, setTab] = useState('cos'); // 'cos' | 'istoric'
  const [comenzi, setComenzi] = useState([]);
  const [loadingComenzi, setLoadingComenzi] = useState(false);
  const [confirmand, setConfirmand] = useState(false);
  const [confirmat, setConfirmat] = useState(false);
  const [metodaPlata, setMetodaPlata] = useState('Card');

  const idUser = localStorage.getItem('idUser');

  useEffect(() => {
    if (tab === 'istoric') fetchComenzi();
  }, [tab]);

  const fetchComenzi = async () => {
    setLoadingComenzi(true);
    try {
      const res = await fetch(`http://localhost:5000/api/comenzi/${idUser}`);
      const data = await res.json();
      setComenzi(data);
    } catch (e) {
      console.error('Eroare la încărcarea comenzilor:', e);
    } finally {
      setLoadingComenzi(false);
    }
  };

  const handleConfirmaComanda = async () => {
    if (cartItems.length === 0) return;
    setConfirmand(true);
    try {
      const body = {
        IdUser: parseInt(idUser),
        Total: parseFloat(cartTotal.toFixed(2)),
        MetodaPlata: metodaPlata,
        Produse: cartItems.map(item => ({
          IdFloare: item.id_floare,
          Cantitate: item.cantitate,
          PretUnitar: item.pret
        }))
      };
      const res = await fetch('http://localhost:5000/api/comenzi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (res.ok) {
        clearCart();
        setConfirmat(true);
        setTimeout(() => {
          setConfirmat(false);
          setTab('istoric');
        }, 2200);
      }
    } catch (e) {
      console.error('Eroare la confirmarea comenzii:', e);
    } finally {
      setConfirmand(false);
    }
  };

  const statusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'finalizata': return <CheckCircle size={16} color="#4caf7d" />;
      case 'in procesare': return <Clock size={16} color="#FFD700" />;
      case 'anulata': return <XCircle size={16} color="#e63946" />;
      default: return <Clock size={16} color="#FFD700" />;
    }
  };

  const statusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'finalizata': return '#4caf7d';
      case 'in procesare': return '#FFD700';
      case 'anulata': return '#e63946';
      default: return '#FFD700';
    }
  };

  return (
    <div className="comenzi-pagina">
      {/* Header */}
      <div className="comenzi-header">
        <button className="comenzi-btn-back" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} style={{ marginRight: '6px' }} />
          Înapoi
        </button>
        <div className="comenzi-header-titlu">
          <ShoppingCart size={26} color="white" style={{ marginRight: '12px' }} />
          <span>Comenzile mele</span>
        </div>
        <div style={{ width: '100px' }} />
      </div>

      {/* Tabs */}
      <div className="comenzi-tabs">
        <button
          className={`tab-btn ${tab === 'cos' ? 'activ' : ''}`}
          onClick={() => setTab('cos')}
        >
          🛒 Coș ({cartItems.reduce((s, i) => s + i.cantitate, 0)})
        </button>
        <button
          className={`tab-btn ${tab === 'istoric' ? 'activ' : ''}`}
          onClick={() => setTab('istoric')}
        >
          📦 Istoric comenzi
        </button>
      </div>

      {/* Continut */}
      <div className="comenzi-continut">

        {/* TAB: COS */}
        {tab === 'cos' && (
          <>
            {cartItems.length === 0 ? (
              <div className="cos-gol">
                <div className="cos-gol-icon">🌷</div>
                <p className="cos-gol-text">Coșul tău este gol</p>
                <p className="cos-gol-sub">Adaugă flori frumoase pentru a le găsi aici</p>
                <button className="btn-cumpara" onClick={() => navigate('/client-home')}>
                  Explorează florile
                </button>
              </div>
            ) : (
              <div className="cos-layout">
                {/* Lista produse */}
                <div className="cos-produse">
                  {confirmat && (
                    <div className="confirmat-banner">
                      <CheckCircle size={22} style={{ marginRight: '10px' }} />
                      Comanda a fost plasată cu succes! 🌸
                    </div>
                  )}
                  {cartItems.map((item) => (
                    <div key={item.id_floare} className="cos-card">
                      <div className="cos-card-imagine">
                        {item.imagine ? (
                          <img src={item.imagine} alt={item.nume} />
                        ) : (
                          <div className="cos-imagine-goala">🌷</div>
                        )}
                      </div>
                      <div className="cos-card-info">
                        <div className="cos-card-nume">{item.nume}</div>
                        <div className="cos-card-categorie">{item.culoare}</div>
                        <div className="cos-card-pret">{item.pret} RON / buc.</div>
                      </div>
                      <div className="cos-card-dreapta">
                        <div className="cantitate-control">
                          <button
                            className="btn-cantitate"
                            onClick={() => updateQuantity(item.id_floare, item.cantitate - 1)}
                          >
                            <Minus size={14} />
                          </button>
                          <span className="cantitate-val">{item.cantitate}</span>
                          <button
                            className="btn-cantitate"
                            onClick={() => updateQuantity(item.id_floare, item.cantitate + 1)}
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <div className="cos-card-subtotal">
                          {(item.pret * item.cantitate).toFixed(2)} RON
                        </div>
                        <button
                          className="btn-sterge"
                          onClick={() => removeFromCart(item.id_floare)}
                          title="Șterge din coș"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Sumar comanda */}
                <div className="cos-sumar">
                  <h3 className="sumar-titlu">Sumar comandă</h3>

                  <div className="sumar-linii">
                    {cartItems.map(item => (
                      <div key={item.id_floare} className="sumar-linie">
                        <span>{item.nume} × {item.cantitate}</span>
                        <span>{(item.pret * item.cantitate).toFixed(2)} RON</span>
                      </div>
                    ))}
                  </div>

                  <div className="sumar-separator" />

                  <div className="sumar-total">
                    <span>Total</span>
                    <span className="total-val">{cartTotal.toFixed(2)} RON</span>
                  </div>

                  <div className="sumar-metoda">
                    <label className="metoda-label">Metodă de plată</label>
                    <div className="metoda-optiuni">
                      {['Card', 'Numerar', 'Transfer bancar'].map(m => (
                        <button
                          key={m}
                          className={`metoda-btn ${metodaPlata === m ? 'selectat' : ''}`}
                          onClick={() => setMetodaPlata(m)}
                        >
                          {m === 'Card' ? '💳' : m === 'Numerar' ? '💵' : '🏦'} {m}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    className="btn-confirma"
                    onClick={handleConfirmaComanda}
                    disabled={confirmand}
                  >
                    {confirmand ? 'Se procesează...' : '🌸 Confirmă comanda'}
                  </button>

                  <button
                    className="btn-goleste"
                    onClick={clearCart}
                  >
                    Golește coșul
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* TAB: ISTORIC */}
        {tab === 'istoric' && (
          <div className="istoric-container">
            {loadingComenzi ? (
              <p className="loading-text">Se încarcă comenzile... 🌷</p>
            ) : comenzi.length === 0 ? (
              <div className="cos-gol">
                <div className="cos-gol-icon">📦</div>
                <p className="cos-gol-text">Nu ai comenzi plasate încă</p>
                <p className="cos-gol-sub">Comandă flori și le vei găsi aici</p>
                <button className="btn-cumpara" onClick={() => setTab('cos')}>
                  Mergi la coș
                </button>
              </div>
            ) : (
              comenzi.map((comanda) => (
                <div key={comanda.idComanda} className="comanda-card">
                  <div className="comanda-header-row">
                    <div className="comanda-id">
                      <Package size={18} style={{ marginRight: '8px', opacity: 0.8 }} />
                      Comanda #{comanda.idComanda}
                    </div>
                    <div className="comanda-status" style={{ color: statusColor(comanda.status) }}>
                      {statusIcon(comanda.status)}
                      <span style={{ marginLeft: '6px' }}>{comanda.status}</span>
                    </div>
                  </div>

                  <div className="comanda-data">
                    🗓 {new Date(comanda.dataComanda).toLocaleDateString('ro-RO', {
                      day: '2-digit', month: 'long', year: 'numeric',
                      hour: '2-digit', minute: '2-digit'
                    })}
                  </div>

                  {comanda.detalii && comanda.detalii.length > 0 && (
                    <div className="comanda-detalii">
                      {comanda.detalii.map((d, i) => (
                        <div key={i} className="detaliu-linie">
                          <div className="detaliu-imagine">
                            {d.imagine ? (
                              <img src={d.imagine} alt={d.numeFloare} />
                            ) : (
                              <div className="detaliu-imagine-goala">🌷</div>
                            )}
                          </div>
                          <div className="detaliu-info">
                            <span className="detaliu-nume">{d.numeFloare}</span>
                            <span className="detaliu-cantitate">× {d.cantitate}</span>
                          </div>
                          <span className="detaliu-pret">{(d.pretUnitar * d.cantitate).toFixed(2)} RON</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="comanda-footer">
                    <span className="comanda-metoda">
                      {comanda.metodaPlata === 'Card' ? '💳' : comanda.metodaPlata === 'Numerar' ? '💵' : '🏦'} {comanda.metodaPlata}
                    </span>
                    <span className="comanda-total">Total: <strong>{comanda.total?.toFixed(2)} RON</strong></span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ComenziPage;
