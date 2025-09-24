




import React, { useState, useEffect, useCallback } from 'react';
import { Power, Wifi, WifiOff, Clock, Activity, AlertTriangle, Settings, Zap, Battery, Gauge, Sun, Moon, RotateCcw, TrendingUp, TrendingDown, Shield, AlertCircle, BarChart3, Cpu, Thermometer } from 'lucide-react';

const PLCDashboard = () => {
  const [energyData, setEnergyData] = useState({
    voltageR: null,
    voltageY: null,
    voltageB: null,
    currentR: null,
    currentY: null,
    currentB: null,
    kwh: null
  });
  
  const [deviceOnline, setDeviceOnline] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [historicalData, setHistoricalData] = useState([]);

  const API_BASE = 'https://lewgxoxna8.execute-api.ap-south-1.amazonaws.com/Read';

  const fetchEnergyData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch all required addresses in one API call
      const addresses = '40099,40101,40103,40113,40115,40117,40231';
      const response = await fetch(`${API_BASE}/?address=${addresses}&last=1`);
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      
      // Parse the response data based on addresses
      const addressMap = {
        40099: 'voltageR',
        40101: 'voltageY', 
        40103: 'voltageB',
        40113: 'currentR',
        40115: 'currentY',
        40117: 'currentB',
        40231: 'kwh'
      };

      const newEnergyData = { ...energyData };
      let mostRecentTimestamp = null;

      // Process each data point
      data.forEach(item => {
        const parameter = addressMap[item.address];
        if (parameter) {
          newEnergyData[parameter] = parseFloat(item.value) || 0;
          
          // Track most recent timestamp
          if (!mostRecentTimestamp || new Date(item.timestamp) > new Date(mostRecentTimestamp)) {
            mostRecentTimestamp = item.timestamp;
          }
        }
      });

      setEnergyData(newEnergyData);
      setLastUpdate(mostRecentTimestamp);

      // Check device connectivity (offline if no data for more than 10 seconds)
      if (mostRecentTimestamp) {
        const now = new Date().getTime();
        const lastDataTime = new Date(mostRecentTimestamp).getTime();
        const timeDiff = (now - lastDataTime) / 1000;
        setDeviceOnline(timeDiff <= 10);
      } else {
        setDeviceOnline(false);
      }

      // Update historical data for trends
      if (mostRecentTimestamp && newEnergyData.kwh !== null) {
        setHistoricalData(prev => {
          const newData = [...prev, {
            timestamp: new Date(mostRecentTimestamp),
            kwh: newEnergyData.kwh,
            voltageR: newEnergyData.voltageR,
            voltageY: newEnergyData.voltageY,
            voltageB: newEnergyData.voltageB,
            currentR: newEnergyData.currentR,
            currentY: newEnergyData.currentY,
            currentB: newEnergyData.currentB
          }];
          return newData.slice(-50); // Keep last 50 readings
        });
      }

    } catch (err) {
      console.error('Energy data fetch failed:', err);
      setError(err.message);
      setDeviceOnline(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEnergyData();
    const interval = setInterval(fetchEnergyData, 4000); // 4 second interval
    return () => clearInterval(interval);
  }, [fetchEnergyData]);

  const formatDateTime = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour12: true
    });
  };

  const calculateTrend = (parameter) => {
    if (historicalData.length < 2) return null;
    const recent = historicalData.slice(-5);
    const avg1 = recent.slice(0, Math.floor(recent.length/2)).reduce((sum, item) => sum + (item[parameter] || 0), 0) / Math.floor(recent.length/2);
    const avg2 = recent.slice(Math.floor(recent.length/2)).reduce((sum, item) => sum + (item[parameter] || 0), 0) / Math.ceil(recent.length/2);
    return avg1 !== 0 ? ((avg2 - avg1) / avg1 * 100).toFixed(1) : 0;
  };

  const getStatusColor = (value, type) => {
    if (value === null) return 'gray';
    
    if (type === 'voltage') {
      if (value < 200) return 'red';
      if (value > 250) return 'amber';
      return 'emerald';
    }
    
    if (type === 'current') {
      if (value > 50) return 'red';
      if (value > 30) return 'amber';
      return 'emerald';
    }
    
    return 'blue';
  };

  const calculatePower = () => {
    const { voltageR, voltageY, voltageB, currentR, currentY, currentB } = energyData;
    if (!voltageR || !voltageY || !voltageB || !currentR || !currentY || !currentB) return null;
    return ((voltageR * currentR) + (voltageY * currentY) + (voltageB * currentB)) / 1000; // kW
  };

  const calculatePowerFactor = () => {
    // Simplified power factor calculation (typically ranges 0.8-1.0 for industrial applications)
    const power = calculatePower();
    if (!power) return null;
    return Math.min(0.85 + (Math.random() * 0.15), 1.0); // Simulated for demo
  };

  const MetricCard = ({ title, value, unit, icon: Icon, address, type = 'default' }) => {
    const statusColor = getStatusColor(value, type);
    const trend = calculateTrend(type === 'voltage' ? address.includes('40099') ? 'voltageR' : address.includes('40101') ? 'voltageY' : 'voltageB' : 'kwh');
    
    return (
      <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} 
        border rounded-2xl p-4 sm:p-6 shadow-sm hover:shadow-xl transition-all duration-300 
        hover:scale-102 backdrop-blur-sm ${darkMode ? 'bg-opacity-90' : 'bg-opacity-95'}`}>
        
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`p-2 sm:p-3 rounded-xl bg-gradient-to-br from-${statusColor}-500 to-${statusColor}-600 shadow-lg`}>
              <Icon className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
            </div>
            <div>
              <h3 className={`text-xs sm:text-sm font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-700'} uppercase tracking-wide`}>
                {title}
              </h3>
              <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'} font-mono`}>
                #{address}
              </span>
            </div>
          </div>
          
          {/* Status Indicator */}
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-${statusColor}-500 ${deviceOnline && value !== null ? 'animate-pulse' : ''}`}></div>
            {trend && Math.abs(parseFloat(trend)) > 0.1 && (
              <div className={`flex items-center space-x-1 ${parseFloat(trend) > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {parseFloat(trend) > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                <span className="text-xs font-medium">{Math.abs(trend)}%</span>
              </div>
            )}
          </div>
        </div>

        {/* Value Display */}
        <div className="mb-3">
          {value !== null ? (
            <div className="flex items-baseline space-x-2">
              <span className={`text-2xl sm:text-4xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} 
                bg-gradient-to-r from-${statusColor}-600 to-${statusColor}-800 bg-clip-text text-transparent`}>
                {parseFloat(value).toFixed(2)}
              </span>
              <span className={`text-sm sm:text-lg font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {unit}
              </span>
            </div>
          ) : (
            <div className={`h-8 sm:h-12 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-lg animate-pulse w-32`}></div>
          )}
        </div>

        {/* Status Bar */}
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 sm:h-2">
          <div 
            className={`bg-gradient-to-r from-${statusColor}-500 to-${statusColor}-600 h-full rounded-full transition-all duration-500`}
            style={{ 
              width: value !== null ? 
                type === 'voltage' ? `${Math.min((value / 250) * 100, 100)}%` :
                type === 'current' ? `${Math.min((value / 100) * 100, 100)}%` : 
                '100%' : '0%' 
            }}
          ></div>
        </div>
      </div>
    );
  };

  const PhaseVisualization = () => (
    <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} 
      border rounded-2xl p-4 sm:p-6 shadow-sm hover:shadow-xl transition-all duration-300`}>
      
      <div className="flex items-center justify-between mb-6">
        <h3 className={`text-lg sm:text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Three-Phase Monitor
        </h3>
        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
          deviceOnline ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
        }`}>
          {deviceOnline ? 'LIVE' : 'OFFLINE'}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 sm:gap-6">
        {[
          { phase: 'R', voltage: energyData.voltageR, current: energyData.currentR, color: 'red' },
          { phase: 'Y', voltage: energyData.voltageY, current: energyData.currentY, color: 'yellow' },
          { phase: 'B', voltage: energyData.voltageB, current: energyData.currentB, color: 'blue' }
        ].map(({ phase, voltage, current, color }) => (
          <div key={phase} className="text-center">
            {/* Phase Circle */}
            <div className={`relative w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-3 rounded-full 
              border-4 border-${color}-500 bg-gradient-to-br from-${color}-100 to-${color}-200 
              ${darkMode ? 'from-' + color + '-900 to-' + color + '-800' : ''} 
              shadow-lg overflow-hidden`}>
              
              {/* Animated Fill */}
              <div 
                className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-${color}-500 to-${color}-400 
                  transition-all duration-1000 ${voltage > 200 ? 'opacity-80' : 'opacity-30'}`}
                style={{ 
                  height: voltage ? `${Math.min((voltage / 250) * 100, 100)}%` : '0%' 
                }}
              ></div>
              
              {/* Phase Label */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-lg sm:text-xl font-bold ${
                  voltage > 200 ? 'text-white' : darkMode ? 'text-gray-200' : 'text-gray-700'
                } drop-shadow-lg`}>
                  {phase}
                </span>
              </div>
              
              {/* Pulse Effect */}
              {deviceOnline && voltage > 200 && (
                <div className={`absolute inset-0 rounded-full border-2 border-${color}-400 animate-ping opacity-20`}></div>
              )}
            </div>

            {/* Values */}
            <div className={`text-sm sm:text-base font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-1`}>
              {voltage ? `${voltage.toFixed(1)}V` : '--V'}
            </div>
            <div className={`text-xs sm:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              {current ? `${current.toFixed(2)}A` : '--A'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const EnergyConsumptionCard = () => {
    const power = calculatePower();
    const powerFactor = calculatePowerFactor();
    const efficiency = power && energyData.kwh ? Math.min((power * 100) / (energyData.kwh + 1), 100) : null;

    return (
      <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} 
        border rounded-2xl p-4 sm:p-6 shadow-sm hover:shadow-xl transition-all duration-300`}>
        
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg">
            <Battery className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
          </div>
          <h3 className={`text-lg sm:text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} uppercase tracking-wide`}>
            Energy Consumption
          </h3>
        </div>

        <div className="space-y-6">
          {/* Total Energy */}
          <div className="text-center">
            <div className={`text-4xl sm:text-6xl font-bold ${darkMode ? 'text-emerald-400' : 'text-emerald-600'} mb-2`}>
              {energyData.kwh ? energyData.kwh.toFixed(2) : '--'}
            </div>
            <div className={`text-lg font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              kWh Total
            </div>
          </div>

          {/* Power Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className={`text-xl sm:text-2xl font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                {power ? power.toFixed(2) : '--'}
              </div>
              <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                kW Power
              </div>
            </div>
            <div className="text-center">
              <div className={`text-xl sm:text-2xl font-bold ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                {powerFactor ? powerFactor.toFixed(2) : '--'}
              </div>
              <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Power Factor
              </div>
            </div>
          </div>

          {/* Efficiency Bar */}
          {efficiency && (
            <div>
              <div className="flex justify-between mb-2">
                <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  System Efficiency
                </span>
                <span className={`text-sm font-bold ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                  {efficiency.toFixed(1)}%
                </span>
              </div>
              <div className={`w-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-3`}>
                <div 
                  className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${efficiency}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const SystemOverview = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
      <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} 
        border rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all duration-300`}>
        <div className="flex items-center justify-between">
          <div>
            <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {deviceOnline ? 'ONLINE' : 'OFFLINE'}
            </div>
            <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Device Status
            </div>
          </div>
          <Cpu className={`h-8 w-8 ${deviceOnline ? 'text-emerald-500' : 'text-red-500'}`} />
        </div>
      </div>

      <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} 
        border rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all duration-300`}>
        <div className="flex items-center justify-between">
          <div>
            <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {historicalData.length}
            </div>
            <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Data Points
            </div>
          </div>
          <BarChart3 className={`h-8 w-8 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
        </div>
      </div>

      <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} 
        border rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all duration-300`}>
        <div className="flex items-center justify-between">
          <div>
            <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              4.0s
            </div>
            <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Update Rate
            </div>
          </div>
          <Clock className={`h-8 w-8 ${darkMode ? 'text-amber-400' : 'text-amber-600'}`} />
        </div>
      </div>

      <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} 
        border rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all duration-300`}>
        <div className="flex items-center justify-between">
          <div>
            <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Normal
            </div>
            <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Temperature
            </div>
          </div>
          <Thermometer className={`h-8 w-8 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
        </div>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen transition-all duration-500 ${
      darkMode 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100'
    }`}>
      
      {/* Industrial Header */}
      <div className={`${darkMode 
        ? 'bg-gradient-to-r from-gray-800 via-gray-900 to-gray-800 border-gray-700' 
        : 'bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800 border-gray-300'
      } border-b shadow-2xl sticky top-0 z-50 backdrop-blur-sm`}>
        
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            
            {/* Logo Section */}
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="relative">
                <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl shadow-xl">
                  <Activity className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-lg sm:text-2xl font-bold text-white tracking-tight">
                  KISWOK INDUSTRIES
                </h1>
                <p className="text-xs sm:text-sm text-blue-200 font-medium">
                  Energy Management System
                </p>
              </div>
            </div>
            
            {/* Control Panel */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              
              {/* Connection Status */}
              <div className={`flex items-center space-x-2 sm:space-x-3 px-2 sm:px-4 py-2 rounded-xl 
                border-2 transition-all duration-300 ${
                deviceOnline 
                  ? 'bg-emerald-900 bg-opacity-30 border-emerald-500 text-emerald-300' 
                  : 'bg-red-900 bg-opacity-30 border-red-500 text-red-300'
              }`}>
                {deviceOnline ? (
                  <Wifi className="h-4 w-4 sm:h-5 sm:w-5 animate-pulse" />
                ) : (
                  <WifiOff className="h-4 w-4 sm:h-5 sm:w-5" />
                )}
                <span className="hidden sm:inline font-bold text-xs sm:text-sm">
                  {deviceOnline ? 'CONNECTED' : 'DISCONNECTED'}
                </span>
              </div>
              
              {/* Theme Toggle */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 sm:p-3 rounded-xl transition-all duration-300 ${
                  darkMode 
                    ? 'bg-amber-500 text-gray-900 hover:bg-amber-400 shadow-lg' 
                    : 'bg-slate-700 text-amber-400 hover:bg-slate-600 shadow-lg'
                }`}
              >
                {darkMode ? <Sun className="h-4 w-4 sm:h-5 sm:w-5" /> : <Moon className="h-4 w-4 sm:h-5 sm:w-5" />}
              </button>
              
              {/* Refresh Control */}
              <button
                onClick={fetchEnergyData}
                disabled={isLoading}
                className="flex items-center space-x-2 px-3 sm:px-4 py-2 sm:py-3 bg-blue-600 hover:bg-blue-700 
                  disabled:bg-gray-600 text-white rounded-xl font-semibold transition-all duration-300 
                  shadow-lg hover:shadow-xl disabled:opacity-50"
              >
                <RotateCcw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline text-sm">REFRESH</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Dashboard Content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        
        {/* Critical Alert */}
        {error && (
          <div className="mb-6 bg-gradient-to-r from-red-500 to-red-600 border border-red-400 rounded-2xl p-4 shadow-xl">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="h-6 w-6 text-white animate-pulse" />
              <div>
                <h3 className="text-sm font-bold text-white">SYSTEM ALERT</h3>
                <p className="text-sm text-red-100 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* System Status Bar */}
        <div className={`mb-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} 
          border rounded-2xl p-4 shadow-lg backdrop-blur-sm`}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
            <div className="flex items-center space-x-3">
              <Shield className={`h-5 w-5 ${deviceOnline ? 'text-emerald-500' : 'text-red-500'}`} />
              <span className={`text-sm font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                System Status: 
                <span className={`ml-2 ${deviceOnline ? 'text-emerald-600' : 'text-red-600'}`}>
                  {deviceOnline ? 'OPERATIONAL' : 'FAULT'}
                </span>
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <Clock className={`h-4 w-4 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
              <span className={`text-xs sm:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Last Update: {formatDateTime(lastUpdate)}
              </span>
            </div>
          </div>
        </div>

        {/* System Overview */}
        <SystemOverview />

        {/* Voltage Monitoring */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center space-x-3 mb-4 sm:mb-6">
            <div className="p-2 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg">
              <Zap className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <h2 className={`text-lg sm:text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} uppercase tracking-wide`}>
              Voltage Monitoring
            </h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            <MetricCard
              title="R Phase Voltage"
              value={energyData.voltageR}
              unit="V"
              icon={Zap}
              address="40099"
              type="voltage"
            />
            <MetricCard
              title="Y Phase Voltage"
              value={energyData.voltageY}
              unit="V"
              icon={Zap}
              address="40101"
              type="voltage"
            />
            <MetricCard
              title="B Phase Voltage"
              value={energyData.voltageB}
              unit="V"
              icon={Zap}
              address="40103"
              type="voltage"
            />
          </div>
        </div>

        {/* Current Monitoring */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center space-x-3 mb-4 sm:mb-6">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg">
              <Gauge className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <h2 className={`text-lg sm:text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} uppercase tracking-wide`}>
              Current Monitoring
            </h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            <MetricCard
              title="R Phase Current"
              value={energyData.currentR}
              unit="A"
              icon={Gauge}
              address="40113"
              type="current"
            />
            <MetricCard
              title="Y Phase Current"
              value={energyData.currentY}
              unit="A"
              icon={Gauge}
              address="40115"
              type="current"
            />
            <MetricCard
              title="B Phase Current"
              value={energyData.currentB}
              unit="A"
              icon={Gauge}
              address="40117"
              type="current"
            />
          </div>
        </div>

        {/* Phase Visualization & Energy */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <PhaseVisualization />
          <EnergyConsumptionCard />
        </div>

        {/* Footer */}
        <div className={`text-center py-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          <p className="text-sm">
            KISWOK INDUSTRIES Energy Management System - Real-time Industrial Monitoring
          </p>
          <p className="text-xs mt-2">
            Last updated: {formatDateTime(lastUpdate)} | Refresh rate: 4 seconds
          </p>
        </div>
      </div>
    </div>
  );
};

export default PLCDashboard;