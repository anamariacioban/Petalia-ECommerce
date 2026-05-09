import React from 'react';
import { useNavigate } from 'react-router-dom';

function ProdusInLucru() {
  const navigate = useNavigate();

  const styles = {
    pagina: {
      minHeight: '100vh',
      backgroundColor: '#8B1A4A',
      backgroundImage: 'linear-gradient(135deg, #8B1A4A 0%, #C2185B 50%, #8B1A4A 100%)',
      color: 'white',
      fontFamily: 'Georgia, serif',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '40px'
    },
    emoji: { fontSize: '5em', marginBottom: '20px' },
    titlu: { fontSize: '2.5em', fontStyle: 'italic', marginBottom: '15px' },
    subtitlu: {
      fontSize: '1.2em',
      opacity: 0.8,
      maxWidth: '450px',
      lineHeight: '1.6',
      marginBottom: '40px'
    },
    buton: {
      padding: '12px 30px',
      backgroundColor: 'white',
      color: '#8B1A4A',
      border: 'none',
      borderRadius: '25px',
      cursor: 'pointer',
      fontFamily: 'Georgia, serif',
      fontSize: '1em',
      fontWeight: 'bold'
    }
  };

  return (
    <div style={styles.pagina}>
      <div style={styles.emoji}>🚧</div>
      <h1 style={styles.titlu}>Pagină în lucru</h1>
      <p style={styles.subtitlu}>
        Această secțiune este în curs de dezvoltare.<br />
        Revino curând pentru mai multe opțiuni! 🌸
      </p>
      <button style={styles.buton} onClick={() => navigate(-1)}>
        ← Înapoi
      </button>
    </div>
  );
}

export default ProdusInLucru;