// src/Pages/Participante.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../supabaseClient'

export default function Participante() {
  const nav = useNavigate()
  const { search } = useLocation()
  const sesion = new URLSearchParams(search).get('sesion') || ''
  const email  = new URLSearchParams(search).get('email') || ''

  const sesionesOrden = ['1.1','1.2','2.1','2.2']
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
  const riesgosPorEtapa = {
    Abastecimiento: [
      'Demora en entrega de materiales por parte del proveedor',
      'Recepción de materiales con especificaciones incorrectas',
      'Falta de control de calidad en los insumos adquiridos',
    ],
    'Prefactibilidad y Factibilidad': [ /* ... */ ],
    Planeación:             [ /* ... */ ],
    'Contratación y Adquisición': [ /* ... */ ],
    Diseño:                 [ /* ... */ ],
    Fabricación:            [ /* ... */ ],
    'Logística y Transporte':[ /* ... */ ],
    Montaje:                [ /* ... */ ],
    Construcción:           [ /* ... */ ],
    'Puesta en Marcha':     [ /* ... */ ],
    'Disposición Final':    [ /* ... */ ],
  }

  const idx = sesionesOrden.indexOf(sesion)
  const etapa = idx >= 0 ? etapasProyecto[idx] : ''

  const [respuestas, setRespuestas] = useState({})

  useEffect(() => {
    if (!email) nav(`/home`, { replace: true })
  }, [email, nav])

  const handleChange = (i, field, v) => {
    const value = Number(v)
    setRespuestas(prev => {
      const c = { ...prev }
      c[i] = c[i] || {}
      if (field === 'importancia_impacto') {
        c[i].importancia_impacto = value
        c[i].importancia_frecuencia = 100 - value
      } else {
        c[i][field] = value
      }
      return c
    })
  }

  const handleCheckbox = (i, ep) => {
    setRespuestas(prev => {
      const c = { ...prev }
      c[i] = c[i] || {}
      const arr = c[i].etapas_afectadas || []
      c[i].etapas_afectadas = arr.includes(ep)
        ? arr.filter(x => x !== ep)
        : [...arr, ep]
      return c
    })
  }

  const handleSubmit = async () => {
    const riesgos = riesgosPorEtapa[etapa] || []
    const inserts = riesgos.map((r, i) => {
      const resp = respuestas[i] || {}
      const base = { sesion, etapa, riesgo: r, experto_email: email }
      if (sesion.startsWith('1.')) {
        const imp = resp.impacto || 0
        const frec = resp.frecuencia || 0
        const impImp = resp.importancia_impacto || 0
        const impFrec = resp.importancia_frecuencia || 0
        return {
          ...base,
          impacto: imp,
          frecuencia: frec,
          importancia_impacto: impImp,
          importancia_frecuencia: impFrec,
          score_base: imp * frec,
          score_final: imp * (impImp/100) + frec * (impFrec/100)
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
      alert('Error al guardar: ' + error.message)
      return
    }

    alert('Respuestas enviadas exitosamente.')
    nav(`/home?email=${encodeURIComponent(email)}`, { replace: true })
  }

  const riesgos = riesgosPorEtapa[etapa] || []

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2>Sesión {sesion} – Etapa: {etapa}</h2>

        {sesion.startsWith('1.') ? (
          <>
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
                    % Importancia (0–100)
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
          <>
            <p>Marca las etapas afectadas por cada riesgo</p>
            <div style={{ overflowX: 'auto', margin: '16px 0' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
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
                      <td style={styles.td}>{`r${i+1}. ${r}`}</td>
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
    minHeight: '100vh',
    display:'flex', alignItems:'center', justifyContent:'center',
    backgroundImage:'url("/proyecto.png")', backgroundSize:'cover',
    fontFamily: `'Poppins', sans-serif`
  },
  card: {
    background: 'rgba(255,255,255,0.9)', padding: '40px',
    borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    width: '90%', maxWidth: '1000px'
  },
  riskRow: {
    display: 'flex', alignItems: 'flex-start', gap: '12px',
    margin: '16px 0'
  },
  riskLabel: { flex: '1 1 200px', fontSize: '14px' },
  inputGroup: { display: 'flex', gap: '16px', alignItems: 'center' },
  label: { display:'flex', flexDirection:'column', fontSize:'12px' },
  small: { width: '60px', padding: '4px' },

  th: {
    border: '1px solid #ccc', padding: '8px',
    background: '#f5f5f5', textAlign: 'left', whiteSpace: 'nowrap'
  },
  thRotated: {
    border: '1px solid #ccc', padding: '8px', whiteSpace: 'nowrap',
    transform: 'rotate(-45deg)', transformOrigin: 'bottom left',
    paddingBottom: '40px', verticalAlign: 'bottom', fontSize: '12px'
  },
  td: {
    border: '1px solid #ccc', padding: '8px', verticalAlign: 'top',
    whiteSpace: 'nowrap'
  },
  tdCenter: {
    border: '1px solid #ccc', padding: '8px', textAlign: 'center'
  },

  button: {
    marginTop: '24px', padding: '12px 24px',
    background: '#007bff', color: '#fff', border: 'none',
    borderRadius: '6px', cursor: 'pointer', fontSize: '16px'
  }
}

