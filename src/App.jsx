import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './assets/Pages/Home';
import Participante from './assets/components/Participante';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/participante" element={<Participante />} />
      </Routes>
    </Router>
  );
}

export default App;


