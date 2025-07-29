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
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundImage: "url('/proyecto.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <h1 style={{ fontSize: '3rem', fontWeight: 'bold', color: '#fff', marginBottom: '1rem' }}>
        Focus Group – Proyecto Riesgos
      </h1>
      <p style={{ fontSize: '1.25rem', color: 'rgba(255,255,255,0.8)', marginBottom: '2rem' }}>
        {dateString}
      </p>
      <Link to="/presentacion">
        <button style={{
          padding: '0.75rem 1.5rem',
          fontSize: '1rem',
          backgroundColor: '#1E90FF',
          color: '#fff',
          border: 'none',
          borderRadius: '0.5rem',
          cursor: 'pointer'
        }}>
          Ingresar
        </button>
      </Link>
    </div>
  )
}
