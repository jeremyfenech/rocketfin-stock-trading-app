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
            <h3>{position.instrument}</h3>
            <p>Cost Basis: {position.costBasis}</p>
            <p>Market Value: {position.marketValue}</p>
            <p>Unrealized Return Rate: {position.unrealizedReturnRate}</p>
            <p>Unrealized Profit/Loss: {position.unrealizedProfitLoss}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default PortfolioPage;
