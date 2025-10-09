import React from 'react';
import Header from '../../components/Header';
import AlertLog from '../../components/AlertLog';

const AlertLogPage = (props) => {
  const {
    darkMode,
    setDarkMode,
    sidebarOpen,
    setSidebarOpen,
    currentTime,
    alertLogData,
    alertLogLoading,
    alertLogCount,
    setAlertLogCount,
    fetchAlertLogData
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
        <AlertLog 
          alertLogRef={React.createRef()}
          darkMode={darkMode}
          alertLogData={alertLogData}
          alertLogLoading={alertLogLoading}
          alertLogCount={alertLogCount}
          setAlertLogCount={setAlertLogCount}
          fetchAlertLogData={fetchAlertLogData}
        />
      </main>
    </div>
  );
};

export default AlertLogPage;
