import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);

  // Si ya hay correo, saltamos a Home
  useEffect(() => {
    const stored = localStorage.getItem('expertEmail');
    if (stored) {
      navigate('/home', { replace: true });
    } else {
      setLoading(false);
    }
  }, [navigate]);

  const handleLogin = async () => {
    if (!email.trim()) return;
    const { data, error } = await supabase
      .from('experts')
      .select('email')
      .eq('email', email)
      .single();
    if (error || !data) {
      alert('Correo no registrado. Ve a Presentación.');
      return;
    }
    localStorage.setItem('expertEmail', email);
    navigate('/home');
  };

  if (loading) return null;

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1>Ingreso</h1>
        <p>Ingresa tu correo para continuar</p>
        <input
          style={styles.input}
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <button style={styles.button} onClick={handleLogin}>
          Ingresar
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    backgroundImage: 'url("/proyecto.png")', backgroundSize: 'cover',
    fontFamily: "'Poppins', sans-serif'"
  },
  card: {
    background: 'rgba(255,255,255,0.9)', padding: '40px', borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)', textAlign: 'center', width: '100%', maxWidth: '400px'
  },
  input: {
    width: '100%', padding: '10px', margin: '8px 0',
    borderRadius: '6px', border: '1px solid #ccc', fontSize: '16px'
  },
  button: {
    marginTop: '16px', width: '100%', padding: '12px',
    background: '#007bff', color: 'white', border: 'none',
    borderRadius: '6px', cursor: 'pointer', fontSize: '16px'
  }
};

