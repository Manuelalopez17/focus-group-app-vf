import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';

export default function Participante() {
  const navigate = useNavigate();
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const sesion = params.get('sesion');

  // Guard: sin correo redirige a login
  useEffect(() => {
    if (!localStorage.getItem('expertEmail')) {
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  const sesionesDisponibles = ['1.1', '1.2', '2.1', '2.2'];
  const etapasProyecto = [ /* tu array de etapas */ ];

  const [etapa, setEtapa] = useState('');
  const [mostrarFormulario, setMostrarFormulario] = useState(true);
  const [riesgos, setRiesgos] = useState([]);
  const [respuestas, setRespuestas] = useState({});

  const expertEmail = localStorage.getItem('expertEmail');

  // Carga riesgos por etapa
  useEffect(() => {
    if (!etapa) return;
    const map = { /* tu mapa de riesgos */ };
    setRiesgos(map[etapa] || []);
  }, [etapa]);

  const canStart = () => sesionesDisponibles.includes(sesion) && etapa;

  const handleStart = () => canStart() && setMostrarFormulario(false);

  const handleChange = (i, field, val) => {
    setRespuestas(prev => { /* tu lógica de cambio */ });
  };

  const handleCheckbox = (i, etapaName) => {
    setRespuestas(prev => { /* tu lógica de checkbox */ });
  };

  const handleSubmit = async () => {
    for (let i = 0; i < riesgos.length; i++) {
      const resp = respuestas[i] || {};
      const payload = {
        expert_email: expertEmail,
        sesion,
        etapa,
        riesgo: riesgos[i],
        ...( ['1.1','1.2'].includes(sesion)
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
        alert(`Error en respuesta ${i+1}: ${error.message}`);
        return;
      }
    }
    alert('Respuestas enviadas');
    setMostrarFormulario(true);
    setRespuestas({});
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {mostrarFormulario ? (
          <>
            <h2>Sesión {sesion}</h2>
            <select style={styles.input} value={etapa} onChange={e => setEtapa(e.target.value)}>
              <option value="">Seleccione etapa</option>
              {etapasProyecto.map(ep => (<option key={ep} value={ep}>{ep}</option>))}
            </select>
            <button style={styles.button} disabled={!canStart()} onClick={handleStart}>
              Comenzar evaluación
            </button>
          </>
        ) : (
          <>
            <h2>Sesión {sesion} – Etapa: {etapa}</h2>
            {/* tu render de riesgos + inputs/checks */}
            <button style={styles.button} onClick={handleSubmit}>
              Enviar y terminar
            </button>
          </>
        )}
      </div>
    </div>
  );
}

const styles = { /* reutiliza los estilos que ya tenías */ };
