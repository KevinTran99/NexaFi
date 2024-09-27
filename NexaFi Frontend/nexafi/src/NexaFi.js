import React from 'react';
import Home from './components/Home';

const NexaFi = () => {
  return (
    <div>
      <nav>
        <ul>
          <li>
            <a href="#home">Home</a>
          </li>
          <li>
            <a href="#about">Vision</a>
          </li>
          <li>
            <a href="#footer">Team</a>
          </li>
        </ul>
      </nav>

      <section id="home" className="home-section">
        <Home />
      </section>
    </div>
  );
};

export default NexaFi;
