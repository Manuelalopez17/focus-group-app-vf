// src/assets/components/Participante.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';

export default function Participante() {
  const navigate = useNavigate();
  const { search } = useLocation();
  const sesion = new URLSearchParams(search).get('sesion') || '';
  const expertEmail = localStorage.getItem('expertEmail');

  // Si no hay correo en localStorage, devolvemos a Presentación
  useEffect(() => {
    if (!expertEmail) navigate('/presentacion', { replace: true });
  }, [expertEmail, navigate]);

  const sesionesDisponibles = ['1.1','1.2','2.1','2.2'];
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
  ];

  const [etapa, setEtapa] = useState('');
  const [riesgos, setRiesgos] = useState([]);
  const [respuestas, setRespuestas] = useState({});

  // Cargo riesgos según etapa seleccionada
  useEffect(() => {
    if (!etapa) return;
    const mapRiesgos = { /* igual que antes… */ };
    setRiesgos(mapRiesgos[etapa] || []);
  }, [etapa]);

  // Sólo permitimos empezar si eligieron sesión válida + etapa
  const canStart = sesionesDisponibles.includes(sesion) && etapa;

  const handleStart = () => canStart && setStarted(true);
  const [started, setStarted] = useState(false);

  const handleChange = (idx, field, value) => {
    /* mantiene la lógica de cálculo de 1.x igual que antes */
  };
  const handleCheckbox = (idx, etapaName) => {
    /* mantiene la lógica de checkboxes igual que antes */
  };

  const handleSubmit = async () => {
    /* igual que antes, agrega `expert_email: expertEmail` al payload */
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        { !started ? (
          <>
            <h2>Sesión {sesion}</h2>
            <select
              style={styles.input}
              value={etapa}
              onChange={e=>setEtapa(e.target.value)}
            >
              <option value="">Seleccione etapa</option>
              {etapasProyecto.map(ep=>(
                <option key={ep} value={ep}>{ep}</option>
              ))}
            </select>
            <button
              style={{...styles.button, opacity: canStart ? 1 : 0.5}}
              disabled={!canStart}
              onClick={handleStart}
            >
              Comenzar evaluación
            </button>
          </>
        ) : (
          <>
            <h2>Sesión {sesion} – Etapa: {etapa}</h2>

            {/* SESIONES 1.x: igual que antes… */}

            {/* SESIONES 2.x: matriz vertical */}
            {['2.1','2.2'].includes(sesion) && (
              <div style={styles.tableWrapper}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Riesgo</th>
                      {etapasProyecto.map(ep=>(
                        <th key={ep} style={styles.thVertical}>{ep}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {riesgos.map((r,i)=>(
                      <tr key={i}>
                        <td style={styles.td}>{`r${i+1}. ${r}`}</td>
                        {etapasProyecto.map(ep=>(
                          <td key={ep} style={styles.tdCenter}>
                            <input
                              type="checkbox"
                              checked={respuestas[i]?.etapas_afectadas?.includes(ep)||false}
                              onChange={()=>handleCheckbox(i,ep)}
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <button style={styles.button} onClick={handleSubmit}>
              Enviar y terminar
            </button>
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center',
    backgroundImage:'url("/proyecto.png")', backgroundSize:'cover', padding:'20px'
  },
  card: {
    background:'rgba(255,255,255,0.9)', borderRadius:12, padding:30,
    width:'100%', maxWidth:1000, boxShadow:'0 4px 12px rgba(0,0,0,0.1)'
  },
  input: {
    width:'100%', padding:10, margin:'10px 0', borderRadius:6, border:'1px solid #ccc'
  },
  button: {
    marginTop:20, padding:'12px 20px', background:'#007bff', color:'#fff',
    border:'none', borderRadius:6, cursor:'pointer', fontSize:16
  },
  tableWrapper: {
    overflowX:'auto',
    marginTop:20
  },
  table: {
    width:'100%',
    borderCollapse:'collapse',
    tableLayout:'fixed',
    fontSize:12
  },
  th: {
    border:'1px solid #ccc', padding:8, background:'#f5f5f5', textAlign:'left'
  },
  thVertical: {
    border:'1px solid #ccc',
    padding:4,
    background:'#f5f5f5',
    writingMode:'vertical-rl',
    textAlign:'center',
    whiteSpace:'nowrap'
  },
  td: {
    border:'1px solid #ccc', padding:8, verticalAlign:'top'
  },
  tdCenter: {
    border:'1px solid #ccc', padding:8, textAlign:'center'
  }
};
