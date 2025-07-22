// src/Pages/Participante.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export default function Participante() {
  const navigate = useNavigate();
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const sesion = params.get('sesion');
  const email =
    params.get('email') || localStorage.getItem('expertEmail') || '';

  // si no hay email, redirige a presentación
  useEffect(() => {
    if (!email) navigate('/presentacion', { replace: true });
  }, [email, navigate]);

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

  const allRiesgos = {
    Abastecimiento: [
      'Demora en entrega de materiales por parte del proveedor',
      'Recepción de materiales con especificaciones incorrectas',
      'Falta de control de calidad en los insumos adquiridos'
    ],
    /* etc. para cada etapa... */
  };

  const [etapa, setEtapa] = useState('');
  const [respuestas, setRespuestas] = useState({});

  useEffect(() => {
    if (etapa && ['2.1', '2.2'].includes(sesion)) {
      // inicializa respuestas vacías para matriz
      const riesgos = allRiesgos[etapa] || [];
      const init = {};
      riesgos.forEach((_, i) => { init[i] = { etapas_afectadas: [] }; });
      setRespuestas(init);
    }
  }, [etapa, sesion]);

  const handleCheckbox = (idx, etapaName) => {
    setRespuestas(prev => {
      const copy = { ...prev };
      const arr = copy[idx].etapas_afectadas || [];
      copy[idx].etapas_afectadas = arr.includes(etapaName)
        ? arr.filter(e => e !== etapaName)
        : [...arr, etapaName];
      return copy;
    });
  };

  const handleSubmit = async () => {
    const riesgos = allRiesgos[etapa] || [];
    for (let i = 0; i < riesgos.length; i++) {
      const resp = respuestas[i] || {};
      const payload = {
        sesion,
        etapa,
        riesgo: riesgos[i],
        expert_email: email,
        ...(['2.1','2.2'].includes(sesion)
          ? { etapas_afectadas: resp.etapas_afectadas || [] }
          : { /* aquí irían impacto, frecuencia, % importancia… si son 1.x */ })
      };
      const { error } = await supabase
        .from('focus-group-db')
        .insert([payload]);
      if (error) {
        console.error('Error en respuesta', i+1, error);
        alert(`Error en respuesta ${i+1}: ${error.message}`);
        return;
      }
    }
    alert('Respuestas enviadas correctamente');
    navigate('/home', { replace: true });
  };

  // Renderizado
  const riesgos = etapa ? (allRiesgos[etapa] || []) : [];

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2>Sesión {sesion} – Etapa: {etapa || '– selecciona etapa –'}</h2>

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

        {etapa && (['1.1','1.2'].includes(sesion) ? (
          /* Aquí tu UI para impacto/frecuencia */
          <p>⚠️ Completa la sesión 1.x en la página de sesión 1.x real</p>
        ) : (
          /* matriz estática para 2.x */
          <div style={styles.matrixWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th>Riesgo</th>
                  {etapasProyecto.map((ep, i) => (
                    <th key={i}>{ep}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {riesgos.map((r, i) => (
                  <tr key={i}>
                    <td>{`r${i+1}. ${r}`}</td>
                    {etapasProyecto.map((ep, j) => (
                      <td key={j}>
                        <input
                          type="checkbox"
                          checked={respuestas[i]?.etapas_afectadas?.includes(ep)}
                          onChange={() => handleCheckbox(i, ep)}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}

        {etapa && (
          <button style={styles.button} onClick={handleSubmit}>
            Enviar y terminar
          </button>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    fontFamily: "'Poppins', sans-serif",
    background: 'url("/proyecto.png") center/cover no-repeat',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px'
  },
  card: {
    background: 'rgba(255,255,255,0.9)',
    borderRadius: '12px',
    padding: '30px',
    maxWidth: '1000px',
    width: '100%',
    textAlign: 'center',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
  },
  input: {
    padding: '8px',
    fontSize: '16px',
    marginBottom: '20px',
    width: '60%'
  },
  matrixWrapper: {
    overflowX: 'auto',
    marginBottom: '20px'
  },
  table: {
    borderCollapse: 'collapse',
    width: '100%',
    fontSize: '14px'
  },
  button: {
    padding: '12px 24px',
    background: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '16px',
    cursor: 'pointer'
  }
};
