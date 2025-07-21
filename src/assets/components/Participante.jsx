import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';

export default function Participante() {
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

  // Datos del participante y control de flujo
  const [sesion, setSesion] = useState('');
  const [nombre, setNombre] = useState('');
  const [empresa, setEmpresa] = useState('');
  const [experiencia, setExperiencia] = useState('');
  const [etapa, setEtapa] = useState('');
  const [mostrarFormulario, setMostrarFormulario] = useState(true);

  // Evaluación de riesgos
  const [riesgos, setRiesgos] = useState([]);
  const [respuestas, setRespuestas] = useState({});

  // Carga de riesgos según la etapa seleccionada
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

  // Validación para iniciar la evaluación
  const canIniciar = () =>
    sesionesDisponibles.includes(sesion) &&
    nombre.trim() &&
    empresa.trim() &&
    experiencia.trim() &&
    etapa.trim();

  const handleStart = () => {
    if (canIniciar()) {
      setMostrarFormulario(false);
    }
  };

  // Manejador de cambios en inputs de riesgo
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
        // Otros campos (impacto, frecuencia)
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

  // Manejador de checkboxes en sesiones 2.x
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

  // Envío final a Supabase
  const handleSubmit = async () => {
    for (let i = 0; i < riesgos.length; i++) {
      const resp = respuestas[i] || {};
      const payload = {
        sesion,
        etapa,
        riesgo: riesgos[i],
        nombre,
        empresa,
        experiencia
      };

      if (['1.1', '1.2'].includes(sesion)) {
        payload.impacto = resp.impacto || 0;
        payload.frecuencia = resp.frecuencia || 0;
        payload.importancia_impacto = resp.importancia_impacto || 0;
        payload.importancia_frecuencia = resp.importancia_frecuencia || 0;
        payload.score_base = resp.score_base || 0;
        payload.score_final = resp.score_final || 0;
      } else {
        payload.etapas_afectadas = resp.etapas_afectadas || [];
      }

      const { error } = await supabase
        .from('focus-group-db')
        .insert([payload]);

      if (error) console.error('Insert error:', error);
    }
    // Volver al formulario inicial si quieres repetir
    setMostrarFormulario(true);
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {mostrarFormulario ? (
          <>
            <h2>Bienvenido</h2>
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
              style={{
                ...styles.button,
                opacity: canIniciar() ? 1 : 0.5
              }}
              disabled={!canIniciar()}
              onClick={handleStart}
            >
              Iniciar Sesión
            </button>
          </>
        ) : (
          <>
            <h2>
              Sesión {sesion} – Etapa: {etapa}
            </h2>
            <p style={styles.note}>
              {['1.1', '1.2'].includes(sesion)
                ? 'Califica Impacto, Frecuencia y sus porcentajes.'
                : 'Selecciona las etapas afectadas por cada riesgo.'}
            </p>
            {riesgos.map((r, i) => (
              <details key={i} style={styles.detail}>
                <summary>
                  <strong>{r}</strong>
                </summary>

                {['1.1', '1.2'].includes(sesion) ? (
                  <div style={styles.grid2}>
                    <div>
                      <label>Impacto (1–5):</label>
                      <br />
                      <input
                        type="number"
                        min="1"
                        max="5"
                        value={respuestas[i]?.impacto || ''}
                        onChange={e =>
                          handleChange(i, 'impacto', e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <label>Frecuencia (1–5):</label>
                      <br />
                      <input
                        type="number"
                        min="1"
                        max="5"
                        value={respuestas[i]?.frecuencia || ''}
                        onChange={e =>
                          handleChange(i, 'frecuencia', e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <label>% Impacto:</label>
                      <br />
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
                      <label>% Frecuencia:</label>
                      <br />
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
                    <div>
                      <strong>Score Base:</strong> {respuestas[i]?.score_base || 0}
                    </div>
                    <div>
                      <strong>Score Final:</strong> {respuestas[i]?.score_final || 0}
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
  note: {
    fontStyle: 'italic',
    marginBottom: '20px'
  },
  detail: {
    textAlign: 'left',
    marginBottom: '20px'
  },
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
  checkboxLabel: {
    display: 'inline-flex',
    alignItems: 'center',
    marginRight: '15px'
  }
};
