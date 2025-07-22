// src/Pages/Participante.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../supabaseClient'

export default function Participante() {
  const nav    = useNavigate()
  const { search } = useLocation()
  const sesion = new URLSearchParams(search).get('sesion') || ''
  const email  = new URLSearchParams(search).get('email')   || ''

  // orden de sesiones → índice de etapa
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

  // listado completo de riesgos por cada etapa
  const riesgosPorEtapa = {
    Abastecimiento: [
      'Demora en entrega de materiales por parte del proveedor',
      'Recepción de materiales con especificaciones incorrectas',
      'Falta de control de calidad en los insumos adquiridos'
    ],
    'Prefactibilidad y Factibilidad': [
      'Falta de análisis adecuado de viabilidad técnica',
      'Supuestos económicos erróneos en la factibilidad financiera',
      'Escasa participación de actores clave en etapa temprana'
    ],
    Planeación: [
      'Errores en la estimación de recursos y tiempos',
      'No inclusión de contingencias en la planificación',
      'Cambios constantes en el alcance del proyecto'
    ],
    'Contratación y Adquisición': [
      'Contratación de proveedores sin experiencia en construcción industrializada',
      'Inadecuada definición de términos contractuales',
      'Demoras en procesos administrativos de adquisición'
    ],
    Diseño: [
      'Diseño no compatible con procesos industrializados',
      'Errores en la integración de disciplinas de diseño',
      'Ausencia de revisión y validación cruzada'
    ],
    Fabricación: [
      'Defectos de fabricación en componentes modulares',
      'Interrupciones en la cadena de producción',
      'Falta de control en tolerancias de fabricación'
    ],
    'Logística y Transporte': [
      'Retrasos en la entrega por dificultades logísticas',
      'Daños en módulos durante el transporte',
      'Problemas de acceso al sitio de construcción'
    ],
    Montaje: [
      'Descoordinación entre equipos de montaje y logística',
      'Errores en la secuencia de montaje',
      'Falta de capacitación en ensamblaje de componentes'
    ],
    Construcción: [
      'Condiciones climáticas adversas afectan avances',
      'Incompatibilidad entre componentes industrializados y tradicionales',
      'Riesgos laborales por manipulación de módulos'
    ],
    'Puesta en Marcha': [
      'Fallos en las pruebas de sistemas instalados',
      'No conformidad con normativas técnicas',
      'Demoras en aprobaciones regulatorias finales'
    ],
    'Disposición Final': [
      'Falta de planificación para reciclaje de componentes',
      'Altos costos de disposición de residuos',
      'Desconocimiento de normativas ambientales aplicables'
    ]
  }

  // deduce la etapa según la sesión
  const idx   = sesionesOrden.indexOf(sesion)
  const etapa = idx >= 0 ? etapasProyecto[idx] : ''
  const riesgos = riesgosPorEtapa[etapa] || []

  const [respuestas, setRespuestas] = useState({})

  // si no hay email, regresa a home
  useEffect(() => {
    if (!email) nav('/home', { replace: true })
  }, [email, nav])

  // para inputs numéricos y % automático
  const handleChange = (i, field, v) => {
    const value = Number(v)
    setRespuestas(prev => {
      const c = { ...prev }
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

  // para checkboxes de sesiones 2.x
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

  // envía todo a la tabla focus-group-db
  const handleSubmit = async () => {
    const inserts = riesgos.map((r, i) => {
      const resp = respuestas[i] || {}
      const base = { sesion, etapa, riesgo: r, expert_email: email }

      if (sesion.startsWith('1.')) {
        const imp    = resp.impacto || 0
        const frec   = resp.frecuencia || 0
        const impImp = resp.importancia_impacto || 0
        const impFrc = resp.importancia_frecuencia || 0
        return {
          ...base,
          impacto:                imp,
          frecuencia:             frec,
          importancia_impacto:    impImp,
          importancia_frecuencia: impFrc,
          score_base:             imp * frec,
          score_final:            imp * (impImp/100) + frec * (impFrc/100)
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
      alert('Error al guardar. Revisa consola.')
      return
    }
    alert('Respuestas enviadas exitosamente.')
    nav(`/home?email=${encodeURIComponent(email)}`, { replace: true })
  }

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
          <>
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
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    backgroundImage: 'url("/proyecto.png")', backgroundSize: 'cover',
    fontFamily: "'Poppins', sans-serif"
  },
  card: {
    background: 'rgba(255,255,255,0.95)',
    padding: '40px',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    width: '95%',
    maxWidth: '1200px'
  },
  riskRow: {
    display: 'flex', alignItems: 'flex-start', gap: '12px', margin: '16px 0'
  },
  riskLabel: { flex: '1 1 200px', fontSize: '14px' },
  inputGroup: { display: 'flex', gap: '16px' },
  label: { display: 'flex', flexDirection: 'column', fontSize: '12px' },
  small: { width: '50px', padding: '4px', fontSize: '12px' },

  tableWrapper: {
    overflowX: 'auto',
    margin: '16px 0',
    border: '1px solid #ddd'
  },
  table: {
    width: 'max-content',
    minWidth: '100%',
    borderCollapse: 'collapse',
    fontSize: '12px'
  },
  th: {
    border: '1px solid #ccc',
    padding: '8px',
    background: '#f5f5f5',
    whiteSpace: 'nowrap',
    fontSize: '12px'
  },
  thRotated: {
    border: '1px solid #ccc',
    padding: '8px',
    whiteSpace: 'nowrap',
    transform: 'rotate(-60deg)',
    transformOrigin: 'bottom left',
    paddingBottom: '50px',
    verticalAlign: 'bottom',
    fontSize: '10px'
  },
  td: {
    border: '1px solid #ccc',
    padding: '8px',
    verticalAlign: 'top',
    whiteSpace: 'normal',
    wordBreak: 'break-word',
    fontSize: '12px'
  },
  tdCenter: {
    border: '1px solid #ccc',
    padding: '8px',
    textAlign: 'center'
  },
  button: {
    marginTop: '24px',
    padding: '12px 24px',
    background: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '16px'
  }
}
