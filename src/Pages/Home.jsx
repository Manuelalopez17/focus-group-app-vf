// src/Pages/Home.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();
  const sesiones = ['1.1', '1.2', '2.1', '2.2'];
  const [sesion, setSesion] = useState('');
  const [email, setEmail] = useState('');

  const canContinue = sesion && email.trim();

  const handleStart = () => {
    if (!canContinue) return;
    navigate(`/participante?sesion=${sesion}&email=${encodeURIComponent(email)}`);
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1>Focus Group</h1>
        <p>Selecciona sesión e ingresa tu correo:</p>
        <select
          style={styles.input}
          value={sesion}
          onChange={e => setSesion(e.target.value)}
        >
          <option value="">-- Seleccione sesión --</option>
          {sesiones.map(s => (
            <option key={s} value={s}>Sesión {s}</option>
          ))}
        </select>
        <input
          style={styles.input}
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <button
          style={{ ...styles.button, opacity: canContinue ? 1 : 0.5 }}
          disabled={!canContinue}
          onClick={handleStart}
        >
          Continuar
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
    backgroundImage: 'url("/proyecto.png")', backgroundSize: 'cover'
  },
  card: {
    background: 'rgba(255,255,255,0.9)', padding: 30, borderRadius: 12,
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)', width: '90%', maxWidth: 400, textAlign: 'center'
  },
  input: {
    width: '100%', padding: 10, margin: '10px 0', borderRadius: 6, border: '1px solid #ccc'
  },
  button: {
    width: '100%', padding: 12, background: '#007bff', color: 'white',
    border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 16
  }
};
