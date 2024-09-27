import React from 'react';

const Home = () => {
  return (
    <div className="home-content">
      <video autoPlay loop muted className="background-video">
        <source src="/environment.mp4" type="video/mp4" />
      </video>
      <div className="overlay-text">
        <h1>Welcome to NexaFi</h1>
        <p className="tagline">The nexus for tokenizing real assets</p>
      </div>
    </div>
  );
};

export default Home;
