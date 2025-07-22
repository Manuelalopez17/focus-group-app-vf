// src/assets/components/Participante.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';

export default function Participante() {
  const navigate = useNavigate();
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

  const [sesion, setSesion] = useState('');
  const [etapa, setEtapa] = useState('');
  const [mostrarFormulario, setMostrarFormulario] = useState(true);
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
      // …resto de etapas como antes…
    };
    setRiesgos(mapRiesgos[etapa] || []);
  }, [etapa]);

  const canIniciar = () =>
    sesionesDisponibles.includes(sesion) && etapa;

  const handleStart = () => {
    if (canIniciar()) setMostrarFormulario(false);
  };

  const handleChange = (idx, field, value) => {
    setRespuestas(prev => {
      const copy = { ...prev };
      copy[idx] = copy[idx] || {};
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
      if (['1.1','1.2'].includes(sesion)) {
        const imp = copy[idx].impacto || 0;
        const frec = copy[idx].frecuencia || 0;
        const impImp = copy[idx].importancia_impacto || 0;
        const impFrec = copy[idx].importancia_frecuencia || 0;
        copy[idx].score_base = (imp * frec).toFixed(2);
        copy[idx].score_final = (imp*(impImp/100) + frec*(impFrec/100)).toFixed(2);
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
    const expertEmail = localStorage.getItem('expertEmail');
    const payload = riesgos.map((r, i) => {
      const resp = respuestas[i] || {};
      const base = {
        sesion,
        etapa,
        riesgo: r,
        expert_email: expertEmail
      };
      const detalle = ['1.1','1.2'].includes(sesion)
        ? {
            impacto: resp.impacto || 0,
            frecuencia: resp.frecuencia || 0,
            importancia_impacto: resp.importancia_impacto || 0,
            importancia_frecuencia: resp.importancia_frecuencia || 0,
            score_base: resp.score_base || 0,
            score_final: resp.score_final || 0
          }
        : { etapas_afectadas: resp.etapas_afectadas || [] };
      return { ...base, ...detalle };
    });

    const { data, error } = await supabase
      .from('focus-group-db')
      .insert(payload);

    if (error) {
      console.error('Error al guardar respuestas:', error);
      alert(`Error guardando respuestas: ${error.message}`);
      return;
    }

    navigate('/home', { replace: true });
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {mostrarFormulario ? (
          <>
            <h2>Bienvenido</h2>
            <select value={sesion} onChange={e => setSesion(e.target.value)}>
              <option value="">Seleccione sesión</option>
              {sesionesDisponibles.map(s => <option key={s} value={s}>Sesión {s}</option>)}
            </select>
            <select value={etapa} onChange={e => setEtapa(e.target.value)}>
              <option value="">Seleccione etapa</option>
              {etapasProyecto.map(ep => <option key={ep} value={ep}>{ep}</option>)}
            </select>
            <button disabled={!canIniciar()} onClick={handleStart}>Comenzar evaluación</button>
          </>
        ) : (
          <>
            <h2>Sesión {sesion} – Etapa: {etapa}</h2>
            {riesgos.map((r, i) => (
              <div key={i} style={{ marginBottom: 16 }}>
                <strong>{i+1}. {r}</strong>
                {['1.1','1.2'].includes(sesion) ? (
                  <div>
                    Impacto: <input type="number" min="1" max="5" onChange={e => handleChange(i,'impacto',e.target.value)} />
                    Frecuencia: <input type="number" min="1" max="5" onChange={e => handleChange(i,'frecuencia',e.target.value)} />
                    %Imp: <input type="number" min="0" max="100" onChange={e => handleChange(i,'importancia_impacto',e.target.value)} />
                  </div>
                ) : (
                  <div style={{ display:'flex', flexWrap:'wrap', gap:12 }}>
                    {etapasProyecto.map(ep => (
                      <label key={ep}>
                        <input type="checkbox" onChange={() => handleCheckbox(i,ep)} /> {ep}
                      </label>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <button onClick={handleSubmit}>Enviar y terminar</button>
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center',
    backgroundImage:'url("/proyecto.png")', backgroundSize:'cover'
  },
  card: {
    background:'rgba(255,255,255,0.9)', padding:24, borderRadius:12, width:'90%', maxWidth:800
  }
};
