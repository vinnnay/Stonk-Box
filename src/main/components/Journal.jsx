import React, { useState } from 'react';

const Journal = () => {
  const [entries, setEntries] = useState([]);
  const [note, setNote] = useState('');

  const addEntry = () => {
    if (note) {
      setEntries([...entries, { note, date: new Date().toLocaleString() }]);
      setNote('');
    }
  };

  return (
    <div>
      <h2>Trade Journal</h2>
      <textarea
        value={note}
        onChange={e => setNote(e.target.value)}
        placeholder="Log your trade, strategy, or observation..."
        rows={3}
        cols={40}
      />
      <br />
      <button onClick={addEntry}>Add Entry</button>
      <ul>
        {entries.map((entry, idx) => (
          <li key={idx}>
            <strong>{entry.date}</strong>: {entry.note}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Journal;