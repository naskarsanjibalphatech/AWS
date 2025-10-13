import React from 'react';
import { Activity } from 'lucide-react';

const LiveData = ({ realtimeRef, darkMode, energyData, thresholdData, alertStatus }) => {
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
          {/* Voltage R */}
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

          {/* Voltage Y */}
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

          {/* Voltage B */}
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

      {/* 2. Currents - WITH ALERT BLINKING (SINGLE DOT) */}
      <div className="space-y-4">
        <h3 className={`text-lg font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Currents</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* ⭐ Current R - SINGLE DOT ALERT */}
          <div className={`relative rounded-2xl p-8 transform hover:scale-105 transition-all duration-300 cursor-pointer ${
            alertStatus?.I_RPhase
              ? 'border-red-600 animate-pulse bg-red-100 dark:bg-red-900/30'
              : darkMode 
                ? 'bg-gradient-to-br from-gray-800 via-gray-750 to-gray-700 border border-gray-600 shadow-2xl' 
                : 'bg-white border border-gray-200'
          }`}
          style={{
            boxShadow: alertStatus?.I_RPhase
              ? '0 0 30px rgba(239, 68, 68, 0.8)'
              : darkMode 
                ? '0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.05)' 
                : '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(0, 0, 0, 0.05)'
          }}>
            {/* Alert Banner */}
            {alertStatus?.I_RPhase && (
              <div className="absolute top-0 left-0 right-0 bg-red-600 text-white text-xs font-bold py-1 px-3 rounded-t-2xl text-center animate-pulse">
                ⚠️ ALERT
              </div>
            )}
            
            <div className={`flex items-center justify-between ${alertStatus?.I_RPhase ? 'mt-4' : ''}`}>
              <div>
                <p className={`text-sm font-medium ${
                  alertStatus?.I_RPhase ? 'text-red-600 font-bold' : darkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Current R-Phase
                </p>
                <p className={`text-3xl font-bold mt-2 ${
                  alertStatus?.I_RPhase ? 'text-red-600' : darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {energyData.currentR !== null ? `${energyData.currentR.toFixed(2)}` : '--'}
                </p>
                <p className={`text-xs font-medium mt-1 ${
                  alertStatus?.I_RPhase ? 'text-red-600' : darkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Amperes
                </p>
                {thresholdData?.I_RPhase && (
                  <p className={`text-xs mt-2 ${
                    alertStatus?.I_RPhase ? 'text-red-600 font-bold' : darkMode ? 'text-gray-500' : 'text-gray-600'
                  }`}>
                    Threshold: {thresholdData.I_RPhase} A
                  </p>
                )}
              </div>
              
              {/* Top-right dot - HIDDEN during alert */}
              {!alertStatus?.I_RPhase && (
                <div className={`w-4 h-4 rounded-full shadow-lg ${
                  darkMode ? 'bg-gray-400 animate-pulse' : 'bg-gray-500 animate-pulse'
                }`}></div>
              )}
            </div>
            
            {/* Bottom-right corner dot - ONLY during alert */}
            {alertStatus?.I_RPhase && (
              <div className="absolute bottom-3 right-3">
                <div className="h-4 w-4 bg-red-600 rounded-full animate-pulse"></div>
              </div>
            )}
          </div>

          {/* ⭐ Current Y - SINGLE DOT ALERT */}
          <div className={`relative rounded-2xl p-8 transform hover:scale-105 transition-all duration-300 cursor-pointer ${
            alertStatus?.I_YPhase
              ? 'border-yellow-600 animate-pulse bg-yellow-100 dark:bg-yellow-900/30'
              : darkMode 
                ? 'bg-gradient-to-br from-gray-800 via-gray-750 to-gray-700 border border-gray-600 shadow-2xl' 
                : 'bg-white border border-gray-200'
          }`}
          style={{
            boxShadow: alertStatus?.I_YPhase
              ? '0 0 30px rgba(234, 179, 8, 0.8)'
              : darkMode 
                ? '0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.05)' 
                : '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(0, 0, 0, 0.05)'
          }}>
            {alertStatus?.I_YPhase && (
              <div className="absolute top-0 left-0 right-0 bg-yellow-600 text-white text-xs font-bold py-1 px-3 rounded-t-2xl text-center animate-pulse">
                ⚠️ ALERT
              </div>
            )}
            
            <div className={`flex items-center justify-between ${alertStatus?.I_YPhase ? 'mt-4' : ''}`}>
              <div>
                <p className={`text-sm font-medium ${
                  alertStatus?.I_YPhase ? 'text-yellow-600 font-bold' : darkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Current Y-Phase
                </p>
                <p className={`text-3xl font-bold mt-2 ${
                  alertStatus?.I_YPhase ? 'text-yellow-600' : darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {energyData.currentY !== null ? `${energyData.currentY.toFixed(2)}` : '--'}
                </p>
                <p className={`text-xs font-medium mt-1 ${
                  alertStatus?.I_YPhase ? 'text-yellow-600' : darkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Amperes
                </p>
                {thresholdData?.I_YPhase && (
                  <p className={`text-xs mt-2 ${
                    alertStatus?.I_YPhase ? 'text-yellow-600 font-bold' : darkMode ? 'text-gray-500' : 'text-gray-600'
                  }`}>
                    Threshold: {thresholdData.I_YPhase} A
                  </p>
                )}
              </div>
              
              {!alertStatus?.I_YPhase && (
                <div className={`w-4 h-4 rounded-full shadow-lg ${
                  darkMode ? 'bg-gray-400 animate-pulse' : 'bg-gray-500 animate-pulse'
                }`}></div>
              )}
            </div>
            
            {alertStatus?.I_YPhase && (
              <div className="absolute bottom-3 right-3">
                <div className="h-4 w-4 bg-yellow-600 rounded-full animate-pulse"></div>
              </div>
            )}
          </div>

          {/* ⭐ Current B - SINGLE DOT ALERT */}
          <div className={`relative rounded-2xl p-8 transform hover:scale-105 transition-all duration-300 cursor-pointer ${
            alertStatus?.I_BPhase
              ? 'border-blue-600 animate-pulse bg-blue-100 dark:bg-blue-900/30'
              : darkMode 
                ? 'bg-gradient-to-br from-gray-800 via-gray-750 to-gray-700 border border-gray-600 shadow-2xl' 
                : 'bg-white border border-gray-200'
          }`}
          style={{
            boxShadow: alertStatus?.I_BPhase
              ? '0 0 30px rgba(59, 130, 246, 0.8)'
              : darkMode 
                ? '0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.05)' 
                : '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(0, 0, 0, 0.05)'
          }}>
            {alertStatus?.I_BPhase && (
              <div className="absolute top-0 left-0 right-0 bg-blue-600 text-white text-xs font-bold py-1 px-3 rounded-t-2xl text-center animate-pulse">
                ⚠️ ALERT
              </div>
            )}
            
            <div className={`flex items-center justify-between ${alertStatus?.I_BPhase ? 'mt-4' : ''}`}>
              <div>
                <p className={`text-sm font-medium ${
                  alertStatus?.I_BPhase ? 'text-blue-600 font-bold' : darkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Current B-Phase
                </p>
                <p className={`text-3xl font-bold mt-2 ${
                  alertStatus?.I_BPhase ? 'text-blue-600' : darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {energyData.currentB !== null ? `${energyData.currentB.toFixed(2)}` : '--'}
                </p>
                <p className={`text-xs font-medium mt-1 ${
                  alertStatus?.I_BPhase ? 'text-blue-600' : darkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Amperes
                </p>
                {thresholdData?.I_BPhase && (
                  <p className={`text-xs mt-2 ${
                    alertStatus?.I_BPhase ? 'text-blue-600 font-bold' : darkMode ? 'text-gray-500' : 'text-gray-600'
                  }`}>
                    Threshold: {thresholdData.I_BPhase} A
                  </p>
                )}
              </div>
              
              {!alertStatus?.I_BPhase && (
                <div className={`w-4 h-4 rounded-full shadow-lg ${
                  darkMode ? 'bg-gray-400 animate-pulse' : 'bg-gray-500 animate-pulse'
                }`}></div>
              )}
            </div>
            
            {alertStatus?.I_BPhase && (
              <div className="absolute bottom-3 right-3">
                <div className="h-4 w-4 bg-blue-600 rounded-full animate-pulse"></div>
              </div>
            )}
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
