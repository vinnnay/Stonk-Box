import React, { useState } from 'react';

const initialPosts = [
  { user: 'TraderPete', message: 'Watching SPY for 450 break.', timestamp: '2025-11-10 10:12' },
  { user: 'MarketQueen', message: 'QQQ looks oversold.', timestamp: '2025-11-10 10:14' },
];

const CommunityFeed = () => {
  const [posts, setPosts] = useState(initialPosts);
  const [msg, setMsg] = useState('');

  const addPost = () => {
    if (msg) {
      setPosts([
        ...posts,
        {
          user: 'You',
          message: msg,
          timestamp: new Date().toISOString().slice(0, 16).replace('T', ' ')
        }
      ]);
      setMsg('');
    }
  };

  return (
    <div>
      <h2>Community Feed</h2>
      <textarea
        value={msg}
        onChange={e => setMsg(e.target.value)}
        placeholder="Share your insight with the community..."
        rows={2}
        cols={40}
      />
      <br />
      <button onClick={addPost}>Post</button>
      <ul>
        {posts.map((post, idx) => (
          <li key={idx}>
            <strong>{post.user}</strong> [{post.timestamp}]: {post.message}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CommunityFeed;