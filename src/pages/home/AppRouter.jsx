import React from 'react';
import { useLocation } from 'react-router-dom';
import Container from './Container';
import Dashboard from './Dashboard';
import LiveDataPage from './LiveDataPage';
import LiveTrendsPage from './LiveTrendsPage';
import AlertLogPage from './AlertLogPage';
import ThresholdPage from './ThresholdPage';
import HistoricalReportPage from './HistoricalReportPage';

const AppRouter = () => {
  const location = useLocation();

  // Container provides all data to child pages
  return (
    <Container>
      {(props) => {
        // Route to appropriate page based on URL
        switch (location.pathname) {
          case '/dashboard':
            return <Dashboard {...props} />;
          case '/live-data':
            return <LiveDataPage {...props} />;
          case '/live-trends':
            return <LiveTrendsPage {...props} />;
          case '/alert-log':
            return <AlertLogPage {...props} />;
          case '/threshold':
            return <ThresholdPage {...props} />;
          case '/reports':
            return <HistoricalReportPage {...props} showReports={true} />;
          case '/historical-trends':
            return <HistoricalReportPage {...props} showTrends={true} />;
          default:
            return <Dashboard {...props} />;
        }
      }}
    </Container>
  );
};

export default AppRouter;
