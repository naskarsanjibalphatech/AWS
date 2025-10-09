import React from 'react';
import Header from '../../components/Header';
import LiveTrends from '../../components/LiveTrends';

const LiveTrendsPage = (props) => {
  const {
    darkMode,
    setDarkMode,
    sidebarOpen,
    setSidebarOpen,
    currentTime,
    realtimeTrendData,
    realtimeTrendLoading
  } = props;

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
        <LiveTrends 
          realtimeTrendSectionRef={React.createRef()}
          darkMode={darkMode}
          realtimeTrendData={realtimeTrendData}
          realtimeTrendLoading={realtimeTrendLoading}
        />
      </main>
    </div>
  );
};

export default LiveTrendsPage;
