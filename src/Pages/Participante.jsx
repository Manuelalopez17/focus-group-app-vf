// src/Pages/Participante.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../supabaseClient'

export default function Participante() {
  const nav = useNavigate()
  const { search } = useLocation()
  const sesion = new URLSearchParams(search).get('sesion') || ''
  const email  = new URLSearchParams(search).get('email') || ''

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
  const estrategias = ['Aceptar riesgo','Mitigar riesgo','Transferir riesgo']

  const riesgosPorEtapa = {
    Abastecimiento: [
      'Demora en entrega de materiales por parte del proveedor',
      'Recepción de materiales con especificaciones incorrectas',
      'Falta de control de calidad en los insumos adquiridos',
    ],
    /* … resto igual … */
  }

  const idx   = sesionesOrden.indexOf(sesion)
  const etapa = idx >= 0 && idx < 4
    ? etapasProyecto[idx]
    : idx >= 4
      ? etapasProyecto[idx-4]
      : ''

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
      const c = { ...prev }
      c[i] = c[i] || {}
      const arr = c[i].etapas_afectadas || []
      c[i].etapas_afectadas = arr.includes(ep)
        ? arr.filter(x => x !== ep)
        : [...arr, ep]
      return c
    })
  }

  const handleRadio = (i, estrategia) => {
    setRespuestas(prev => {
      const c = { ...prev }
      c[i] = c[i] || {}
      c[i].estrategia = estrategia
      return c
    })
  }

  const handleSubmit = async () => {
    const riesgos = riesgosPorEtapa[etapa] || []
    const inserts = riesgos.map((r, i) => {
      const resp = respuestas[i] || {}
      // **Aquí usamos expert_email** (justo el nombre de tu columna)
      const base = { sesion, etapa, riesgo: r, expert_email: email }

      if (sesion.startsWith('1.')) {
        const imp      = resp.impacto || 0
        const frec     = resp.frecuencia || 0
        const impImp   = resp.importancia_impacto || 0
        const impFrec  = resp.importancia_frecuencia || 0
        return {
          ...base,
          impacto: imp,
          frecuencia: frec,
          importancia_impacto: impImp,
          importancia_frecuencia: impFrec,
          score_base: imp * frec,
          score_final: imp * (impImp/100) + frec * (impFrec/100)
        }
      }
      if (sesion.startsWith('2.')) {
        return { ...base, etapas_afectadas: resp.etapas_afectadas || [] }
      }
      // **Sesiones 3.x** → guardamos la estrategia
      return { ...base, estrategia: resp.estrategia || null }
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

        {/* … tus tres bloques de renderización 1.x, 2.x y 3.x … */}

        <button style={styles.button} onClick={handleSubmit}>
          Enviar y terminar
        </button>
      </div>
    </div>
  )
}

/* … tus estilos exactamente igual … */
