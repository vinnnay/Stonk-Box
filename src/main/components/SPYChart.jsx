import React from 'react';
// You can replace lightweight-charts with TradingView widget if preferred
import { createChart } from 'lightweight-charts';

const SPYChart = () => {
  React.useEffect(() => {
    const chart = createChart(document.getElementById('spy-chart'), {
      width: 700,
      height: 400,
    });
    // Example price series, replace with API data
    const lineSeries = chart.addLineSeries();
    lineSeries.setData([
      { time: '2022-01-01', value: 470 },
      { time: '2022-01-02', value: 468 },
      { time: '2022-01-03', value: 472 },
    ]);
    return () => chart.remove();
  }, []);
  return <div id="spy-chart" />;
};

export default SPYChart;