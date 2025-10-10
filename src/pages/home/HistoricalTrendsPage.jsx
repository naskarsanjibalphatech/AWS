import React, { useState, useCallback, useRef } from 'react';
import Header from '../../components/Header';
import { BarChart3, Filter, Calendar } from 'lucide-react';
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
import Footer from '../../components/Footer';

const HistoricalTrendsPage = (props) => {
  const {
    darkMode,
    setDarkMode,
    sidebarOpen,
    setSidebarOpen,
    currentTime,
    reportConfig,
    setReportConfig
  } = props;

  // Multi-parameter selection state
  const [selectedParams, setSelectedParams] = useState(['voltageR', 'voltageY', 'voltageB']);
  const [multiReportData, setMultiReportData] = useState([]);
  const [multiReportLoading, setMultiReportLoading] = useState(false);

  const fromDateRef = useRef(null);
  const toDateRef = useRef(null);

  const parameterOptions = [
    { value: 'voltageR', label: 'R Phase Voltage', color: '#ef4444', unit: 'V', address: '40099' },
    { value: 'voltageY', label: 'Y Phase Voltage', color: '#eab308', unit: 'V', address: '40101' },
    { value: 'voltageB', label: 'B Phase Voltage', color: '#3b82f6', unit: 'V', address: '40103' },
    { value: 'currentR', label: 'R Phase Current', color: '#ef4444', unit: 'A', address: '40113' },
    { value: 'currentY', label: 'Y Phase Current', color: '#eab308', unit: 'A', address: '40115' },
    { value: 'currentB', label: 'B Phase Current', color: '#3b82f6', unit: 'A', address: '40117' },
    { value: 'kwh', label: 'Energy', color: '#10b981', unit: 'kWh', address: '40231' }
  ];

  const toggleParameter = (param) => {
    setSelectedParams(prev => 
      prev.includes(param) 
        ? prev.filter(p => p !== param)
        : [...prev, param]
    );
  };

  const getCurrentDateTime = () => {
    const now = new Date();
    return now.toISOString().slice(0, 16);
  };

  // Format datetime for Report API (YYYY-MM-DD HH:MM:SS)
  const formatDateTimeForReportAPI = (datetimeLocal) => {
    const date = new Date(datetimeLocal);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  // Fetch multi-parameter trend data
  const fetchMultiParameterData = useCallback(async () => {
    if (selectedParams.length === 0) return;

    try {
      setMultiReportLoading(true);
      
      // Get addresses for selected parameters
      const selectedAddresses = selectedParams.map(param => 
        parameterOptions.find(p => p.value === param)?.address
      ).filter(Boolean);
      
      if (selectedAddresses.length === 0) return;
      
      const fromDateTime = fromDateRef.current ? fromDateRef.current.value : reportConfig.fromDateTime;
      const toDateTime = toDateRef.current ? toDateRef.current.value : reportConfig.toDateTime;
      
      const fromDateTimeFormatted = encodeURIComponent(formatDateTimeForReportAPI(fromDateTime));
      const toDateTimeFormatted = encodeURIComponent(formatDateTimeForReportAPI(toDateTime));
      
      // Use comma-separated addresses
      const addressesString = selectedAddresses.join(',');
      const apiUrl = `https://mt9vt4fvcf.execute-api.ap-south-1.amazonaws.com/S1/R2?address=${addressesString}&from=${fromDateTimeFormatted}&to=${toDateTimeFormatted}`;
      
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} - ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!Array.isArray(data)) {
        throw new Error('Invalid API response format');
      }
      
      // Group data by timestamp and map addresses to parameter names
      const addressToParam = {};
      selectedParams.forEach(param => {
        const paramInfo = parameterOptions.find(p => p.value === param);
        if (paramInfo) {
          addressToParam[paramInfo.address] = param;
        }
      });
      
      const timestampMap = {};
      
      data.forEach(item => {
        const paramName = addressToParam[item.address];
        if (paramName) {
          const timestamp = item.timestamp;
          if (!timestampMap[timestamp]) {
            timestampMap[timestamp] = {
              timestamp: timestamp,
              shortTime: new Date(timestamp).toLocaleString('en-IN', {
                timeZone: 'Asia/Kolkata',
                month: 'short',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
              }),
              dateTime: new Date(timestamp)
            };
          }
          timestampMap[timestamp][paramName] = parseFloat(item.value) || 0;
        }
      });
      
      const formattedData = Object.values(timestampMap)
        .sort((a, b) => a.dateTime - b.dateTime);
      
      setMultiReportData(formattedData);
      
    } catch (err) {
      console.error('Multi-parameter trend data fetch failed:', err);
      setMultiReportData([]);
    } finally {
      setMultiReportLoading(false);
    }
  }, [selectedParams, reportConfig.fromDateTime]);

  const getChartData = () => {
    if (multiReportData.length === 0) return [];
    
    let chartData = multiReportData;
    
    if (multiReportData.length > 100) {
      const step = Math.ceil(multiReportData.length / 100);
      chartData = multiReportData.filter((_, index) => index % step === 0);
    }
    
    return chartData;
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
        {/* Page Header */}
        <div className="flex items-center space-x-3">
          <BarChart3 className="h-6 w-6 text-blue-600" />
          <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Historical Trends
          </h2>
        </div>

        {/* Configuration Panel */}
        <div className={`rounded-xl p-6 shadow-lg ${
          darkMode 
            ? 'bg-gradient-to-r from-gray-800 to-gray-700 border border-gray-600' 
            : 'bg-white border border-gray-200'
        }`}>
          <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Trend Configuration
          </h3>

          {/* Multi-Parameter Selection */}
          <div className="mb-6">
            <label className={`block text-sm font-medium mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <Filter className="inline h-4 w-4 mr-2" />
              Select Parameters (Multiple)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
              {parameterOptions.map((param) => (
                <button
                  key={param.value}
                  onClick={() => toggleParameter(param.value)}
                  className={`px-4 py-3 rounded-lg font-medium text-sm transition-all transform hover:scale-105 ${
                    selectedParams.includes(param.value)
                      ? darkMode
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'bg-blue-600 text-white shadow-md'
                      : darkMode
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  style={{
                    borderLeft: selectedParams.includes(param.value) ? `4px solid ${param.color}` : 'none'
                  }}
                >
                  {param.label}
                </button>
              ))}
            </div>
          </div>

          {/* Date Range Selection */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <Calendar className="inline h-4 w-4 mr-2" />
                From Date Time
              </label>
              <input
                ref={fromDateRef}
                type="datetime-local"
                defaultValue={reportConfig.fromDateTime}
                className={`w-full rounded-md border px-3 py-2 transition-colors ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <Calendar className="inline h-4 w-4 mr-2" />
                To Date Time
              </label>
              <input
                ref={toDateRef}
                type="datetime-local"
                defaultValue={getCurrentDateTime()}
                max={getCurrentDateTime()}
                className={`w-full rounded-md border px-3 py-2 transition-colors ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={fetchMultiParameterData}
                disabled={multiReportLoading || selectedParams.length === 0}
                className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-2 rounded-md transition-colors transform hover:scale-105"
              >
                {multiReportLoading ? 'Loading...' : 'Generate Trends'}
              </button>
            </div>
          </div>

          {selectedParams.length === 0 && (
            <p className={`mt-4 text-sm ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>
              ⚠️ Please select at least one parameter to view trends
            </p>
          )}
        </div>

        {/* Chart Display */}
        {multiReportData.length > 0 && !multiReportLoading && selectedParams.length > 0 && (
          <div className={`rounded-xl p-6 shadow-lg ${
            darkMode 
              ? 'bg-gradient-to-r from-gray-800 to-gray-700 border border-gray-600' 
              : 'bg-white border border-gray-200'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
              <h3 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Multi-Parameter Trend Analysis
              </h3>
              <div className="flex flex-wrap gap-2 mt-3 sm:mt-0">
                {selectedParams.map(param => {
                  const paramInfo = parameterOptions.find(p => p.value === param);
                  return (
                    <div key={param} className="flex items-center space-x-2">
                      <div className="w-4 h-4 rounded-full" style={{backgroundColor: paramInfo?.color}}></div>
                      <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {paramInfo?.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div style={{width: '100%', height: '450px'}}>
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
                      value: 'Values', 
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
                  {selectedParams.map(param => {
                    const paramInfo = parameterOptions.find(p => p.value === param);
                    return (
                      <Line 
                        key={param}
                        type="monotone" 
                        dataKey={param}
                        stroke={paramInfo?.color}
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 5 }}
                        name={`${paramInfo?.label} (${paramInfo?.unit})`}
                        isAnimationActive={false}
                        animationDuration={0}
                      />
                    );
                  })}
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            <div className={`mt-6 text-sm text-center p-4 rounded-lg ${
              darkMode 
                ? 'text-gray-300 bg-gray-700' 
                : 'text-gray-600 bg-gray-50'
            }`}>
              Showing {getChartData().length} of {multiReportData.length} data points | 
              Parameters: {selectedParams.length} selected |
              Time range: {multiReportData.length > 0 ? multiReportData[0].shortTime : ''} to {multiReportData.length > 0 ? multiReportData[multiReportData.length - 1].shortTime : ''}
            </div>
          </div>
        )}

        {multiReportData.length === 0 && !multiReportLoading && (
          <div className={`text-center py-12 rounded-xl border shadow-lg ${
            darkMode 
              ? 'bg-gradient-to-r from-gray-800 to-gray-700 border-gray-600' 
              : 'bg-white border-gray-200'
          }`}>
            <BarChart3 className={`h-16 w-16 mx-auto mb-4 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
            <p className={`text-xl font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              No trend data available
            </p>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Select parameters, configure date range, and click Generate Trends
            </p>
          </div>
        )}
      </main>
      <Footer darkMode={darkMode} /> {/* ADD THIS */}
    </div>
  );
};

export default HistoricalTrendsPage;
