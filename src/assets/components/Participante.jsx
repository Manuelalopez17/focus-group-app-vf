import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';

export default function Participante() {
  const sesiulesDisponibles = ['1.1', '1.2', '2.1', '2.2'];
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

  // --- Datos iniciales del experto y control de flujo ---
  const [sesion, setSesion] = useState('');
  const [etapa, setEtapa] = useState('');
  const [mostrarFormulario, setMostrarFormulario] = useState(true);

  // --- Riesgos y respuestas ---
  const [riesgos, setRiesgos] = useState([]);
  const [respuestas, setRespuestas] = useState({});

  // Recupera el email del experto guardado en localStorage
  const expertEmail = localStorage.getItem('expertEmail');

  // Carga de lista de riesgos segun la etapa
  useEffect(() => {
    if (!etapa) return;
    const mapa = {
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
    setRiesgos(mapa[etapa] || []);
  }, [etapa]);

  // Validar que se haya escogido sesión y etapa antes de continuar
  const canIniciar = () => sesionesDisponibles.includes(sesion) && etapa;

  const handleStart = () => {
    if (!canIniciar()) return;
    setMostrarFormulario(false);
  };

  // Actualiza respuestas y auto‑suma de porcentajes
  const handleChange = (i, field, val) => {
    setRespuestas(prev => {
      const copy = { ...prev };
      copy[i] = copy[i] || {};

      // Para impacto/frecuencia usamos Number
      if (field === 'impacto' || field === 'frecuencia') {
        copy[i][field] = Number(val);
      } 
      // Auto‑sumar porcentajes
      else if (field === 'importancia_impacto') {
        const imp = Number(val);
        copy[i].importancia_impacto = imp;
        copy[i].importancia_frecuencia = 100 - imp;
      } else if (field === 'importancia_frecuencia') {
        const frec = Number(val);
        copy[i].importancia_frecuencia = frec;
        copy[i].importancia_impacto = 100 - frec;
      }

      // Recalcular scores en sesiones 1.x
      if (['1.1', '1.2'].includes(sesion)) {
        const imp = copy[i].impacto || 0;
        const frec = copy[i].frecuencia || 0;
        const impImp = copy[i].importancia_impacto || 0;
        const impFrec = copy[i].importancia_frecuencia || 0;
        copy[i].score_base = (imp * frec).toFixed(2);
        copy[i].score_final = (
          imp * (impImp / 100) + frec * (impFrec / 100)
        ).toFixed(2);
      }

      return copy;
    });
  };

  // Manejador de checkboxes en 2.x
  const handleCheckbox = (i, etapaName) => {
    setRespuestas(prev => {
      const copy = { ...prev };
      copy[i] = copy[i] || {};
      const arr = copy[i].etapas_afectadas || [];
      copy[i].etapas_afectadas = arr.includes(etapaName)
        ? arr.filter(e => e !== etapaName)
        : [...arr, etapaName];
      return copy;
    });
  };

  // Envío final de todas las respuestas junto a expert_email
  const handleSubmit = async () => {
    for (let i = 0; i < riesgos.length; i++) {
      const resp = respuestas[i] || {};
      const payload = {
        expert_email: expertEmail,
        sesion,
        etapa,
        riesgo: riesgos[i],
        // sólo para 1.x:
        ...(['1.1', '1.2'].includes(sesion)
          ? {
              impacto: resp.impacto,
              frecuencia: resp.frecuencia,
              importancia_impacto: resp.importancia_impacto,
              importancia_frecuencia: resp.importancia_frecuencia,
              score_base: resp.score_base,
              score_final: resp.score_final
            }
          : { etapas_afectadas: resp.etapas_afectadas })
      };

      const { error } = await supabase
        .from('focus-group-db')
        .insert([payload]);

      if (error) {
        console.error('Insert error:', error);
        alert(`Error al guardar la respuesta ${i + 1}: ${error.message}`);
        return;
      }
    }
    alert('Respuestas enviadas correctamente');
    // Reinicia al formulario de selección si quieres repetir
    setMostrarFormulario(true);
    setRespuestas({});
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {mostrarFormulario ? (
          <>
            <h2>Sesión {sesion}</h2>
            <select
              style={styles.input}
              value={sesion}
              onChange={e => setSesion(e.target.value)}
            >
              <option value="">Seleccione sesión</option>
              {sesionesDisponibles.map(s => (
                <option key={s} value={s}>
                  Sesión {s}
                </option>
              ))}
            </select>
            <select
              style={styles.input}
              value={etapa}
              onChange={e => setEtapa(e.target.value)}
            >
              <option value="">Seleccione etapa</option>
              {etapasProyecto.map(ep => (
                <option key={ep} value={ep}>
                  {ep}
                </option>
              ))}
            </select>
            <button
              style={{ ...styles.button, opacity: canIniciar() ? 1 : 0.5 }}
              disabled={!canIniciar()}
              onClick={handleStart}
            >
              Comenzar evaluación
            </button>
          </>
        ) : (
          <>
            <h2>
              Sesión {sesion} – Etapa: {etapa}
            </h2>
            <p style={styles.note}>
              {['1.1', '1.2'].includes(sesion)
                ? 'Califica Impacto, Frecuencia y %'
                : 'Selecciona las etapas afectadas'}
            </p>
            {riesgos.map((r, i) => (
              <details key={i} style={styles.detail}>
                <summary>{r}</summary>
                {['1.1', '1.2'].includes(sesion) ? (
                  <div style={styles.grid2}>
                    <div>
                      <label>Impacto (1–5)</label>
                      <input
                        type="number"
                        min="1"
                        max="5"
                        value={respuestas[i]?.impacto || ''}
                        onChange={e => handleChange(i, 'impacto', e.target.value)}
                      />
                    </div>
                    <div>
                      <label>Frecuencia (1–5)</label>
                      <input
                        type="number"
                        min="1"
                        max="5"
                        value={respuestas[i]?.frecuencia || ''}
                        onChange={e => handleChange(i, 'frecuencia', e.target.value)}
                      />
                    </div>
                    <div>
                      <label>% Impacto</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={respuestas[i]?.importancia_impacto || ''}
                        onChange={e =>
                          handleChange(i, 'importancia_impacto', e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <label>% Frecuencia</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={respuestas[i]?.importancia_frecuencia || ''}
                        onChange={e =>
                          handleChange(i, 'importancia_frecuencia', e.target.value)
                        }
                      />
                    </div>
                  </div>
                ) : (
                  <div style={styles.wrap}>
                    {etapasProyecto.map(ep => (
                      <label key={ep} style={styles.checkboxLabel}>
                        <input
                          type="checkbox"
                          onChange={() => handleCheckbox(i, ep)}
                        />{' '}
                        {ep}
                      </label>
                    ))}
                  </div>
                )}
              </details>
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
  note: { fontStyle: 'italic', marginBottom: '20px' },
  detail: { textAlign: 'left', marginBottom: '20px' },
  grid2: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
    marginTop: '10px'
  },
  wrap: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
    marginTop: '10px',
    justifyContent: 'center'
  },
  checkboxLabel: { display: 'inline-flex', alignItems: 'center', marginRight: '15px' }
};
