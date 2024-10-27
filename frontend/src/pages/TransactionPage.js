import React, { useEffect, useState } from "react";
import {
  searchInstrument,
  buyShares,
  sellShares,
} from "../services/stockService";
import "../styles/TransactionPage.css";
import { useNavigate } from "react-router-dom";
import Title from "../components/Title";

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
      if (data && !data.error) {
        setInstrumentData(data); // Set to the first item in the array
      } else {
        showError(data.error);
        setInstrumentData(null);
      }
    } catch (error) {
      if (error.message) {
        showError(error.message);
      } else {
        showError("Error fetching instrument data.");
      }
      setInstrumentData(null);
    }
  };

  const navigate = useNavigate();

  const handleBuy = async () => {
    try {
      await buyShares(instrumentData.symbol, shares);
      alert("Shares purchased!");
      navigate("/"); // Redirect to the homepage
    } catch (error) {
      var message = "Error purchasing shares.";
      if (error.message) {
        message = error.message;
      }
      showError(message);
    }
  };

  const handleSell = async () => {
    try {
      await sellShares(instrumentData.symbol, shares);
      alert("Shares sold!");
      navigate("/"); // Redirect to the homepage
    } catch (error) {
      var message = "Error purchasing shares.";
      if (error.message) {
        message = error.message;
      }
      showError(message);
    }
  };

  return (
    <div className="mainContainer">
      <Title title="Transaction" />
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
              Shares Owned:{" "}
              <span className="price">{instrumentData.shares_owned}</span>
            </p>
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
                ${instrumentData.change_value.toFixed(2)}
              </span>
            </p>
            <p>
              Change (%):{" "}
              <span
                className={`change ${
                  instrumentData.change_percent >= 0 ? "positive" : "negative"
                }`}
              >
                {instrumentData.change_percent.toFixed(3)}%
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
