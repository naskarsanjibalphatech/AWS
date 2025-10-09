import React from 'react';
import Header from '../../components/Header';
import Threshold from '../../components/Threshold';

const ThresholdPage = (props) => {
  const {
    darkMode,
    setDarkMode,
    sidebarOpen,
    setSidebarOpen,
    currentTime,
    thresholdData,
    thresholdLoading,
    thresholdError,
    updateThreshold,
    thresholdEditingState,
    setThresholdEditingState
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
        <Threshold 
          thresholdRef={React.createRef()}
          darkMode={darkMode}
          thresholdData={thresholdData}
          thresholdLoading={thresholdLoading}
          thresholdError={thresholdError}
          updateThreshold={updateThreshold}
          thresholdEditingState={thresholdEditingState}
          setThresholdEditingState={setThresholdEditingState}
        />
      </main>
    </div>
  );
};

export default ThresholdPage;
