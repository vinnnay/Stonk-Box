import React, { useState } from 'react';
import './App.css';
import StockChart from './StockChart';

function App() {
  const [symbol, setSymbol] = useState('SPY');

  return (
    <div className="App">
      <h1>Stock Analysis</h1>
      <div>
        <label>
          Symbol:
          <input
            type="text"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            placeholder="Enter symbol"
          />
        </label>
      </div>
      <StockChart symbol={symbol} />
    </div>
  );
}

export default App;
