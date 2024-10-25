import React, { useState } from 'react';
import { searchInstrument, buyShares, sellShares } from '../services/stockService';

function TransactionPage() {
  const [ticker, setTicker] = useState('');
  const [instrumentData, setInstrumentData] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [shares, setShares] = useState(0);

  const handleSearch = async () => {
    try {
      const data = await searchInstrument(ticker);
      setInstrumentData(data);
      setErrorMessage('');
    } catch (error) {
      setErrorMessage('Instrument not found.');
      setInstrumentData(null);
    }
  };

  const handleBuy = async () => {
    try {
      await buyShares(ticker, shares);
      alert('Shares purchased!');
    } catch (error) {
      alert('Error purchasing shares.');
    }
  };

  const handleSell = async () => {
    try {
      await sellShares(ticker, shares);
      alert('Shares sold!');
    } catch (error) {
      alert('Error selling shares.');
    }
  };

  return (
    <div>
      <h1>Search and Trade Securities</h1>
      <input 
        type="text" 
        value={ticker} 
        onChange={(e) => setTicker(e.target.value)} 
        placeholder="Enter Ticker (e.g., AAPL)" 
      />
      <button onClick={handleSearch}>Search</button>

      {errorMessage && <p>{errorMessage}</p>}

      {instrumentData && (
        <div>
          <h2>{instrumentData.name}</h2>
          <p>Current Price: ${instrumentData.current_price}</p>
          <p>Bid: ${instrumentData.bid}</p>
          <p>Ask: ${instrumentData.ask}</p>
          <p>Change: ${instrumentData.change_value}</p>
          <p>Change (%): {instrumentData.change_percent}%</p>

          <input 
            type="number" 
            value={shares} 
            onChange={(e) => setShares(e.target.value)} 
            placeholder="Number of Shares" 
          />
          <button onClick={handleBuy}>Buy</button>
          <button onClick={handleSell}>Sell</button>
        </div>
      )}
    </div>
  );
}

export default TransactionPage;
