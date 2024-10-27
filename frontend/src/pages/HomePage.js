import React, { useState, useEffect } from "react";
import { fetchRecentTransactions, fetchPortfolioStatus } from "../services/stockService";
import PillBar from "../components/PillBar";
import { Link } from 'react-router-dom';
import "../styles/HomePage.css";
import Title from '../components/Title';

function HomePage({ showError }) {
  const [portfolioStatus, setPortfolioStatus] = useState({});
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    showError(""); // Clear previous error messages
    const getData = async () => {
      try {
        const status = await fetchPortfolioStatus();
        const transactions = await fetchRecentTransactions(5);
        setPortfolioStatus(status);
        setRecentTransactions(transactions);
      } catch (error) {
        showError("Failed to fetch portfolio status or recent transactions.");
      } finally {
        setLoading(false);
      }
    };
    getData();
  }, [showError]);

  if (loading) {
    return <div className="mainContainer">Loading...</div>;
  }

  return (
    <div className="mainContainer">
      <Title title="Home" />
      <div className="content">
        <h1>Portfolio Status</h1>
        <div>
          <p>
            Total Shares:{" "}
            <span className="price">{portfolioStatus.total_shares_owned?.toLocaleString()}</span>
          </p>
          <p>
            Cost Basis:{" "}
            <span className="price">${portfolioStatus.total_cost_basis?.toLocaleString()}</span>
          </p>
          <p>
            Market Value:{" "}
            <span className="price">
              ${portfolioStatus.total_current_market_value?.toLocaleString()}
            </span>
          </p>
          <p
            className={`profit-loss ${
              portfolioStatus.total_unrealized_return_rate >= 0
                ? "positive"
                : "negative"
            }`}
          >
            Unrealized Return Rate:{" "}
            <span
              className={`change ${
                portfolioStatus.total_unrealized_profit_loss >= 0
                  ? "positive"
                  : "negative"
              }`}
            >
              {portfolioStatus.total_unrealized_return_rate}%
            </span>
          </p>
          <p
            className={`profit-loss ${
              portfolioStatus.total_unrealized_profit_loss >= 0
                ? "positive"
                : "negative"
            }`}
          >
            Unrealized Profit/Loss:{" "}
            <span
              className={`change ${
                portfolioStatus.total_unrealized_profit_loss >= 0
                  ? "positive"
                  : "negative"
              }`}
            >
              {portfolioStatus.total_unrealized_profit_loss < 0
                ? `-$${Math.abs(portfolioStatus.total_unrealized_profit_loss)?.toLocaleString()}`
                : `$${portfolioStatus.total_unrealized_profit_loss?.toLocaleString()}`}
            </span>
          </p>
        </div>

        <h2>
          <span className="sub-heading">Recent Transactions</span>
          <Link to="/all-transactions">
            <button className="show-all-button">Show All {'>>'}</button>
          </Link>
        </h2>
        <ul>
          {recentTransactions.map((transaction) => (
            <PillBar
              key={transaction.id} // Make sure to add a unique key prop
              ticker={transaction.ticker}
              operation={transaction.operation}
              shares={transaction.shares}
              date={transaction.date}
              pricePerShare={transaction.price}
              costBasis={transaction.price * transaction.shares}
              fullTimestamp={transaction.date}
            />
          ))}
        </ul>
      </div>
    </div>
  );
}

export default HomePage;
