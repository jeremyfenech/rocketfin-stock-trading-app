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
    <div>
      <h1>Portfolio Status</h1>
      <div>
        {/* Display portfolio status (cost basis, market value, etc.) */}
        <p>Cost Basis: {portfolioStatus.total_cost_basis}</p>
        <p>Market Value: {portfolioStatus.total_current_market_value}</p>
        <p>
          Unrealized Return Rate: {portfolioStatus.total_unrealized_return_rate}
          %
        </p>
        <p>
          Unrealized Profit/Loss: {portfolioStatus.total_unrealized_profit_loss}
        </p>
      </div>

      <h2>Recent Transactions</h2>
      <ul>
        {recentTransactions.map((transaction, index) => (
          <li key={index}>
            {transaction.ticker.toUpperCase()}: {transaction.operation} {transaction.shares}{" "}
            shares on {transaction.date}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default HomePage;
