import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();
  const sesiones = ['1.1', '1.2', '2.1', '2.2'];

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1>Focus Group</h1>
        <p>Selecciona la sesión para comenzar</p>
        <div style={styles.buttons}>
          {sesiones.map(s => (
            <button key={s} style={styles.button} onClick={() => navigate(`/participante?sesion=${s}`)}>
              Sesión {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
    backgroundImage: 'url("/proyecto.png")', backgroundSize: 'cover', fontFamily: "'Poppins',sans-serif'"
  },
  card: {
    background: 'rgba(255,255,255,0.9)', padding: '40px', borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px', textAlign: 'center'
  },
  buttons: {
    display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center', marginTop: '16px'
  },
  button: {
    padding: '12px 20px', background: '#007bff', color: 'white', border: 'none',
    borderRadius: '6px', cursor: 'pointer', fontSize: '16px'
  }
};
