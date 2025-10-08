import React from 'react';
import { Activity } from 'lucide-react';

const LiveData = ({ realtimeRef, darkMode, energyData }) => {
  return (
    <section ref={realtimeRef} className="space-y-6">
      <div className="flex items-center space-x-3">
        <Activity className="h-6 w-6 text-blue-600" />
        <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Real Time Data</h2>
      </div>

      {/* A. Voltages */}
      <div className="space-y-4">
        <h3 className={`text-lg font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Voltages</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Voltage R - Unitone White/Gray */}
          <div className={`relative rounded-2xl p-8 transform hover:scale-105 transition-all duration-300 cursor-pointer ${
            darkMode 
              ? 'bg-gradient-to-br from-gray-800 via-gray-750 to-gray-700 border border-gray-600 shadow-2xl' 
              : 'bg-white border border-gray-200'
          }`}
          style={{
            boxShadow: darkMode 
              ? '0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.05)' 
              : '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(0, 0, 0, 0.05)'
          }}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Voltage R-Phase</p>
                <p className={`text-3xl font-bold mt-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {energyData.voltageR !== null ? `${energyData.voltageR.toFixed(2)}` : '--'}
                </p>
                <p className={`text-xs font-medium mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Volts</p>
              </div>
              <div className={`w-4 h-4 rounded-full shadow-lg animate-pulse ${darkMode ? 'bg-gray-400' : 'bg-gray-500'}`}></div>
            </div>
          </div>

          {/* Voltage Y - Unitone White/Gray */}
          <div className={`relative rounded-2xl p-8 transform hover:scale-105 transition-all duration-300 cursor-pointer ${
            darkMode 
              ? 'bg-gradient-to-br from-gray-800 via-gray-750 to-gray-700 border border-gray-600 shadow-2xl' 
              : 'bg-white border border-gray-200'
          }`}
          style={{
            boxShadow: darkMode 
              ? '0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.05)' 
              : '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(0, 0, 0, 0.05)'
          }}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Voltage Y-Phase</p>
                <p className={`text-3xl font-bold mt-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {energyData.voltageY !== null ? `${energyData.voltageY.toFixed(2)}` : '--'}
                </p>
                <p className={`text-xs font-medium mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Volts</p>
              </div>
              <div className={`w-4 h-4 rounded-full shadow-lg animate-pulse ${darkMode ? 'bg-gray-400' : 'bg-gray-500'}`}></div>
            </div>
          </div>

          {/* Voltage B - Unitone White/Gray */}
          <div className={`relative rounded-2xl p-8 transform hover:scale-105 transition-all duration-300 cursor-pointer ${
            darkMode 
              ? 'bg-gradient-to-br from-gray-800 via-gray-750 to-gray-700 border border-gray-600 shadow-2xl' 
              : 'bg-white border border-gray-200'
          }`}
          style={{
            boxShadow: darkMode 
              ? '0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.05)' 
              : '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(0, 0, 0, 0.05)'
          }}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Voltage B-Phase</p>
                <p className={`text-3xl font-bold mt-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {energyData.voltageB !== null ? `${energyData.voltageB.toFixed(2)}` : '--'}
                </p>
                <p className={`text-xs font-medium mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Volts</p>
              </div>
              <div className={`w-4 h-4 rounded-full shadow-lg animate-pulse ${darkMode ? 'bg-gray-400' : 'bg-gray-500'}`}></div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Currents */}
      <div className="space-y-4">
        <h3 className={`text-lg font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Currents</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Current R - Unitone White/Gray */}
          <div className={`relative rounded-2xl p-8 transform hover:scale-105 transition-all duration-300 cursor-pointer ${
            darkMode 
              ? 'bg-gradient-to-br from-gray-800 via-gray-750 to-gray-700 border border-gray-600 shadow-2xl' 
              : 'bg-white border border-gray-200'
          }`}
          style={{
            boxShadow: darkMode 
              ? '0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.05)' 
              : '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(0, 0, 0, 0.05)'
          }}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Current R-Phase</p>
                <p className={`text-3xl font-bold mt-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {energyData.currentR !== null ? `${energyData.currentR.toFixed(2)}` : '--'}
                </p>
                <p className={`text-xs font-medium mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Amperes</p>
              </div>
              <div className={`w-4 h-4 rounded-full shadow-lg animate-pulse ${darkMode ? 'bg-gray-400' : 'bg-gray-500'}`}></div>
            </div>
          </div>

          {/* Current Y - Unitone White/Gray */}
          <div className={`relative rounded-2xl p-8 transform hover:scale-105 transition-all duration-300 cursor-pointer ${
            darkMode 
              ? 'bg-gradient-to-br from-gray-800 via-gray-750 to-gray-700 border border-gray-600 shadow-2xl' 
              : 'bg-white border border-gray-200'
          }`}
          style={{
            boxShadow: darkMode 
              ? '0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.05)' 
              : '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(0, 0, 0, 0.05)'
          }}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Current Y-Phase</p>
                <p className={`text-3xl font-bold mt-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {energyData.currentY !== null ? `${energyData.currentY.toFixed(2)}` : '--'}
                </p>
                <p className={`text-xs font-medium mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Amperes</p>
              </div>
              <div className={`w-4 h-4 rounded-full shadow-lg animate-pulse ${darkMode ? 'bg-gray-400' : 'bg-gray-500'}`}></div>
            </div>
          </div>

          {/* Current B - Unitone White/Gray */}
          <div className={`relative rounded-2xl p-8 transform hover:scale-105 transition-all duration-300 cursor-pointer ${
            darkMode 
              ? 'bg-gradient-to-br from-gray-800 via-gray-750 to-gray-700 border border-gray-600 shadow-2xl' 
              : 'bg-white border border-gray-200'
          }`}
          style={{
            boxShadow: darkMode 
              ? '0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.05)' 
              : '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(0, 0, 0, 0.05)'
          }}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Current B-Phase</p>
                <p className={`text-3xl font-bold mt-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {energyData.currentB !== null ? `${energyData.currentB.toFixed(2)}` : '--'}
                </p>
                <p className={`text-xs font-medium mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Amperes</p>
              </div>
              <div className={`w-4 h-4 rounded-full shadow-lg animate-pulse ${darkMode ? 'bg-gray-400' : 'bg-gray-500'}`}></div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Energy Consumed */}
      <div className="space-y-4">
        <h3 className={`text-lg font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Energy Consumed</h3>
        <div className="grid grid-cols-1 md:grid-cols-1 gap-6 max-w-md">
          <div className={`relative rounded-2xl p-8 transform hover:scale-105 transition-all duration-300 cursor-pointer ${
            darkMode 
              ? 'bg-gradient-to-br from-gray-800 via-gray-750 to-gray-700 border border-gray-600 shadow-2xl' 
              : 'bg-white border border-gray-200'
          }`}
          style={{
            boxShadow: darkMode 
              ? '0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.05)' 
              : '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(0, 0, 0, 0.05)'
          }}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Total Energy</p>
                <p className={`text-4xl font-bold mt-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {energyData.kwh !== null ? `${energyData.kwh.toFixed(2)}` : '--'}
                </p>
                <p className={`text-xs font-medium mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>kWh</p>
              </div>
              <div className={`w-5 h-5 rounded-full shadow-lg animate-pulse ${darkMode ? 'bg-gray-400' : 'bg-gray-500'}`}></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LiveData;
