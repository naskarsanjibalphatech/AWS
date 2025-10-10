import React from 'react';
import { 
  Power, Wifi, WifiOff, Clock, Activity, AlertTriangle, 
  RotateCcw, FileText, ChevronLeft, ChevronRight, 
  Download, Filter, Calendar, BarChart3, Moon, Sun, Menu, X, TrendingUp
} from 'lucide-react';
import LiveData from '../../components/LiveData';
import LiveTrends from '../../components/LiveTrends';
import Threshold from '../../components/Threshold';
import HistoricalReport from '../../components/HistoricalReport';
import AlertLog from '../../components/AlertLog';
import Footer from '../../components/Footer';

const Body = ({
    darkMode,
  setDarkMode,
  sidebarOpen,
  setSidebarOpen,
  energyData,
  deviceOnline,
  lastUpdate,
  isLoading,
  error,
  thresholdRef,
  thresholdData,
  thresholdLoading,
  thresholdError,
  updateThreshold,
  fetchThresholdData,
  thresholdEditingState,
  setThresholdEditingState,
  currentTime,
  reportData,
  reportLoading,
  reportConfig,
  setReportConfig,
  fromDateRef,
  toDateRef,
  realtimeRef,
  reportsRef,
  trendsRef,
  realtimeTrendSectionRef,
  fetchReportData,
  realtimeTrendData,
  toast={toast},             // ← ADD THIS
  setToast={setToast},
    alertLogRef,
  alertLogData,
  alertLogLoading,
  alertLogCount,
  setAlertLogCount,
  fetchAlertLogData,
  realtimeTrendLoading
}) => {

  // Scroll to section function
  const scrollToSection = (sectionRef) => {
    sectionRef.current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  };

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
      {/* Header */}
      <header className={`sticky top-0 z-50 ${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      } border-b shadow-sm`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Title */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Activity className="h-8 w-8 text-blue-600" />
                <div>
                  <h1 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>CLOUD SCADA</h1>
                  <p className="text-xs text-gray-500 font-medium">KISWOK INDUSTRIES</p>
                </div>
              </div>
            </div>

            {/* Navigation Menu */}
            <nav className="hidden md:flex items-center space-x-8">
              <button
                onClick={() => scrollToSection(realtimeRef)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  darkMode 
                    ? 'text-gray-300 hover:text-white' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Real Time Data
              </button>
              
              <button
                onClick={() => scrollToSection(realtimeTrendSectionRef)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  darkMode 
                    ? 'text-gray-300 hover:text-white' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Live Trends
              </button>
              <button
    onClick={() => scrollToSection(alertLogRef)}
    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      darkMode 
        ? 'text-gray-300 hover:text-white' 
        : 'text-gray-600 hover:text-gray-900'
    }`}
  >
    Alert Log
  </button>
              <button
                onClick={() => scrollToSection(thresholdRef)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  darkMode 
                    ? 'text-gray-300 hover:text-white' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Set Threshold
              </button>
              <button
                onClick={() => scrollToSection(reportsRef)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  darkMode 
                    ? 'text-gray-300 hover:text-white' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Reports
              </button>
              <button
                onClick={() => scrollToSection(trendsRef)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  darkMode 
                    ? 'text-gray-300 hover:text-white' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Historical Trends
              </button>
            </nav>

            {/* Header Controls */}
            <div className="flex items-center space-x-4">
              {/* Current Time - Professional Display */}
              <div className={`hidden lg:flex items-center space-x-2 px-3 py-2 rounded-lg ${
                darkMode ? 'bg-gray-700' : 'bg-gray-100'
              }`}>
                <Clock className="h-4 w-4 text-gray-500" />
                <span className={`text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                  {currentTime.toLocaleString('en-IN', { hour12: true })}
                </span>
              </div>

              {/* Theme Toggle */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 rounded-lg transition-colors ${
                  darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>

              {/* Mobile Menu */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden p-2 rounded-lg"
              >
                {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {sidebarOpen && (
          <div className={`md:hidden border-t ${
            darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
          }`}>
            <div className="px-4 py-3 space-y-2">
              <button
                onClick={() => {
                  scrollToSection(realtimeRef);
                  setSidebarOpen(false);
                }}
                className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium ${
                  darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Real Time Data
              </button>
              <button
                onClick={() => {
                  scrollToSection(thresholdRef);
                  setSidebarOpen(false);
                }}
                className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium ${
                  darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Set Threshold
              </button>
              <button
                onClick={() => {
                  scrollToSection(realtimeTrendSectionRef);
                  setSidebarOpen(false);
                }}
                className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium ${
                  darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Live Trends
              </button>
              <button
        onClick={() => {
          scrollToSection(alertLogRef);
          setSidebarOpen(false);
        }}
        className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium ${
          darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        Alert Log
      </button>
              <button
                onClick={() => {
                  scrollToSection(reportsRef);
                  setSidebarOpen(false);
                }}
                className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium ${
                  darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Reports
              </button>
              <button
                onClick={() => {
                  scrollToSection(trendsRef);
                  setSidebarOpen(false);
                }}
                className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium ${
                  darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Historical Trends
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        
        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <p className="text-sm font-medium text-red-600 dark:text-red-400">{error}</p>
            </div>
          </div>
        )}

        {/* Status Bar */}
        <div className={`rounded-xl p-4 shadow-lg transform hover:scale-[1.01] transition-all duration-300 ${
          darkMode 
            ? 'bg-gradient-to-r from-gray-800 to-gray-700 border border-gray-600 shadow-gray-900/50' 
            : 'bg-white border border-gray-200 shadow-gray-300/30'
        }`}
        style={{
          boxShadow: !darkMode 
            ? '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' 
            : undefined
        }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Device Status:</span>
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

        {/* Live Data Section */}
        <LiveData 
          realtimeRef={realtimeRef}
          darkMode={darkMode}
          energyData={energyData}
        />

        {/* Live Trends Section */}
        <LiveTrends 
          realtimeTrendSectionRef={realtimeTrendSectionRef}
          darkMode={darkMode}
          realtimeTrendData={realtimeTrendData}
          realtimeTrendLoading={realtimeTrendLoading}
        />
        {/* Alert Log Section */}
<AlertLog 
  alertLogRef={alertLogRef}
  darkMode={darkMode}
  alertLogData={alertLogData}
  alertLogLoading={alertLogLoading}
  alertLogCount={alertLogCount}
  setAlertLogCount={setAlertLogCount}
  fetchAlertLogData={fetchAlertLogData}
/>

        {/* Threshold Section */}
        <Threshold 
          thresholdRef={thresholdRef}
          darkMode={darkMode}
          thresholdData={thresholdData}
          thresholdLoading={thresholdLoading}
          thresholdError={thresholdError}
          updateThreshold={updateThreshold}
          thresholdEditingState={thresholdEditingState}
          setThresholdEditingState={setThresholdEditingState}
          toast={toast}              // ← ADD THIS
          setToast={setToast} 
        />

        {/* Historical Report & Trends Section */}
        <HistoricalReport 
          reportsRef={reportsRef}
          trendsRef={trendsRef}
          darkMode={darkMode}
          reportData={reportData}
          reportLoading={reportLoading}
          reportConfig={reportConfig}
          setReportConfig={setReportConfig}
          fromDateRef={fromDateRef}
          toDateRef={toDateRef}
          fetchReportData={fetchReportData}
        />

      </main>
      <Footer darkMode={darkMode} /> {/* ADD THIS */}
    </div>
  );
};

export default Body;
