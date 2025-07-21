import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Presentacion from './Pages/Presentacion';
import Login from './Pages/Login';
import Home from './Pages/Home';
import Participante from './assets/components/Participante';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/presentacion" replace />} />
        <Route path="/presentacion" element={<Presentacion />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/participante" element={<Participante />} />
        {/* Ruta comodín a presentación */}
        <Route path="*" element={<Navigate to="/presentacion" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

