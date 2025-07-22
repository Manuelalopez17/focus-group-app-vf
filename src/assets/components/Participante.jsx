// src/assets/components/Participante.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../supabaseClient'

export default function Participante() {
  const nav = useNavigate()
  const { search } = useLocation()
  const sesion = new URLSearchParams(search).get('sesion')
  const email  = new URLSearchParams(search).get('email')

  const etapasProyecto = [
    'Abastecimiento','Prefactibilidad y Factibilidad','Planeación','Contratación y Adquisición',
    'Diseño','Fabricación','Logística y Transporte','Montaje','Construcción','Puesta en Marcha','Disposición Final'
  ]

  // Aquí debes copiar TODOS los riesgos para cada etapa:
  const riesgosPorEtapa = {
    Abastecimiento: [
      'Demora en entrega de materiales por parte del proveedor',
      'Recepción de materiales con especificaciones incorrectas',
      'Falta de control de calidad en los insumos adquiridos',
    ],
    'Prefactibilidad y Factibilidad': [
      /* tus riesgos aquí... */
    ],
    Planeación: [ /* ... */ ],
    'Contratación y Adquisición': [ /* ... */ ],
    Diseño: [ /* ... */ ],
    Fabricación: [ /* ... */ ],
    'Logística y Transporte': [ /* ... */ ],
    Montaje: [ /* ... */ ],
    Construcción: [ /* ... */ ],
    'Puesta en Marcha': [ /* ... */ ],
    'Disposición Final': [ /* ... */ ],
  }

  const [etapa, setEtapa] = useState('')
  const [mostrar, setMostrar] = useState(false)
  const [respuestas, setRespuestas] = useState({})

  // Si no hay email en la URL, redirijo al home de login por correo
  useEffect(()=>{
    if (!email) nav(`/home`, { replace:true })
  },[email, nav])

  const start = () => {
    if (etapa) setMostrar(true)
  }

  const handleChange1 = (idx, field, value) => {
    setRespuestas(prev => {
      const copy = {...prev}
      copy[idx] = copy[idx] || {}
      if (field === 'importancia_impacto') {
        const imp = Number(value)
        copy[idx].importancia_impacto = imp
        copy[idx].importancia_frecuencia = 100 - imp
      } else {
        copy[idx][field] = Number(value)
      }
      return copy
    })
  }

  const handleCheckbox = (idx, ep) => {
    setRespuestas(prev => {
      const copy = {...prev}
      copy[idx] = copy[idx] || {}
      const arr = copy[idx].etapas_afectadas || []
      copy[idx].etapas_afectadas = 
        arr.includes(ep) ? arr.filter(e => e !== ep) : [...arr, ep]
      return copy
    })
  }

  const handleSubmit = async () => {
    const riesgos = riesgosPorEtapa[etapa] || []
    const inserts = riesgos.map((r,i) => {
      const resp = respuestas[i] || {}
      const base = { sesion, etapa, riesgo: r, experto_email: email }
      if (sesion.startsWith('1.')) {
        return {
          ...base,
          impacto: resp.impacto||0,
          frecuencia: resp.frecuencia||0,
          importancia_impacto: resp.importancia_impacto||0,
          importancia_frecuencia: resp.importancia_frecuencia||0,
          score_base: (resp.impacto||0)*(resp.frecuencia||0),
          score_final:
            (resp.impacto||0)*((resp.importancia_impacto||0)/100) +
            (resp.frecuencia||0)*((resp.importancia_frecuencia||0)/100),
        }
      } else {
        return { ...base, etapas_afectadas: resp.etapas_afectadas || [] }
      }
    })
    const { error } = await supabase
      .from('focus-group-db')
      .insert(inserts)
    if (error) {
      console.error(error)
      alert('Error guardando respuestas. Revisa consola.')
      return
    }
    // de vuelta al home pero pasando el email para login
    nav(`/home?email=${encodeURIComponent(email)}`, { replace:true })
  }

  const riesgos = riesgosPorEtapa[etapa] || []

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {!mostrar ? (
          <>
            <h2>Sesión {sesion}</h2>
            <select
              style={styles.input}
              value={etapa}
              onChange={e => setEtapa(e.target.value)}
            >
              <option value="">Seleccione etapa</option>
              {etapasProyecto.map(ep => (
                <option key={ep} value={ep}>{ep}</option>
              ))}
            </select>
            <button
              style={{...styles.button, opacity: etapa?1:0.5}}
              disabled={!etapa}
              onClick={start}
            >Comenzar</button>
          </>
        ) : sesion.startsWith('1.') ? (
          <>
            <h2>Sesión {sesion} – Etapa: {etapa}</h2>
            <p>Califica Impacto, Frecuencia y % de Impacto</p>
            {riesgos.map((r,i) => (
              <div key={i} style={styles.riskRow}>
                <div style={styles.riskLabel}>{r}</div>
                <input
                  type="number" min="1" max="5" placeholder="Impacto"
                  style={styles.small}
                  onChange={e=>handleChange1(i,'impacto',e.target.value)}
                />
                <input
                  type="number" min="1" max="5" placeholder="Frecuencia"
                  style={styles.small}
                  onChange={e=>handleChange1(i,'frecuencia',e.target.value)}
                />
                <input
                  type="number" min="0" max="100" placeholder="%Imp"
                  style={styles.small}
                  onChange={e=>handleChange1(i,'importancia_impacto',e.target.value)}
                />
              </div>
            ))}
            <button style={styles.button} onClick={handleSubmit}>
              Enviar y terminar
            </button>
          </>
        ) : (
          <>
            <h2>Sesión {sesion} – Etapa: {etapa}</h2>
            <p>Marca las etapas afectadas por cada riesgo</p>
            <div style={styles.matrix}>
              <div style={styles.headerRow}>
                <div>Riesgo</div>
                {etapasProyecto.map(ep => (
                  <div key={ep} style={styles.headerCell}>{ep}</div>
                ))}
              </div>
              {riesgos.map((r,i) => (
                <div key={i} style={styles.matrixRow}>
                  <div style={styles.riskLabel}>{`r${i+1}. ${r}`}</div>
                  {etapasProyecto.map(ep => (
                    <div key={ep} style={styles.cell}>
                      <input
                        type="checkbox"
                        onChange={()=>handleCheckbox(i,ep)}
                      />
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <button style={styles.button} onClick={handleSubmit}>
              Enviar y terminar
            </button>
          </>
        )}
      </div>
    </div>
  )
}

const styles = {
  container: {
    minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center',
    backgroundImage:'url("/proyecto.png")', backgroundSize:'cover',
    fontFamily:"'Poppins', sans-serif'"
  },
  card: {
    background:'rgba(255,255,255,0.9)', padding:'40px', borderRadius:'12px',
    boxShadow:'0 4px 12px rgba(0,0,0,0.1)', width:'90%', maxWidth:'900px'
  },
  input: {
    width:'100%', padding:'10px', margin:'8px 0',
    borderRadius:'6px', border:'1px solid #ccc'
  },
  button: {
    marginTop:'16px', padding:'12px 20px', background:'#007bff',
    color:'white', border:'none', borderRadius:'6px',
    cursor:'pointer', fontSize:'16px'
  },
  riskRow: { display:'flex', alignItems:'center', gap:'12px', margin:'8px 0' },
  riskLabel: { flex:'1 1 200px' },
  small: { width:'60px', padding:'4px' },
  matrix: { overflowX:'auto', margin:'16px 0' },
  headerRow: {
    display:'grid', gridTemplateColumns:'200px repeat(11,120px)',
    textAlign:'center', fontWeight:'600'
  },
  headerCell: { padding:'8px' },
  matrixRow: {
    display:'grid', gridTemplateColumns:'200px repeat(11,120px)',
    alignItems:'center'
  },
  cell: { textAlign:'center' }
}
