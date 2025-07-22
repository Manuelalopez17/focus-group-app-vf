// src/App.jsx
import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

// rutas a tus páginas
import Presentacion from './Pages/Presentacion.jsx'
import Home          from './Pages/Home.jsx'
// Participante está en src/assets/components
import Participante  from './assets/components/Participante.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/presentacion" replace />} />
        <Route path="/presentacion" element={<Presentacion />} />
        <Route path="/home"          element={<Home />} />
        <Route path="/participante"  element={<Participante />} />
        <Route path="*"              element={<Navigate to="/presentacion" replace />} />
      </Routes>
    </BrowserRouter>
  )
}


