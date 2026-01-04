// server.js
import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const API_KEY = process.env.ALPHA_VANTAGE_API_KEY;

// Realtime quote for a symbol
app.get('/api/quote/:symbol', async (req, res) => {
  const { symbol } = req.params;

  try {
    const response = await axios.get('https://www.alphavantage.co/query', {
      params: {
        function: 'GLOBAL_QUOTE',
        symbol,
        apikey: API_KEY
      }
    });

    const quote = response.data['Global Quote'];
    if (quote && Object.keys(quote).length > 0) {
      res.json({
        symbol: quote['01. symbol'],
        price: parseFloat(quote['05. price']),
        change: parseFloat(quote['09. change']),
        changePercent: quote['10. change percent'],
        volume: parseInt(quote['06. volume'], 10),
        latestTradingDay: quote['07. latest trading day'],
        previousClose: parseFloat(quote['08. previous close']),
        open: parseFloat(quote['02. open']),
        high: parseFloat(quote['03. high']),
        low: parseFloat(quote['04. low'])
      });
    } else {
      res.status(400).json({ error: 'Invalid symbol or no data available.' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error fetching quote data' });
  }
});

// Daily historical data for analysis
app.get('/api/daily/:symbol', async (req, res) => {
  const { symbol } = req.params;

  try {
    const response = await axios.get('https://www.alphavantage.co/query', {
      params: {
        function: 'TIME_SERIES_DAILY',
        symbol,
        outputsize: 'compact',
        apikey: API_KEY
      }
    });

    const timeSeries = response.data['Time Series (Daily)'];
    if (timeSeries) {
      const data = Object.entries(timeSeries)
        .map(([date, values]) => ({
          date,
          open: parseFloat(values['1. open']),
          high: parseFloat(values['2. high']),
          low: parseFloat(values['3. low']),
          close: parseFloat(values['4. close']),
          volume: parseInt(values['5. volume'], 10)
        }))
        .sort((a, b) => new Date(a.date) - new Date(b.date));

      res.json(data);
    } else {
      res.status(400).json({ error: 'Invalid symbol or no data available.' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error fetching daily data' });
  }
});

// Intraday data (existing endpoint)
app.get('/api/stock/:symbol', async (req, res) => {
  const { symbol } = req.params;

  try {
    const response = await axios.get('https://www.alphavantage.co/query', {
      params: {
        function: 'TIME_SERIES_INTRADAY',
        symbol,
        interval: '5min',
        apikey: API_KEY
      }
    });

    if (response.data['Time Series (5min)']) {
      res.json(response.data['Time Series (5min)']);
    } else {
      res.status(400).json({ error: 'Invalid symbol or no data available.' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error fetching stock data' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
