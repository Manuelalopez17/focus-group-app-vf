import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const Participante = () => {
  const location = useLocation();
  const sesion = new URLSearchParams(location.search).get('sesion');

  const [nombre, setNombre] = useState('');
  const [empresa, setEmpresa] = useState('');
  const [experiencia, setExperiencia] = useState('');
  const [etapa, setEtapa] = useState('');
  const [mostrarEvaluacion, setMostrarEvaluacion] = useState(false);

  // Riesgos de ejemplo
  const riesgos = [
    `Ejemplo de riesgo 1 para ${etapa}`,
    `Ejemplo de riesgo 2 para ${etapa}`,
    `Ejemplo de riesgo 3 para ${etapa}`,
  ];

  const [respuestas, setRespuestas] = useState({});

  const handleChange = (index, field, value) => {
    const updated = { ...respuestas };
    if (!updated[index]) updated[index] = {};
    updated[index][field] = value;
    setRespuestas(updated);
  };

  return (
    <div
      style={{
        backgroundImage: 'url("/proyecto.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px',
        fontFamily: 'Poppins, sans-serif',
      }}
    >
      {!mostrarEvaluacion ? (
        <div
          style={{
            backgroundColor: 'rgba(255,255,255,0.85)',
            padding: '40px',
            borderRadius: '20px',
            width: '100%',
            maxWidth: '600px',
            textAlign: 'center',
          }}
        >
          <h2 style={{ fontWeight: '700', marginBottom: '20px' }}>P6 – Proyecto Riesgos</h2>
          <input
            type="text"
            placeholder="Nombre completo"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            style={inputStyle}
          />
          <input
            type="text"
            placeholder="Empresa"
            value={empresa}
            onChange={(e) => setEmpresa(e.target.value)}
            style={inputStyle}
          />
          <input
            type="number"
            placeholder="Años de experiencia"
            value={experiencia}
            onChange={(e) => setExperiencia(e.target.value)}
            style={inputStyle}
          />
          <select value={etapa} onChange={(e) => setEtapa(e.target.value)} style={inputStyle}>
            <option value="">Seleccione la etapa</option>
            <option value="Abastecimiento">Abastecimiento</option>
            <option value="Diseño">Diseño</option>
            <option value="Construcción">Construcción</option>
            {/* Agrega más etapas si es necesario */}
          </select>
          <button
            onClick={() => setMostrarEvaluacion(true)}
            style={buttonStyle}
          >
            Comenzar evaluación
          </button>
        </div>
      ) : (
        <div
          style={{
            backgroundColor: 'rgba(255,255,255,0.85)',
            padding: '40px',
            borderRadius: '20px',
            width: '100%',
            maxWidth: '800px',
            textAlign: 'center',
          }}
        >
          <h2 style={{ fontWeight: '700', marginBottom: '20px' }}>
            Riesgos para la etapa: {etapa}
          </h2>

          {riesgos.map((riesgo, index) => (
            <details key={index} style={{ marginBottom: '20px', textAlign: 'left' }}>
              <summary style={{ fontWeight: '600', cursor: 'pointer' }}>{riesgo}</summary>
              <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                  <div>
                    <label>Impacto (1–5):</label>
                    <input
                      type="number"
                      min="1"
                      max="5"
                      value={respuestas[index]?.impacto || ''}
                      onChange={(e) => handleChange(index, 'impacto', e.target.value)}
                      style={inputField}
                    />
                  </div>
                  <div>
                    <label>Frecuencia (1–5):</label>
                    <input
                      type="number"
                      min="1"
                      max="5"
                      value={respuestas[index]?.frecuencia || ''}
                      onChange={(e) => handleChange(index, 'frecuencia', e.target.value)}
                      style={inputField}
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                  <div>
                    <label>% Imp. Impacto (0–100%):</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={respuestas[index]?.importanciaImpacto || ''}
                      onChange={(e) => handleChange(index, 'importanciaImpacto', e.target.value)}
                      style={inputField}
                    />
                  </div>
                  <div>
                    <label>% Imp. Frecuencia (0–100%):</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={respuestas[index]?.importanciaFrecuencia || ''}
                      onChange={(e) => handleChange(index, 'importanciaFrecuencia', e.target.value)}
                      style={inputField}
                    />
                  </div>
                </div>
              </div>
              <p style={{ marginTop: '10px' }}>
                Score Base: 0 <br />
                Score Final: 0
              </p>
            </details>
          ))}

          <button style={buttonStyle}>Enviar respuestas</button>
        </div>
      )}
    </div>
  );
};

const inputStyle = {
  width: '100%',
  padding: '10px',
  marginBottom: '15px',
  fontSize: '16px',
  borderRadius: '6px',
  border: '1px solid #ccc',
};

const inputField = {
  width: '200px',
  padding: '8px',
  fontSize: '14px',
  borderRadius: '6px',
  border: '1px solid #ccc',
};

const buttonStyle = {
  backgroundColor: '#007bff',
  color: 'white',
  border: 'none',
  padding: '12px 20px',
  fontSize: '16px',
  fontWeight: '600',
  borderRadius: '6px',
  cursor: 'pointer',
  marginTop: '20px',
};

export default Participante;
