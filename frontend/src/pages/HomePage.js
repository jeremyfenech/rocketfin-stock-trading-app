import React, { useState, useEffect } from "react";
import {
  fetchRecentTransactions,
  fetchPortfolioStatus,
} from "../services/stockService";

function HomePage() {
  const [portfolioStatus, setPortfolioStatus] = useState({});
  const [recentTransactions, setRecentTransactions] = useState([]);

  useEffect(() => {
    const getData = async () => {
      const status = await fetchPortfolioStatus();
      const transactions = await fetchRecentTransactions();
      setPortfolioStatus(status);
      setRecentTransactions(transactions);
    };
    getData();
  }, []);

  return (
    <div className="mainContainer">
      <div className="content">
        <h1>Portfolio Status</h1>
        <div>
          <p>
            Total Shares:{" "}
            <span className="price">{portfolioStatus.total_shares_owned}</span>
          </p>
          <p>
            Cost Basis:{" "}
            <span className="price">${portfolioStatus.total_cost_basis}</span>
          </p>
          <p>
            Market Value:{" "}
            <span className="price">
              ${portfolioStatus.total_current_market_value}
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
                ? `-$${Math.abs(portfolioStatus.total_unrealized_profit_loss)}`
                : `$${portfolioStatus.total_unrealized_profit_loss}`}
            </span>
          </p>
        </div>

        <h2>Recent Transactions</h2>
        <ul>
          {recentTransactions.map((transaction, index) => {
            const formattedDateTime = new Date(transaction.date).toLocaleString(
              "en-US",
              {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "numeric",
                minute: "numeric",
                hour12: true,
              }
            );

            return (
              <li className="pillBar" key={index}>
                <span className="price">
                  {transaction.ticker.toUpperCase()}
                </span>
                : {transaction.operation} {transaction.shares} shares on{" "}
                {formattedDateTime}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

export default HomePage;
