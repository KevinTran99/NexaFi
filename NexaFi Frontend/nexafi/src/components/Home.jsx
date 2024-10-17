import React from 'react';
import '../styles/home.css';

const Home = () => {
  return (
    <section id="home" className="home-section">
      <div className="home-content">
        <video autoPlay loop muted className="background-video">
          <source src="/environment.mp4" type="video/mp4" />
        </video>
        <header className="overlay-text">
          <h1>Welcome to NexaFi</h1>
          <p className="tagline">The nexus for tokenizing environmental assets</p>
        </header>
      </div>
    </section>
  );
};

export default Home;
