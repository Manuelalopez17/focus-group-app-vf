import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Presentacion from './Pages/Presentacion'
import Home from './Pages/Home'
import Participante from './Pages/Participante'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/presentacion" replace />} />
        <Route path="/presentacion" element={<Presentacion />} />
        <Route path="/home" element={<Home />} />
        <Route path="/participante" element={<Participante />} />
        <Route path="*" element={<Navigate to="/presentacion" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

