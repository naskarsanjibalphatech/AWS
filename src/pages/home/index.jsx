import React from 'react';
import Container from './Container';
export { default as Home } from './home';
export { default as AppRouter } from './home/AppRouter';
export { default as Dashboard } from './home/Dashboard';
export { default as LiveDataPage } from './home/LiveDataPage';
export { default as LiveTrendsPage } from './home/LiveTrendsPage';
export { default as AlertLogPage } from './home/AlertLogPage';
export { default as ThresholdPage } from './home/ThresholdPage';
export { default as HistoricalReportPage } from './home/HistoricalReportPage';


const Index = () => {
  return <Container />;
};

export default Index;
