import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [parola, setParola] = useState('');
  const [showParola, setShowParola] = useState(false); 
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

          <button type="submit" className="buton-transparent">Conectează-te</button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;