import React from 'react';
import '../styles/navbar.css';

const Navbar = () => {
  return (
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
  );
};

export default Navbar;
