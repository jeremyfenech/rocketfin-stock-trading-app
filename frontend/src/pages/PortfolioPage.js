import React, { useState, useEffect } from 'react';
import { fetchPortfolio } from '../services/stockService';

function PortfolioPage() {
  const [positions, setPositions] = useState([]);

  useEffect(() => {
    const getPortfolio = async () => {
      const portfolioData = await fetchPortfolio();
      setPositions(portfolioData);
    };
    getPortfolio();
  }, []);

  return (
    <div>
      <h1>Your Portfolio</h1>
      <ul>
        {positions.map((position, index) => (
          <li key={index}>
            <h3>{position.name}</h3>
            <p>Cost Basis: {position.total_cost_basis}</p>
            <p>Market Value: {position.current_market_value}</p>
            <p>Unrealized Return Rate: {position.unrealized_return_rate}%</p>
            <p>Unrealized Profit/Loss: {position.unrealized_profit_loss}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default PortfolioPage;
