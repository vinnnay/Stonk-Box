// src/main/App.js
import React, { useState } from 'react';
import './App.css';
import StockChart from './StockChart';

function App() {
  const [symbol, setSymbol] = useState('SPY');

  return (
    <div className="App">
      <h1>Stock Analysis Platform</h1>
      <div>
        <label>
          Enter Stock Symbol:
          <input 
            type="text" 
            value={symbol} 
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
          />
        </label>
      </div>
      <StockChart symbol={symbol} />
    </div>
  );
}

export default App;
