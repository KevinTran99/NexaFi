import React from 'react';
import Navbar from './components/Navbar';
import Home from './components/Home';
import Vision from './components/Vision';

const NexaFi = () => {
  return (
    <div>
      <Navbar />

      <section id="home" className="home-section">
        <Home />
      </section>

      <section id="vision" className="vision-section">
        <Vision />
      </section>
    </div>
  );
};

export default NexaFi;
