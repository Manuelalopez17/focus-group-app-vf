// src/Pages/Participante.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../supabaseClient'

export default function Participante() {
  const nav = useNavigate()
  const { search } = useLocation()
  const sesion = new URLSearchParams(search).get('sesion') || ''
  const email  = new URLSearchParams(search).get('email') || ''

  // incluir 3.1 y 3.2
  const sesionesOrden = ['1.1','1.2','2.1','2.2','3.1','3.2']
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
    /* ... tus riesgos ... */
  }

  const idx = sesionesOrden.indexOf(sesion)
  const etapa = idx >= 0 ? etapasProyecto[idx] : ''
  const [respuestas, setRespuestas] = useState({})

  useEffect(() => {
    if (!email) nav(`/home`, { replace: true })
  }, [email, nav])

  // para 1.x
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

  // para 2.x
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

  // **nuevo:** para 3.x
  const handleMitigation = (i, estrategia) => {
    setRespuestas(prev => {
      const c = { ...prev }
      c[i] = c[i] || {}
      c[i].mitigacion = estrategia
      return c
    })
  }

  const handleSubmit = async () => {
    const riesgos = riesgosPorEtapa[etapa] || []
    const inserts = riesgos.map((r, i) => {
      const resp = respuestas[i] || {}
      const base = { sesion, etapa, riesgo: r, mitigation_strategy: resp.mitigacion || null, expert_email: email }

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
      } else if (sesion.startsWith('2.')) {
        return { ...base, etapas_afectadas: resp.etapas_afectadas || [] }
      } else { // 3.x
        return base
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

  const riesgos = riesgosPorEtapa[etapa] || []

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2>Sesión {sesion} – Etapa: {etapa}</h2>

        {/* SESIONES 1.x */}
        {sesion.startsWith('1.') ? (
          <>
            {/* …igual que antes… */}
          </>
        ) : sesion.startsWith('2.') ? (
          <>
            {/* …igual que antes… */}
          </>
        ) : sesion.startsWith('3.') ? (
          <>
            <p>¿Qué estrategia de mitigación recomienda para cada riesgo?</p>
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Riesgo</th>
                    {['Aceptar','Mitigar','Transferir'].map(op => (
                      <th key={op} style={styles.th}>{op}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {riesgos.map((r, i) => (
                    <tr key={i}>
                      <td style={styles.td}>{`r${i+1}. ${r}`}</td>
                      {['Aceptar','Mitigar','Transferir'].map(op => (
                        <td key={op} style={styles.tdCenter}>
                          <input
                            type="radio"
                            name={`mitigacion-${i}`}
                            value={op}
                            onChange={() => handleMitigation(i, op)}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : null}

        <button style={styles.button} onClick={handleSubmit}>
          Enviar y terminar
        </button>
      </div>
    </div>
  )
}

const styles = {
  /* …tus estilos existentes, incluyendo tableWrapper, table, th, td, tdCenter… */
}
