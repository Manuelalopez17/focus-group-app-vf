// src/Pages/Home.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

export default function Home() {
  const navigate = useNavigate()
  const { search } = useLocation()
  const email = new URLSearchParams(search).get('email') || ''

  // ➊ Lista de sesiones ahora con 3.1 y 3.2
  const sesiones = ['1.1','1.2','2.1','2.2','3.1','3.2']

  const etapasProyecto = [
    'Abastecimiento',
    'Prefactibilidad y Factibilidad',
    'Planeación',
    'Contratación y Adquisición',
    'Diseño',
    'Fabricación',
    'Logística y Transporte',
    'Montaje',
    'Construcción',
    'Puesta en Marcha',
    'Disposición Final'
  ]

  const [etapa, setEtapa] = useState('')

  useEffect(() => {
    if (!email) navigate('/presentacion', { replace: true })
  }, [email, navigate])

  const startSession = sesion => {
    if (!etapa) {
      alert('Por favor seleccione su área de experiencia')
      return
    }
    navigate(
      `/participante?sesion=${sesion}` +
      `&email=${encodeURIComponent(email)}` +
      `&etapa=${encodeURIComponent(etapa)}`,
      { replace: false }
    )
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2>Bienvenido, <strong>{email}</strong></h2>
        <p>Seleccione su área de experiencia:</p>
        <select
          style={styles.input}
          value={etapa}
          onChange={e => setEtapa(e.target.value)}
        >
          <option value="">-- Seleccione etapa --</option>
          {etapasProyecto.map(ep => (
            <option key={ep} value={ep}>{ep}</option>
          ))}
        </select>
        <div style={styles.buttons}>
          {sesiones.map(s => (
            <button
              key={s}
              style={styles.button}
              onClick={() => startSession(s)}
            >
              Sesión {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    backgroundImage: 'url("/proyecto.png")', backgroundSize: 'cover',
    fontFamily: `'Poppins', sans-serif`, padding: '20px'
  },
  card: {
    background: 'rgba(255,255,255,0.9)',
    padding: '30px',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    width: '100%', maxWidth: '500px',
    textAlign: 'center'
  },
  input: {
    width: '100%', padding: '10px', margin: '12px 0',
    borderRadius: '6px', border: '1px solid #ccc'
  },
  buttons: {
    display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center'
  },
  button: {
    flex: '1 1 100px',
    padding: '10px 0',
    background: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px'
  }
}
