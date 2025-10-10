import React from 'react';
import { useLocation } from 'react-router-dom';
import Container from './Container';
import Dashboard from './Dashboard';
import LiveDataPage from './LiveDataPage';
import AlertLogPage from './AlertLogPage';
import ThresholdPage from './ThresholdPage';
import HistoricalReportPage from './HistoricalReportPage';
import HistoricalTrendsPage from './HistoricalTrendsPage'; // NEW IMPORT


const AppRouter = () => {
  const location = useLocation();

  return (
    <Container>
      {(props) => {
        switch (location.pathname) {
          case '/dashboard':
            return <Dashboard {...props} />;
          case '/live-data':
            return <LiveDataPage {...props} />;
          case '/alert-log':
            return <AlertLogPage {...props} />;
          case '/threshold':
            return <ThresholdPage {...props} />;
          case '/reports':
            return <HistoricalReportPage {...props} />; // Reports only
          case '/historical-trends':
            return <HistoricalTrendsPage {...props} />; // Trends with multi-parameter
          default:
            return <Dashboard {...props} />;
        }
      }}
    </Container>
  );
};

export default AppRouter;
