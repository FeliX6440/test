import React, { useState } from "react";
import {
  FaHome,
  FaTachometerAlt,
  FaCloudRain,
  FaInfoCircle,
  FaBars,
} from "react-icons/fa";

const NavBarDash = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="bg-white p-4 shadow-md rounded-md relative mb-2">
      <div className="flex justify-between items-center">
        <FaBars
          className="md:hidden cursor-pointer"
          onClick={() => setMenuOpen(!menuOpen)}
        />
      </div>

      <ul
        className={`absolute left-0 right-0 mt-2 transform origin-top bg-white shadow-lg rounded-md transition-transform ease-out duration-300 overflow-hidden ${
          menuOpen ? "scale-y-100" : "scale-y-0"
        } md:scale-y-100 md:static md:transform-none md:bg-transparent md:shadow-none md:flex md:flex-row md:space-x-6`}
      >
        <li className="flex items-center space-x-2 hover:text-blue-500 transition-colors duration-300 p-2 md:p-0">
          <FaTachometerAlt />
          <a href="/dashboard">Dashboard</a>
        </li>
        <li className="flex items-center space-x-2 hover:text-blue-500 transition-colors duration-300 p-2 md:p-0">
          <FaHome />
          <a href="/">Home</a>
        </li>
        <li className="flex items-center space-x-2 hover:text-blue-500 transition-colors duration-300 p-2 md:p-0">
          <FaCloudRain />
          <a
            href="https://www.rainhackers.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            Rainhackers
          </a>
        </li>
        <li className="flex items-center space-x-2 hover:text-blue-500 transition-colors duration-300 p-2 md:p-0">
          <FaInfoCircle />
          <a href="/about">About</a>
        </li>
      </ul>
    </div>
  );
};

export default NavBarDash;
