import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Activity, Clock, Moon, Sun, Menu, X,
  LayoutDashboard, Zap, TrendingUp, Bell, Settings, FileText, BarChart3
} from 'lucide-react';

const Header = ({ darkMode, setDarkMode, sidebarOpen, setSidebarOpen, currentTime }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/live-data', label: 'Live Data', icon: Zap },
    { path: '/live-trends', label: 'Live Trends', icon: TrendingUp },
    { path: '/alert-log', label: 'Alert Log', icon: Bell },
    { path: '/threshold', label: 'Threshold', icon: Settings },
    { path: '/reports', label: 'Reports', icon: FileText },
    { path: '/historical-trends', label: 'Historical Trends', icon: BarChart3 }
  ];

  return (
    <header className={`sticky top-0 z-50 ${
      darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    } border-b shadow-sm`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Title */}
          <div className="flex items-center space-x-4 cursor-pointer" onClick={() => navigate('/dashboard')}>
            <div className="flex items-center space-x-2">
              <Activity className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  CLOUD SCADA
                </h1>
                <p className="text-xs text-gray-500 font-medium">KISWOK INDUSTRIES</p>
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive(item.path)
                      ? darkMode
                        ? 'bg-blue-600 text-white'
                        : 'bg-blue-100 text-blue-700'
                      : darkMode
                      ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Header Controls */}
          <div className="flex items-center space-x-4">
            {/* Current Time */}
            <div className={`hidden lg:flex items-center space-x-2 px-3 py-2 rounded-lg ${
              darkMode ? 'bg-gray-700' : 'bg-gray-100'
            }`}>
              <Clock className="h-4 w-4 text-gray-500" />
              <span className={`text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                {currentTime.toLocaleString('en-IN', { hour12: true })}
              </span>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-lg transition-colors ${
                darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 rounded-lg"
            >
              {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {sidebarOpen && (
        <div className={`md:hidden border-t ${
          darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
        }`}>
          <div className="px-4 py-3 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    setSidebarOpen(false);
                  }}
                  className={`flex items-center space-x-3 w-full text-left px-3 py-2 rounded-md text-base font-medium ${
                    isActive(item.path)
                      ? darkMode
                        ? 'bg-blue-600 text-white'
                        : 'bg-blue-100 text-blue-700'
                      : darkMode
                      ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
