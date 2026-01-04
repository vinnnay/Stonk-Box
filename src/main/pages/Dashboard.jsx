import React from 'react';
import SPYChart from '../components/SPYChart';
import Watchlist from '../components/Watchlist';
import Journal from '../components/Journal';
import CommunityFeed from '../components/CommunityFeed';

const Dashboard = () => (
  <div>
    <h1>stonkbox Dashboard</h1>
    <SPYChart />
    <Watchlist />
    <Journal />
    <CommunityFeed />
  </div>
);

export default Dashboard;