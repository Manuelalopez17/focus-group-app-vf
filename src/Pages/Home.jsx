// src/Pages/Home.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();
  // 1) Cargo correo de localStorage si existe
  const [email, setEmail] = useState(
    () => localStorage.getItem('expertEmail') || ''
  );

  // 2) Si meten correo nuevo, lo guardo
  useEffect(() => {
    if (email) {
      localStorage.setItem('expertEmail', email);
    }
  }, [email]);

  const sesiones = ['1.1','1.2','2.1','2.2'];

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1>Focus Group</h1>

        {/* Si no hay email, muestro input para “login” */}
        {!email ? (
          <>
            <p>Ingresa tu correo para continuar</p>
            <input
              type="email"
              placeholder="Correo electrónico"
              style={styles.input}
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </>
        ) : (
          <p style={{ color: 'green' }}>Bienvenido, {email}</p>
        )}

        <div style={styles.buttons}>
          {sesiones.map(s => (
            <button
              key={s}
              style={{
                ...styles.button,
                opacity: email ? 1 : 0.5,
                cursor: email ? 'pointer' : 'not-allowed'
              }}
              disabled={!email}
              onClick={() => navigate(`/participante?sesion=${s}`)}
            >
              Sesión {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight:'100vh',
    display:'flex', alignItems:'center', justifyContent:'center',
    backgroundImage:'url("/proyecto.png")', backgroundSize:'cover',
    fontFamily:"'Poppins', sans-serif"
  },
  card: {
    background:'rgba(255,255,255,0.9)', padding:30, borderRadius:12,
    boxShadow:'0 4px 12px rgba(0,0,0,0.1)', textAlign:'center', width:'100%', maxWidth:400
  },
  input: {
    width:'100%', padding:10, margin:'10px 0', borderRadius:6, border:'1px solid #ccc'
  },
  buttons: {
    display:'flex', flexWrap:'wrap', gap:10, justifyContent:'center', marginTop:20
  },
  button: {
    padding:'10px 16px', background:'#007bff', color:'#fff',
    border:'none', borderRadius:6, fontSize:16
  }
};
