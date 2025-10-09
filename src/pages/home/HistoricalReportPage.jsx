import React from 'react';
import Header from '../../components/Header';
import HistoricalReport from '../../components/HistoricalReport';

const HistoricalReportPage = (props) => {
  const {
    darkMode,
    setDarkMode,
    sidebarOpen,
    setSidebarOpen,
    currentTime,
    reportData,
    reportLoading,
    reportConfig,
    setReportConfig,
    fromDateRef,
    toDateRef,
    fetchReportData,
    showReports = false,
    showTrends = false
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
        <HistoricalReport 
          reportsRef={React.createRef()}
          trendsRef={React.createRef()}
          darkMode={darkMode}
          reportData={reportData}
          reportLoading={reportLoading}
          reportConfig={reportConfig}
          setReportConfig={setReportConfig}
          fromDateRef={fromDateRef}
          toDateRef={toDateRef}
          fetchReportData={fetchReportData}
        />
      </main>
    </div>
  );
};

export default HistoricalReportPage;
