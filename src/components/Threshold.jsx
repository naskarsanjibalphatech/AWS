import React from 'react';
import { AlertTriangle } from 'lucide-react';

// Threshold Card Component
const ThresholdCard = React.memo(({ 
  phase, 
  phaseId, 
  color, 
  currentValue, 
  darkMode, 
  thresholdLoading, 
  updateThreshold,
  editingState,
  setEditingState
}) => {
  const colorClasses = {
    red: {
      bg: darkMode ? 'from-red-900/20 to-gray-800' : 'from-red-50 to-white',
      border: darkMode ? 'border-red-800' : 'border-red-200',
      text: 'text-red-500',
      button: 'bg-red-600 hover:bg-red-700'
    },
    yellow: {
      bg: darkMode ? 'from-yellow-900/20 to-gray-800' : 'from-yellow-50 to-white',
      border: darkMode ? 'border-yellow-800' : 'border-yellow-200',
      text: 'text-yellow-500',
      button: 'bg-yellow-600 hover:bg-yellow-700'
    },
    blue: {
      bg: darkMode ? 'from-blue-900/20 to-gray-800' : 'from-blue-50 to-white',
      border: darkMode ? 'border-blue-800' : 'border-blue-200',
      text: 'text-blue-500',
      button: 'bg-blue-600 hover:bg-blue-700'
    }
  };

  const handleUpdate = async () => {
    const value = parseFloat(editingState.inputValue);
    if (isNaN(value) || value < 0) {
      alert('Please enter a valid positive number');
      return;
    }
    await updateThreshold(phaseId, value);
    setEditingState({ isEditing: false, inputValue: '' });
  };

  const handleStartEdit = () => {
    setEditingState({ isEditing: true, inputValue: '' });
  };

  const handleCancel = () => {
    setEditingState({ isEditing: false, inputValue: '' });
  };

  const handleInputChange = (e) => {
    setEditingState({ ...editingState, inputValue: e.target.value });
  };

  return (
    <div className={`relative rounded-2xl p-6 transform hover:scale-105 transition-all duration-300 border ${
      colorClasses[color].border
    } bg-gradient-to-br ${colorClasses[color].bg}`}
    style={{
      boxShadow: darkMode 
        ? '0 25px 50px -12px rgba(0, 0, 0, 0.6)' 
        : '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
    }}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Phase {phase} Current
          </h3>
          <AlertTriangle className={`h-5 w-5 ${colorClasses[color].text}`} />
        </div>

        {/* Current Threshold Value */}
        <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-white/50'}`}>
          <p className={`text-xs font-medium mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Current Threshold
          </p>
          <p className={`text-2xl font-bold ${colorClasses[color].text}`}>
            {currentValue !== null ? `${currentValue.toFixed(2)} A` : 'Loading...'}
          </p>
        </div>

        {/* Input Section */}
        {editingState.isEditing ? (
          <div className="space-y-3">
            <input
              type="number"
              step="0.01"
              placeholder="Enter new threshold"
              value={editingState.inputValue}
              onChange={handleInputChange}
              autoFocus
              className={`w-full px-3 py-2 rounded-lg border ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:outline-none focus:ring-2 focus:ring-${color}-500`}
            />
            <div className="flex space-x-2">
              <button
                onClick={handleUpdate}
                disabled={thresholdLoading}
                className={`flex-1 ${colorClasses[color].button} text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50`}
              >
                {thresholdLoading ? 'Updating...' : 'Update'}
              </button>
              <button
                onClick={handleCancel}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  darkMode 
                    ? 'bg-gray-600 hover:bg-gray-500 text-white' 
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                }`}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={handleStartEdit}
            className={`w-full ${colorClasses[color].button} text-white px-4 py-2 rounded-lg font-medium transition-colors`}
          >
            Set New Threshold
          </button>
        )}
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.currentValue === nextProps.currentValue &&
    prevProps.thresholdLoading === nextProps.thresholdLoading &&
    prevProps.editingState.isEditing === nextProps.editingState.isEditing &&
    prevProps.editingState.inputValue === nextProps.editingState.inputValue &&
    prevProps.darkMode === nextProps.darkMode
  );
});

const Threshold = ({ 
  thresholdRef, 
  darkMode, 
  thresholdData, 
  thresholdLoading, 
  thresholdError, 
  updateThreshold,
  thresholdEditingState,
  setThresholdEditingState
}) => {
  return (
    <section ref={thresholdRef} className="space-y-6">
      <div className="flex items-center space-x-3">
        <AlertTriangle className="h-6 w-6 text-orange-600" />
        <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Set Current Thresholds</h2>
      </div>

      {/* Threshold Error Display */}
      {thresholdError && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <p className="text-sm font-medium text-red-600 dark:text-red-400">{thresholdError}</p>
          </div>
        </div>
      )}

      {/* Threshold Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ThresholdCard
          phase="R"
          phaseId="I_RPhase"
          color="red"
          currentValue={thresholdData.I_RPhase}
          darkMode={darkMode}
          thresholdLoading={thresholdLoading}
          updateThreshold={updateThreshold}
          editingState={thresholdEditingState.I_RPhase}
          setEditingState={(state) => setThresholdEditingState(prev => ({
            ...prev,
            I_RPhase: state
          }))}
        />
        <ThresholdCard
          phase="Y"
          phaseId="I_YPhase"
          color="yellow"
          currentValue={thresholdData.I_YPhase}
          darkMode={darkMode}
          thresholdLoading={thresholdLoading}
          updateThreshold={updateThreshold}
          editingState={thresholdEditingState.I_YPhase}
          setEditingState={(state) => setThresholdEditingState(prev => ({
            ...prev,
            I_YPhase: state
          }))}
        />
        <ThresholdCard
          phase="B"
          phaseId="I_BPhase"
          color="blue"
          currentValue={thresholdData.I_BPhase}
          darkMode={darkMode}
          thresholdLoading={thresholdLoading}
          updateThreshold={updateThreshold}
          editingState={thresholdEditingState.I_BPhase}
          setEditingState={(state) => setThresholdEditingState(prev => ({
            ...prev,
            I_BPhase: state
          }))}
        />
      </div>
    </section>
  );
};

export default Threshold;
