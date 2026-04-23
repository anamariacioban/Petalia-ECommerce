import React, { useState } from 'react';
import './LoginPage.css';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [parola, setParola] = useState('');

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
        alert(data.message);
        // Aici vei putea redirecționa utilizatorul către pagina de magazin
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
            <input 
              type="password" 
              value={parola} 
              onChange={(e) => setParola(e.target.value)} 
              required 
            />
          </div>

          <button type="submit" className="buton-transparent">Conectează-te</button>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;