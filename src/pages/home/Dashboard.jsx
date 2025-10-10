import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import LiveTrends from '../../components/LiveTrends';
import { 
  Zap, TrendingUp, ArrowRight,
  Activity, Wifi, WifiOff, Bell
} from 'lucide-react';
import Footer from '../../components/Footer';

const Dashboard = (props) => {
  const {
    darkMode,
    setDarkMode,
    sidebarOpen,
    setSidebarOpen,
    currentTime,
    energyData,
    deviceOnline,
    lastUpdate,
    alertLogData,
    realtimeTrendData,
    realtimeTrendLoading
  } = props;

  const navigate = useNavigate();

  const formatDateTime = (timestamp) => {
    if (!timestamp) return 'No data';
    return new Date(timestamp).toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour12: true
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
        {/* Welcome Section */}
        <div>
          <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Dashboard
          </h1>
          <p className={`mt-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Real-time monitoring and system overview
          </p>
        </div>

{/* Device Status Banner */}
<div className={`rounded-xl p-4 shadow-lg ${
  darkMode 
    ? 'bg-gradient-to-r from-gray-800 to-gray-700 border border-gray-600' 
    : 'bg-white border border-gray-200'
}`}>
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
    <div className="flex items-center space-x-4">
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
    <div className={`flex flex-col sm:flex-row sm:items-center sm:space-x-2 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
      <span>Last Update:</span>
      <span className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
        {lastUpdate ? formatDateTime(lastUpdate) : 'No data received'}
      </span>
    </div>
  </div>
</div>

        {/* Live Data Overview */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Zap className="h-6 w-6 text-blue-600" />
              <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Live System Status
              </h2>
            </div>
            <button
              onClick={() => navigate('/live-data')}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors"
            >
              <span>View Details</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Voltage Stats */}
            <div className={`rounded-xl p-4 ${
              darkMode 
                ? 'bg-gradient-to-br from-gray-800 to-gray-700 border border-gray-600' 
                : 'bg-white border border-gray-200'
            } shadow-lg`}>
              <p className={`text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Avg Voltage
              </p>
              <p className={`text-2xl font-bold mt-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {energyData.voltageR !== null && energyData.voltageY !== null && energyData.voltageB !== null
                  ? ((energyData.voltageR + energyData.voltageY + energyData.voltageB) / 3).toFixed(1)
                  : '--'}
              </p>
              <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Volts</p>
            </div>

            {/* Current Stats */}
            <div className={`rounded-xl p-4 ${
              darkMode 
                ? 'bg-gradient-to-br from-gray-800 to-gray-700 border border-gray-600' 
                : 'bg-white border border-gray-200'
            } shadow-lg`}>
              <p className={`text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Avg Current
              </p>
              <p className={`text-2xl font-bold mt-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {energyData.currentR !== null && energyData.currentY !== null && energyData.currentB !== null
                  ? ((energyData.currentR + energyData.currentY + energyData.currentB) / 3).toFixed(1)
                  : '--'}
              </p>
              <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Amperes</p>
            </div>

            {/* Energy Stats */}
            <div className={`rounded-xl p-4 ${
              darkMode 
                ? 'bg-gradient-to-br from-gray-800 to-gray-700 border border-gray-600' 
                : 'bg-white border border-gray-200'
            } shadow-lg`}>
              <p className={`text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Total Energy
              </p>
              <p className={`text-2xl font-bold mt-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {energyData.kwh !== null ? energyData.kwh.toFixed(2) : '--'}
              </p>
              <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>kWh</p>
            </div>

            {/* Active Alerts */}
            <div className={`rounded-xl p-4 ${
              darkMode 
                ? 'bg-gradient-to-br from-red-900/20 to-gray-700 border border-red-800' 
                : 'bg-red-50 border border-red-200'
            } shadow-lg`}>
              <p className={`text-xs font-medium ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
                Recent Alerts
              </p>
              <p className={`text-2xl font-bold mt-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {alertLogData.length}
              </p>
              <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total</p>
            </div>
          </div>
        </section>

        {/* Live Trends Section */}
<section>
  <LiveTrends 
    realtimeTrendSectionRef={React.createRef()}
    darkMode={darkMode}
    realtimeTrendData={realtimeTrendData}
    realtimeTrendLoading={realtimeTrendLoading}
  />
</section>

        {/* Quick Actions */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => navigate('/alert-log')}
            className={`rounded-xl p-6 text-left transition-transform hover:scale-105 ${
              darkMode 
                ? 'bg-gradient-to-br from-orange-900/30 to-gray-700 border border-orange-800' 
                : 'bg-orange-50 border border-orange-200'
            } shadow-lg`}
          >
            <Bell className="h-8 w-8 text-orange-600 mb-3" />
            <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              View Alert Log
            </h3>
            <p className={`text-sm mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Check alert history and notifications
            </p>
          </button>

          <button
            onClick={() => navigate('/threshold')}
            className={`rounded-xl p-6 text-left transition-transform hover:scale-105 ${
              darkMode 
                ? 'bg-gradient-to-br from-purple-900/30 to-gray-700 border border-purple-800' 
                : 'bg-purple-50 border border-purple-200'
            } shadow-lg`}
          >
            <Activity className="h-8 w-8 text-purple-600 mb-3" />
            <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Configure Thresholds
            </h3>
            <p className={`text-sm mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Set alert thresholds for monitoring
            </p>
          </button>

          <button
            onClick={() => navigate('/reports')}
            className={`rounded-xl p-6 text-left transition-transform hover:scale-105 ${
              darkMode 
                ? 'bg-gradient-to-br from-blue-900/30 to-gray-700 border border-blue-800' 
                : 'bg-blue-50 border border-blue-200'
            } shadow-lg`}
          >
            <TrendingUp className="h-8 w-8 text-blue-600 mb-3" />
            <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Generate Reports
            </h3>
            <p className={`text-sm mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Access historical data and analytics
            </p>
          </button>
        </section>
      </main>
      <Footer darkMode={darkMode} /> {/* ADD THIS */}
    </div>
  );
};

export default Dashboard;
