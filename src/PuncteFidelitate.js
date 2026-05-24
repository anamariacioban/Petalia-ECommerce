import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, ShoppingBag, Flower2, Sparkles, Plus, Minus, Trash2, CheckCircle } from 'lucide-react';
import './PuncteFidelitate.css';

function PuncteFidelitate() {
  const navigate = useNavigate();
  const idUser = localStorage.getItem('idUser');

  const [puncte, setPuncte] = useState(0);
  const [loadingPuncte, setLoadingPuncte] = useState(true);
  const [tab, setTab] = useState('catalog'); // 'catalog' | 'custom'
  const [flori, setFlori] = useState([]);
  const [loadingFlori, setLoadingFlori] = useState(true);
  const [cos, setCos] = useState([]); // { floare, cantitate }
  const [tipCreatie, setTipCreatie] = useState('Buchet');
  const [loadingComanda, setLoadingComanda] = useState(false);
  const [succes, setSucces] = useState(false);
  const [eroare, setEroare] = useState('');

  useEffect(() => {
    fetchPuncte();
    fetchFlori();
  }, []);

  const fetchPuncte = async () => {
    setLoadingPuncte(true);
    try {
      const res = await fetch(`http://localhost:5000/api/puncte/${idUser}`);
      const data = await res.json();
      setPuncte(data.puncte || 0);
    } catch (e) {
      console.error('Eroare la încărcarea punctelor:', e);
    } finally {
      setLoadingPuncte(false);
    }
  };

  const fetchFlori = async () => {
    setLoadingFlori(true);
    try {
      const res = await fetch('http://localhost:5000/api/flori');
      const data = await res.json();
      setFlori(data.filter(f => f.stoc > 0));
    } catch (e) {
      console.error('Eroare la încărcarea florilor:', e);
    } finally {
      setLoadingFlori(false);
    }
  };

  // 1 punct = 1 RON
  const pretInPuncte = (pret) => Math.ceil(pret);

  const adaugaInCos = (floare) => {
    setCos(prev => {
      const existent = prev.find(i => i.floare.id_floare === floare.id_floare);
      if (existent) {
        return prev.map(i =>
          i.floare.id_floare === floare.id_floare
            ? { ...i, cantitate: i.cantitate + 1 }
            : i
        );
      }
      return [...prev, { floare, cantitate: 1 }];
    });
  };

  const scadedinCos = (id) => {
    setCos(prev => {
      const item = prev.find(i => i.floare.id_floare === id);
      if (!item) return prev;
      if (item.cantitate <= 1) return prev.filter(i => i.floare.id_floare !== id);
      return prev.map(i =>
        i.floare.id_floare === id ? { ...i, cantitate: i.cantitate - 1 } : i
      );
    });
  };

  const scoateDinCos = (id) => {
    setCos(prev => prev.filter(i => i.floare.id_floare !== id));
  };

  const totalPuncteNecesare = cos.reduce(
    (sum, item) => sum + pretInPuncte(item.floare.pret) * item.cantitate,
    0
  );

  const cantitateInCos = (id) => {
    const item = cos.find(i => i.floare.id_floare === id);
    return item ? item.cantitate : 0;
  };

  const genereazaTitlu = () => {
    if (tab !== 'custom' || cos.length === 0) return null;
    const tipText = tipCreatie === 'Buchet' ? 'Buchet' : 'Aranjament Floral';
    const floriText = cos
      .map(item => `${item.cantitate} ${item.floare.nume}`)
      .join(', ');
    return `${tipText} cu ${floriText}`;
  };

  const handlePlaseazaComanda = async () => {
    if (cos.length === 0) return;
    if (puncte < totalPuncteNecesare) {
      setEroare(`Puncte insuficiente! Ai ${puncte} puncte, ai nevoie de ${totalPuncteNecesare}.`);
      return;
    }
    setEroare('');
    setLoadingComanda(true);
    try {
      const titlu = genereazaTitlu();
      const body = {
        IdUser: parseInt(idUser),
        PuncteNecesare: totalPuncteNecesare,
        Produse: cos.map(item => ({
          IdFloare: item.floare.id_floare,
          Cantitate: item.cantitate,
          PretUnitar: item.floare.pret
        })),
        ...(titlu ? { Titlu: titlu } : {})
      };
      const res = await fetch('http://localhost:5000/api/foloseste-puncte', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (res.ok) {
        setPuncte(data.puncteRamase);
        setCos([]);
        setSucces(true);
        setTimeout(() => setSucces(false), 3000);
      } else {
        setEroare(data.error || 'A apărut o eroare.');
      }
    } catch (e) {
      setEroare('Eroare la plasarea comenzii.');
    } finally {
      setLoadingComanda(false);
    }
  };

  const floriPentruCustom = flori.filter(f => f.culoare === 'Flori');
  const floriPentruCatalog = flori;

  return (
    <div className="pf-pagina">
      {/* Header */}
      <div className="pf-header">
        <button className="pf-btn-back" onClick={() => navigate('/client-home')}>
          <ArrowLeft size={16} style={{ marginRight: '6px' }} />
          Înapoi
        </button>
        <div className="pf-header-titlu">
          <Star size={26} color="white" style={{ marginRight: '10px' }} />
          <span>Puncte de Fidelitate</span>
        </div>
        <div style={{ width: '100px' }} />
      </div>

      <div className="pf-continut">
        {/* Card puncte */}
        <div className="pf-card-puncte">
          <div className="pf-stele-decor">✦ ✦ ✦</div>
          <div className="pf-puncte-label">Punctele tale</div>
          {loadingPuncte ? (
            <div className="pf-puncte-loading">...</div>
          ) : (
            <div className="pf-puncte-numar">{puncte}</div>
          )}
          <div className="pf-puncte-sublabel">puncte acumulate</div>
          <div className="pf-info-rate">
            <div className="pf-info-chip">🌸 1 punct = 1 RON</div>
            <div className="pf-info-chip">🛒 Comanda / 20 = puncte noi</div>
          </div>
          <div className="pf-info-exemplu">
            Ex: Comandă de 200 RON → câștigă 10 puncte
          </div>
        </div>

        {/* Succes / Eroare */}
        {succes && (
          <div className="pf-mesaj-succes">
            <CheckCircle size={20} style={{ marginRight: '8px' }} />
            Comandă plasată cu succes! Punctele au fost scăzute.
          </div>
        )}
        {eroare && (
          <div className="pf-mesaj-eroare">{eroare}</div>
        )}

        {/* Tabs */}
        <div className="pf-tabs">
          <button
            className={`pf-tab ${tab === 'catalog' ? 'activ' : ''}`}
            onClick={() => { setTab('catalog'); setCos([]); setEroare(''); }}
          >
            <ShoppingBag size={16} style={{ marginRight: '6px' }} />
            Flori din catalog
          </button>
          <button
            className={`pf-tab ${tab === 'custom' ? 'activ' : ''}`}
            onClick={() => { setTab('custom'); setCos([]); setEroare(''); }}
          >
            <Sparkles size={16} style={{ marginRight: '6px' }} />
            Crează buchet / aranjament
          </button>
        </div>

        {/* TAB: CATALOG */}
        {tab === 'catalog' && (
          <div className="pf-tab-continut">
            <p className="pf-descriere">
              Alege florile pe care vrei să le comanzi folosind punctele tale.
              Costul fiecărui produs în puncte este egal cu prețul în RON.
            </p>

            {loadingFlori ? (
              <div className="pf-loading">Se încarcă florile... 🌷</div>
            ) : floriPentruCatalog.length === 0 ? (
              <div className="pf-gol">Nu există flori disponibile momentan.</div>
            ) : (
              <div className="pf-grid-flori">
                {floriPentruCatalog.map(floare => {
                  const cantitate = cantitateInCos(floare.id_floare);
                  const cost = pretInPuncte(floare.pret);
                  const poateAdauga = puncte >= cost || cantitate > 0;
                  return (
                    <div key={floare.id_floare} className="pf-card-floare">
                      <div className="pf-card-imagine">
                        {floare.imagine
                          ? <img src={floare.imagine} alt={floare.nume} />
                          : <div className="pf-imagine-goala">🌷</div>
                        }
                      </div>
                      <div className="pf-card-body">
                        <div className="pf-card-nume">{floare.nume}</div>
                        <div className="pf-card-categorie">{floare.culoare}</div>
                        <div className="pf-card-cost">
                          <Star size={13} color="#FFD700" style={{ marginRight: '4px' }} />
                          {cost} puncte
                        </div>
                        <div className="pf-card-stoc">Stoc: {floare.stoc} buc.</div>
                      </div>
                      <div className="pf-card-footer">
                        {cantitate === 0 ? (
                          <button
                            className={`pf-btn-adauga ${!poateAdauga ? 'disabled' : ''}`}
                            onClick={() => adaugaInCos(floare)}
                            disabled={!poateAdauga}
                            title={!poateAdauga ? 'Puncte insuficiente pentru acest produs' : ''}
                          >
                            <Plus size={14} style={{ marginRight: '4px' }} />
                            Adaugă
                          </button>
                        ) : (
                          <div className="pf-cantitate-control">
                            <button className="pf-btn-qty" onClick={() => scadedinCos(floare.id_floare)}>
                              <Minus size={14} />
                            </button>
                            <span className="pf-qty-val">{cantitate}</span>
                            <button className="pf-btn-qty" onClick={() => adaugaInCos(floare)}>
                              <Plus size={14} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB: CUSTOM */}
        {tab === 'custom' && (
          <div className="pf-tab-continut">
            <p className="pf-descriere">
              Creează-ți propriul buchet sau aranjament floral din florile disponibile.
              Selectează tipul și adaugă florile dorite.
            </p>

            {/* Tip creatie */}
            <div className="pf-tip-selectie">
              <span className="pf-tip-label">Tip:</span>
              {['Buchet', 'Aranjament Floral'].map(tip => (
                <button
                  key={tip}
                  className={`pf-tip-btn ${tipCreatie === tip ? 'activ' : ''}`}
                  onClick={() => setTipCreatie(tip)}
                >
                  {tip === 'Buchet' ? '💐' : '🌸'} {tip}
                </button>
              ))}
            </div>

            {loadingFlori ? (
              <div className="pf-loading">Se încarcă florile... 🌷</div>
            ) : (
              <>
                <h3 className="pf-sectiune-titlu">
                  <Flower2 size={18} style={{ marginRight: '8px' }} />
                  Alege florile
                </h3>
                {flori.filter(f => f.culoare === 'Flori').length === 0 ? (
                  <div className="pf-gol">Nu există flori individuale disponibile momentan.</div>
                ) : (
                  <div className="pf-grid-flori">
                    {flori.filter(f => f.culoare === 'Flori').map(floare => {
                      const cantitate = cantitateInCos(floare.id_floare);
                      const cost = pretInPuncte(floare.pret);
                      return (
                        <div key={floare.id_floare} className="pf-card-floare">
                          <div className="pf-card-imagine">
                            {floare.imagine
                              ? <img src={floare.imagine} alt={floare.nume} />
                              : <div className="pf-imagine-goala">🌷</div>
                            }
                          </div>
                          <div className="pf-card-body">
                            <div className="pf-card-nume">{floare.nume}</div>
                            <div className="pf-card-cost">
                              <Star size={13} color="#FFD700" style={{ marginRight: '4px' }} />
                              {cost} puncte / buc.
                            </div>
                            <div className="pf-card-stoc">Stoc: {floare.stoc} buc.</div>
                          </div>
                          <div className="pf-card-footer">
                            {cantitate === 0 ? (
                              <button className="pf-btn-adauga" onClick={() => adaugaInCos(floare)}>
                                <Plus size={14} style={{ marginRight: '4px' }} />
                                Adaugă
                              </button>
                            ) : (
                              <div className="pf-cantitate-control">
                                <button className="pf-btn-qty" onClick={() => scadedinCos(floare.id_floare)}>
                                  <Minus size={14} />
                                </button>
                                <span className="pf-qty-val">{cantitate}</span>
                                <button className="pf-btn-qty" onClick={() => adaugaInCos(floare)}>
                                  <Plus size={14} />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Cos comanda cu puncte */}
        {cos.length > 0 && (
          <div className="pf-cos">
            <h3 className="pf-cos-titlu">
              {tab === 'custom'
                ? `🌿 ${tipCreatie} tău`
                : '🛒 Selecția ta'}
            </h3>

            <div className="pf-cos-lista">
              {cos.map(item => (
                <div key={item.floare.id_floare} className="pf-cos-item">
                  <div className="pf-cos-info">
                    <span className="pf-cos-nume">{item.floare.nume}</span>
                    <span className="pf-cos-qty">× {item.cantitate}</span>
                  </div>
                  <div className="pf-cos-dreapta">
                    <span className="pf-cos-cost">
                      <Star size={12} color="#FFD700" style={{ marginRight: '3px' }} />
                      {pretInPuncte(item.floare.pret) * item.cantitate} pct.
                    </span>
                    <button className="pf-cos-sterge" onClick={() => scoateDinCos(item.floare.id_floare)}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="pf-cos-separator" />

            <div className="pf-cos-total">
              <span>Total necesar:</span>
              <span className="pf-cos-total-val">
                <Star size={16} color="#FFD700" style={{ marginRight: '5px' }} />
                {totalPuncteNecesare} puncte
              </span>
            </div>

            <div className="pf-cos-disponibil">
              Puncte disponibile: <strong>{puncte}</strong>
              {puncte < totalPuncteNecesare && (
                <span className="pf-insuficient"> (insuficiente)</span>
              )}
            </div>

            <button
              className={`pf-btn-confirma ${puncte < totalPuncteNecesare || loadingComanda ? 'disabled' : ''}`}
              onClick={handlePlaseazaComanda}
              disabled={puncte < totalPuncteNecesare || loadingComanda}
            >
              {loadingComanda
                ? 'Se procesează...'
                : tab === 'custom'
                  ? `🌸 Comandă ${tipCreatie}`
                  : '🌸 Plasează comanda'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default PuncteFidelitate;
