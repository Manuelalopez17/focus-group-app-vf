// src/Pages/Participante.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../supabaseClient'

export default function Participante() {
  const nav = useNavigate()
  const { search } = useLocation()
  const sesion = new URLSearchParams(search).get('sesion') || ''
  const email = new URLSearchParams(search).get('email') || ''

  const sesionesOrden = ['1.1','1.2','2.1','2.2','3.1','3.2']
  const etapasProyecto = [
    'Abastecimiento','Prefactibilidad y Factibilidad','Planeación',
    'Contratación y Adquisición','Diseño','Fabricación',
    'Logística y Transporte','Montaje','Construcción',
    'Puesta en Marcha','Disposición Final'
  ]
  const estrategiasMitig = ['Aceptar el riesgo','Mitigar el riesgo','Transferir el riesgo']

  const riesgosPorEtapa = { /* ...igual que antes...*/ }

  const idx = sesionesOrden.indexOf(sesion)
  const etapa = idx >= 0 ? sesionesOrden[idx] : ''
  const riesgos = riesgosPorEtapa[etapa] || []
  const [respuestas, setRespuestas] = useState({})

  useEffect(() => {
    if (!email) nav(`/home`, { replace: true })
  }, [email, nav])

  const handleCheckbox = (i, val) => {
    setRespuestas(prev => {
      const c = {...prev}
      c[i] = val
      return c
    })
  }

  const handleSubmit = async () => {
    const inserts = riesgos.map((r,i) => ({
      sesion, etapa: etapa, riesgo: r,
      estrategia: respuestas[i] || ''
    }))
    const { error } = await supabase.from('focus-group-db').insert(inserts)
    if (error) return alert('Error al guardar. Revisa consola.')
    alert('Respuestas enviadas exitosamente.')
    nav(`/home?email=${encodeURIComponent(email)}`)
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2>Sesión {sesion} – Etapa: {etapa}</h2>

        {sesion.startsWith('3.') ? (
          <>
            <p>¿Qué estrategia de mitigación recomienda?</p>
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Riesgo</th>
                    {estrategiasMitig.map(e=> <th key={e} style={styles.th}>{e}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {riesgos.map((r,i)=>(
                    <tr key={i}>
                      <td style={styles.td}>{r}</td>
                      {estrategiasMitig.map(e=>(
                        <td key={e} style={styles.tdCenter}>
                          <input
                            type="radio"
                            name={`estrat-${i}`}
                            onChange={()=>handleCheckbox(i,e)}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          /* aquí va 1.x y 2.x como antes */
          <p> ...</p>
        )}

        <button style={styles.button} onClick={handleSubmit}>Enviar y terminar</button>
      </div>
    </div>
  )
}

const styles = { /* ...igual que antes..., ajusta tabla...*/ }
