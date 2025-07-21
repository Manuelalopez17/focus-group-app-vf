import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '../supabaseClient';

function Participante() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const sesion = searchParams.get('sesion');

  const [nombre, setNombre] = useState('');
  const [empresa, setEmpresa] = useState('');
  const [experiencia, setExperiencia] = useState('');
  const [etapaSeleccionada, setEtapaSeleccionada] = useState('');
  const [riesgos, setRiesgos] = useState([]);
  const [respuestas, setRespuestas] = useState({});

  const etapasProyecto = [
    'Abastecimiento', 'Prefactibilidad y Factibilidad', 'Planeación', 'Contratación y Adquisición',
    'Diseño', 'Fabricación', 'Logística y Transporte', 'Montaje', 'Construcción',
    'Puesta en Marcha', 'Disposición Final'
  ];

  useEffect(() => {
    if (etapaSeleccionada && ['1.1', '1.2', 'simulacion'].includes(sesion)) {
      setRiesgos([
        `Ejemplo de riesgo 1 para ${etapaSeleccionada}`,
        `Ejemplo de riesgo 2 para ${etapaSeleccionada}`,
        `Ejemplo de riesgo 3 para ${etapaSeleccionada}`,
      ]);
    }
  }, [etapaSeleccionada, sesion]);

  const handleChange = (index, field, value) => {
    setRespuestas(prev => {
      const copia = { ...prev };
      copia[index] = {
        ...copia[index],
        [field]: value,
      };
      const impacto = parseFloat(copia[index]?.impacto) || 0;
      const frecuencia = parseFloat(copia[index]?.frecuencia) || 0;
      const impImpacto = parseFloat(copia[index]?.importancia_impacto) || 0;
      const impFrecuencia = parseFloat(copia[index]?.importancia_frecuencia) || 0;
      const score_base = impacto * frecuencia;
      const score_final = ((impacto * impImpacto) + (frecuencia * impFrecuencia)) / 100;
      copia[index].score_base = score_base;
      copia[index].score_final = score_final;
      return copia;
    });
  };

  const handleSubmit = async () => {
    for (const index in respuestas) {
      const r = respuestas[index];
      const { error } = await supabase.from('respuestas').insert({
        sesion,
        etapa: etapaSeleccionada,
        riesgo: riesgos[index],
        nombre,
        empresa,
        experiencia,
        impacto: r.impacto,
        frecuencia: r.frecuencia,
        importancia_impacto: r.importancia_impacto,
        importancia_frecuencia: r.importancia_frecuencia,
        score_base: r.score_base,
        score_final: r.score_final,
        etapas_afectadas: null,
      });
      if (error) console.error(error);
    }
    alert('Respuestas enviadas correctamente');
  };

  return (
    <div
      style={{
        backgroundImage: 'url("/proyecto.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '100vh',
        padding: '40px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: "'Poppins', sans-serif"
      }}
    >
      <div
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(8px)',
          padding: '40px',
          borderRadius: '20px',
          width: '90%',
          maxWidth: '800px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          textAlign: 'center'
        }}
      >
        {!etapaSeleccionada ? (
          <>
            <h2 style={{ marginBottom: '20px', fontWeight: '600' }}>P6 – Proyecto Riesgos</h2>
            <input
              placeholder="Nombre completo"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              style={{ width: '100%', marginBottom: '10px', padding: '10px' }}
            />
            <input
              placeholder="Empresa"
              value={empresa}
              onChange={(e) => setEmpresa(e.target.value)}
              style={{ width: '100%', marginBottom: '10px', padding: '10px' }}
            />
            <input
              placeholder="Años de experiencia"
              value={experiencia}
              onChange={(e) => setExperiencia(e.target.value)}
              style={{ width: '100%', marginBottom: '20px', padding: '10px' }}
            />
            <select
              value={etapaSeleccionada}
              onChange={(e) => setEtapaSeleccionada(e.target.value)}
              style={{ width: '100%', padding: '10px', marginBottom: '20px' }}
            >
              <option value="">Seleccione la etapa</option>
              {etapasProyecto.map((etapa, idx) => (
                <option key={idx} value={etapa}>{etapa}</option>
              ))}
            </select>
            <button
              onClick={() => {}}
              style={{
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                padding: '12px 20px',
                fontSize: '16px',
                fontWeight: '600',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              Comenzar evaluación
            </button>
          </>
        ) : (
          <>
            <h2 style={{ marginBottom: '20px' }}>Riesgos para la etapa: {etapaSeleccionada}</h2>
            {riesgos.map((riesgo, index) => (
              <details key={index} style={{ marginBottom: '25px' }}>
                <summary style={{ fontWeight: 'bold' }}>{riesgo}</summary>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '10px' }}>
                  <div>
                    <label>Impacto (1–5):</label><br />
                    <input type="number" min="1" max="5" value={respuestas[index]?.impacto || ''} onChange={(e) => handleChange(index, 'impacto', e.target.value)} />
                  </div>
                  <div>
                    <label>Frecuencia (1–5):</label><br />
                    <input type="number" min="1" max="5" value={respuestas[index]?.frecuencia || ''} onChange={(e) => handleChange(index, 'frecuencia', e.target.value)} />
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '10px' }}>
                  <div>
                    <label>% Imp. Impacto (0–100%):</label><br />
                    <input type="number" min="0" max="100" value={respuestas[index]?.importancia_impacto || ''} onChange={(e) => handleChange(index, 'importancia_impacto', e.target.value)} />
                  </div>
                  <div>
                    <label>% Imp. Frecuencia (0–100%):</label><br />
                    <input type="number" min="0" max="100" value={respuestas[index]?.importancia_frecuencia || ''} onChange={(e) => handleChange(index, 'importancia_frecuencia', e.target.value)} />
                  </div>
                </div>
                <p>Score Base: {respuestas[index]?.score_base || 0}</p>
                <p>Score Final: {respuestas[index]?.score_final || 0}</p>
              </details>
            ))}
            <button onClick={handleSubmit} style={{ marginTop: '10px', padding: '10px 20px' }}>Enviar respuestas</button>
          </>
        )}
      </div>
    </div>
  );
}

export default Participante;
