// src/Pages/LandingPage.jsx
import React from 'react'
import { Link } from 'react-router-dom'

export default function LandingPage() {
  const today = new Date()
  const options = { day: 'numeric', month: 'long', year: 'numeric' }
  const dateString = today.toLocaleDateString('es-ES', options)

  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundImage: "url('/proyecto.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Recuadro semitransparente */}
      <div
        style={{
          backgroundColor: 'rgba(0,0,0,0.6)',
          padding: '2rem 3rem',
          borderRadius: '1rem',
          textAlign: 'center',
          maxWidth: '90%',
        }}
      >
        <h1
          style={{
            fontSize: '4rem',        // Más grande
            fontWeight: 700,
            color: '#fff',
            marginBottom: '1rem',
            lineHeight: 1.2,
            textShadow: '4px 4px 8px rgba(0,0,0,0.8)'  // Sombreado
          }}
        >
          Focus Group – Proyecto Riesgos
        </h1>
        <p
          style={{
            fontSize: '1.5rem',    // Texto más grande
            color: 'rgba(255,255,255,0.9)',
            marginBottom: '2rem',
            fontWeight: 400,
            textShadow: '2px 2px 4px rgba(0,0,0,0.7)'  // Sombreado ligero
          }}
        >
          {dateString}
        </p>
        <Link to="/presentacion">
          <button
            style={{
              padding: '0.75rem 1.5rem',
              fontSize: '1rem',
              backgroundColor: '#1E90FF',
              color: '#fff',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
              fontWeight: 500,
            }}
            onMouseOver={e => e.currentTarget.style.backgroundColor = '#1C86EE'}
            onMouseOut={e => e.currentTarget.style.backgroundColor = '#1E90FF'}
          >
            Ingresar
          </button>
        </Link>
      </div>
    </div>
  )
}
