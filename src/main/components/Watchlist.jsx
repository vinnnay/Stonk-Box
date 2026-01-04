import React, { useState } from 'react';

const Watchlist = () => {
  const [tickers, setTickers] = useState(['SPY', 'QQQ', 'AAPL']);
  const [input, setInput] = useState('');

  const addTicker = () => {
    if (input && !tickers.includes(input.toUpperCase())) {
      setTickers([...tickers, input.toUpperCase()]);
      setInput('');
    }
  };

  const removeTicker = (ticker) => {
    setTickers(tickers.filter(t => t !== ticker));
  };

  return (
    <div>
      <h2>Watchlist</h2>
      <input
        type="text"
        value={input}
        onChange={e => setInput(e.target.value)}
        placeholder="Add ticker..."
      />
      <button onClick={addTicker}>Add</button>
      <ul>
        {tickers.map(ticker => (
          <li key={ticker}>
            {ticker}
            <button onClick={() => removeTicker(ticker)}>Remove</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Watchlist;