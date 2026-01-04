// Simple Trade entry model
class Trade {
  constructor({ ticker, entryPrice, exitPrice, date, notes }) {
    this.ticker = ticker;
    this.entryPrice = entryPrice;
    this.exitPrice = exitPrice;
    this.date = date;
    this.notes = notes;
  }
}

export default Trade;