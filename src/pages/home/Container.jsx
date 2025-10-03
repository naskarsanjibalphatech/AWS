import React, { useState, useEffect, useCallback, useRef } from 'react';
import Body from './Body';

const Container = () => {
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

  // API endpoints
  const API_BASE = 'https://lewgxoxna8.execute-api.ap-south-1.amazonaws.com/Read';
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

  // Fetch energy data
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

  // Fetch report data
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

  // Pass all props to Body component
  return (
    <Body
      darkMode={darkMode}
      setDarkMode={setDarkMode}
      sidebarOpen={sidebarOpen}
      setSidebarOpen={setSidebarOpen}
      energyData={energyData}
      deviceOnline={deviceOnline}
      lastUpdate={lastUpdate}
      isLoading={isLoading}
      error={error}
      currentTime={currentTime}
      reportData={reportData}
      reportLoading={reportLoading}
      reportConfig={reportConfig}
      setReportConfig={setReportConfig}
      fromDateRef={fromDateRef}
      toDateRef={toDateRef}
      realtimeRef={realtimeRef}
      reportsRef={reportsRef}
      trendsRef={trendsRef}
      fetchReportData={fetchReportData}
    />
  );
};

export default Container;