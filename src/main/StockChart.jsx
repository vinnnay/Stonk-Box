import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
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

// ============ TECHNICAL INDICATORS ============

const calculateSMA = (data, period) => {
  const sma = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      sma.push(null);
    } else {
      const sum = data.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
      sma.push(sum / period);
    }
  }
  return sma;
};

const calculateEMA = (data, period) => {
  const ema = [];
  const multiplier = 2 / (period + 1);

  for (let i = 0; i < data.length; i++) {
    if (i === 0) {
      ema.push(data[0]);
    } else {
      ema.push((data[i] - ema[i - 1]) * multiplier + ema[i - 1]);
    }
  }
  return ema;
};

const calculateRSI = (closes, period = 14) => {
  const rsi = [];
  const gains = [];
  const losses = [];

  for (let i = 1; i < closes.length; i++) {
    const change = closes[i] - closes[i - 1];
    gains.push(change > 0 ? change : 0);
    losses.push(change < 0 ? Math.abs(change) : 0);
  }

  rsi.push(null); // First element has no RSI

  for (let i = 0; i < gains.length; i++) {
    if (i < period - 1) {
      rsi.push(null);
    } else if (i === period - 1) {
      const avgGain = gains.slice(0, period).reduce((a, b) => a + b, 0) / period;
      const avgLoss = losses.slice(0, period).reduce((a, b) => a + b, 0) / period;
      const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
      rsi.push(100 - (100 / (1 + rs)));
    } else {
      const prevRSI = rsi[rsi.length - 1];
      if (prevRSI === null) {
        rsi.push(null);
      } else {
        const avgGain = (gains.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0)) / period;
        const avgLoss = (losses.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0)) / period;
        const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
        rsi.push(100 - (100 / (1 + rs)));
      }
    }
  }

  return rsi;
};

const calculateMACD = (closes) => {
  const ema12 = calculateEMA(closes, 12);
  const ema26 = calculateEMA(closes, 26);
  const macdLine = ema12.map((val, i) => val - ema26[i]);
  const signalLine = calculateEMA(macdLine, 9);
  const histogram = macdLine.map((val, i) => val - signalLine[i]);

  return { macdLine, signalLine, histogram };
};

const calculateBollingerBands = (closes, period = 20, stdDev = 2) => {
  const sma = calculateSMA(closes, period);
  const upper = [];
  const lower = [];

  for (let i = 0; i < closes.length; i++) {
    if (i < period - 1) {
      upper.push(null);
      lower.push(null);
    } else {
      const slice = closes.slice(i - period + 1, i + 1);
      const mean = sma[i];
      const variance = slice.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / period;
      const std = Math.sqrt(variance);
      upper.push(mean + stdDev * std);
      lower.push(mean - stdDev * std);
    }
  }

  return { upper, middle: sma, lower };
};

// ============ SIGNAL GENERATION ============

const generateSignals = (candles) => {
  if (candles.length < 50) return { buySignals: [], sellSignals: [], analysis: null };

  const closes = candles.map(c => c.close);
  const rsi = calculateRSI(closes);
  const macd = calculateMACD(closes);
  const sma20 = calculateSMA(closes, 20);
  const sma50 = calculateSMA(closes, 50);
  const bollinger = calculateBollingerBands(closes);

  const buySignals = [];
  const sellSignals = [];

  for (let i = 50; i < candles.length; i++) {
    const reasons = [];

    // RSI signals
    if (rsi[i] !== null && rsi[i] < 30 && rsi[i - 1] >= 30) {
      reasons.push('RSI oversold (<30)');
    }
    if (rsi[i] !== null && rsi[i] > 70 && rsi[i - 1] <= 70) {
      sellSignals.push({ index: i, price: closes[i], reasons: ['RSI overbought (>70)'] });
      continue;
    }

    // MACD crossover
    if (macd.macdLine[i] > macd.signalLine[i] && macd.macdLine[i - 1] <= macd.signalLine[i - 1]) {
      reasons.push('MACD bullish crossover');
    }
    if (macd.macdLine[i] < macd.signalLine[i] && macd.macdLine[i - 1] >= macd.signalLine[i - 1]) {
      sellSignals.push({ index: i, price: closes[i], reasons: ['MACD bearish crossover'] });
      continue;
    }

    // Golden Cross / Death Cross
    if (sma20[i] > sma50[i] && sma20[i - 1] <= sma50[i - 1]) {
      reasons.push('Golden Cross (20 SMA > 50 SMA)');
    }
    if (sma20[i] < sma50[i] && sma20[i - 1] >= sma50[i - 1]) {
      sellSignals.push({ index: i, price: closes[i], reasons: ['Death Cross (20 SMA < 50 SMA)'] });
      continue;
    }

    // Bollinger Band touches
    if (closes[i] <= bollinger.lower[i] && closes[i - 1] > bollinger.lower[i - 1]) {
      reasons.push('Price touched lower Bollinger Band');
    }
    if (closes[i] >= bollinger.upper[i] && closes[i - 1] < bollinger.upper[i - 1]) {
      sellSignals.push({ index: i, price: closes[i], reasons: ['Price touched upper Bollinger Band'] });
      continue;
    }

    if (reasons.length > 0) {
      buySignals.push({ index: i, price: closes[i], reasons });
    }
  }

  // Current analysis
  const lastIdx = closes.length - 1;
  const currentRSI = rsi[lastIdx];
  const currentMACD = macd.histogram[lastIdx];
  const trendUp = sma20[lastIdx] > sma50[lastIdx];

  let recommendation = 'HOLD';
  let score = 0;

  if (currentRSI < 30) score += 2;
  else if (currentRSI < 50) score += 1;
  else if (currentRSI > 70) score -= 2;
  else if (currentRSI > 50) score -= 1;

  if (currentMACD > 0) score += 1;
  else score -= 1;

  if (trendUp) score += 1;
  else score -= 1;

  if (score >= 3) recommendation = 'STRONG BUY';
  else if (score >= 1) recommendation = 'BUY';
  else if (score <= -3) recommendation = 'STRONG SELL';
  else if (score <= -1) recommendation = 'SELL';

  return {
    buySignals,
    sellSignals,
    analysis: {
      recommendation,
      rsi: currentRSI?.toFixed(1) || 'N/A',
      macd: currentMACD?.toFixed(3) || 'N/A',
      trend: trendUp ? 'Bullish' : 'Bearish',
      sma20: sma20[lastIdx]?.toFixed(2) || 'N/A',
      sma50: sma50[lastIdx]?.toFixed(2) || 'N/A',
    },
    indicators: { rsi, macd, sma20, sma50, bollinger }
  };
};

// ============ CHART BUILDING ============

const buildChartDatasets = (candles, symbol, signals) => {
  if (!candles.length) return { datasets: [], labels: [] };

  const labels = candles.map(c => c.timestamp || c.date);
  const closes = candles.map(c => c.close);

  const datasets = [
    {
      label: `${symbol} Price`,
      data: closes,
      borderColor: '#10b981',
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      borderWidth: 2,
      pointRadius: 0,
      tension: 0.1,
      fill: true,
    },
  ];

  // Add SMA lines
  if (signals?.indicators) {
    datasets.push({
      label: 'SMA 20',
      data: signals.indicators.sma20,
      borderColor: '#3b82f6',
      borderWidth: 1.5,
      pointRadius: 0,
      borderDash: [5, 5],
    });
    datasets.push({
      label: 'SMA 50',
      data: signals.indicators.sma50,
      borderColor: '#f59e0b',
      borderWidth: 1.5,
      pointRadius: 0,
      borderDash: [5, 5],
    });
  }

  // Buy signals
  if (signals?.buySignals?.length > 0) {
    const buyData = new Array(candles.length).fill(null);
    signals.buySignals.forEach(s => { buyData[s.index] = s.price; });
    datasets.push({
      label: 'BUY Signal',
      data: buyData,
      borderColor: '#22c55e',
      backgroundColor: '#22c55e',
      pointRadius: 8,
      pointStyle: 'triangle',
      showLine: false,
    });
  }

  // Sell signals
  if (signals?.sellSignals?.length > 0) {
    const sellData = new Array(candles.length).fill(null);
    signals.sellSignals.forEach(s => { sellData[s.index] = s.price; });
    datasets.push({
      label: 'SELL Signal',
      data: sellData,
      borderColor: '#ef4444',
      backgroundColor: '#ef4444',
      pointRadius: 8,
      pointStyle: 'triangle',
      rotation: 180,
      showLine: false,
    });
  }

  return { labels, datasets };
};

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: { mode: 'index', intersect: false },
  plugins: {
    legend: { position: 'bottom', labels: { usePointStyle: true } },
    tooltip: {
      callbacks: {
        label: (ctx) => `${ctx.dataset.label}: $${ctx.raw?.toFixed(2) || 'N/A'}`,
      },
    },
  },
  scales: {
    x: { ticks: { maxTicksLimit: 10 } },
    y: {
      title: { display: true, text: 'Price ($)' },
      ticks: { callback: (v) => `$${v.toFixed(0)}` },
    },
  },
};

// ============ COMPONENT ============

const StockChart = ({ symbol }) => {
  const [candles, setCandles] = useState([]);
  const [quote, setQuote] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const [dailyRes, quoteRes] = await Promise.all([
          axios.get(`/api/daily/${symbol}`),
          axios.get(`/api/quote/${symbol}`).catch(() => null),
        ]);

        setCandles(dailyRes.data);
        if (quoteRes) setQuote(quoteRes.data);
      } catch (err) {
        console.error('Error:', err);
        setError('Unable to load data. Check symbol or try later.');
      } finally {
        setIsLoading(false);
      }
    };

    if (symbol) fetchData();
  }, [symbol]);

  const signals = useMemo(() => generateSignals(candles), [candles]);
  const chartData = useMemo(() => buildChartDatasets(candles, symbol, signals), [candles, symbol, signals]);

  const getRecommendationColor = (rec) => {
    if (rec?.includes('BUY')) return '#22c55e';
    if (rec?.includes('SELL')) return '#ef4444';
    return '#6b7280';
  };

  return (
    <div className="stock-chart">
      <div className="chart-header">
        <h2>{symbol}</h2>
        {quote && (
          <div className="quote-info">
            <span className="price">${quote.price?.toFixed(2)}</span>
            <span className={`change ${quote.change >= 0 ? 'positive' : 'negative'}`}>
              {quote.change >= 0 ? '+' : ''}{quote.change?.toFixed(2)} ({quote.changePercent})
            </span>
          </div>
        )}
      </div>

      {isLoading && <p>Loading...</p>}
      {error && <p className="error">{error}</p>}

      {!isLoading && !error && candles.length > 0 && (
        <>
          <div className="chart-area">
            <Line data={chartData} options={chartOptions} />
          </div>

          {signals.analysis && (
            <div className="analysis-panel">
              <div
                className="recommendation"
                style={{ backgroundColor: getRecommendationColor(signals.analysis.recommendation) }}
              >
                {signals.analysis.recommendation}
              </div>
              <div className="indicators">
                <div><strong>RSI:</strong> {signals.analysis.rsi}</div>
                <div><strong>MACD:</strong> {signals.analysis.macd}</div>
                <div><strong>Trend:</strong> {signals.analysis.trend}</div>
                <div><strong>SMA 20:</strong> ${signals.analysis.sma20}</div>
                <div><strong>SMA 50:</strong> ${signals.analysis.sma50}</div>
              </div>
              <div className="signal-summary">
                <span className="buy-count">▲ {signals.buySignals.length} Buy</span>
                <span className="sell-count">▼ {signals.sellSignals.length} Sell</span>
              </div>
            </div>
          )}
        </>
      )}

      {!isLoading && !error && candles.length === 0 && (
        <p>No data available.</p>
      )}
    </div>
  );
};

export default StockChart;
