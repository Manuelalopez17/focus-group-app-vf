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
  const [riesgos, setRiesgos] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(true);
  const [respuestas, setRespuestas] = useState({});

  useEffect(() => {
    if (etapa) {
      // Simulación de carga de riesgos por etapa
      const riesgosEjemplo = [
        `Ejemplo de riesgo 1 para ${etapa}`,
        `Ejemplo de riesgo 2 para ${etapa}`,
        `Ejemplo de riesgo 3 para ${etapa}`,
      ];
      setRiesgos(riesgosEjemplo);
    }
  }, [etapa]);

  const handleChange = (index, campo, valor) => {
    const nuevasRespuestas = { ...respuestas };
    if (!nuevasRespuestas[index]) {
      nuevasRespuestas[index] = {};
    }
    nuevasRespuestas[index][campo] = valor;

    const impacto = parseFloat(nuevasRespuestas[index].impacto || 0);
    const frecuencia = parseFloat(nuevasRespuestas[index].frecuencia || 0);
    const impImpacto = parseFloat(nuevasRespuestas[index].importancia_impacto || 0);
    const impFrecuencia = parseFloat(nuevasRespuestas[index].importancia_frecuencia || 0);

    const scoreBase = impacto * frecuencia;
    const scoreFinal = (impacto * (impImpacto / 100)) + (frecuencia * (impFrecuencia / 100));

    nuevasRespuestas[index].score_base = scoreBase.toFixed(2);
    nuevasRespuestas[index].score_final = scoreFinal.toFixed(2);
    setRespuestas(nuevasRespuestas);
  };

  const handleSubmit = async () => {
    for (let i = 0; i < riesgos.length; i++) {
      const r = respuestas[i];
      if (r) {
        await supabase.from('respuestas').insert([{
          sesion,
          etapa,
          riesgo: riesgos[i],
          nombre,
          empresa,
          experiencia,
          impacto: r.impacto || 0,
          frecuencia: r.frecuencia || 0,
          importancia_impacto: r.importancia_impacto || 0,
          importancia_frecuencia: r.importancia_frecuencia || 0,
          score_base: r.score_base || 0,
          score_final: r.score_final || 0,
        }]);
      }
    }
    alert('Respuestas enviadas correctamente.');
    setMostrarFormulario(true);
  };

  return (
    <div
      style={{
        backgroundImage: 'url("/proyecto.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Poppins', sans-serif",
        padding: '30px',
      }}
    >
      <div
        style={{
          backgroundColor: 'rgba(255,255,255,0.8)',
          borderRadius: '16px',
          padding: '40px',
          maxWidth: '900px',
          width: '100%',
          textAlign: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
        }}
      >
        {mostrarFormulario ? (
          <>
            <h2 style={{ marginBottom: '10px' }}>P6 – Proyecto Riesgos</h2>
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
            <select
              value={etapa}
              onChange={(e) => setEtapa(e.target.value)}
              style={inputStyle}
            >
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
            <br />
            <button onClick={() => setMostrarFormulario(false)} style={buttonStyle}>Comenzar evaluación</button>
          </>
        ) : (
          <>
            <h2>Riesgos para la etapa: {etapa}</h2>
            {riesgos.map((riesgo, index) => (
              <details key={index} style={{ marginBottom: '20px', textAlign: 'left' }}>
                <summary><strong>{riesgo}</strong></summary>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '10px' }}>
                  <div>
                    <label>Impacto (1–5):</label><br />
                    <input type="number" min="1" max="5" value={respuestas[index]?.impacto || ''} onChange={(e) => handleChange(index, 'impacto', e.target.value)} />
                  </div>
                  <div>
                    <label>Frecuencia (1–5):</label><br />
                    <input type="number" min="1" max="5" value={respuestas[index]?.frecuencia || ''} onChange={(e) => handleChange(index, 'frecuencia', e.target.value)} />
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '10px' }}>
                  <div>
                    <label>% Imp. Impacto (0–100%):</label><br />
                    <input type="number" min="0" max="100" value={respuestas[index]?.importancia_impacto || ''} onChange={(e) => handleChange(index, 'importancia_impacto', e.target.value)} />
                  </div>
                  <div>
                    <label>% Imp. Frecuencia (0–100%):</label><br />
                    <input type="number" min="0" max="100" value={respuestas[index]?.importancia_frecuencia || ''} onChange={(e) => handleChange(index, 'importancia_frecuencia', e.target.value)} />
                  </div>
                </div>
                <p><strong>Score Base:</strong> {respuestas[index]?.score_base || 0}</p>
                <p><strong>Score Final:</strong> {respuestas[index]?.score_final || 0}</p>
              </details>
            ))}
            <button onClick={handleSubmit} style={buttonStyle}>Enviar respuestas</button>
          </>
        )}
      </div>
    </div>
  );
}

const inputStyle = {
  width: '100%',
  padding: '10px',
  fontSize: '16px',
  marginBottom: '15px',
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
  marginTop: '15px',
};

export default Participante;
