import React from 'react';

const Footer = ({ darkMode }) => {
  return (
    <footer className={`mt-12 border-t ${
      darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="text-center">
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Developed by{' '}
            <a 
              href="https://alphatechsolutions.in/" 
              target="_blank" 
              rel="noopener noreferrer"
              className={`font-semibold transition-colors ${
                darkMode 
                  ? 'text-blue-400 hover:text-blue-300' 
                  : 'text-blue-600 hover:text-blue-700'
              }`}
            >
              Alphatech Solutions
            </a>
          </p>
          <p className={`text-xs mt-2 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
            © {new Date().getFullYear()} Cloud SCADA | KISWOK Industries
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
