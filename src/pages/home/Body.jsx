import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Wifi, WifiOff, Clock, Activity, AlertTriangle, 
  FileText, Filter, BarChart3, Moon, Sun, Menu, X
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

const App = () => {
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
    toDateTime: new Date().toISOString().slice(0, 16),
    selectedTags: {
      voltageR: true,
      voltageY: true,
      voltageB: true,
      currentR: true,
      currentY: true,
      currentB: true,
      kwh: true
    }
  });

  // API endpoints
  const REALTIME_API = 'https://lewgxoxna8.execute-api.ap-south-1.amazonaws.com/Read';
  const REPORT_API = 'https://yv2f6ynj93.execute-api.ap-south-1.amazonaws.com/default/Report';
  const TRIGGER_API = 'https://yv2f6ynj93.execute-api.ap-south-1.amazonaws.com/default/AWSToUSR_Kiswok';

  const fromDateRef = useRef(null);
  const toDateRef = useRef(null);
  const isUserInteracting = useRef(false);
  const autoRefreshRef = useRef(null);
  const triggerRef = useRef(null);

  // Navigation references
  const realtimeRef = useRef(null);
  const reportsRef = useRef(null);
  const trendsRef = useRef(null);

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Background Data Trigger Function
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

  // Setup Background Data Trigger
  useEffect(() => {
    triggerDataFetch();
    triggerRef.current = setInterval(triggerDataFetch, 3000);
    
    return () => {
      if (triggerRef.current) {
        clearInterval(triggerRef.current);
      }
    };
  }, [triggerDataFetch]);

  // Fetch energy data for real-time
  const fetchEnergyData = useCallback(async () => {
    if (isUserInteracting.current) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const addresses = ['40099', '40101', '40103', '40113', '40115', '40117', '40231'];
      const response = await fetch(`${REALTIME_API}?address=${addresses}&last=1`);
      
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

  // Fetch report data
  const fetchReportData = useCallback(async () => {
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
      
      const apiUrl = `${REPORT_API}?address=${addressMap[reportConfig.tag]}&from=${fromDateTimeFormatted}&to=${toDateTimeFormatted}`;
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!Array.isArray(data)) {
        throw new Error('Invalid API response format');
      }
      
      const formattedData = data.map(item => ({
        timestamp: item.timestamp,
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

  const getChartData = () => {
    if (reportData.length === 0) return [];
    
    let chartData = reportData;
    
    if (reportData.length > 100) {
      const step = Math.ceil(reportData.length / 100);
      chartData = reportData.filter((_, index) => index % step === 0);
    }
    
    return chartData;
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
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Activity className="h-8 w-8 text-blue-600" />
                <div>
                  <h1 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>CLOUD SCADA</h1>
                  <p className="text-xs text-gray-500 font-medium">KISWOK INDUSTRIES</p>
                </div>
              </div>
            </div>

            <nav className="hidden md:flex items-center space-x-8">
              <button
                onClick={() => scrollToSection(realtimeRef)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Real Time Data
              </button>
              <button
                onClick={() => scrollToSection(reportsRef)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Reports
              </button>
              <button
                onClick={() => scrollToSection(trendsRef)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Trends
              </button>
            </nav>

            <div className="flex items-center space-x-4">
              <div className={`hidden lg:flex items-center space-x-2 px-3 py-2 rounded-lg ${
                darkMode ? 'bg-gray-700' : 'bg-gray-100'
              }`}>
                <Clock className="h-4 w-4 text-gray-500" />
                <span className={`text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                  {currentTime.toLocaleString('en-IN', { hour12: true })}
                </span>
              </div>

              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 rounded-lg transition-colors ${
                  darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>

              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden p-2 rounded-lg"
              >
                {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>

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
        }`}>
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

          {/* Voltages */}
          <div className="space-y-4">
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Voltages</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Voltage R */}
              <div className={`relative rounded-2xl p-8 transform hover:scale-105 transition-all duration-300 cursor-pointer ${
                darkMode 
                  ? 'bg-gradient-to-br from-gray-800 via-gray-750 to-gray-700 border border-gray-600 hover:shadow-red-500/20 shadow-2xl' 
                  : 'bg-white border border-gray-200'
              }`}>
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
              }`}>
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
              }`}>
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

          {/* Currents */}
          <div className="space-y-4">
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Currents</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Current R */}
              <div className={`relative rounded-2xl p-8 transform hover:scale-105 transition-all duration-300 cursor-pointer ${
                darkMode 
                  ? 'bg-gradient-to-br from-gray-800 via-gray-750 to-gray-700 border border-gray-600 hover:shadow-red-500/20 shadow-2xl' 
                  : 'bg-white border border-gray-200'
              }`}>
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
              }`}>
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
              }`}>
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

          {/* Energy Consumption */}
          <div className="space-y-4">
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Energy Consumption (kWh)</h3>
            <div className={`relative rounded-2xl p-8 transform hover:scale-105 transition-all duration-300 cursor-pointer ${
              darkMode 
                ? 'bg-gradient-to-br from-gray-800 via-gray-750 to-gray-700 border border-gray-600 hover:shadow-green-500/20 shadow-2xl' 
                : 'bg-white border border-gray-200'
            }`}>
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
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex flex-col">
              <label className={`text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`} htmlFor="parameterSelect">Parameter</label>
              <select
                id="parameterSelect"
                value={reportConfig.tag}
                onChange={(e) => setReportConfig(prev => ({ ...prev, tag: e.target.value }))}
                className={`rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
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

          {/* Report Table */}
          {!reportLoading && reportData.length > 0 && (
            <div className={`overflow-x-auto rounded-lg border ${
              darkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className={darkMode ? 'bg-gray-800' : 'bg-gray-50'}>
                  <tr>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                      darkMode ? 'text-gray-300' : 'text-gray-500'
                    }`}>
                      Timestamp
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                      darkMode ? 'text-gray-300' : 'text-gray-500'
                    }`}>
                      Value
                    </th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${darkMode ? 'divide-gray-700 bg-gray-800' : 'divide-gray-200 bg-white'}`}>
                  {reportData.map((row, index) => (
                    <tr key={index} className={darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                        darkMode ? 'text-gray-300' : 'text-gray-900'
                      }`}>
                        {row.timestamp}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                        darkMode ? 'text-gray-200' : 'text-gray-900'
                      }`}>
                        {row.value.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* No Data Message */}
          {!reportLoading && reportData.length === 0 && (
            <div className="text-center py-6 text-gray-500 dark:text-gray-400">
              No report data available for the selected range.
            </div>
          )}
        </section>

        {/* Trends Section */}
        <section ref={trendsRef} className="space-y-6">
          <div className="flex items-center space-x-3">
            <BarChart3 className="h-6 w-6 text-purple-600" />
            <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Trends</h2>
          </div>

          {/* Date Filter Controls for Trends */}
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex flex-col">
              <label className={`text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`} htmlFor="trendParameterSelect">Parameter</label>
              <select
                id="trendParameterSelect"
                value={reportConfig.tag}
                onChange={(e) => setReportConfig(prev => ({ ...prev, tag: e.target.value }))}
                className={`rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
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
            <div className="flex flex-col">
              <label className={`text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`} htmlFor="trendFromDate">From Date</label>
              <input
                type="datetime-local"
                id="trendFromDate"
                ref={fromDateRef}
                className={`rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                }`}
                defaultValue={getCurrentDateTime()}
              />
            </div>
            <div className="flex flex-col">
              <label className={`text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`} htmlFor="trendToDate">To Date</label>
              <input
                type="datetime-local"
                id="trendToDate"
                ref={toDateRef}
                className={`rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                }`}
                defaultValue={getCurrentDateTime()}
              />
            </div>
            <button
              onClick={fetchReportData}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition"
            >
              <Filter className="h-4 w-4" />
              <span>Filter</span>
            </button>
          </div>

          {/* Trend Loading Indicator */}
          {reportLoading && (
            <div className="text-center py-6 text-purple-600 font-medium">
              Loading trend data...
            </div>
          )}

          {/* Trend Chart */}
          {!reportLoading && reportData.length > 0 && (
            <ResponsiveContainer width="100%" height={400}>
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
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={getChartColor(reportConfig.tag)}
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                  name={reportConfig.tag}
                />
              </LineChart>
            </ResponsiveContainer>
          )}

          {/* No Data Message */}
          {!reportLoading && reportData.length === 0 && (
            <div className="text-center py-6 text-gray-500 dark:text-gray-400">
              No trend data available for the selected range.
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default App;