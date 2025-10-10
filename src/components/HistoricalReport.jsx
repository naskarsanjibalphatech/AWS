import React from 'react';
import { FileText, Filter } from 'lucide-react';

const HistoricalReport = ({ 
  reportsRef, 
  darkMode, 
  reportData, 
  reportLoading, 
  reportConfig, 
  setReportConfig,
  fromDateRef,
  toDateRef,
  fetchReportData
}) => {

  const getCurrentDateTime = () => {
    const now = new Date();
    return now.toISOString().slice(0, 16);
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
  );
};

export default HistoricalReport;
