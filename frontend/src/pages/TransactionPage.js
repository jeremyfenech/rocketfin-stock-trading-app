import React, { useEffect, useState } from "react";
import {
  searchInstrument,
  buyShares,
  sellShares,
} from "../services/stockService";
import "../styles/TransactionPage.css";

function TransactionPage({ showError }) {
  const [ticker, setTicker] = useState("");
  const [instrumentData, setInstrumentData] = useState(null);
  const [shares, setShares] = useState(0);

  useEffect(() => {
    showError("");
  }, [showError]);

  const handleSearch = async () => {
    try {
      const data = await searchInstrument(ticker);
      if (data && data.length > 0) {
        setInstrumentData(data[0]); // Set to the first item in the array
      } else {
        showError("Instrument not found.");
        setInstrumentData(null);
      }
    } catch (error) {
      showError("Error fetching instrument data.");
      setInstrumentData(null);
    }
  };

  const handleBuy = async () => {
    try {
      await buyShares(ticker, shares);
      alert("Shares purchased!");
    } catch (error) {
      showError("Error purchasing shares.");
    }
  };

  const handleSell = async () => {
    try {
      await sellShares(ticker, shares);
      alert("Shares sold!");
    } catch (error) {
      showError("Error selling shares.");
    }
  };

  return (
    <div className="mainContainer">
      <div className="content transaction-content">
        <h1>Search and Trade Securities</h1>
        <input
          type="text"
          value={ticker}
          onChange={(e) => setTicker(e.target.value)}
          placeholder="Enter Ticker (e.g., AAPL)"
          className="ticker-input"
        />
        <button onClick={handleSearch} className="search-button">
          Search
        </button>

        {instrumentData && (
          <div className="instrument-info">
            <h2>
              {instrumentData.name} ({instrumentData.symbol})
            </h2>
            <p>
              Current Price:{" "}
              <span className="price">${instrumentData.current_price}</span>
            </p>
            <p>
              Bid: <span className="price">${instrumentData.bid}</span>
            </p>
            <p>
              Ask: <span className="price">${instrumentData.ask}</span>
            </p>
            <p>
              Change:{" "}
              <span
                className={`change ${
                  instrumentData.change_value >= 0 ? "positive" : "negative"
                }`}
              >
                ${instrumentData.change_value}
              </span>
            </p>
            <p>
              Change (%):{" "}
              <span
                className={`change ${
                  instrumentData.change_percent >= 0 ? "positive" : "negative"
                }`}
              >
                {instrumentData.change_percent}%
              </span>
            </p>

            <input
              type="number"
              value={shares}
              onChange={(e) => setShares(e.target.value)}
              placeholder="Number of Shares"
              className="shares-input"
            />
            <div className="button-container">
              <button onClick={handleBuy} className="trade-button buy-button">
                Buy
              </button>
              <button onClick={handleSell} className="trade-button sell-button">
                Sell
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TransactionPage;
