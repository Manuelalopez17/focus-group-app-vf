import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '../../supabaseClient';

function Participante() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const sesion = searchParams.get('sesion');

  const [nombre, setNombre] = useState('');
  const [empresa, setEmpresa] = useState('');
  const [experiencia, setExperiencia] = useState('');
  const [etapa, setEtapa] = useState('');
  const [mostrarFormulario, setMostrarFormulario] = useState(true);
  const [riesgos, setRiesgos] = useState([]);
  const [respuestas, setRespuestas] = useState({});

  // Lista de etapas para checkboxes en sesiones 2.x
  const etapasProyecto = [
    'Abastecimiento', 'Prefactibilidad y Factibilidad', 'Planeación',
    'Contratación y Adquisición', 'Diseño', 'Fabricación',
    'Logística y Transporte', 'Montaje', 'Construcción',
    'Puesta en Marcha', 'Disposición Final'
  ];

  useEffect(() => {
    if (etapa) {
      const riesgosPorEtapa = {
        'Abastecimiento': [
          'Demora en entrega de materiales por parte del proveedor',
          'Recepción de materiales con especificaciones incorrectas',
          'Falta de control de calidad en los insumos adquiridos'
        ],
        // ... resto de etapas igual que antes
      };
      setRiesgos(riesgosPorEtapa[etapa] || []);
    }
  }, [etapa]);

  const canProceed = () => nombre && empresa && experiencia && etapa;

  const handleChange = (index, campo, valor) => {
    const nuevas = { ...respuestas };
    if (!nuevas[index]) nuevas[index] = {};
    nuevas[index][campo] = valor;
    // Recalcular score sólo en sesiones 1.x
    if (['1.1','1.2'].includes(sesion)) {
      const imp = parseFloat(nuevas[index].impacto || 0);
      const frec = parseFloat(nuevas[index].frecuencia || 0);
      const impImp = parseFloat(nuevas[index].importancia_impacto || 0);
      const impFrec = parseFloat(nuevas[index].importancia_frecuencia || 0);
      nuevas[index].score_base = (imp * frec).toFixed(2);
      nuevas[index].score_final = ((imp * (impImp/100)) + (frec * (impFrec/100))).toFixed(2);
    }
    setRespuestas(nuevas);
  };

  const handleCheckbox = (index, etapaName) => {
    const nuevas = { ...respuestas };
    if (!nuevas[index]) nuevas[index] = {};
    const arr = nuevas[index].etapas_afectadas || [];
    nuevas[index].etapas_afectadas = arr.includes(etapaName)
      ? arr.filter(e => e !== etapaName)
      : [...arr, etapaName];
    setRespuestas(nuevas);
  };

  const handleStart = () => {
    if (canProceed()) {
      setMostrarFormulario(false);
    }
  };

  const handleSubmit = async () => {
    for (let i = 0; i < riesgos.length; i++) {
      const respuesta = respuestas[i] || {};
      const payload = {
        sesion,
        etapa,
        riesgo: riesgos[i],
        nombre,
        empresa,
        experiencia,
      };
      if (['1.1','1.2'].includes(sesion)) {
        Object.assign(payload, {
          impacto: respuesta.impacto || 0,
          frecuencia: respuesta.frecuencia || 0,
          importancia_impacto: respuesta.importancia_impacto || 0,
          importancia_frecuencia: respuesta.importancia_frecuencia || 0,
          score_base: respuesta.score_base || 0,
          score_final: respuesta.score_final || 0
        });
      } else if (['2.1','2.2'].includes(sesion)) {
        payload.etapas_afectadas = respuesta.etapas_afectadas || [];
      }
      await supabase.from('respuestas').insert([payload]);
    }
    alert('Respuestas enviadas correctamente.');
    setMostrarFormulario(true);
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {mostrarFormulario ? (
          <>
            <h2>P6 – Proyecto Riesgos</h2>
            <p style={{ color: '#555', marginBottom: '20px' }}>
              Ingresa tus datos para comenzar. Sin ellos no garantizamos tener la información de los participantes.
            </p>
            <input type="text" placeholder="Nombre completo" value={nombre} onChange={e => setNombre(e.target.value)} style={styles.input} />
            <input type="text" placeholder="Empresa" value={empresa} onChange={e => setEmpresa(e.target.value)} style={styles.input} />
            <input type="number" placeholder="Años de experiencia" value={experiencia} onChange={e => setExperiencia(e.target.value)} style={styles.input} />
            <select value={etapa} onChange={e => setEtapa(e.target.value)} style={styles.input}>
              <option value="">Seleccione la etapa</option>
              <option value="Abastecimiento">Abastecimiento</option>
              <option value="Prefactibilidad y Factibilidad">Prefactibilidad y Factibilidad</option>
              <option value="Planeación">Planeación</option>
              <option value="Contratación y Adquisición">Contratación y Adquisición</option>
              <option value="Diseño">Diseño</option>
              <option value="Fabricación">Fabricación</option>
              <option value="Logística y Transporte">Logística y Transporte</option>
              <option value="Montaje">Montaje</option>
              <option value="Construcción">Construcción</option>
              <option value="Puesta en Marcha">Puesta en Marcha</option>
              <option value="Disposición Final">Disposición Final</option>
            </select>
            <button onClick={handleStart} disabled={!canProceed()} style={{ ...styles.button, opacity: canProceed() ? 1 : 0.5 }}>
              Comenzar evaluación
            </button>
          </>
        ) : (
          <>
            <h2>Sesión {sesion} – Etapa: {etapa}</h2>
            <p style={{ fontStyle: 'italic', marginBottom: '15px' }}>
              {['1.1','1.2'].includes(sesion)
                ? 'En esta sesión (1.x) califica Impacto, Frecuencia y sus ponderaciones.'
                : 'En esta sesión (2.x) selecciona las etapas del proyecto afectadas por cada riesgo.'}
            </p>
            <p style={{ fontStyle: 'italic', marginBottom: '20px' }}>
              Despliega cada riesgo para ver la pregunta correspondiente.
            </p>
            {riesgos.map((riesgo, index) => (
              <details key={index} style={styles.detail}>
                <summary><strong>{riesgo}</strong></summary>
                {['1.1','1.2'].includes(sesion) ? (
                  <div style={styles.grid2}>
                    <div><label>Impacto (1–5):</label><br/><input type="number" min="1" max="5" value={respuestas[index]?.impacto || ''} onChange={e => handleChange(index, 'impacto', e.target.value)} /></div>
                    <div><label>Frecuencia (1–5):</label><br/><input type="number" min="1"	max="5" value={respuestas[index]?.frecuencia || ''} onChange={e => handleChange(index, 'frecuencia', e.target.value)} /></div>
                    <div><label>% Imp. Impacto:</label><br/><input type="number" min="0" max="100" value={respuestas[index]?.importancia_impacto || ''} onChange={e => handleChange(index, 'importancia_impacto', e.target.value)} /></div>
                    <div><label>% Imp. Frecuencia:</label><br/><input type="number" min="0" max="100" value={respuestas[index]?.importancia_frecuencia || ''} onChange={e => handleChange(index, 'importancia_frecuencia', e.target.value)} /></div>
                    <div><strong>Score Base:</strong> {respuestas[index]?.score_base || 0}</div>
                    <div><strong>Score Final:</strong> {respuestas[index]?.score_final || 0}</div>
                  </div>
                ) : (
                  <div style={styles.wrap}>
                    {etapasProyecto.map(ep => (
                      <label key={ep} style={styles.checkboxLabel}>
                        <input type="checkbox" onChange={() => handleCheckbox(index, ep)} /> {ep}
                      </label>
                    ))}
                  </div>
                )}
              </details>
            ))}
            <button onClick={handleSubmit} style={styles.button}>Enviar respuestas</button>
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
    padding: '30px',
    fontFamily: "'Poppins', sans-serif"
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: '16px',
    padding: '40px',
   	maxWidth: '900px',
    width: '100%',
    textAlign: 'center',
    boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
  },
  input: {
    width: '100%',
    padding: '10px',
    fontSize: '16px',
    marginBottom: '15px',
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
  detail: {
    marginBottom: '20px',
    textAlign: 'left'
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
    justifyContent: 'center',
   	marginTop: '10px'
  },
  checkboxLabel: {
    display: 'inline-flex',
   	alignItems: 'center',
    marginRight: '15px'
  }
};

export default Participante;
