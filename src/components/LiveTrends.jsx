import React, { useState } from 'react';
import { TrendingUp, Eye, EyeOff } from 'lucide-react';
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

const LiveTrends = ({ realtimeTrendSectionRef, darkMode, realtimeTrendData, realtimeTrendLoading }) => {
  // Phase visibility state
  const [visiblePhases, setVisiblePhases] = useState({
    R: true,
    Y: true,
    B: true
  });

  const togglePhase = (phase) => {
    setVisiblePhases(prev => ({
      ...prev,
      [phase]: !prev[phase]
    }));
  };

  return (
    <section ref={realtimeTrendSectionRef} className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <TrendingUp className="h-6 w-6 text-blue-600" />
          <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Live Trends</h2>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
            darkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700'
          } animate-pulse`}>
            Updates every 3s
          </span>
        </div>

        {/* Phase Toggle Controls */}
        <div className="flex items-center space-x-2">
          <span className={`text-sm font-medium mr-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Show:
          </span>
          <button
            onClick={() => togglePhase('R')}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              visiblePhases.R
                ? darkMode
                  ? 'bg-red-900/30 text-red-400 border border-red-700'
                  : 'bg-red-100 text-red-700 border border-red-300'
                : darkMode
                ? 'bg-gray-700 text-gray-500 border border-gray-600'
                : 'bg-gray-200 text-gray-500 border border-gray-300'
            }`}
          >
            {visiblePhases.R ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            <span>R Phase</span>
          </button>

          <button
            onClick={() => togglePhase('Y')}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              visiblePhases.Y
                ? darkMode
                  ? 'bg-yellow-900/30 text-yellow-400 border border-yellow-700'
                  : 'bg-yellow-100 text-yellow-700 border border-yellow-300'
                : darkMode
                ? 'bg-gray-700 text-gray-500 border border-gray-600'
                : 'bg-gray-200 text-gray-500 border border-gray-300'
            }`}
          >
            {visiblePhases.Y ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            <span>Y Phase</span>
          </button>

          <button
            onClick={() => togglePhase('B')}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              visiblePhases.B
                ? darkMode
                  ? 'bg-blue-900/30 text-blue-400 border border-blue-700'
                  : 'bg-blue-100 text-blue-700 border border-blue-300'
                : darkMode
                ? 'bg-gray-700 text-gray-500 border border-gray-600'
                : 'bg-gray-200 text-gray-500 border border-gray-300'
            }`}
          >
            {visiblePhases.B ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            <span>B Phase</span>
          </button>
        </div>
      </div>

      {realtimeTrendData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Voltages Chart */}
          <div className={`rounded-xl p-6 shadow-lg ${
            darkMode 
              ? 'bg-gradient-to-r from-gray-800 to-gray-700 border border-gray-600 shadow-gray-900/50' 
              : 'bg-white border border-gray-200'
          }`}
          style={{
            boxShadow: !darkMode 
              ? '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' 
              : undefined
          }}>
            <div className="mb-4">
              <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                3-Phase Voltages
              </h3>
              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Last 5 readings</p>
            </div>
            
            <div style={{width: '100%', height: '300px'}}>
              <ResponsiveContainer>
                <LineChart 
                  data={realtimeTrendData}
                  isAnimationActive={false} 
                  margin={{ top: 5, right: 10, left: 0, bottom: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#f0f0f0'} />
                  <XAxis 
                    dataKey="shortTime"
                    tick={{ fontSize: 10, fill: darkMode ? '#D1D5DB' : '#6B7280' }}
                    angle={-45}
                    textAnchor="end"
                    height={70}
                  />
                  <YAxis 
                    tick={{ fontSize: 10, fill: darkMode ? '#D1D5DB' : '#6B7280' }}
                    label={{ 
                      value: 'Voltage (V)', 
                      angle: -90, 
                      position: 'insideLeft',
                      style: { textAnchor: 'middle', fill: darkMode ? '#D1D5DB' : '#6B7280', fontSize: 11 }
                    }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                      border: darkMode ? '1px solid #374151' : '1px solid #e5e7eb',
                      borderRadius: '6px',
                      color: darkMode ? '#D1D5DB' : '#374151',
                      fontSize: '11px'
                    }}
                  />
                  <Legend 
                    wrapperStyle={{ paddingTop: '10px', fontSize: '11px' }}
                    iconType="line"
                  />
                  {visiblePhases.R && (
                    <Line type="monotone" dataKey="voltageR" stroke="#ef4444" strokeWidth={2} name="R Phase" dot={{ r: 3 }} isAnimationActive={false} animationDuration={0} />
                  )}
                  {visiblePhases.Y && (
                    <Line type="monotone" dataKey="voltageY" stroke="#eab308" strokeWidth={2} name="Y Phase" dot={{ r: 3 }} isAnimationActive={false} animationDuration={0} />
                  )}
                  {visiblePhases.B && (
                    <Line type="monotone" dataKey="voltageB" stroke="#3b82f6" strokeWidth={2} name="B Phase" dot={{ r: 3 }} isAnimationActive={false} animationDuration={0} />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            <div className={`mt-4 text-xs text-center p-2 rounded-lg ${
              darkMode ? 'text-gray-300 bg-gray-700' : 'text-gray-600 bg-gray-50'
            }`}>
              <div className="flex items-center justify-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Live updating</span>
              </div>
            </div>
          </div>

          {/* Currents Chart */}
          <div className={`rounded-xl p-6 shadow-lg ${
            darkMode 
              ? 'bg-gradient-to-r from-gray-800 to-gray-700 border border-gray-600 shadow-gray-900/50' 
              : 'bg-white border border-gray-200'
          }`}
          style={{
            boxShadow: !darkMode 
              ? '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' 
              : undefined
          }}>
            <div className="mb-4">
              <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                3-Phase Currents
              </h3>
              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Last 5 readings</p>
            </div>
            
            <div style={{width: '100%', height: '300px'}}>
              <ResponsiveContainer>
                <LineChart 
                  data={realtimeTrendData}
                  isAnimationActive={false} 
                  margin={{ top: 5, right: 10, left: 0, bottom: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#f0f0f0'} />
                  <XAxis 
                    dataKey="shortTime"
                    tick={{ fontSize: 10, fill: darkMode ? '#D1D5DB' : '#6B7280' }}
                    angle={-45}
                    textAnchor="end"
                    height={70}
                  />
                  <YAxis 
                    tick={{ fontSize: 10, fill: darkMode ? '#D1D5DB' : '#6B7280' }}
                    label={{ 
                      value: 'Current (A)', 
                      angle: -90, 
                      position: 'insideLeft',
                      style: { textAnchor: 'middle', fill: darkMode ? '#D1D5DB' : '#6B7280', fontSize: 11 }
                    }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                      border: darkMode ? '1px solid #374151' : '1px solid #e5e7eb',
                      borderRadius: '6px',
                      color: darkMode ? '#D1D5DB' : '#374151',
                      fontSize: '11px'
                    }}
                  />
                  <Legend 
                    wrapperStyle={{ paddingTop: '10px', fontSize: '11px' }}
                    iconType="line"
                  />
                  {visiblePhases.R && (
                    <Line type="monotone" dataKey="currentR" stroke="#ef4444" strokeWidth={2} name="R Phase" dot={{ r: 3 }} isAnimationActive={false} animationDuration={0} />
                  )}
                  {visiblePhases.Y && (
                    <Line type="monotone" dataKey="currentY" stroke="#eab308" strokeWidth={2} name="Y Phase" dot={{ r: 3 }} isAnimationActive={false} animationDuration={0} />
                  )}
                  {visiblePhases.B && (
                    <Line type="monotone" dataKey="currentB" stroke="#3b82f6" strokeWidth={2} name="B Phase" dot={{ r: 3 }} isAnimationActive={false} animationDuration={0} />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            <div className={`mt-4 text-xs text-center p-2 rounded-lg ${
              darkMode ? 'text-gray-300 bg-gray-700' : 'text-gray-600 bg-gray-50'
            }`}>
              <div className="flex items-center justify-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Live updating</span>
              </div>
            </div>
          </div>

          {/* Energy (kWh) Chart */}
          <div className={`rounded-xl p-6 shadow-lg ${
            darkMode 
              ? 'bg-gradient-to-r from-gray-800 to-gray-700 border border-gray-600 shadow-gray-900/50' 
              : 'bg-white border border-gray-200'
          }`}
          style={{
            boxShadow: !darkMode 
              ? '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' 
              : undefined
          }}>
            <div className="mb-4">
              <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Energy Consumption
              </h3>
              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Last 5 readings</p>
            </div>
            
            <div style={{width: '100%', height: '300px'}}>
              <ResponsiveContainer>
                <LineChart 
                  data={realtimeTrendData} 
                  margin={{ top: 5, right: 10, left: 0, bottom: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#f0f0f0'} />
                  <XAxis 
                    dataKey="shortTime"
                    tick={{ fontSize: 10, fill: darkMode ? '#D1D5DB' : '#6B7280' }}
                    angle={-45}
                    textAnchor="end"
                    height={70}
                  />
                  <YAxis 
                    tick={{ fontSize: 10, fill: darkMode ? '#D1D5DB' : '#6B7280' }}
                    label={{ 
                      value: 'Energy (kWh)', 
                      angle: -90, 
                      position: 'insideLeft',
                      style: { textAnchor: 'middle', fill: darkMode ? '#D1D5DB' : '#6B7280', fontSize: 11 }
                    }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                      border: darkMode ? '1px solid #374151' : '1px solid #e5e7eb',
                      borderRadius: '6px',
                      color: darkMode ? '#D1D5DB' : '#374151',
                      fontSize: '11px'
                    }}
                  />
                  <Legend 
                    wrapperStyle={{ paddingTop: '10px', fontSize: '11px' }}
                    iconType="line"
                  />
                  <Line type="monotone" dataKey="kwh" stroke="#10b981" strokeWidth={2} name="Total kWh" dot={{ r: 3 }} isAnimationActive={false} animationDuration={0} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            <div className={`mt-4 text-xs text-center p-2 rounded-lg ${
              darkMode ? 'text-gray-300 bg-gray-700' : 'text-gray-600 bg-gray-50'
            }`}>
              <div className="flex items-center justify-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Live updating</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default LiveTrends;
