import React from 'react';
import { AlertTriangle, Bell, CheckCircle, XCircle } from 'lucide-react';

const AlertLog = ({ 
  alertLogRef, 
  darkMode, 
  alertLogData, 
  alertLogLoading,
  alertLogCount,
  setAlertLogCount,
  fetchAlertLogData
}) => {

  const formatDateTime = (timestamp) => {
    if (!timestamp) return 'N/A';
    // Timestamp format from API: "2025-10-08 23:55:27"
    const date = new Date(timestamp.replace(' ', 'T'));
    return date.toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  const getStatusColor = (status) => {
    if (!status) return 'text-gray-500';
    const lowerStatus = status.toLowerCase();
    if (lowerStatus.includes('exceeded') || lowerStatus.includes('critical')) return 'text-red-500';
    if (lowerStatus.includes('warning')) return 'text-yellow-500';
    if (lowerStatus.includes('recovered') || lowerStatus.includes('normal')) return 'text-green-500';
    return 'text-blue-500';
  };

  const getStatusBadgeColor = (status) => {
    if (!status) return darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700';
    const lowerStatus = status.toLowerCase();
    if (lowerStatus.includes('exceeded') || lowerStatus.includes('critical')) 
      return darkMode ? 'bg-red-900/30 text-red-400 border border-red-700' : 'bg-red-100 text-red-700 border border-red-300';
    if (lowerStatus.includes('warning')) 
      return darkMode ? 'bg-yellow-900/30 text-yellow-400 border border-yellow-700' : 'bg-yellow-100 text-yellow-700 border border-yellow-300';
    if (lowerStatus.includes('recovered') || lowerStatus.includes('normal')) 
      return darkMode ? 'bg-green-900/30 text-green-400 border border-green-700' : 'bg-green-100 text-green-700 border border-green-300';
    return darkMode ? 'bg-blue-900/30 text-blue-400 border border-blue-700' : 'bg-blue-100 text-blue-700 border border-blue-300';
  };

  const getStatusIcon = (status) => {
    if (!status) return <AlertTriangle className="h-4 w-4" />;
    const lowerStatus = status.toLowerCase();
    if (lowerStatus.includes('exceeded') || lowerStatus.includes('critical')) 
      return <XCircle className="h-4 w-4" />;
    if (lowerStatus.includes('recovered') || lowerStatus.includes('normal')) 
      return <CheckCircle className="h-4 w-4" />;
    return <AlertTriangle className="h-4 w-4" />;
  };

  return (
    <section ref={alertLogRef} className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center space-x-3">
          <Bell className="h-6 w-6 text-orange-600" />
          <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Alert Log</h2>
        </div>
        
        {/* Count Selector */}
        <div className="flex items-center space-x-3">
          <label className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Show:
          </label>
          <select
            value={alertLogCount}
            onChange={(e) => {
              setAlertLogCount(parseInt(e.target.value));
              fetchAlertLogData(parseInt(e.target.value));
            }}
            className={`rounded-md border px-3 py-2 transition-colors ${
              darkMode 
                ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-500' 
                : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
            }`}
          >
            <option value="5">Last 5 Alerts</option>
            <option value="10">Last 10 Alerts</option>
            <option value="20">Last 20 Alerts</option>
            <option value="50">Last 50 Alerts</option>
            <option value="100">Last 100 Alerts</option>
          </select>
        </div>
      </div>

      {/* Alert Log Table */}
      {alertLogData.length > 0 && !alertLogLoading ? (
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
          <div className="overflow-x-auto max-h-[600px]">
            <table className={`min-w-full divide-y ${darkMode ? 'divide-gray-600' : 'divide-gray-200'}`}>
              <thead className={`sticky top-0 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <tr>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    darkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    #
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    darkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    Timestamp
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    darkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    Sensor Name
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    darkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    Status
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    darkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    Actual Value
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    darkMode ? 'text-gray-300' : 'text-gray-500'
                  }`}>
                    Threshold
                  </th>
                </tr>
              </thead>
              <tbody className={`divide-y ${darkMode ? 'divide-gray-600' : 'divide-gray-200'}`}>
                {alertLogData.map((alert, index) => (
                  <tr key={index} className={`transition-colors ${
                    darkMode 
                      ? 'bg-gray-800 hover:bg-gray-700' 
                      : 'bg-white hover:bg-gray-50'
                  }`}>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                      darkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {alertLogData.length - index}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                      darkMode ? 'text-gray-200' : 'text-gray-900'
                    }`}>
                      {formatDateTime(alert.timestamp)}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${
                      darkMode ? 'text-blue-400' : 'text-blue-600'
                    }`}>
                      {alert.sensor_name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center space-x-2">
                        <span className={getStatusColor(alert.status)}>
                          {getStatusIcon(alert.status)}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(alert.status)}`}>
                          {alert.status || 'Unknown'}
                        </span>
                      </div>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold ${
                      darkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {alert.actual_value !== null && alert.actual_value !== undefined ? `${alert.actual_value} A` : 'N/A'}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                      darkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      {alert.threshold_value !== null && alert.threshold_value !== undefined ? `${alert.threshold_value} A` : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className={`px-6 py-4 border-t ${darkMode ? 'border-gray-600 bg-gray-700/50' : 'border-gray-200 bg-gray-50'}`}>
            <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Showing {alertLogData.length} alert{alertLogData.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      ) : alertLogLoading ? (
        <div className={`text-center py-12 rounded-xl border shadow-lg ${
          darkMode 
            ? 'bg-gradient-to-r from-gray-800 to-gray-700 border-gray-600' 
            : 'bg-white border-gray-200'
        }`}>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className={`text-lg font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Loading alerts...
          </p>
        </div>
      ) : (
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
          <Bell className={`h-16 w-16 mx-auto mb-4 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
          <p className={`text-xl font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            No alerts found
          </p>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            There are no alert logs to display at this time.
          </p>
        </div>
      )}
    </section>
  );
};

export default AlertLog;
