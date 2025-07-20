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
        backgroundImage: 'url(/proyecto.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        height: '100vh',
        width: '100vw',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
      }}
    >
      {/* Logos superiores */}
      <div
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          padding: '20px',
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
        }}
      >
        <img src="/96f674c7-242e-4c71-891f-081e925015be.png" alt="AdMadera" style={{ height: '60px' }} />
        <img src="/7dc4942f-8f73-47ed-954b-82c5390a0e2d.png" alt="Territoria" style={{ height: '50px' }} />
        <img src="/24e60a3e-66ce-4b95-a6c4-3c06ba139f23.png" alt="CENAMAD" style={{ height: '50px' }} />
      </div>

      {/* Contenido central */}
      <div
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          padding: '40px',
          borderRadius: '15px',
          textAlign: 'center',
          width: '90%',
          maxWidth: '600px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          marginTop: '40px',
        }}
      >
        <h2 style={{ marginBottom: '10px' }}>FOCUS GROUP </h2>
        <h2 style={{ marginBottom: '10px' }}> P6  Proyecto Riesgos</h2>
        <p style={{ marginBottom: '20px' }}>
          Evaluación de riesgos en construcción industrializada en madera
        </p>
        <select
          value={selectedSession}
          onChange={(e) => setSelectedSession(e.target.value)}
          style={{
            padding: '10px',
            fontSize: '16px',
            borderRadius: '5px',
            marginBottom: '20px',
            width: '100%',
          }}
        >
          <option value="">Selecciona una sesión</option>
          <option value="1">Sesión 1.1</option>
          <option value="1">Sesión 1.2</option>
          <option value="2">Sesión 2.1</option>
          <option value="2">Sesión 2.2</option>
          <option value="2">Sesión 3.1</option>
          <option value="2">Sesión 3.2</option>
          <option value="simulacion">Simulación</option>
        </select>
        <br />
        <button
          onClick={handleNavigation}
          style={{
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            fontSize: '16px',
            borderRadius: '5px',
            cursor: 'pointer',
            width: '100%',
          }}
        >
          Participar en Sesión
        </button>
      </div>
    </div>
  );
}

export default Home;

