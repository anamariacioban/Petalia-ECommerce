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
  const [showParola, setShowParola] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const validate = () => {
    const newErrors = {};

    // Nume complet - minim 2 cuvinte
    const cuvinte = formData.nume.trim().split(/\s+/);
    if (!formData.nume.trim()) {
      newErrors.nume = 'Numele complet este obligatoriu.';
    } else if (cuvinte.length < 2) {
      newErrors.nume = 'Introduceți cel puțin prenume și nume (2 cuvinte).';
    }

    // Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Emailul este obligatoriu.';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Emailul nu are un format valid (ex: nume@domeniu.com).';
    }

    // Parola - minim 6 caractere, o majuscula, o cifra
    if (!formData.parola) {
      newErrors.parola = 'Parola este obligatorie.';
    } else if (formData.parola.length < 6) {
      newErrors.parola = 'Parola trebuie să aibă cel puțin 6 caractere.';
    } else if (!/[A-Z]/.test(formData.parola)) {
      newErrors.parola = 'Parola trebuie să conțină cel puțin o literă mare.';
    } else if (!/[0-9]/.test(formData.parola)) {
      newErrors.parola = 'Parola trebuie să conțină cel puțin o cifră.';
    }

    // Telefon - optional, dar daca e completat trebuie sa fie valid
    if (formData.telefon) {
      const telRegex = /^[0-9]{10}$/;
      if (!telRegex.test(formData.telefon.replace(/\s/g, ''))) {
        newErrors.telefon = 'Numărul de telefon trebuie să aibă 10 cifre.';
      }
    }

    // Adresa - optional, dar daca e completata trebuie sa aiba minim 10 caractere
    if (formData.adresa && formData.adresa.trim().length < 10) {
      newErrors.adresa = 'Adresa este prea scurtă. Introduceți strada, numărul și orașul.';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

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
        if (data.error && data.error.includes('UNIQUE')) {
          setErrors({ email: 'Acest email este deja folosit. Încercați cu alt email.' });
        } else {
          alert("Eroare: " + data.error);
        }
      }
    } catch (error) {
      alert("Serverul nu răspunde. Verificați dacă ați pornit backend-ul!");
    }
  };

  return (
    <div className="pagina-fundal-completa">
      <div className="dreptunghi-signin">
        <h2 className="titlu-stanga-sus">Cont nou</h2>
        
        <form className="formular-flex" onSubmit={handleSubmit}>
          <div className="grup-input">
            <label>Nume Complet <span className="obligatoriu">*</span></label>
            <input type="text" name="nume" onChange={handleChange} placeholder="Ex: Popescu Maria" />
            {errors.nume && <span className="eroare-text">{errors.nume}</span>}
          </div>

          <div className="grup-input">
            <label>Email <span className="obligatoriu">*</span></label>
            <input type="text" name="email" onChange={handleChange} placeholder="Ex: maria@gmail.com" />
            {errors.email && <span className="eroare-text">{errors.email}</span>}
          </div>

          <div className="grup-input">
            <label>Parolă <span className="obligatoriu">*</span></label>
            <p className="cerinte-parola">Minim 6 caractere, o literă mare și o cifră.</p>
            <div className="input-parola-wrapper">
              <input type={showParola ? "text" : "password"} name="parola" onChange={handleChange} />
              <button type="button" className="buton-show-parola" onClick={() => setShowParola(!showParola)}>
                {showParola ? "Ascunde" : "Arată"}
              </button>
            </div>
            {errors.parola && <span className="eroare-text">{errors.parola}</span>}
          </div>

          <div className="grup-input">
            <label>Telefon <span className="optional">(opțional)</span></label>
            <input type="text" name="telefon" onChange={handleChange} placeholder="Ex: 0712345678" />
            {errors.telefon && <span className="eroare-text">{errors.telefon}</span>}
          </div>

          <div className="grup-input">
            <label>Adresă <span className="optional">(opțional)</span></label>
            <textarea name="adresa" onChange={handleChange} placeholder="Ex: Str. Florilor nr. 5, Cluj-Napoca"></textarea>
            {errors.adresa && <span className="eroare-text">{errors.adresa}</span>}
          </div>
          
          <div className="grup-input">
            <label>Rol utilizator</label>
            <select name="rol" onChange={handleChange}>
              <option value="Client">Client</option>
            </select>
          </div>

          <p className="legenda-obligatoriu"><span className="obligatoriu">*</span> câmpuri obligatorii</p>

          <button type="submit" className="buton-transparent">Creează</button>
        </form>
      </div>
    </div>
  );
}

export default SignInPage;