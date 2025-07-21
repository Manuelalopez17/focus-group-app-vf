import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export default function Presentacion() {
  const navigate = useNavigate();
  const [nombre, setNombre] = useState('');
  const [empresa, setEmpresa] = useState('');
  const [experiencia, setExperiencia] = useState('');
  const [rol, setRol] = useState('');
  const [email, setEmail] = useState('');

  const canSubmit = [nombre, empresa, experiencia, rol, email].every(v => v.trim());

  const handleSubmit = async () => {
    if (!canSubmit) return;
    const { error } = await supabase
      .from('experts')
      .upsert(
        [{ nombre, empresa, experiencia, rol, email }],
        { onConflict: 'email' }
      );
    if (error) {
      console.error('Error guardando experto:', error);
      alert('Hubo un error al guardar. Revisa consola.');
      return;
    }
    localStorage.setItem('expertEmail', email);
    navigate('/login');
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1>Presentación</h1>
        <p>Completa tus datos para iniciar el Focus Group</p>
        <input style={styles.input} placeholder="Nombre completo" value={nombre} onChange={e => setNombre(e.target.value)} />
        <input style={styles.input} placeholder="Empresa" value={empresa} onChange={e => setEmpresa(e.target.value)} />
        <input style={styles.input} type="number" placeholder="Años de experiencia" value={experiencia} onChange={e => setExperiencia(e.target.value)} />
        <input style={styles.input} placeholder="Rol" value={rol} onChange={e => setRol(e.target.value)} />
        <input style={styles.input} type="email" placeholder="Correo electrónico" value={email} onChange={e => setEmail(e.target.value)} />
        <button style={{ ...styles.button, opacity: canSubmit ? 1 : 0.5 }} disabled={!canSubmit} onClick={handleSubmit}>
          Guardar y continuar
        </button>
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
  input: {
    width: '100%', padding: '10px', margin: '8px 0', borderRadius: '6px', border: '1px solid #ccc'
  },
  button: {
    marginTop: '16px', width: '100%', padding: '12px', background: '#007bff', color: 'white',
    border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '16px'
  }
};
