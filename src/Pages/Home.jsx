import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

export default function Home() {
  const nav = useNavigate()
  const { search } = useLocation()
  const email = new URLSearchParams(search).get('email') || ''
  const [inputEmail, setInputEmail] = useState('')

  useEffect(() => {
    if (email) setInputEmail(email)
  }, [email])

  const sesiones = ['1.1','1.2','2.1','2.2']

  const handleGo = () => {
    if (!inputEmail.trim()) return
    nav(`/home?email=${encodeURIComponent(inputEmail)}`, { replace: true })
  }

  if (!email) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h1>Identifícate</h1>
          <p>Ingresa tu correo para continuar</p>
          <input style={styles.input} type="email" placeholder="Correo electrónico" value={inputEmail} onChange={e=>setInputEmail(e.target.value)} />
          <button style={{...styles.button, opacity: inputEmail.trim()?1:0.5}} disabled={!inputEmail.trim()} onClick={handleGo}>
            Continuar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1>Focus Group</h1>
        <p>Selecciona la sesión para comenzar</p>
        <div style={styles.buttons}>
          {sesiones.map(s => (
            <button key={s} style={styles.button} onClick={()=>nav(`/participante?sesion=${s}&email=${encodeURIComponent(email)}`)}>
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
    minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center',
    backgroundImage:'url("/proyecto.png")', backgroundSize:'cover', fontFamily:"'Poppins', sans-serif'"
  },
  card: {
    background:'rgba(255,255,255,0.9)', padding:'40px', borderRadius:'12px',
    boxShadow:'0 4px 12px rgba(0,0,0,0.1)', textAlign:'center', width:'100%', maxWidth:'400px'
  },
  input: { width:'100%', padding:'10px', margin:'8px 0', borderRadius:'6px', border:'1px solid #ccc' },
  button: { padding:'12px 20px', background:'#007bff', color:'white', border:'none', borderRadius:'6px', cursor:'pointer', fontSize:'16px' },
  buttons: { display:'flex', flexWrap:'wrap', gap:'12px', justifyContent:'center', marginTop:'16px' }
}
