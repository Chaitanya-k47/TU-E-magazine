// src/components/Footer.jsx
import React from 'react';

function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 text-center text-gray-500">
        <p>© {new Date().getFullYear()} Tezpur University. All rights reserved.</p>
        <p className="mt-1 text-sm">
          {/* Add any relevant links here, e.g., University Website, Contact */}
          <a href="http://www.tezu.ernet.in/" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">
            University Website
          </a>
        </p>
      </div>
    </footer>
  );
}

export default Footer;