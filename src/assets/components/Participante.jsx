// src/assets/components/Participante.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../supabaseClient';

export default function Participante() {
  const navigate = useNavigate();
  const { search } = useLocation();
  const sesion = new URLSearchParams(search).get('sesion') || '';
  const expertEmail = new URLSearchParams(search).get('email') || '';

  const sesiones1 = ['1.1', '1.2'];
  const sesiones2 = ['2.1', '2.2'];

  const etapas = [
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
  const [riesgos, setRiesgos] = useState([]);
  const [respuestas, setRespuestas] = useState({});

  // Carga riesgos al elegir etapa
  useEffect(() => {
    if (!etapa) return;
    const map = {
      Abastecimiento: [
        'Demora en entrega de materiales por parte del proveedor',
        'Recepción de materiales con especificaciones incorrectas',
        'Falta de control de calidad en los insumos adquiridos'
      ],
      // … igual para cada etapa …
    };
    setRiesgos(map[etapa] || []);
  }, [etapa]);

  // Toggle checkbox en sesiones 2.x
  const handleCheckbox = (i, col) => {
    setRespuestas(p => {
      const c = { ...p };
      c[i] = c[i] || {};
      const arr = c[i].etapas_afectadas || [];
      c[i].etapas_afectadas = arr.includes(col)
        ? arr.filter(x => x !== col)
        : [...arr, col];
      return c;
    });
  };

  // Insert final
  const handleSubmit = async () => {
    const payload = riesgos.map((r, i) => ({
      sesion,
      etapa,
      riesgo: r,
      expert_email: expertEmail,
      ...(
        sesiones2.includes(sesion)
          ? { etapas_afectadas: respuestas[i]?.etapas_afectadas || [] }
          : {}
      )
    }));

    const { error } = await supabase
      .from('focus-group-db')
      .insert(payload);

    if (error) {
      console.error(error);
      alert('Error al guardar: ' + error.message);
      return;
    }
    alert('¡Respuestas guardadas!');
    navigate('/home', { replace: true });
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2>Sesión {sesion} – Etapa: {etapa}</h2>
        {!etapa ? (
          <select style={styles.input} value={etapa} onChange={e => setEtapa(e.target.value)}>
            <option value="">-- Seleccione etapa --</option>
            {etapas.map(ep => <option key={ep} value={ep}>{ep}</option>)}
          </select>
        ) : sesiones1.includes(sesion) ? (
          <p>(Las sesiones 1.x ya fueron completadas en la página anterior)</p>
        ) : (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th>Riesgo</th>
                  {etapas.map((ep, j) => (
                    <th key={j} style={styles.thVertical}>{ep}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {riesgos.map((r, i) => (
                  <tr key={i}>
                    <td>{i+1}. {r}</td>
                    {etapas.map((ep, j) => (
                      <td key={j}>
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

        {etapa && sesiones2.includes(sesion) && (
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
    minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
    backgroundImage: 'url("/proyecto.png")', backgroundSize: 'cover'
  },
  card: {
    background: 'rgba(255,255,255,0.9)', padding: 30, borderRadius: 12,
    width: '95%', maxWidth: 1000
  },
  input: {
    width: '100%', padding: 10, margin: '10px 0', borderRadius: 6, border: '1px solid #ccc'
  },
  tableWrapper: {
    overflowX: 'auto', marginTop: 20
  },
  table: {
    borderCollapse: 'collapse', width: '100%'
  },
  thVertical: {
    writingMode: 'vertical-rl', transform: 'rotate(180deg)',
    border: '1px solid #ddd', padding: '8px', whiteSpace: 'nowrap', fontSize: 12
  },
  button: {
    marginTop: 20, padding: '12px 24px', background: '#007bff', color: 'white',
    border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 16
  }
};
