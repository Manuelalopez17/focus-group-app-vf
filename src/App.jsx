// src/App.jsx
import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import LandingPage  from './Pages/LandingPage'
import Presentacion from './Pages/Presentacion'
import Home         from './Pages/Home'
import Participante from './Pages/Participante'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 1. Pantalla de bienvenida */}
        <Route path="/" element={<LandingPage />} />

        {/* 2. Rutas existentes */}
        <Route path="/presentacion" element={<Presentacion />} />
        <Route path="/home"          element={<Home />} />
        <Route path="/participante"  element={<Participante />} />

        {/* 3. Fallback vuelve al landing */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}


