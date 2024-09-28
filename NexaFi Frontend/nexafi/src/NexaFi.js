import React from 'react';
import './styles/nav.css';
import Home from './components/Home';
import Vision from './components/Vision';

const NexaFi = () => {
  return (
    <div>
      <nav>
        <ul>
          <li>
            <a href="#home">Home</a>
          </li>
          <li>
            <a href="#vision">Vision</a>
          </li>
          <li>
            <a href="#footer">Team</a>
          </li>
        </ul>
      </nav>

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
