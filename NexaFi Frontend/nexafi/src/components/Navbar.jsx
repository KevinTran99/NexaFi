import React from 'react';
import '../styles/navbar.css';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="nav-section">
      <div className="nav-content">
        <h3>NexaFi</h3>

        <ul className="nav-links">
          <li className="nav-item">
            <a href="#home">Home</a>
          </li>

          <li className="nav-item">
            <a href="#vision">Vision</a>
          </li>

          <li className="nav-item">
            <a href="#howItWorks">How It Works</a>
          </li>

          <li className="nav-item">
            <a href="#benefits">Benefits</a>
          </li>

          <li className="nav-item">
            <a href="#partners">Partners</a>
          </li>

          <li className="nav-item">
            <a href="#team">Team</a>
          </li>
        </ul>

        <Link to={'nexafihub'} className="hub-link">
          Explore NexaFi Hub
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
