import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '../../supabaseClient';

export default function Participante() {
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

  // Carga de riesgos según etapa
  useEffect(() => {
    if (!etapa) return;
    const map = {
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
    setRiesgos(map[etapa] || []);
  }, [etapa]);

  // Suscripción real-time para inserciones
  useEffect(() => {
    const sub = supabase
      .from('focus-group-db')
      .on('INSERT', payload => console.log('➡️ New insert:', payload.new))
      .subscribe();
    return () => supabase.removeSubscription(sub);
  }, []);

  const canProceed = () =>
    nombre.trim() && empresa.trim() && experiencia.trim() && etapa.trim();

  const handleStart = () => {
    if (canProceed()) setMostrarFormulario(false);
  };

  const handleChange = (index, campo, valor) => {
    setRespuestas(prev => {
      const copy = { ...prev };
      copy[index] = copy[index] || {};
      // Auto distribución de porcentajes
      if (campo === 'importancia_impacto') {
        const imp = Number(valor);
        copy[index].importancia_impacto = imp;
        copy[index].importancia_frecuencia = 100 - imp;
      } else if (campo === 'importancia_frecuencia') {
        const frec = Number(valor);
        copy[index].importancia_frecuencia = frec;
        copy[index].importancia_impacto = 100 - frec;
      } else {
        copy[index][campo] = valor;
      }
      // Recalc scores en 1.x
      if (['1.1','1.2'].includes(sesion)) {
        const imp = parseFloat(copy[index].impacto || 0);
        const frec = parseFloat(copy[index].frecuencia || 0);
        const impImp = parseFloat(copy[index].importancia_impacto || 0);
        const impFrec = parseFloat(copy[index].importancia_frecuencia || 0);
        copy[index].score_base = (imp * frec).toFixed(2);
        copy[index].score_final = (
          imp * (impImp/100) + frec * (impFrec/100)
        ).toFixed(2);
      }
      return copy;
    });
  };

  const handleCheckbox = (index, etapaName) => {
    setRespuestas(prev => {
      const copy = { ...prev };
      copy[index] = copy[index] || {};
      const arr = copy[index].etapas_afectadas || [];
      copy[index].etapas_afectadas = arr.includes(etapaName)
        ? arr.filter(e => e !== etapaName)
        : [...arr, etapaName];
      return copy;
    });
  };

  const handleSubmit = async () => {
    for (let i = 0; i < riesgos.length; i++) {
      const resp = respuestas[i] || {};
      const payload = { sesion, etapa, riesgo: riesgos[i], nombre, empresa, experiencia };
      if (['1.1','1.2'].includes(sesion)) {
        Object.assign(payload, {
          impacto: resp.impacto||0,
          frecuencia: resp.frecuencia||0,
          importancia_impacto: resp.importancia_impacto||0,
          importancia_frecuencia: resp.importancia_frecuencia||0,
          score_base: resp.score_base||0,
          score_final: resp.score_final||0
        });
      } else if (['2.1','2.2'].includes(sesion)) {
        payload.etapas_afectadas = resp.etapas_afectadas||[];
      }
      const { data, error } = await supabase
        .from('focus-group-db')
        .insert([payload]);
      if (error) console.error('❌ Insert error:', error);
      else console.log('✅ Inserted:', data);
    }
    setMostrarFormulario(true);
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {mostrarFormulario ? (
          <>
            <h2>P6 – Proyecto Riesgos</h2>
            <p style={styles.note}>
              Ingresa tus datos para comenzar. Sin ellos no garantizamos tener la información de los participantes.
            </p>
            <input style={styles.input} placeholder="Nombre completo" value={nombre} onChange={e=>setNombre(e.target.value)} />
            <input style={styles.input} placeholder="Empresa" value={empresa} onChange={e=>setEmpresa(e.target.value)} />
            <input style={styles.input} type="number" placeholder="Años de experiencia" value={experiencia} onChange={e=>setExperiencia(e.target.value)} />
            <select style={styles.input} value={etapa} onChange={e=>setEtapa(e.target.value)}>
              <option value="">Seleccione la etapa</option>
              {etapasProyecto.map(ep=><option key={ep} value={ep}>{ep}</option>)}
            </select>
            <button style={{...styles.button,opacity:canProceed()?1:0.5}} disabled={!canProceed()} onClick={handleStart}>
              Comenzar evaluación
            </button>
          </>
        ) : (
          <>
            <h2>Sesión {sesion} – Etapa: {etapa}</h2>
            <p style={styles.note}>
              {['1.1','1.2'].includes(sesion)
                ? 'En esta sesión (1.x) califica Impacto, Frecuencia y sus ponderaciones.'
                : ['2.1','2.2'].includes(sesion)
                ? 'En esta sesión (2.x) selecciona las etapas del proyecto afectadas por cada riesgo.'
                : ''}
            </p>
            <p style={styles.note}>Despliega cada riesgo para ver la pregunta correspondiente.</p>
            {riesgos.map((r,i)=>(
              <details key={i} style={styles.detail}>
                <summary><strong>{r}</strong></summary>
                {['1.1','1.2'].includes(sesion) ? (
                  <div style={styles.grid2}>
                    <div><label>Impacto:</label><input type="number" min="1" max="5" value={respuestas[i]?.impacto||''} onChange={e=>handleChange(i,'impacto',e.target.value)} /></div>
                    <div><label>Frecuencia:</label><input type="number" min="1" max="5" value={respuestas[i]?.frecuencia||''} onChange={e=>handleChange(i,'frecuencia',e.target.value)} /></div>
                    <div><label>% Impacto:</label><input type="number" min="0" max="100" value={respuestas[i]?.importancia_impacto||''} onChange={e=>handleChange(i,'importancia_impacto',e.target.value)} /></div>
                    <div><label>% Frecuencia:</label><input type="number" min="0" max="100" value={respuestas[i]?.importancia_frecuencia||''} onChange={e=>handleChange(i,'importancia_frecuencia',e.target.value)} /></div>
                    <div><strong>Base:</strong>{respuestas[i]?.score_base||0}</div>
                    <div><strong>Final:</strong>{respuestas[i]?.score_final||0}</div>
                  </div>
                ) : ['2.1','2.2'].includes(sesion) ? (
                  <div style={styles.wrap}>
                    {etapasProyecto.map(ep=><label key={ep} style={styles.checkboxLabel}><input type="checkbox" onChange={()=>handleCheckbox(i,ep)} />{ep}</label>)}
                  </div>
                ) : null}
              </details>
            ))}
            <button style={styles.button} onClick={handleSubmit}>Enviar respuestas</button>
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  container:{backgroundImage:'url("/proyecto.png")',backgroundSize:'cover',backgroundPosition:'center',minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',padding:'30px',fontFamily:"'Poppins',sans-serif"},
  card:{backgroundColor:'rgba(255,255,255,0.8)',borderRadius:'16px',padding:'40px',maxWidth:'900px',width:'100%',textAlign:'center',boxShadow:'0 4px 12px rgba(0,0,0,0.2)'},
  input:{width:'100%',padding:'10px',margin:'8px 0',fontSize:'16px',borderRadius:'6px',border:'1px solid #ccc'},
  button:{backgroundColor:'#007bff',color:'white',border:'none',padding:'12px 20px',fontSize:'16px',fontWeight:'600',borderRadius:'6px',cursor:'pointer',marginTop:'15px'},
  note:{fontStyle:'italic',marginBottom:'20px'},
  detail:{marginBottom:'20px',textAlign:'left'},
  grid2:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'20px',marginTop:'10px'},
  wrap:{display:'flex',flexWrap:'wrap',gap:'10px',justifyContent:'center',marginTop:'10px'},
  checkboxLabel:{display:'inline-flex',alignItems:'center',marginRight:'15px'}
};
