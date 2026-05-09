import React, { useState } from 'react';
import './SignInPage.css';

function SignInPage() {
  const [formData, setFormData] = useState({
    nume: '',
    email: '',
    parola: '',
    telefon: '',
    adresa: '',
    rol: 'Client'
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      if (response.ok) {
        alert("Cont creat cu succes!");
      } else {
        alert("Eroare: " + data.error);
      }
    } catch (error) {
      alert("Serverul nu răspunde. Verifică dacă ai pornit backend-ul!");
    }
  };

  return (
    <div className="pagina-fundal-completa">
      <div className="dreptunghi-signin">
        <h2 className="titlu-stanga-sus">Cont nou</h2>
        
        <form className="formular-flex" onSubmit={handleSubmit}>
          <div className="grup-input">
            <label>Nume Complet</label>
            <input type="text" name="nume" onChange={handleChange} required />
          </div>

          <div className="grup-input">
            <label>Email</label>
            <input type="email" name="email" onChange={handleChange} required />
          </div>

          <div className="grup-input">
            <label>Parolă</label>
            <input type="password" name="parola" onChange={handleChange} required />
          </div>

          <div className="grup-input">
            <label>Telefon</label>
            <input type="text" name="telefon" onChange={handleChange} />
          </div>

          <div className="grup-input">
            <label>Adresă</label>
            <textarea name="adresa" onChange={handleChange}></textarea>
          </div>
          
          <div className="grup-input">
            <label>Rol utilizator</label>
            <select name="rol" onChange={handleChange}>
              <option value="Client">Client</option>
            </select>
          </div>

          <button type="submit" className="buton-transparent">Creează</button>
        </form>
      </div>
    </div>
  );
}

// Această linie este crucială pentru a-l putea folosi în App.js
export default SignInPage;