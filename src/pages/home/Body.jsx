import React from 'react';
import { 
  Power, Wifi, WifiOff, Clock, Activity, AlertTriangle, 
  RotateCcw, FileText, ChevronLeft, ChevronRight, 
  Download, Filter, Calendar, BarChart3, Moon, Sun, Menu, X
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

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
  fetchReportData
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

  const getCurrentDateTime = () => {
    const now = new Date();
    return now.toISOString().slice(0, 16);
  };

  // Get chart data
  const getChartData = () => {
    if (reportData.length === 0) return [];
    
    let chartData = reportData;
    
    if (reportData.length > 100) {
      const step = Math.ceil(reportData.length / 100);
      chartData = reportData.filter((_, index) => index % step === 0);
    }
    
    return chartData;
  };

  const getTagDisplayName = (tag) => {
    const tagNames = {
      'voltageR': 'R Phase Voltage',
      'voltageY': 'Y Phase Voltage', 
      'voltageB': 'B Phase Voltage',
      'currentR': 'R Phase Current',
      'currentY': 'Y Phase Current',
      'currentB': 'B Phase Current',
      'kwh': 'Energy (kWh)'
    };
    return tagNames[tag] || tag;
  };

  const getTagUnit = (tag) => {
    if (tag.includes('voltage')) return 'V';
    if (tag.includes('current')) return 'A'; 
    if (tag === 'kwh') return 'kWh';
    return '';
  };

  const getChartColor = (tag) => {
    if (tag === 'voltageR' || tag === 'currentR') return '#ef4444';
    if (tag === 'voltageY' || tag === 'currentY') return '#eab308';
    if (tag === 'voltageB' || tag === 'currentB') return '#3b82f6';
    if (tag === 'kwh') return '#10b981';
    return '#6366f1';
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
                Trends
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
                Trends
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

        {/* Real Time Data Section */}
        <section ref={realtimeRef} className="space-y-6">
          <div className="flex items-center space-x-3">
            <Activity className="h-6 w-6 text-blue-600" />
            <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Real Time Data</h2>
          </div>

          {/* A. Voltages */}
          <div className="space-y-4">
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}> Voltages</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Voltage R */}
              <div className={`relative rounded-2xl p-8 transform hover:scale-105 transition-all duration-300 cursor-pointer ${
                darkMode 
                  ? 'bg-gradient-to-br from-gray-800 via-gray-750 to-gray-700 border border-gray-600 hover:shadow-red-500/20 shadow-2xl' 
                  : 'bg-white border border-gray-200'
              }`}
              style={{
                boxShadow: darkMode 
                  ? '0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(239, 68, 68, 0.1)' 
                  : '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(0, 0, 0, 0.05)'
              }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Voltage R-Phase</p>
                    <p className="text-3xl font-bold text-red-500 mt-2">
                      {energyData.voltageR !== null ? `${energyData.voltageR.toFixed(2)}` : '--'}
                    </p>
                    <p className={`text-xs font-medium mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Volts</p>
                  </div>
                  <div className="w-4 h-4 bg-red-500 rounded-full shadow-lg animate-pulse"></div>
                </div>
                {darkMode && <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-transparent rounded-2xl pointer-events-none"></div>}
              </div>

              {/* Voltage Y */}
              <div className={`relative rounded-2xl p-8 transform hover:scale-105 transition-all duration-300 cursor-pointer ${
                darkMode 
                  ? 'bg-gradient-to-br from-gray-800 via-gray-750 to-gray-700 border border-gray-600 hover:shadow-yellow-500/20 shadow-2xl' 
                  : 'bg-white border border-gray-200'
              }`}
              style={{
                boxShadow: darkMode 
                  ? '0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(234, 179, 8, 0.1)' 
                  : '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(0, 0, 0, 0.05)'
              }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Voltage Y-Phase</p>
                    <p className="text-3xl font-bold text-yellow-500 mt-2">
                      {energyData.voltageY !== null ? `${energyData.voltageY.toFixed(2)}` : '--'}
                    </p>
                    <p className={`text-xs font-medium mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Volts</p>
                  </div>
                  <div className="w-4 h-4 bg-yellow-500 rounded-full shadow-lg animate-pulse"></div>
                </div>
                {darkMode && <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 to-transparent rounded-2xl pointer-events-none"></div>}
              </div>

              {/* Voltage B */}
              <div className={`relative rounded-2xl p-8 transform hover:scale-105 transition-all duration-300 cursor-pointer ${
                darkMode 
                  ? 'bg-gradient-to-br from-gray-800 via-gray-750 to-gray-700 border border-gray-600 hover:shadow-blue-500/20 shadow-2xl' 
                  : 'bg-white border border-gray-200'
              }`}
              style={{
                boxShadow: darkMode 
                  ? '0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(59, 130, 246, 0.1)' 
                  : '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(0, 0, 0, 0.05)'
              }}>
                                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Voltage B-Phase</p>
                    <p className="text-3xl font-bold text-blue-500 mt-2">
                      {energyData.voltageB !== null ? `${energyData.voltageB.toFixed(2)}` : '--'}
                    </p>
                    <p className={`text-xs font-medium mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Volts</p>
                  </div>
                  <div className="w-4 h-4 bg-blue-500 rounded-full shadow-lg animate-pulse"></div>
                </div>
                {darkMode && <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-transparent rounded-2xl pointer-events-none"></div>}
              </div>
            </div>
          </div>

          {/* B. Currents */}
          <div className="space-y-4">
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}> Currents</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Current R */}
              <div className={`relative rounded-2xl p-8 transform hover:scale-105 transition-all duration-300 cursor-pointer ${
                darkMode 
                  ? 'bg-gradient-to-br from-gray-800 via-gray-750 to-gray-700 border border-gray-600 hover:shadow-red-500/20 shadow-2xl' 
                  : 'bg-white border border-gray-200'
              }`}
              style={{
                boxShadow: darkMode 
                  ? '0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(239, 68, 68, 0.1)' 
                  : '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(0, 0, 0, 0.05)'
              }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Current R-Phase</p>
                    <p className="text-3xl font-bold text-red-500 mt-2">
                      {energyData.currentR !== null ? `${energyData.currentR.toFixed(2)}` : '--'}
                    </p>
                    <p className={`text-xs font-medium mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Amps</p>
                  </div>
                  <div className="w-4 h-4 bg-red-500 rounded-full shadow-lg animate-pulse"></div>
                </div>
                {darkMode && <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-transparent rounded-2xl pointer-events-none"></div>}
              </div>

              {/* Current Y */}
              <div className={`relative rounded-2xl p-8 transform hover:scale-105 transition-all duration-300 cursor-pointer ${
                darkMode 
                  ? 'bg-gradient-to-br from-gray-800 via-gray-750 to-gray-700 border border-gray-600 hover:shadow-yellow-500/20 shadow-2xl' 
                  : 'bg-white border border-gray-200'
              }`}
              style={{
                boxShadow: darkMode 
                  ? '0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(234, 179, 8, 0.1)' 
                  : '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(0, 0, 0, 0.05)'
              }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Current Y-Phase</p>
                    <p className="text-3xl font-bold text-yellow-500 mt-2">
                      {energyData.currentY !== null ? `${energyData.currentY.toFixed(2)}` : '--'}
                    </p>
                    <p className={`text-xs font-medium mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Amps</p>
                  </div>
                  <div className="w-4 h-4 bg-yellow-500 rounded-full shadow-lg animate-pulse"></div>
                </div>
                {darkMode && <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 to-transparent rounded-2xl pointer-events-none"></div>}
              </div>

              {/* Current B */}
              <div className={`relative rounded-2xl p-8 transform hover:scale-105 transition-all duration-300 cursor-pointer ${
                darkMode 
                  ? 'bg-gradient-to-br from-gray-800 via-gray-750 to-gray-700 border border-gray-600 hover:shadow-blue-500/20 shadow-2xl' 
                  : 'bg-white border border-gray-200'
              }`}
              style={{
                boxShadow: darkMode 
                  ? '0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(59, 130, 246, 0.1)' 
                  : '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(0, 0, 0, 0.05)'
              }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Current B-Phase</p>
                    <p className="text-3xl font-bold text-blue-500 mt-2">
                      {energyData.currentB !== null ? `${energyData.currentB.toFixed(2)}` : '--'}
                    </p>
                    <p className={`text-xs font-medium mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Amps</p>
                  </div>
                  <div className="w-4 h-4 bg-blue-500 rounded-full shadow-lg animate-pulse"></div>
                </div>
                {darkMode && <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-transparent rounded-2xl pointer-events-none"></div>}
              </div>
            </div>
          </div>

          {/* C. Energy Consumption */}
          <div className="space-y-4">
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}> Energy Consumption (kWh)</h3>
            <div className={`relative rounded-2xl p-8 transform hover:scale-105 transition-all duration-300 cursor-pointer ${
              darkMode 
                ? 'bg-gradient-to-br from-gray-800 via-gray-750 to-gray-700 border border-gray-600 hover:shadow-green-500/20 shadow-2xl' 
                : 'bg-white border border-gray-200'
            }`}
            style={{
              boxShadow: darkMode 
                ? '0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(16, 185, 129, 0.1)' 
                : '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(0, 0, 0, 0.05)'
            }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Total Energy</p>
                  <p className="text-3xl font-bold text-green-500 mt-2">
                    {energyData.kwh !== null ? `${energyData.kwh.toFixed(2)}` : '--'}
                  </p>
                  <p className={`text-xs font-medium mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>kWh</p>
                </div>
                <div className="w-4 h-4 bg-green-500 rounded-full shadow-lg animate-pulse"></div>
              </div>
              {darkMode && <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-transparent rounded-2xl pointer-events-none"></div>}
            </div>
          </div>
        </section>

        {/* Reports Section */}
        <section ref={reportsRef} className="space-y-6">
          <div className="flex items-center space-x-3">
            <FileText className="h-6 w-6 text-indigo-600" />
            <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Reports</h2>
          </div>

          {/* Date Filter Controls */}
          <div className="flex flex-wrap items-center space-x-4 space-y-4">
            <div className="flex flex-col">
              <label className={`text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`} htmlFor="fromDate">From Date</label>
              <input
                ref={fromDateRef}
                type="datetime-local"
                id="fromDate"
                className={`rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                }`}
                defaultValue={getCurrentDateTime()}
              />
            </div>
            <div className="flex flex-col">
              <label className={`text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`} htmlFor="toDate">To Date</label>
              <input
                ref={toDateRef}
                type="datetime-local"
                id="toDate"
                className={`rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                }`}
                defaultValue={getCurrentDateTime()}
              />
            </div>
            <button
              onClick={fetchReportData}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
            >
              <Filter className="h-4 w-4" />
              <span>Filter</span>
            </button>
          </div>

          {/* Report Loading Indicator */}
          {reportLoading && (
            <div className="text-center py-6 text-indigo-600 font-medium">
              Loading report data...
            </div>
          )}

          {/* Report Chart */}
          {!reportLoading && reportData.length > 0 && (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={getChartData()}
                margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#444" : "#ccc"} />
                <XAxis
                  dataKey="timestamp"
                  tickFormatter={(tick) => new Date(tick).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  stroke={darkMode ? "#ccc" : "#555"}
                />
                <YAxis stroke={darkMode ? "#ccc" : "#555"} />
                <Tooltip
                  labelFormatter={(label) => formatDateTime(label)}
                  contentStyle={{ backgroundColor: darkMode ? '#333' : '#fff', borderRadius: '8px' }}
                  itemStyle={{ color: 'inherit' }}
                  cursor={{ strokeDasharray: '3 3' }}
                />
                <Legend wrapperStyle={{ color: darkMode ? '#ccc' : '#555' }} />
                {Object.keys(reportConfig.selectedTags).map((tag) => (
                  reportConfig.selectedTags[tag] && 
                  <Line
                    key={tag}
                    type="monotone"
                    dataKey={tag}
                    stroke={getChartColor(tag)}
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          )}

          {/* No Data Message */}
          {!reportLoading && reportData.length === 0 && (
            <div className="text-center py-6 text-gray-500 dark:text-gray-400">
              No report data available for the selected range.
            </div>
          )}
        </section>

        {/* Trends Section (Placeholder) */}
        <section ref={trendsRef} className="space-y-6">
          <div className="flex items-center space-x-3">
            <BarChart3 className="h-6 w-6 text-purple-600" />
            <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Trends</h2>
          </div>
          <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Trend analysis features coming soon.</p>
        </section>
      </main>
    </div>
  );
};

export default Body;
