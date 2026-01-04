import React, { useMemo, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
);

const randomDataset = (length) => Array.from({ length }, () => Math.random() * 100);

const BreakoutDetector = () => {
  const [windowSize, setWindowSize] = useState(20);
  const [pivotSensitivity, setPivotSensitivity] = useState(0.02);

  const handleWindowChange = (event) => setWindowSize(Number(event.target.value));
  const handleSensitivityChange = (event) => setPivotSensitivity(Number(event.target.value));

  const chartData = useMemo(
    () => ({
      labels: [...Array(50).keys()],
      datasets: [
        {
          label: 'Price',
          data: randomDataset(50),
          borderColor: '#007bff',
          borderWidth: 2,
          pointRadius: 0,
          tension: 0.2,
        },
      ],
    }),
    [windowSize, pivotSensitivity],
  );

  return (
    <div style={{ width: '600px', maxWidth: '100%', margin: '2rem auto' }}>
      <h2>Breakout Detector</h2>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '1rem' }}>
        <label>
          Window Size:
          <input
            type="number"
            value={windowSize}
            onChange={handleWindowChange}
            min={5}
            max={100}
            step={1}
            style={{ marginLeft: '0.5rem', width: '70px' }}
          />
        </label>
        <label>
          Pivot Sensitivity:
          <input
            type="number"
            value={pivotSensitivity}
            onChange={handleSensitivityChange}
            min={0.001}
            max={0.1}
            step={0.001}
            style={{ marginLeft: '0.5rem', width: '90px' }}
          />
        </label>
      </div>

      <div style={{ height: '320px' }}>
        <Line data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
      </div>

      <p style={{ marginTop: '1rem' }}>
        Current window size: <strong>{windowSize}</strong> | Pivot sensitivity:{' '}
        <strong>{pivotSensitivity}</strong>
      </p>
    </div>
  );
};

export default BreakoutDetector;

