import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';

export default function Participante() {
  const navigate = useNavigate();
  const { search } = useLocation();
  const sesion = new URLSearchParams(search).get('sesion') || '';
  const expertEmail = localStorage.getItem('expertEmail');

  useEffect(() => {
    if (!expertEmail) navigate('/home', { replace: true });
  }, [expertEmail, navigate]);

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
  const [started, setStarted] = useState(false);
  const [riesgos, setRiesgos] = useState([]);
  const [respuestas, setRespuestas] = useState({});

  useEffect(() => {
    if (!etapa) return;
    const mapRiesgos = {
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
    };
    setRiesgos(mapRiesgos[etapa] || []);
  }, [etapa]);

  const canStart = Boolean(etapa);

  const handleStart = () => {
    if (canStart) setStarted(true);
  };

  const handleChange = (idx, field, value) => {
    setRespuestas(prev => {
      const copy = { ...prev };
      copy[idx] = copy[idx] || {};

      if (field === 'importancia_impacto') {
        const imp = Number(value);
        copy[idx].importancia_impacto = imp;
        copy[idx].importancia_frecuencia = 100 - imp;
      } else {
        copy[idx][field] = Number(value);
      }

      if (['1.1','1.2'].includes(sesion)) {
        const imp = copy[idx].impacto || 0;
        const frec = copy[idx].frecuencia || 0;
        const impImp = copy[idx].importancia_impacto || 0;
        const impFrec = copy[idx].importancia_frecuencia || 0;
        copy[idx].score_base = (imp * frec).toFixed(2);
        copy[idx].score_final = (
          imp * (impImp/100) + frec * (impFrec/100)
        ).toFixed(2);
      }

      return copy;
    });
  };

  const handleCheckbox = (idx, etapaName) => {
    setRespuestas(prev => {
      const copy = { ...prev };
      copy[idx] = copy[idx] || {};
      const arr = copy[idx].etapas_afectadas || [];
      copy[idx].etapas_afectadas = arr.includes(etapaName)
        ? arr.filter(e => e !== etapaName)
        : [...arr, etapaName];
      return copy;
    });
  };

  const handleSubmit = async () => {
    for (let i = 0; i < riesgos.length; i++) {
      const resp = respuestas[i] || {};
      const base = {
        sesion,
        etapa,
        riesgo: riesgos[i],
        experto_email: expertEmail
      };
      const detalle = ['1.1','1.2'].includes(sesion)
        ? {
            impacto: resp.impacto,
            frecuencia: resp.frecuencia,
            importancia_impacto: resp.importancia_impacto,
            importancia_frecuencia: resp.importancia_frecuencia,
            score_base: resp.score_base,
            score_final: resp.score_final
          }
        : { etapas_afectadas: resp.etapas_afectadas || [] };

      const { error } = await supabase
        .from('focus-group-db')
        .insert([{ ...base, ...detalle }]);
      if (error) {
        console.error(error);
        alert(`Error en respuesta ${i+1}: ${error.message}`);
        return;
      }
    }
    navigate('/home', { replace: true });
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {!started ? (
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

            {/* SESIONES 1.x */}
            {['1.1','1.2'].includes(sesion) && riesgos.map((r,i) => (
              <div key={i} style={styles.detail}>
                <strong>{r}</strong>
                <div style={styles.grid2}>
                  <div>
                    <label>Impacto (1–5):</label><br/>
                    <input
                      type="number" min="1" max="5"
                      value={respuestas[i]?.impacto||''}
                      onChange={e=>handleChange(i,'impacto',e.target.value)}
                    />
                  </div>
                  <div>
                    <label>Frecuencia (1–5):</label><br/>
                    <input
                      type="number" min="1" max="5"
                      value={respuestas[i]?.frecuencia||''}
                      onChange={e=>handleChange(i,'frecuencia',e.target.value)}
                    />
                  </div>
                  <div>
                    <label>% Imp. Impacto:</label><br/>
                    <input
                      type="number" min="0" max="100"
                      value={respuestas[i]?.importancia_impacto||''}
                      onChange={e=>handleChange(i,'importancia_impacto',e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}

            {/* SESIONES 2.x */}
            {['2.1','2.2'].includes(sesion) && (
              <div style={styles.tableWrapper}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Riesgo</th>
                      {etapasProyecto.map(ep => (
                        <th key={ep} style={styles.thDiagonal}>
                          <div>{ep}</div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {riesgos.map((r,i) => (
                      <tr key={i}>
                        <td style={styles.td}>r{i+1}. {r}</td>
                        {etapasProyecto.map(ep => (
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
    backgroundImage:'url("/proyecto.png")', backgroundSize:'cover', padding:20
  },
  card: {
    background:'rgba(255,255,255,0.9)', padding:30, borderRadius:12,
    boxShadow:'0 4px 12px rgba(0,0,0,0.1)', width:'100%', maxWidth:1000
  },
  input: {
    width:'100%', padding:10, margin:'10px 0', borderRadius:6, border:'1px solid #ccc'
  },
  button: {
    marginTop:20, padding:'12px 20px', background:'#007bff', color:'#fff',
    border:'none', borderRadius:6, cursor:'pointer', fontSize:16
  },
  detail: {
    marginBottom:20, textAlign:'left'
  },
  grid2: {
    display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:20, marginTop:10
  },
  tableWrapper: {
    overflowX:'auto', marginTop:20
  },
  table: {
    width:'100%', borderCollapse:'collapse', fontSize:12
  },
  th: {
    border:'1px solid #ccc', padding:8, background:'#f5f5f5', textAlign:'left'
  },
  thDiagonal: {
    border:'1px solid #ccc', width:40, height:120, padding:0,
    background:'#f5f5f5', textAlign:'center', verticalAlign:'bottom',
    writingMode:'vertical-rl', whiteSpace:'nowrap'
  },
  td: {
    border:'1px solid #ccc', padding:8, verticalAlign:'top'
  },
  tdCenter: {
    border:'1px solid #ccc', padding:8, textAlign:'center'
  }
};
