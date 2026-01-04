// Watchlist model for user
class Watchlist {
  constructor(owner, tickers = []) {
    this.owner = owner; // username/email
    this.tickers = tickers;
  }
}

export default Watchlist;