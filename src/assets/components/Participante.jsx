// src/assets/components/Participante.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';

export default function Participante() {
  const navigate = useNavigate();
  const { search } = useLocation();
  const sesion = new URLSearchParams(search).get('sesion');
  const expertEmail = localStorage.getItem('expertEmail');

  // Si no hay email en localStorage, forzamos volver al login de esa sesión
  useEffect(() => {
    if (!expertEmail) {
      navigate(`/login?sesion=${sesion}`, { replace: true });
    }
  }, [expertEmail, navigate, sesion]);

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
    'Disposición Final',
  ];

  const [etapa, setEtapa] = useState('');
  const [mostrarFormulario, setMostrarFormulario] = useState(true);
  const [riesgos, setRiesgos] = useState([]);
  const [respuestas, setRespuestas] = useState({});

  // Carga los riesgos según la etapa
  useEffect(() => {
    if (!etapa) return;
    const mapRiesgos = {
      Abastecimiento: [
        'Demora en entrega de materiales por parte del proveedor',
        'Recepción de materiales con especificaciones incorrectas',
        'Falta de control de calidad en los insumos adquiridos',
      ],
      'Prefactibilidad y Factibilidad': [
        'Falta de análisis adecuado de viabilidad técnica',
        'Supuestos económicos erróneos en la factibilidad financiera',
        'Escasa participación de actores clave en etapa temprana',
      ],
      Planeación: [
        'Errores en la estimación de recursos y tiempos',
        'No inclusión de contingencias en la planificación',
        'Cambios constantes en el alcance del proyecto',
      ],
      'Contratación y Adquisición': [
        'Contratación de proveedores sin experiencia en construcción industrializada',
        'Inadecuada definición de términos contractuales',
        'Demoras en procesos administrativos de adquisición',
      ],
      Diseño: [
        'Diseño no compatible con procesos industrializados',
        'Errores en la integración de disciplinas de diseño',
        'Ausencia de revisión y validación cruzada',
      ],
      Fabricación: [
        'Defectos de fabricación en componentes modulares',
        'Interrupciones en la cadena de producción',
        'Falta de control en tolerancias de fabricación',
      ],
      'Logística y Transporte': [
        'Retrasos en la entrega por dificultades logísticas',
        'Daños en módulos durante el transporte',
        'Problemas de acceso al sitio de construcción',
      ],
      Montaje: [
        'Descoordinación entre equipos de montaje y logística',
        'Errores en la secuencia de montaje',
        'Falta de capacitación en ensamblaje de componentes',
      ],
      Construcción: [
        'Condiciones climáticas adversas afectan avances',
        'Incompatibilidad entre componentes industrializados y tradicionales',
        'Riesgos laborales por manipulación de módulos',
      ],
      'Puesta en Marcha': [
        'Fallos en las pruebas de sistemas instalados',
        'No conformidad con normativas técnicas',
        'Demoras en aprobaciones regulatorias finales',
      ],
      'Disposición Final': [
        'Falta de planificación para reciclaje de componentes',
        'Altos costos de disposición de residuos',
        'Desconocimiento de normativas ambientales aplicables',
      ],
    };
    setRiesgos(mapRiesgos[etapa] || []);
  }, [etapa]);

  // Validación para mostrar el botón de "Comenzar evaluación"
  const canStart = etapa !== '' && typeof sesion === 'string';

  const handleStart = () => {
    if (canStart) setMostrarFormulario(false);
  };

  // Manejador de inputs y cálculo de scores
  const handleChange = (idx, field, value) => {
    setRespuestas(prev => {
      const r = { ...(prev[idx] || {}) };

      if (field === 'impacto' || field === 'frecuencia') {
        r[field] = Number(value);
      } else if (field === 'importancia_impacto') {
        const imp = Number(value);
        r.importancia_impacto = imp;
        r.importancia_frecuencia = 100 - imp;
      }

      if (['1.1', '1.2'].includes(sesion)) {
        const imp = r.impacto || 0;
        const frec = r.frecuencia || 0;
        const impImp = r.importancia_impacto || 0;
        const impFrec = r.importancia_frecuencia || 0;
        r.score_base = Number((imp * frec).toFixed(2));
        r.score_final = Number(
          (imp * (impImp / 100) + frec * (impFrec / 100)).toFixed(2)
        );
      }

      return { ...prev, [idx]: r };
    });
  };

  // Manejador de checkboxes (sesiones 2.x)
  const handleCheckbox = (idx, etapaName) => {
    setRespuestas(prev => {
      const r = { ...(prev[idx] || {}) };
      const arr = r.etapas_afectadas || [];
      r.etapas_afectadas = arr.includes(etapaName)
        ? arr.filter(e => e !== etapaName)
        : [...arr, etapaName];
      return { ...prev, [idx]: r };
    });
  };

  // Envío final de todas las respuestas
  const handleSubmit = async () => {
    for (let i = 0; i < riesgos.length; i++) {
      const resp = respuestas[i] || {};
      const base = {
        expert_email: expertEmail,
        sesion,
        etapa,
        riesgo: riesgos[i],
      };
      const detalle = ['1.1', '1.2'].includes(sesion)
        ? {
            impacto: resp.impacto,
            frecuencia: resp.frecuencia,
            importancia_impacto: resp.importancia_impacto,
            importancia_frecuencia: resp.importancia_frecuencia,
            score_base: resp.score_base,
            score_final: resp.score_final,
          }
        : { etapas_afectadas: resp.etapas_afectadas };

      const { error } = await supabase
        .from('focus-group-db')
        .insert([{ ...base, ...detalle }]);
      if (error) {
        alert(`Error guardando respuesta ${i + 1}: ${error.message}`);
        return;
      }
    }

    alert('Respuestas enviadas correctamente');
    setRespuestas({});
    navigate('/home', { replace: true });
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {mostrarFormulario ? (
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
              style={{ ...styles.button, opacity: canStart ? 1 : 0.5 }}
              disabled={!canStart}
              onClick={handleStart}
            >
              Comenzar evaluación
            </button>
          </>
        ) : (
          <>
            <h2>Sesión {sesion} – Etapa: {etapa}</h2>
            <p style={styles.note}>
              {['1.1','1.2'].includes(sesion)
                ? 'Califica Impacto, Frecuencia y % de Impacto'
                : 'Selecciona las etapas afectadas'}
            </p>

            {riesgos.map((r, i) => (
              <div key={i} style={styles.riskContainer}>
                <p style={styles.riskTitle}><strong>{r}</strong></p>

                {['1.1','1.2'].includes(sesion) ? (
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
                ) : (
                  <div style={styles.wrap}>
                    {etapasProyecto.map(ep=>(
                      <label key={ep} style={styles.checkboxLabel}>
                        <input
                          type="checkbox"
                          checked={respuestas[i]?.etapas_afectadas?.includes(ep)||false}
                          onChange={()=>handleCheckbox(i,ep)}
                        />{' '}{ep}
                      </label>
                    ))}
                  </div>
                )}
              </div>
            ))}

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
    backgroundImage: 'url("/proyecto.png")',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'Poppins', sans-serif",
    padding: '30px'
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: '12px',
    padding: '40px',
    width: '100%',
    maxWidth: '800px',
    textAlign: 'center',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
  },
  input: {
    width: '100%',
    padding: '10px',
    margin: '8px 0',
    fontSize: '16px',
    borderRadius: '6px',
    border: '1px solid #ccc'
  },
  button: {
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    padding: '12px 20px',
    fontSize: '16px',
    fontWeight: '600',
    borderRadius: '6px',
    cursor: 'pointer',
    marginTop: '15px'
  },
  note: {
    fontStyle: 'italic',
    marginBottom: '20px'
  },
  riskContainer: {
    textAlign: 'left',
    marginBottom: '20px'
  },
  riskTitle: {
    marginBottom: '10px'
  },
  grid2: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: '20px',
    marginBottom: '10px'
  },
  wrap: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
    marginBottom: '10px',
    justifyContent: 'center'
  },
  checkboxLabel: {
    display: 'inline-flex',
    alignItems: 'center',
    marginRight: '15px'
  }
};
