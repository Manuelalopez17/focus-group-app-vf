import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import supabase from '../supabaseClient';

function Participante() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const sesion = searchParams.get('sesion');
  const [etapa, setEtapa] = useState('');
  const [nombre, setNombre] = useState('');
  const [empresa, setEmpresa] = useState('');
  const [experiencia, setExperiencia] = useState('');
  const [mostrarFormulario, setMostrarFormulario] = useState(true);
  const [respuestas, setRespuestas] = useState({});
  const [riesgos, setRiesgos] = useState([]);

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

  useEffect(() => {
    if (etapa) {
      setRiesgos([
        `Ejemplo de riesgo 1 para ${etapa}`,
        `Ejemplo de riesgo 2 para ${etapa}`,
        `Ejemplo de riesgo 3 para ${etapa}`
      ]);
    }
  }, [etapa]);

  const handleChange = (riesgo, field, value) => {
    setRespuestas((prev) => {
      const nuevo = {
        ...prev[riesgo],
        [field]: value
      };
      const impacto = parseFloat(nuevo.impacto) || 0;
      const frecuencia = parseFloat(nuevo.frecuencia) || 0;
      const impImpacto = parseFloat(nuevo.importancia_impacto) || 0;
      const impFrecuencia = parseFloat(nuevo.importancia_frecuencia) || 0;
      const score_base = impacto * frecuencia;
      const score_final = (impacto * impImpacto + frecuencia * impFrecuencia) / 100;
      return {
        ...prev,
        [riesgo]: {
          ...nuevo,
          score_base,
          score_final
        }
      };
    });
  };

  const handleSubmit = async () => {
    for (const riesgo of riesgos) {
      const r = respuestas[riesgo] || {};
      await supabase.from('respuestas').insert({
        sesion,
        etapa,
        riesgo,
        nombre,
        empresa,
        experiencia,
        impacto: r.impacto || 0,
        frecuencia: r.frecuencia || 0,
        importancia_impacto: r.importancia_impacto || 0,
        importancia_frecuencia: r.importancia_frecuencia || 0,
        score_base: r.score_base || 0,
        score_final: r.score_final || 0
      });
    }
    alert('Respuestas enviadas con éxito');
  };

  if (mostrarFormulario) {
    return (
      <div
        style={{
          backgroundImage: 'url(/proyecto.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
        }}
      >
        <div style={{
          backgroundColor: 'rgba(255,255,255,0.9)',
          borderRadius: '15px',
          padding: '30px',
          maxWidth: '600px',
          width: '100%',
          textAlign: 'center',
        }}>
          <h2 style={{ fontWeight: 700 }}>P6 – Proyecto Riesgos</h2>
          <input placeholder="Nombre completo" value={nombre} onChange={(e) => setNombre(e.target.value)} style={inputStyle} />
          <input placeholder="Empresa" value={empresa} onChange={(e) => setEmpresa(e.target.value)} style={inputStyle} />
          <input placeholder="Años de experiencia" value={experiencia} onChange={(e) => setExperiencia(e.target.value)} style={inputStyle} />
          <select value={etapa} onChange={(e) => setEtapa(e.target.value)} style={inputStyle}>
            <option value="">Seleccione la etapa</option>
            {etapasProyecto.map((etapa) => (
              <option key={etapa} value={etapa}>{etapa}</option>
            ))}
          </select>
          <button onClick={() => setMostrarFormulario(false)} style={buttonStyle}>
            Comenzar evaluación
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundImage: 'url(/proyecto.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '100vh',
        padding: '40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Poppins', sans-serif",
      }}
    >
      <div style={{
        backgroundColor: 'rgba(255,255,255,0.9)',
        borderRadius: '15px',
        padding: '30px',
        width: '90%',
        maxWidth: '800px',
        textAlign: 'center',
      }}>
        <h2>Riesgos para la etapa: {etapa}</h2>
        {riesgos.map((riesgo, index) => (
          <details key={index} style={{ marginBottom: '20px', textAlign: 'left' }}>
            <summary><strong>{riesgo}</strong></summary>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '10px' }}>
              <label>Impacto (1–5):<br />
                <input type="number" min="1" max="5" value={respuestas[riesgo]?.impacto || ''} onChange={(e) => handleChange(riesgo, 'impacto', e.target.value)} style={inputBox} />
              </label>
              <label>Frecuencia (1–5):<br />
                <input type="number" min="1" max="5" value={respuestas[riesgo]?.frecuencia || ''} onChange={(e) => handleChange(riesgo, 'frecuencia', e.target.value)} style={inputBox} />
              </label>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '10px' }}>
              <label>% Imp. Impacto (0–100%):<br />
                <input type="number" min="0" max="100" value={respuestas[riesgo]?.importancia_impacto || ''} onChange={(e) => handleChange(riesgo, 'importancia_impacto', e.target.value)} style={inputBox} />
              </label>
              <label>% Imp. Frecuencia (0–100%):<br />
                <input type="number" min="0" max="100" value={respuestas[riesgo]?.importancia_frecuencia || ''} onChange={(e) => handleChange(riesgo, 'importancia_frecuencia', e.target.value)} style={inputBox} />
              </label>
            </div>
            <p><strong>Score Base:</strong> {respuestas[riesgo]?.score_base || 0}</p>
            <p><strong>Score Final:</strong> {respuestas[riesgo]?.score_final || 0}</p>
          </details>
        ))}
        <button onClick={handleSubmit} style={buttonStyle}>
          Enviar respuestas
        </button>
      </div>
    </div>
  );
}

const inputStyle = {
  marginBottom: '15px',
  padding: '10px',
  width: '100%',
  fontSize: '16px',
  borderRadius: '6px',
  border: '1px solid #ccc'
};

const inputBox = {
  padding: '8px',
  fontSize: '14px',
  width: '150px',
  borderRadius: '5px',
  border: '1px solid #ccc',
  marginTop: '5px'
};

const buttonStyle = {
  marginTop: '20px',
  backgroundColor: '#007bff',
  color: 'white',
  padding: '12px 20px',
  border: 'none',
  borderRadius: '6px',
  fontSize: '16px',
  fontWeight: '600',
  cursor: 'pointer'
};

export default Participante;
