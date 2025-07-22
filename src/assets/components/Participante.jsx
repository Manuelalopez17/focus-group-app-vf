import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';

export default function Participante() {
  const navigate = useNavigate();
  const { search } = useLocation();
  const sesion = new URLSearchParams(search).get('sesion') || '';

  const sesionesDisponibles = ['1.1', '1.2', '2.1', '2.2'];
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

  const [nombre, setNombre] = useState('');
  const [empresa, setEmpresa] = useState('');
  const [experiencia, setExperiencia] = useState('');
  const [etapa, setEtapa] = useState('');
  const [mostrarFormulario, setMostrarFormulario] = useState(true);

  const [riesgos, setRiesgos] = useState([]);
  const [respuestas, setRespuestas] = useState({});

  // Carga lista de riesgos según etapa
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

  const canIniciar = () =>
    nombre.trim() &&
    empresa.trim() &&
    experiencia.trim() &&
    sesionesDisponibles.includes(sesion) &&
    etapa.trim();

  const handleStart = () => {
    if (canIniciar()) setMostrarFormulario(false);
  };

  const handleChange = (idx, field, value) => {
    setRespuestas(prev => {
      const copy = { ...prev };
      copy[idx] = copy[idx] || {};

      // Auto‑sumar porcentajes
      if (field === 'importancia_impacto') {
        const imp = Number(value);
        copy[idx].importancia_impacto = imp;
        copy[idx].importancia_frecuencia = 100 - imp;
      } else if (field === 'importancia_frecuencia') {
        const frec = Number(value);
        copy[idx].importancia_frecuencia = frec;
        copy[idx].importancia_impacto = 100 - frec;
      } else {
        copy[idx][field] = Number(value);
      }

      // Recalcular scores en sesiones 1.x
      if (['1.1', '1.2'].includes(sesion)) {
        const imp = copy[idx].impacto || 0;
        const frec = copy[idx].frecuencia || 0;
        const impImp = copy[idx].importancia_impacto || 0;
        const impFrec = copy[idx].importancia_frecuencia || 0;
        copy[idx].score_base = (imp * frec).toFixed(2);
        copy[idx].score_final = (
          imp * (impImp / 100) + frec * (impFrec / 100)
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
      const payload = {
        sesion,
        etapa,
        riesgo: riesgos[i],
        nombre,
        empresa,
        experiencia: Number(experiencia),
        expert_email: localStorage.getItem('expertEmail') || ''
      };

      if (['1.1', '1.2'].includes(sesion)) {
        Object.assign(payload, {
          impacto: resp.impacto || 0,
          frecuencia: resp.frecuencia || 0,
          importancia_impacto: resp.importancia_impacto || 0,
          importancia_frecuencia: resp.importancia_frecuencia || 0,
          score_base: resp.score_base || 0,
          score_final: resp.score_final || 0
        });
      } else {
        payload.etapas_afectadas = resp.etapas_afectadas || [];
      }

      const { error } = await supabase
        .from('focus-group-db')
        .insert([payload]);

      if (error) {
        console.error('Error al guardar respuesta:', error);
        alert(`Error guardando respuesta ${i+1}: ${error.message}`);
        return;
      }
    }
    // al terminar, volvemos a Home
    navigate('/', { replace: true });
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {mostrarFormulario ? (
          <>
            <h2>Bienvenido (Sesión {sesion})</h2>
            <input
              style={styles.input}
              type="text"
              placeholder="Nombre completo"
              value={nombre}
              onChange={e => setNombre(e.target.value)}
            />
            <input
              style={styles.input}
              type="text"
              placeholder="Empresa"
              value={empresa}
              onChange={e => setEmpresa(e.target.value)}
            />
            <input
              style={styles.input}
              type="number"
              placeholder="Años de experiencia"
              value={experiencia}
              onChange={e => setExperiencia(e.target.value)}
            />
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
              style={{
                ...styles.button,
                opacity: canIniciar() ? 1 : 0.5
              }}
              disabled={!canIniciar()}
              onClick={handleStart}
            >
              Comenzar Evaluación
            </button>
          </>
        ) : (
          <>
            <h2>Sesión {sesion} – Etapa: {etapa}</h2>
            {/* SESIONES 1.x */}
            {['1.1','1.2'].includes(sesion) && riesgos.map((r, i) => (
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
                  <div>
                    <label>% Imp. Frecuencia:</label><br/>
                    <input
                      type="number" min="0" max="100"
                      value={respuestas[i]?.importancia_frecuencia||''}
                      onChange={e=>handleChange(i,'importancia_frecuencia',e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}

            {/* SESIONES 2.x: matriz estática */}
            {['2.1','2.2'].includes(sesion) && (
              <div style={{ overflowX: 'auto', marginTop: '20px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Riesgo</th>
                      {etapasProyecto.map(ep => (
                        <th key={ep} style={styles.th}>{ep}</th>
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
                              checked={respuestas[i]?.etapas_afectadas?.includes(ep) || false}
                              onChange={() => handleCheckbox(i, ep)}
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
    minHeight: '100vh',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    backgroundImage: 'url("/proyecto.png")', backgroundSize: 'cover',
    fontFamily: "'Poppins', sans-serif", padding: '30px'
  },
  card: {
    background: 'rgba(255,255,255,0.9)', padding: '40px',
    borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    width: '100%', maxWidth: '900px'
  },
  input: {
    width: '100%', padding: '10px', margin: '8px 0',
    borderRadius: '6px', border: '1px solid #ccc'
  },
  button: {
    marginTop: '20px', padding: '12px 20px',
    background: '#007bff', color: 'white', border: 'none',
    borderRadius: '6px', cursor: 'pointer', fontSize: '16px'
  },
  detail: {
    textAlign: 'left', marginBottom: '20px'
  },
  grid2: {
    display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr',
    gap: '20px', marginTop: '10px'
  },
  th: {
    border: '1px solid #ccc', padding: '8px',
    background: '#f5f5f5', textAlign: 'left', whiteSpace: 'nowrap'
  },
  td: {
    border: '1px solid #ccc', padding: '8px', whiteSpace: 'nowrap'
  },
  tdCenter: {
    border: '1px solid #ccc', padding: '8px', textAlign: 'center'
  }
};
