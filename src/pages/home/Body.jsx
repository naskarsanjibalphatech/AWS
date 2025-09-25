import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Power, Wifi, WifiOff, Clock, Activity, AlertTriangle, 
  RotateCcw, FileText, ChevronLeft, ChevronRight, 
  Download, Filter, Calendar, BarChart3
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
  const [energyData, setEnergyData] = useState({
    voltageR: null, voltageY: null, voltageB: null,
    currentR: null, currentY: null, currentB: null, kwh: null
  });
  
  const [deviceOnline, setDeviceOnline] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showReports, setShowReports] = useState(true);
  const [reportData, setReportData] = useState([]);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportConfig, setReportConfig] = useState({
    tag: 'voltageR',
    fromDateTime: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().slice(0, 16),
    toDateTime: new Date().toISOString().slice(0, 16)
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showChart, setShowChart] = useState(true);
  const [triggerStatus, setTriggerStatus] = useState({ success: 0, failed: 0, lastTriggered: null });
  const itemsPerPage = 50;

  const API_BASE = 'https://lewgxoxna8.execute-api.ap-south-1.amazonaws.com/Read/';
  const TRIGGER_API = 'https://yv2f6ynj93.execute-api.ap-south-1.amazonaws.com/default/AWSToUSR_Kiswok';
  
  // Refs for direct DOM manipulation to avoid React interference
  const fromDateRef = useRef(null);
  const toDateRef = useRef(null);
  const isUserInteracting = useRef(false);
  const autoRefreshRef = useRef(null);
  const triggerRef = useRef(null); // For background trigger

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Background Data Trigger Function - Runs every 3 seconds
  const triggerDataFetch = useCallback(async () => {
    try {
      console.log('Triggering data fetch from PLC to database...');
      
      const response = await fetch(TRIGGER_API, {
        method: 'GET', // or POST if needed
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        setTriggerStatus(prev => ({
          ...prev,
          success: prev.success + 1,
          lastTriggered: new Date().toISOString()
        }));
        console.log('✅ Data trigger successful');
      } else {
        throw new Error(`Trigger failed: ${response.status}`);
      }
    } catch (err) {
      console.error('❌ Data trigger failed:', err);
      setTriggerStatus(prev => ({
        ...prev,
        failed: prev.failed + 1,
        lastTriggered: new Date().toISOString()
      }));
    }
  }, []);

  // Setup Background Data Trigger (Every 3 seconds)
  useEffect(() => {
    console.log('🚀 Starting background data trigger (every 3 seconds)');
    
    // Initial trigger
    triggerDataFetch();
    
    // Set up interval for every 3 seconds
    triggerRef.current = setInterval(triggerDataFetch, 3000);
    
    return () => {
      if (triggerRef.current) {
        clearInterval(triggerRef.current);
        console.log('🛑 Background data trigger stopped');
      }
    };
  }, [triggerDataFetch]);

  const fetchEnergyData = useCallback(async () => {
    // Skip if user is actively using datetime inputs
    if (isUserInteracting.current) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const addresses = '40099,40101,40103,40113,40115,40117,40231';
      const response = await fetch(`${API_BASE}?address=${addresses}&last=1`);
      
      if (!response.ok) throw new Error(`API Error: ${response.status}`);

      const data = await response.json();
      
      const addressMap = {
        40099: 'voltageR', 40101: 'voltageY', 40103: 'voltageB',
        40113: 'currentR', 40115: 'currentY', 40117: 'currentB', 40231: 'kwh'
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

      setEnergyData(prev => ({...prev, ...newEnergyData}));
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

  // Convert datetime-local format to API format (YYYY-MM-DD HH:MM:SS)
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

  const fetchReportData = useCallback(async (page = 1) => {
    try {
      setReportLoading(true);
      
      const addressMap = {
        'voltageR': '40099', 'voltageY': '40101', 'voltageB': '40103',
        'currentR': '40113', 'currentY': '40115', 'currentB': '40117', 'kwh': '40231'
      };

      // Get values directly from DOM to avoid React state issues
      const fromDateTime = fromDateRef.current ? fromDateRef.current.value : reportConfig.fromDateTime;
      const toDateTime = toDateRef.current ? toDateRef.current.value : reportConfig.toDateTime;
      
      const fromDateTimeFormatted = encodeURIComponent(formatDateTimeForAPI(fromDateTime));
      const toDateTimeFormatted = encodeURIComponent(formatDateTimeForAPI(toDateTime));
      
      const apiUrl = `${API_BASE}?address=${addressMap[reportConfig.tag]}&from=${fromDateTimeFormatted}&to=${toDateTimeFormatted}`;
      console.log('API URL:', apiUrl);
      
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      console.log('API Response:', data);
      
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
      })).sort((a, b) => a.dateTime - b.dateTime); // Sort chronologically for chart

      const total = formattedData.length;
      const totalPagesCalc = Math.ceil(total / itemsPerPage);
      const startIndex = (page - 1) * itemsPerPage;
      const paginatedData = formattedData.slice(startIndex, startIndex + itemsPerPage);

      setReportData(formattedData); // Store all data for chart
      setTotalPages(totalPagesCalc);
      setCurrentPage(page);

      console.log('Formatted data length:', formattedData.length);

    } catch (err) {
      console.error('Report data fetch failed:', err);
      setError(`Report Error: ${err.message}`);
      setReportData([]);
    } finally {
      setReportLoading(false);
    }
  }, [reportConfig.tag]);

  // Setup controlled auto-refresh for display data (every 5 seconds)
  useEffect(() => {
    const startAutoRefresh = () => {
      fetchEnergyData(); // Initial fetch
      autoRefreshRef.current = setInterval(fetchEnergyData, 5000); // Every 5 seconds
    };

    startAutoRefresh();

    return () => {
      if (autoRefreshRef.current) {
        clearInterval(autoRefreshRef.current);
      }
    };
  }, [fetchEnergyData]);

  // Auto-fetch initial report data
  useEffect(() => {
    if (showReports) {
      fetchReportData(1);
    }
  }, [showReports, reportConfig.tag]);

  const formatDateTime = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata', hour12: true
    });
  };

  const getTagDisplayName = (tag) => {
    const tagNames = {
      'voltageR': 'R Phase Voltage', 'voltageY': 'Y Phase Voltage', 'voltageB': 'B Phase Voltage',
      'currentR': 'R Phase Current', 'currentY': 'Y Phase Current', 'currentB': 'B Phase Current',
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

  const getPhaseInfo = (tag) => {
    if (tag === 'voltageR' || tag === 'currentR') return 'R Phase';
    if (tag === 'voltageY' || tag === 'currentY') return 'Y Phase';
    if (tag === 'voltageB' || tag === 'currentB') return 'B Phase';
    if (tag === 'kwh') return 'Total';
    return 'Unknown';
  };

  const getChartColor = (tag) => {
    if (tag === 'voltageR' || tag === 'currentR') return '#ef4444'; // Red
    if (tag === 'voltageY' || tag === 'currentY') return '#eab308'; // Yellow
    if (tag === 'voltageB' || tag === 'currentB') return '#3b82f6'; // Blue
    if (tag === 'kwh') return '#10b981'; // Green
    return '#6366f1'; // Default purple
  };

  // Completely isolated datetime input handlers
  const handleDateTimeEvents = (ref, isFromDate = true) => {
    if (!ref.current) return;

    const input = ref.current;
    
    // Prevent any React interference during datetime selection
    const handleFocus = () => {
      console.log('DateTime focused - stopping auto-refresh');
      isUserInteracting.current = true;
      if (autoRefreshRef.current) {
        clearInterval(autoRefreshRef.current);
      }
    };

    const handleBlur = () => {
      console.log('DateTime blurred - restarting auto-refresh');
      setTimeout(() => {
        isUserInteracting.current = false;
        // Restart auto-refresh
        if (autoRefreshRef.current) {
          clearInterval(autoRefreshRef.current);
        }
        autoRefreshRef.current = setInterval(fetchEnergyData, 5000);
      }, 500);
    };

    const handleChange = () => {
      // Update React state to keep it in sync
      if (isFromDate) {
        setReportConfig(prev => ({ ...prev, fromDateTime: input.value }));
      } else {
        setReportConfig(prev => ({ ...prev, toDateTime: input.value }));
      }
    };

    // Add event listeners directly to DOM
    input.addEventListener('focus', handleFocus);
    input.addEventListener('blur', handleBlur);
    input.addEventListener('change', handleChange);
    input.addEventListener('click', handleFocus); // Also handle clicks

    // Cleanup function
    return () => {
      input.removeEventListener('focus', handleFocus);
      input.removeEventListener('blur', handleBlur);
      input.removeEventListener('change', handleChange);
      input.removeEventListener('click', handleFocus);
    };
  };

  // Initialize datetime event handlers
  useEffect(() => {
    const cleanup1 = handleDateTimeEvents(fromDateRef, true);
    const cleanup2 = handleDateTimeEvents(toDateRef, false);

    return () => {
      cleanup1?.();
      cleanup2?.();
    };
  }, []);

  // Custom Tooltip for the chart
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-300 rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium text-gray-900">{`Time: ${label}`}</p>
          <p className="text-sm text-blue-600">
            {`${getTagDisplayName(reportConfig.tag)}: ${payload[0].value.toFixed(2)} ${getTagUnit(reportConfig.tag)}`}
          </p>
        </div>
      );
    }
    return null;
  };

  // Prepare chart data - sample every nth point if too many data points
  const getChartData = () => {
    if (reportData.length === 0) return [];
    
    let chartData = reportData;
    
    // If more than 100 points, sample to reduce clutter
    if (reportData.length > 100) {
      const step = Math.ceil(reportData.length / 100);
      chartData = reportData.filter((_, index) => index % step === 0);
    }
    
    return chartData;
  };

  // Minimal Metric Card Component
  const MetricCard = React.memo(({ title, value, unit, status = 'normal' }) => (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        <div className={`w-2 h-2 rounded-full ${
          status === 'warning' ? 'bg-amber-400' : 
          status === 'error' ? 'bg-red-400' : 'bg-green-400'
        }`}></div>
      </div>
      <div className="flex items-baseline space-x-1">
        <span className="text-2xl font-bold text-gray-900">
          {value !== null ? parseFloat(value).toFixed(2) : '--'}
        </span>
        <span className="text-sm text-gray-500">{unit}</span>
      </div>
    </div>
  ));

  // Enhanced Status Bar with Trigger Status
  const StatusBar = React.memo(() => (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            {deviceOnline ? 
              <Wifi className="h-4 w-4 text-green-500" /> : 
              <WifiOff className="h-4 w-4 text-red-500" />
            }
            <span className="text-sm font-medium">
              {deviceOnline ? 'Online' : 'Offline'}
            </span>
            {isUserInteracting.current && (
              <span className="text-xs text-orange-500 bg-orange-50 px-2 py-1 rounded">
                Auto-refresh paused
              </span>
            )}
          </div>
          
          {/* Data Trigger Status */}
          <div className="flex items-center space-x-2 text-sm">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-gray-600">Data Sync:</span>
            <span className="text-green-600 font-medium">✅ {triggerStatus.success}</span>
            {triggerStatus.failed > 0 && (
              <span className="text-red-600 font-medium">❌ {triggerStatus.failed}</span>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">
              Last update: {formatDateTime(lastUpdate)}
            </span>
          </div>
        </div>
        <button
          onClick={() => {
            isUserInteracting.current = false;
            fetchEnergyData();
          }}
          disabled={isLoading}
          className="flex items-center space-x-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 
            disabled:opacity-50 rounded-md text-sm font-medium transition-colors"
        >
          <RotateCcw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>
    </div>
  ));

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Clean Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Activity className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">CLOUD SCADA</h1>
                <p className="text-sm text-gray-500">KISWOK INDUSTRIES</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-gray-900">
                {currentTime.toLocaleTimeString('en-IN', { hour12: true })}
              </div>
              <div className="text-xs text-gray-500">
                {currentTime.toLocaleDateString('en-IN')}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <p className="text-sm text-red-700">System Alert: {error}</p>
            </div>
          </div>
        )}

        {/* Enhanced Status Bar */}
        <StatusBar />

        {/* System Status Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-3">
            <Activity className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-blue-900 mb-1">System Status</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-700">
                <div>
                  <span className="font-medium">Data Trigger:</span> Every 3 seconds
                  <br />
                  <span className="text-xs">PLC → Database sync active</span>
                </div>
                <div>
                  <span className="font-medium">Display Refresh:</span> Every 5 seconds
                  <br />
                  <span className="text-xs">Real-time dashboard updates</span>
                </div>
                <div>
                  <span className="font-medium">Successful Syncs:</span> {triggerStatus.success}
                  <br />
                  <span className="text-xs">
                    Last triggered: {triggerStatus.lastTriggered ? 
                      new Date(triggerStatus.lastTriggered).toLocaleTimeString('en-IN') : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard 
            title="R Phase Voltage" 
            value={energyData.voltageR} 
            unit="V" 
            status={energyData.voltageR < 200 || energyData.voltageR > 250 ? 'warning' : 'normal'} 
          />
          <MetricCard 
            title="Y Phase Voltage" 
            value={energyData.voltageY} 
            unit="V"
            status={energyData.voltageY < 200 || energyData.voltageY > 250 ? 'warning' : 'normal'} 
          />
          <MetricCard 
            title="B Phase Voltage" 
            value={energyData.voltageB} 
            unit="V"
            status={energyData.voltageB < 200 || energyData.voltageB > 250 ? 'warning' : 'normal'} 
          />
          <MetricCard 
            title="Total Energy" 
            value={energyData.kwh} 
            unit="kWh" 
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <MetricCard title="R Phase Current" value={energyData.currentR} unit="A" />
          <MetricCard title="Y Phase Current" value={energyData.currentY} unit="A" />
          <MetricCard title="B Phase Current" value={energyData.currentB} unit="A" />
        </div>

        {/* Reports Section */}
        {showReports && (
          <div className="bg-white border border-gray-200 rounded-lg mb-6">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FileText className="h-5 w-5 text-gray-600" />
                  <h2 className="text-lg font-semibold text-gray-900">Historical Reports</h2>
                </div>
                <button
                  onClick={() => setShowReports(false)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-md transition-colors"
                >
                  Hide Reports
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* API Status Display */}
              <div className="text-sm text-gray-500 mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="font-medium mb-2">Report Status:</div>
                <div>• Parameter: {getTagDisplayName(reportConfig.tag)} ({getPhaseInfo(reportConfig.tag)})</div>
                <div>• Data Count: {reportData.length} records</div>
                <div>• Loading: {reportLoading ? 'Yes' : 'No'}</div>
              </div>

              {/* Completely Isolated DateTime Inputs */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Report Configuration</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Parameter
                    </label>
                    <select
                      value={reportConfig.tag}
                      onChange={(e) => setReportConfig(prev => ({...prev, tag: e.target.value}))}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm bg-white
                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      From Date & Time
                    </label>
                    <input
                      ref={fromDateRef}
                      type="datetime-local"
                      defaultValue={reportConfig.fromDateTime}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm bg-white
                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      To Date & Time
                    </label>
                    <input
                      ref={toDateRef}
                      type="datetime-local"
                      defaultValue={reportConfig.toDateTime}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm bg-white
                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="flex items-end">
                    <button
                      onClick={() => fetchReportData(1)}
                      disabled={reportLoading}
                      className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 
                        disabled:cursor-not-allowed text-white text-sm font-medium rounded-md transition-colors
                        flex items-center justify-center space-x-2"
                    >
                      {reportLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                          <span>Loading...</span>
                        </>
                      ) : (
                        <>
                          <Filter className="h-4 w-4" />
                          <span>Generate Report</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Data Summary with Phase Info and Chart Toggle */}
              {reportData.length > 0 && !reportLoading && (
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 bg-blue-50 rounded-lg">
                  <div className="text-center">
                    <div className="text-xl font-bold text-blue-600">{getPhaseInfo(reportConfig.tag)}</div>
                    <div className="text-sm text-gray-600">Phase</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-blue-600">{reportData.length}</div>
                    <div className="text-sm text-gray-600">Data Points</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-blue-600">
                      {reportData.length > 0 ? Math.max(...reportData.map(d => d.value)).toFixed(2) : '0.00'}
                    </div>
                    <div className="text-sm text-gray-600">Max Value</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-blue-600">
                      {reportData.length > 0 ? Math.min(...reportData.map(d => d.value)).toFixed(2) : '0.00'}
                    </div>
                    <div className="text-sm text-gray-600">Min Value</div>
                  </div>
                  <div className="text-center">
                    <button
                      onClick={() => setShowChart(!showChart)}
                      className="flex items-center justify-center space-x-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors"
                    >
                      <BarChart3 className="h-4 w-4" />
                      <span>{showChart ? 'Hide Chart' : 'Show Chart'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Line Chart Section */}
              {reportData.length > 0 && !reportLoading && showChart && (
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {getTagDisplayName(reportConfig.tag)} Trend Analysis
                    </h3>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getChartColor(reportConfig.tag) }}></div>
                      <span>{getPhaseInfo(reportConfig.tag)} - {getTagUnit(reportConfig.tag)}</span>
                    </div>
                  </div>
                  
                  <div style={{ width: '100%', height: '400px' }}>
                    <ResponsiveContainer>
                      <LineChart
                        data={getChartData()}
                        margin={{ top: 5, right: 30, left: 20, bottom: 60 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis 
                          dataKey="shortTime" 
                          tick={{ fontSize: 12 }}
                          angle={-45}
                          textAnchor="end"
                          height={80}
                          interval="preserveStartEnd"
                        />
                        <YAxis 
                          tick={{ fontSize: 12 }}
                          label={{ 
                            value: `${getTagDisplayName(reportConfig.tag)} (${getTagUnit(reportConfig.tag)})`, 
                            angle: -90, 
                            position: 'insideLeft',
                            style: { textAnchor: 'middle' }
                          }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke={getChartColor(reportConfig.tag)}
                          strokeWidth={2}
                          dot={{ r: 3 }}
                          activeDot={{ r: 5, stroke: getChartColor(reportConfig.tag), strokeWidth: 2 }}
                          name={`${getTagDisplayName(reportConfig.tag)} (${getTagUnit(reportConfig.tag)})`}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="mt-4 text-sm text-gray-600 text-center">
                    Showing {getChartData().length} of {reportData.length} data points • 
                    Time range: {reportData.length > 0 ? reportData[0].shortTime : ''} to {reportData.length > 0 ? reportData[reportData.length - 1].shortTime : ''}
                  </div>
                </div>
              )}

              {/* Enhanced Data Table */}
              {reportData.length > 0 && !reportLoading && (
                <div className="bg-white">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {getTagDisplayName(reportConfig.tag)} - {getPhaseInfo(reportConfig.tag)} Data Table
                    </h3>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => fetchReportData(currentPage - 1)}
                        disabled={currentPage === 1 || reportLoading}
                        className="p-2 border border-gray-300 rounded-md disabled:opacity-50 
                          disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <span className="px-3 py-1 text-sm text-gray-600 bg-gray-100 rounded-md">
                        Showing all {reportData.length} records
                      </span>
                      <button
                        onClick={() => fetchReportData(currentPage + 1)}
                        disabled={currentPage === totalPages || reportLoading}
                        className="p-2 border border-gray-300 rounded-md disabled:opacity-50 
                          disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="overflow-x-auto border border-gray-200 rounded-lg max-h-96">
                    <table className="w-full">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Timestamp
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Phase
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Parameter
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Value
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Unit
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {reportData.slice().reverse().map((item, index) => (
                          <tr key={index} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.timestamp}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium" style={{ color: getChartColor(reportConfig.tag) }}>
                              {getPhaseInfo(reportConfig.tag)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {reportConfig.tag.includes('voltage') ? 'Voltage' : 
                               reportConfig.tag.includes('current') ? 'Current' : 'Energy'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-lg font-bold text-gray-900">
                              {item.value.toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {getTagUnit(reportConfig.tag)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* No Data State */}
              {reportData.length === 0 && !reportLoading && (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium">No data found</p>
                  <p className="text-sm">Try adjusting the date range or parameter selection.</p>
                  <button
                    onClick={() => fetchReportData(1)}
                    className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors"
                  >
                    Retry
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {!showReports && (
          <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Historical Reports</h3>
            <p className="text-gray-600 mb-4">View detailed historical data for all parameters</p>
            <button
              onClick={() => setShowReports(true)}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors"
            >
              Show Reports
            </button>
          </div>
        )}

        {/* Footer */}
        <footer className="text-center py-6 text-sm text-gray-500">
          Developed by{' '}
          <a 
            href="https://alphatechsolutions.in/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-700"
          >
            Alpha Tech Solutions
          </a>
        </footer>
      </main>
    </div>
  );
};

export default PLCDashboard;
