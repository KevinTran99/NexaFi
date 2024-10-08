import React from 'react';
import '../styles/nexafihubnavbar.css';
import { Link } from 'react-router-dom';

const NexaFiHubNavbar = () => {
  return (
    <nav className="nav-section">
      <div className="nav-content">
        <h3>NexaFi Hub</h3>

        <ul className="nav-links">
          <li>
            <Link to={'/nexafihub'} className="hub-nav-item">
              Home
            </Link>
          </li>

          <li>
            <Link to={'/nexafihub/dashboard'} className="hub-nav-item">
              Dashboard
            </Link>
          </li>

          <li>
            <Link to={'/nexafihub/marketplace'} className="hub-nav-item">
              Marketplace
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default NexaFiHubNavbar;
