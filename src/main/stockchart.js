// src/StockChart.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, LineElement, Title, Tooltip, Legend);

const StockChart = ({ symbol }) => {
  const [stockData, setStockData] = useState(null);

  useEffect(() => {
    const fetchStockData = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/stock/${symbol}`);
        setStockData(response.data);
      } catch (error) {
        console.error('Error fetching stock data:', error);
      }
    };

    fetchStockData();
  }, [symbol]);

  const formatChartData = (data) => {
    const labels = Object.keys(data);
    const prices = labels.map((timestamp) => data[timestamp]["4. close"]);

    return {
      labels,
      datasets: [
        {
          label: `${symbol} Price`,
          data: prices,
          borderColor: 'rgba(75,192,192,1)',
          borderWidth: 1,
          fill: false,
        },
      ],
    };
  };

  return (
    <div>
      <h2>{symbol} Stock Chart</h2>
      {stockData ? (
        <Line data={formatChartData(stockData)} />
      ) : (
        <p>Loading data...</p>
      )}
    </div>
  );
};

export default StockChart;
