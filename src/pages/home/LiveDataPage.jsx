import React from 'react';
import Header from '../../components/Header';
import LiveData from '../../components/LiveData';
import { Wifi, WifiOff } from 'lucide-react';
import Footer from '../../components/Footer';

const LiveDataPage = (props) => {
  const {
    darkMode,
    setDarkMode,
    sidebarOpen,
    setSidebarOpen,
    currentTime,
    energyData,
    deviceOnline,
    lastUpdate,
    error
  } = props;

  const formatDateTime = (timestamp) => {
    if (!timestamp) return 'No data';
    return new Date(timestamp).toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
    }`}>
      <Header 
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        currentTime={currentTime}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium text-red-600 dark:text-red-400">{error}</span>
            </div>
          </div>
        )}

        {/* Status Bar */}
        <div className={`rounded-xl p-4 shadow-lg transform hover:scale-[1.01] transition-all duration-300 ${
          darkMode 
            ? 'bg-gradient-to-r from-gray-800 to-gray-700 border border-gray-600 shadow-gray-900/50' 
            : 'bg-white border border-gray-200 shadow-gray-300/30'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Device Status:
                </span>
                {deviceOnline ? (
                  <div className="flex items-center space-x-2 text-green-500">
                    <Wifi className="h-4 w-4" />
                    <span className="font-medium">Connected</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 text-red-500">
                    <WifiOff className="h-4 w-4" />
                    <span className="font-medium">Disconnected</span>
                  </div>
                )}
              </div>
            </div>
            <div className={`flex items-center space-x-2 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              <span>Last Data:</span>
              <span className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                {lastUpdate ? formatDateTime(lastUpdate) : 'No data received'}
              </span>
            </div>
          </div>
        </div>

        {/* Live Data Component */}
        <LiveData 
          realtimeRef={React.createRef()}
          darkMode={darkMode}
          energyData={energyData}
        />
      </main>
      <Footer darkMode={darkMode} /> {/* ADD THIS */}
    </div>
  );
};

export default LiveDataPage;
