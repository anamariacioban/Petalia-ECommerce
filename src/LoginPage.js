import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [parola, setParola] = useState('');
  const [showParola, setShowParola] = useState(false);
  const [popup, setPopup] = useState(null); // null = ascuns, string = mesaj de afisat
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, parola })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('numeUtilizator', data.nume);
        localStorage.setItem('idUser', data.idUser);
        localStorage.setItem('rol', data.rol);
        localStorage.setItem('emailUser', email);

        navigate('/client-home');

      } else {
        alert(data.error);
      }
    } catch (error) {
      alert("Eroare la conectarea cu serverul!");
    }
  };

  const handleRecuperareParola = async () => {
    if (!email || email.trim() === '') {
      alert("Introdu mai întâi adresa de email în câmpul de mai sus!");
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/recover-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (response.ok) {
        setPopup(email);
      } else {
        alert(data.error || "A apărut o eroare. Încearcă din nou.");
      }
    } catch (error) {
      alert("Eroare la conectarea cu serverul!");
    }
  };

  return (
    <div className="pagina-fundal-completa">
      <div className="dreptunghi-login">
        <h2 className="titlu-stanga-sus">Autentificare</h2>
        
        <form className="formular-flex" onSubmit={handleLogin}>
          <div className="grup-input">
            <label>Adresă Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>

          <div className="grup-input">
            <label>Parolă</label>
            <div className="input-parola-wrapper">
              <input 
                type={showParola ? "text" : "password"}
                value={parola} 
                onChange={(e) => setParola(e.target.value)} 
                required 
              />
              <button
                type="button"
                className="buton-show-parola"
                onClick={() => setShowParola(!showParola)}
              >
                {showParola ? "Ascunde" : "Arată"}
              </button>
            </div>
          </div>

          {/* Link recuperare parolă */}
          <div className="casuta-recuperare-parola">
            <span
              className="link-recuperare-parola"
              onClick={handleRecuperareParola}
            >
              Ups... Ai uitat parola? Recupereaz-o!
            </span>
          </div>

          <button type="submit" className="buton-transparent">Conectează-te</button>
        </form>
      </div>

      {/* Popup confirmare trimitere email */}
      {popup && (
        <div className="popup-overlay" onClick={() => setPopup(null)}>
          <div className="popup-box" onClick={(e) => e.stopPropagation()}>
            <p className="popup-mesaj">
              Am trimis parola pe mail-ul <strong>{popup}</strong>
            </p>
            <button className="popup-buton-inchide" onClick={() => setPopup(null)}>
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default LoginPage;
