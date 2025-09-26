import React, { useState, useEffect, useCallback, useRef } from 'react';
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

const PLCDashboard = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [energyData, setEnergyData] = useState({
    voltageR: null, voltageY: null, voltageB: null,
    currentR: null, currentY: null, currentB: null, kwh: null
  });
  
  const [deviceOnline, setDeviceOnline] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [reportData, setReportData] = useState([]);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportConfig, setReportConfig] = useState({
    tag: 'voltageR',
    fromDateTime: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().slice(0, 16),
    toDateTime: new Date().toISOString().slice(0, 16)
  });

  // Your exact original API endpoints
  const API_BASE = 'https://lewgxoxna8.execute-api.ap-south-1.amazonaws.com/Read';
  const TRIGGER_API = 'https://yv2f6ynj93.execute-api.ap-south-1.amazonaws.com/default/AWSToUSR_Kiswok';

  const fromDateRef = useRef(null);
  const toDateRef = useRef(null);
  const isUserInteracting = useRef(false);
  const autoRefreshRef = useRef(null);
  const triggerRef = useRef(null);

  // Navigation references for smooth scrolling
  const realtimeRef = useRef(null);
  const reportsRef = useRef(null);
  const trendsRef = useRef(null);

  // Scroll to section function
  const scrollToSection = (sectionRef) => {
    sectionRef.current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  };

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Background Data Trigger Function - Runs every 3 seconds
  const triggerDataFetch = useCallback(async () => {
    try {
      const response = await fetch(TRIGGER_API, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Trigger failed: ${response.status}`);
      }
    } catch (err) {
      console.error('Data trigger failed:', err);
    }
  }, []);

  // Setup Background Data Trigger Every 3 seconds
  useEffect(() => {
    triggerDataFetch();
    triggerRef.current = setInterval(triggerDataFetch, 3000);
    
    return () => {
      if (triggerRef.current) {
        clearInterval(triggerRef.current);
      }
    };
  }, [triggerDataFetch]);

  // Fetch energy data using your original API
  const fetchEnergyData = useCallback(async () => {
    if (isUserInteracting.current) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const addresses = ['40099', '40101', '40103', '40113', '40115', '40117', '40231'];
      const response = await fetch(`${API_BASE}?address=${addresses}&last=1`);
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }
      
      const data = await response.json();
      
      const addressMap = {
        '40099': 'voltageR',
        '40101': 'voltageY', 
        '40103': 'voltageB',
        '40113': 'currentR',
        '40115': 'currentY',
        '40117': 'currentB',
        '40231': 'kwh'
      };
      
      const newEnergyData = {};
      let mostRecentTimestamp = null;
      
      data.forEach(item => {
        const parameter = addressMap[item.address];
        if (parameter) {
          newEnergyData[parameter] = parseFloat(item.value) || 0;
          if (!mostRecentTimestamp || new Date(item.timestamp) > new Date(mostRecentTimestamp)) {
            mostRecentTimestamp = item.timestamp;
          }
        }
      });
      
      setEnergyData(prev => ({ ...prev, ...newEnergyData }));
      setLastUpdate(mostRecentTimestamp);
      
      if (mostRecentTimestamp) {
        const timeDiff = (new Date().getTime() - new Date(mostRecentTimestamp).getTime()) / 1000;
        setDeviceOnline(timeDiff <= 30);
      } else {
        setDeviceOnline(false);
      }
      
    } catch (err) {
      console.error('Energy data fetch failed:', err);
      setError(err.message);
      setDeviceOnline(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Auto-refresh every 5 seconds
  useEffect(() => {
    const startAutoRefresh = () => {
      fetchEnergyData();
      autoRefreshRef.current = setInterval(fetchEnergyData, 5000);
    };
    
    startAutoRefresh();
    
    return () => {
      if (autoRefreshRef.current) {
        clearInterval(autoRefreshRef.current);
      }
    };
  }, [fetchEnergyData]);

  // Format datetime for API
  const formatDateTimeForAPI = (datetimeLocal) => {
    const date = new Date(datetimeLocal);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  // Fetch report data using your original API
  const fetchReportData = useCallback(async (page = 1) => {
    try {
      setReportLoading(true);
      
      const addressMap = {
        'voltageR': '40099',
        'voltageY': '40101', 
        'voltageB': '40103',
        'currentR': '40113',
        'currentY': '40115',
        'currentB': '40117',
        'kwh': '40231'
      };
      
      const fromDateTime = fromDateRef.current ? fromDateRef.current.value : reportConfig.fromDateTime;
      const toDateTime = toDateRef.current ? toDateRef.current.value : reportConfig.toDateTime;
      
      const fromDateTimeFormatted = encodeURIComponent(formatDateTimeForAPI(fromDateTime));
      const toDateTimeFormatted = encodeURIComponent(formatDateTimeForAPI(toDateTime));
      
      const apiUrl = `${API_BASE}?address=${addressMap[reportConfig.tag]}&from=${fromDateTimeFormatted}&to=${toDateTimeFormatted}`;
      
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} - ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!Array.isArray(data)) {
        throw new Error('Invalid API response format');
      }
      
      const formattedData = data.map(item => ({
        timestamp: new Date(item.timestamp).toLocaleString('en-IN', {
          timeZone: 'Asia/Kolkata',
          hour12: true,
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        }),
        shortTime: new Date(item.timestamp).toLocaleString('en-IN', {
          timeZone: 'Asia/Kolkata',
          month: 'short',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        }),
        value: parseFloat(item.value) || 0,
        dateTime: new Date(item.timestamp)
      })).sort((a, b) => a.dateTime - b.dateTime);
      
      setReportData(formattedData);
      
    } catch (err) {
      console.error('Report data fetch failed:', err);
      setError(`Report Error: ${err.message}`);
      setReportData([]);
    } finally {
      setReportLoading(false);
    }
  }, [reportConfig.tag]);

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

  // Handle datetime input events
  const handleDateTimeEvents = (ref, isFromDate = true) => {
    if (!ref.current) return;
    
    const input = ref.current;
    
    const handleFocus = () => {
      isUserInteracting.current = true;
      if (autoRefreshRef.current) {
        clearInterval(autoRefreshRef.current);
      }
    };
    
    const handleBlur = () => {
      setTimeout(() => {
        isUserInteracting.current = false;
        if (autoRefreshRef.current) {
          clearInterval(autoRefreshRef.current);
        }
        autoRefreshRef.current = setInterval(fetchEnergyData, 5000);
      }, 500);
    };
    
    const handleChange = () => {
      if (isFromDate) {
        setReportConfig(prev => ({ ...prev, fromDateTime: input.value }));
      } else {
        setReportConfig(prev => ({ ...prev, toDateTime: input.value }));
      }
    };
    
    input.addEventListener('focus', handleFocus);
    input.addEventListener('blur', handleBlur);
    input.addEventListener('change', handleChange);
    input.addEventListener('click', handleFocus);
    
    return () => {
      input.removeEventListener('focus', handleFocus);
      input.removeEventListener('blur', handleBlur);
      input.removeEventListener('change', handleChange);
      input.removeEventListener('click', handleFocus);
    };
  };

  useEffect(() => {
    const cleanup1 = handleDateTimeEvents(fromDateRef, true);
    const cleanup2 = handleDateTimeEvents(toDateRef, false);
    
    return () => {
      if (cleanup1) cleanup1();
      if (cleanup2) cleanup2();
    };
  }, []);

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
              {/* Voltage R - White Mode: Clean white with subtle shadow */}
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

          {/* 2. Currents */}
          <div className="space-y-4">
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Currents</h3>
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
                    <p className={`text-xs font-medium mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Amperes</p>
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
                    <p className={`text-xs font-medium mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Amperes</p>
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
                    <p className={`text-xs font-medium mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Amperes</p>
                  </div>
                  <div className="w-4 h-4 bg-blue-500 rounded-full shadow-lg animate-pulse"></div>
                </div>
                {darkMode && <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-transparent rounded-2xl pointer-events-none"></div>}
              </div>
            </div>
          </div>

          {/* 3. Energy Consumed */}
          <div className="space-y-4">
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Energy Consumed</h3>
            <div className="grid grid-cols-1 md:grid-cols-1 gap-6 max-w-md">
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
                    <p className="text-4xl font-bold text-green-500 mt-2">
                      {energyData.kwh !== null ? `${energyData.kwh.toFixed(2)}` : '--'}
                    </p>
                    <p className={`text-xs font-medium mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>kWh</p>
                  </div>
                  <div className="w-5 h-5 bg-green-500 rounded-full shadow-lg animate-pulse"></div>
                </div>
                {darkMode && <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-transparent rounded-2xl pointer-events-none"></div>}
              </div>
            </div>
          </div>
        </section>

        {/* Reports Section */}
        <section ref={reportsRef} className="space-y-6">
          <div className="flex items-center space-x-3">
            <FileText className="h-6 w-6 text-blue-600" />
            <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Reports</h2>
          </div>

          {/* Report Controls */}
          <div className={`rounded-xl p-6 shadow-lg transform hover:scale-[1.01] transition-all duration-300 ${
            darkMode 
              ? 'bg-gradient-to-r from-gray-800 to-gray-700 border border-gray-600 shadow-gray-900/50' 
              : 'bg-white border border-gray-200'
          }`}
          style={{
            boxShadow: !darkMode 
              ? '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' 
              : undefined
          }}>
            <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Report Configuration</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Parameter</label>
                <select
                  value={reportConfig.tag}
                  onChange={(e) => setReportConfig(prev => ({ ...prev, tag: e.target.value }))}
                  className={`w-full rounded-md border px-3 py-2 transition-colors ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' 
                      : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                  }`}
                >
                  <option value="voltageR">R Phase Voltage</option>
                  <option value="voltageY">Y Phase Voltage</option>
                  <option value="voltageB">B Phase Voltage</option>
                  <option value="currentR">R Phase Current</option>
                  <option value="currentY">Y Phase Current</option>
                  <option value="currentB">B Phase Current</option>
                  <option value="kwh">Energy (kWh)</option>
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>From Date Time</label>
                <input
                  ref={fromDateRef}
                  type="datetime-local"
                  defaultValue={reportConfig.fromDateTime}
                  className={`w-full rounded-md border px-3 py-2 transition-colors ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' 
                      : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>To Date Time</label>
                <input
                  ref={toDateRef}
                  type="datetime-local"
                  defaultValue={getCurrentDateTime()}
                  max={getCurrentDateTime()}
                  className={`w-full rounded-md border px-3 py-2 transition-colors ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' 
                      : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                  }`}
                />
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => fetchReportData(1)}
                  disabled={reportLoading}
                  className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-md transition-colors transform hover:scale-105"
                >
                  <Filter className="h-4 w-4" />
                  <span>{reportLoading ? 'Loading...' : 'Generate Report'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Historical Data Table */}
          {reportData.length > 0 && !reportLoading && (
            <div className={`rounded-xl shadow-lg transform hover:scale-[1.01] transition-all duration-300 overflow-hidden ${
              darkMode 
                ? 'bg-gradient-to-r from-gray-800 to-gray-700 border border-gray-600 shadow-gray-900/50' 
                : 'bg-white border border-gray-200'
            }`}
            style={{
              boxShadow: !darkMode 
                ? '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' 
                : undefined
            }}>
              <div className={`p-4 border-b ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {getTagDisplayName(reportConfig.tag)} - Data Table
                </h3>
              </div>
              <div className="overflow-x-auto max-h-96">
                <table className={`min-w-full divide-y ${darkMode ? 'divide-gray-600' : 'divide-gray-200'}`}>
                  <thead className={darkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                    <tr>
                      <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                        darkMode ? 'text-gray-300' : 'text-gray-500'
                      }`}>
                        Timestamp
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                        darkMode ? 'text-gray-300' : 'text-gray-500'
                      }`}>
                        Parameter
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                        darkMode ? 'text-gray-300' : 'text-gray-500'
                      }`}>
                        Value
                      </th>
                      <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                        darkMode ? 'text-gray-300' : 'text-gray-500'
                      }`}>
                        Unit
                      </th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${darkMode ? 'divide-gray-600' : 'divide-gray-200'}`}>
                    {reportData.slice().reverse().map((item, index) => (
                      <tr key={index} className={`transition-colors ${
                        darkMode 
                          ? 'bg-gray-800 hover:bg-gray-700' 
                          : 'bg-white hover:bg-gray-50'
                      }`}>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                          darkMode ? 'text-gray-200' : 'text-gray-900'
                        }`}>
                          {item.timestamp}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold" style={{color: getChartColor(reportConfig.tag)}}>
                          {getTagDisplayName(reportConfig.tag)}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-lg font-bold ${
                          darkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {item.value.toFixed(2)}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                          darkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          {getTagUnit(reportConfig.tag)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {reportData.length === 0 && !reportLoading && (
            <div className={`text-center py-12 rounded-xl border shadow-lg ${
              darkMode 
                ? 'bg-gradient-to-r from-gray-800 to-gray-700 border-gray-600' 
                : 'bg-white border-gray-200'
            }`}
            style={{
              boxShadow: !darkMode 
                ? '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' 
                : undefined
            }}>
              <FileText className={`h-16 w-16 mx-auto mb-4 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
              <p className={`text-xl font-semibold mb-2 ${
                darkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>No data found</p>
              <p className={`text-sm mb-6 ${
                darkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>Try adjusting the date range or parameter selection.</p>
              <button 
                onClick={() => fetchReportData(1)}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm transform hover:scale-105"
              >
                Retry
              </button>
            </div>
          )}
        </section>

        {/* Trends Section */}
        <section ref={trendsRef} className="space-y-6">
          <div className="flex items-center space-x-3">
            <BarChart3 className="h-6 w-6 text-blue-600" />
            <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Trends</h2>
          </div>

          {/* Chart Display */}
          {reportData.length > 0 && !reportLoading && (
            <div className={`rounded-xl p-6 shadow-lg transform hover:scale-[1.01] transition-all duration-300 ${
              darkMode 
                ? 'bg-gradient-to-r from-gray-800 to-gray-700 border border-gray-600 shadow-gray-900/50' 
                : 'bg-white border border-gray-200'
            }`}
            style={{
              boxShadow: !darkMode 
                ? '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' 
                : undefined
            }}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-3 sm:space-y-0">
                <h3 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {getTagDisplayName(reportConfig.tag)} Trend Analysis
                </h3>
                <div className="flex items-center space-x-3 text-sm">
                  <div className="w-4 h-4 rounded-full" style={{backgroundColor: getChartColor(reportConfig.tag)}}></div>
                  <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                    {getTagDisplayName(reportConfig.tag)} ({getTagUnit(reportConfig.tag)})
                  </span>
                </div>
              </div>
              
              <div style={{width: '100%', height: '400px'}}>
                <ResponsiveContainer>
                  <LineChart 
                    data={getChartData()} 
                    margin={{ top: 5, right: 30, left: 20, bottom: 60 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#f0f0f0'} />
                    <XAxis 
                      dataKey="shortTime"
                      tick={{ fontSize: 12, fill: darkMode ? '#D1D5DB' : '#6B7280' }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      interval="preserveStartEnd"
                    />
                    <YAxis 
                      tick={{ fontSize: 12, fill: darkMode ? '#D1D5DB' : '#6B7280' }}
                      label={{ 
                        value: `${getTagDisplayName(reportConfig.tag)} (${getTagUnit(reportConfig.tag)})`, 
                        angle: -90, 
                        position: 'insideLeft',
                        style: { textAnchor: 'middle', fill: darkMode ? '#D1D5DB' : '#6B7280' }
                      }}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                        border: darkMode ? '1px solid #374151' : '1px solid #e5e7eb',
                        borderRadius: '6px',
                        color: darkMode ? '#D1D5DB' : '#374151'
                      }}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke={getChartColor(reportConfig.tag)}
                      strokeWidth={3}
                      dot={{ r: 4, strokeWidth: 2 }}
                      activeDot={{ r: 6, stroke: getChartColor(reportConfig.tag), strokeWidth: 2 }}
                      name={`${getTagDisplayName(reportConfig.tag)} (${getTagUnit(reportConfig.tag)})`}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              
              <div className={`mt-6 text-sm text-center p-4 rounded-lg ${
                darkMode 
                  ? 'text-gray-300 bg-gray-700' 
                  : 'text-gray-600 bg-gray-50'
              }`}>
                Showing {getChartData().length} of {reportData.length} data points | 
                Time range: {reportData.length > 0 ? reportData[0].shortTime : ''} to {reportData.length > 0 ? reportData[reportData.length - 1].shortTime : ''}
              </div>
            </div>
          )}

          {reportData.length === 0 && !reportLoading && (
            <div className={`text-center py-12 rounded-xl border shadow-lg ${
              darkMode 
                ? 'bg-gradient-to-r from-gray-800 to-gray-700 border-gray-600' 
                : 'bg-white border-gray-200'
            }`}
            style={{
              boxShadow: !darkMode 
                ? '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' 
                : undefined
            }}>
              <BarChart3 className={`h-16 w-16 mx-auto mb-4 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
              <p className={`text-xl font-semibold mb-2 ${
                darkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>No chart data available</p>
              <p className={`text-sm mb-6 ${
                darkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>Generate a report first to view trend analysis.</p>
            </div>
          )}
        </section>

      </main>
    </div>
  );
};

export default PLCDashboard;
