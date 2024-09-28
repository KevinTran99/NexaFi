import React from 'react';

const Vision = () => {
  return (
    <div className="vision-content">
      <div className="vision-header">
        <h1>Our</h1>
        <h1>Vision</h1>
      </div>

      <div className="vision-main">
        <img
          src="/windturbine.jpg"
          alt="Wind turbines generating renewable energy on a lush green field beneath a clear sky"
          className="vision-image"
        />

        <p>
          To empower a sustainable future by creating a transparent and accessible marketplace for tokenized real-world
          assets, beginning with EUAs and EUAAs within the European Union Emissions Trading System (EU ETS). As the
          world transitions toward decarbonization, we bridge the gap between traditional finance and the digital
          economy, enabling businesses and individuals to actively engage in climate action. By tokenizing environmental
          assets, we strive to make climate solutions more inclusive and accessible, driving impactful change toward a
          greener, net-zero future.
        </p>
      </div>
    </div>
  );
};

export default Vision;
