// src/Pages/Participante.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../supabaseClient'

export default function Participante() {
  const nav    = useNavigate()
  const { search } = useLocation()
  const sesion = new URLSearchParams(search).get('sesion') || ''
  const email  = new URLSearchParams(search).get('email')   || ''

  const sesionesOrden = ['1.1','1.2','2.1','2.2']
  const etapasProyecto = [
    'Abastecimiento','Prefactibilidad y Factibilidad','Planeación','Contratación y Adquisición',
    'Diseño','Fabricación','Logística y Transporte','Montaje','Construcción','Puesta en Marcha','Disposición Final'
  ]

  const riesgosPorEtapa = {
    Abastecimiento: [
      'Demora en entrega de materiales por parte del proveedor',
      'Recepción de materiales con especificaciones incorrectas',
      'Falta de control de calidad en los insumos adquiridos'
    ],
    'Prefactibilidad y Factibilidad': [/* ... */],
    Planeación: [/* ... */],
    'Contratación y Adquisición': [/* ... */],
    Diseño: [/* ... */],
    Fabricación: [/* ... */],
    'Logística y Transporte': [/* ... */],
    Montaje: [/* ... */],
    Construcción: [/* ... */],
    'Puesta en Marcha': [/* ... */],
    'Disposición Final': [/* ... */]
  }

  const idx   = sesionesOrden.indexOf(sesion)
  const etapa = idx >= 0 ? etapasProyecto[idx] : ''
  const riesgos = riesgosPorEtapa[etapa] || []
  const [respuestas, setRespuestas] = useState({})

  useEffect(() => {
    if (!email) nav('/home', { replace: true })
  }, [email, nav])

  const handleChange = (i, field, v) => {
    const value = Number(v)
    setRespuestas(prev => {
      const c = {...prev}
      c[i] = c[i] || {}
      if (field === 'importancia_impacto') {
        c[i].importancia_impacto    = value
        c[i].importancia_frecuencia = 100 - value
      } else {
        c[i][field] = value
      }
      return c
    })
  }

  const handleCheckbox = (i, ep) => {
    setRespuestas(prev => {
      const c = {...prev}
      c[i] = c[i] || {}
      const arr = c[i].etapas_afectadas || []
      c[i].etapas_afectadas = arr.includes(ep)
        ? arr.filter(x => x !== ep)
        : [...arr, ep]
      return c
    })
  }

  const handleSubmit = async () => {
    const inserts = riesgos.map((r, i) => {
      const resp = respuestas[i] || {}
      const base = { sesion, etapa, riesgo: r, expert_email: email }
      if (sesion.startsWith('1.')) {
        const imp    = resp.impacto || 0
        const frec   = resp.frecuencia || 0
        const impImp = resp.importancia_impacto || 0
        return {
          ...base,
          impacto: imp,
          frecuencia: frec,
          importancia_impacto: impImp,
          importancia_frecuencia: 100 - impImp,
          score_base: imp * frec,
          score_final: imp * (impImp/100) + frec * ((100-impImp)/100)
        }
      } else {
        return {...base, etapas_afectadas: resp.etapas_afectadas || []}
      }
    })
    const { error } = await supabase.from('focus-group-db').insert(inserts)
    if (error) { alert('Error al guardar. Revisa consola.'); return }
    alert('Respuestas enviadas exitosamente.')
    nav(`/home?email=${encodeURIComponent(email)}`, { replace: true })
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2>Sesión {sesion} – Etapa: {etapa}</h2>
        {sesion.startsWith('1.')
          ? (
            <> {/* 1.x */}
              <p>Califica cada riesgo usando estas escalas:</p>
              {riesgos.map((r, i) => (
                <div key={i} style={styles.riskRow}>
                  <div style={styles.riskLabel}>{r}</div>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>
                      Impacto (1–5)
                      <input
                        type="number" min="1" max="5"
                        style={styles.small}
                        onChange={e => handleChange(i, 'impacto', e.target.value)}
                      />
                    </label>
                    <label style={styles.label}>
                      Frecuencia (1–5)
                      <input
                        type="number" min="1" max="5"
                        style={styles.small}
                        onChange={e => handleChange(i, 'frecuencia', e.target.value)}
                      />
                    </label>
                    <label style={styles.label}>
                      % Imp. (0–100)
                      <input
                        type="number" min="0" max="100"
                        style={styles.small}
                        onChange={e => handleChange(i, 'importancia_impacto', e.target.value)}
                      />
                    </label>
                  </div>
                </div>
              ))}
            </>
          ) : (
            <> {/* 2.x */}
              <p>Marca las etapas afectadas por cada riesgo</p>
              <div style={styles.tableWrapper}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Riesgo</th>
                      {etapasProyecto.map(ep => (
                        <th key={ep} style={styles.thRotated}>{ep}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {riesgos.map((r, i) => (
                      <tr key={i}>
                        <td style={styles.td}>{r}</td>
                        {etapasProyecto.map(ep => (
                          <td key={ep} style={styles.tdCenter}>
                            <input
                              type="checkbox"
                              onChange={() => handleCheckbox(i, ep)}
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        <button style={styles.button} onClick={handleSubmit}>
          Enviar y terminar
        </button>
      </div>
    </div>
  )
}

const styles = {
  container: {
    minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center',
    backgroundImage:'url("/proyecto.png")', backgroundSize:'cover', fontFamily:"'Poppins', sans-serif"
  },
  card: {
    background:'rgba(255,255,255,0.95)', padding:'40px', borderRadius:'12px',
    boxShadow:'0 4px 12px rgba(0,0,0,0.1)', width:'95%', maxWidth:'1200px'
  },
  riskRow: { display:'flex', alignItems:'flex-start', gap:'12px', margin:'16px 0' },
  riskLabel: { flex:'1 1 250px', fontSize:'14px', lineHeight:1.3 },
  inputGroup: { display:'flex', gap:'16px' },
  label: { display:'flex', flexDirection:'column', fontSize:'12px' },
  small: { width:'50px', padding:'4px', fontSize:'12px' },

  tableWrapper: { overflowX:'auto', margin:'16px 0', border:'1px solid #ccc' },
  table: { width:'100%', borderCollapse:'collapse', fontSize:'12px' },
  th: { border:'1px solid #ccc', padding:'8px', background:'#f5f5f5', fontSize:'12px' },
  thRotated: {
    border:'1px solid #ccc', padding:'8px', fontSize:'10px',
    transform:'rotate(-45deg)', transformOrigin:'bottom center',
    whiteSpace:'normal', verticalAlign:'bottom', paddingBottom:'30px'
  },
  td: { border:'1px solid #ccc', padding:'8px', fontSize:'12px', whiteSpace:'normal', wordBreak:'break-word' },
  tdCenter: { border:'1px solid #ccc', padding:'8px', textAlign:'center' },

  button: { marginTop:'24px', padding:'12px 24px', background:'#007bff', color:'#fff', border:'none', borderRadius:'6px', cursor:'pointer', fontSize:'16px' }
}
