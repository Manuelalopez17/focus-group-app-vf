import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Home() {
  const [selectedSession, setSelectedSession] = useState('');
  const navigate = useNavigate();

  const handleNavigation = () => {
    if (selectedSession) {
      navigate(`/participante?sesion=${selectedSession}`);
    } else {
      alert('Por favor selecciona una sesión.');
    }
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
        padding: '20px',
      }}
    >
      <div
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.6)',
          backdropFilter: 'blur(10px)',
          padding: '40px',
          borderRadius: '15px',
          textAlign: 'center',
          width: '100%',
          maxWidth: '600px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
        }}
      >
        <h2 style={{ marginBottom: '10px', fontWeight: 700, fontSize: '28px' }}>FOCUS GROUP</h2>
        <h2 style={{ marginBottom: '10px', fontWeight: 600, fontSize: '24px' }}>P6 – Proyecto Riesgos</h2>
        <p style={{ marginBottom: '20px', fontSize: '16px' }}>
          Evaluación de riesgos en construcción industrializada en madera
        </p>
        <select
          value={selectedSession}
          onChange={(e) => setSelectedSession(e.target.value)}
          style={{
            padding: '12px',
            fontSize: '16px',
            borderRadius: '6px',
            marginBottom: '20px',
            width: '100%',
            border: '1px solid #ccc',
          }}
        >
          <option value="">Selecciona una sesión</option>
          <option value="1.1">Sesión 1.1</option>
          <option value="1.2">Sesión 1.2</option>
          <option value="2.1">Sesión 2.1</option>
          <option value="2.2">Sesión 2.2</option>
          <option value="3.1">Sesión 3.1</option>
          <option value="3.2">Sesión 3.2</option>
          <option value="simulacion">Simulación</option>
        </select>
        <br />
        <button
          onClick={handleNavigation}
          style={{
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            padding: '12px 20px',
            fontSize: '16px',
            fontWeight: '600',
            borderRadius: '6px',
            cursor: 'pointer',
            width: '100%',
            transition: 'background-color 0.3s',
          }}
          onMouseOver={(e) => (e.target.style.backgroundColor = '#0056b3')}
          onMouseOut={(e) => (e.target.style.backgroundColor = '#007bff')}
        >
          Participar en Sesión
        </button>
      </div>
    </div>
  );
}

export default Home;
