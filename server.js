// server.js
const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Endpoint to fetch stock data for a specific symbol (e.g., SPY)
app.get('/api/stock/:symbol', async (req, res) => {
  const { symbol } = req.params;
  const API_KEY = process.env.ALPHA_VANTAGE_API_KEY;
  
  try {
    const response = await axios.get(`https://www.alphavantage.co/query`, {
      params: {
        function: 'TIME_SERIES_INTRADAY',
        symbol,
        interval: '5min',
        apikey: API_KEY
      }
    });
    
    if (response.data["Time Series (5min)"]) {
      res.json(response.data["Time Series (5min)"]);
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
