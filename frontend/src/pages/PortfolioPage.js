import React, { useState, useEffect } from "react";
import { fetchPortfolio } from "../services/stockService";
import PillBar from "../components/PillBar"; // Import the PillBar component
import "../styles/PortfolioPage.css";
import Title from '../components/Title';
import { Link } from 'react-router-dom';

function PortfolioPage({ showError }) {
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true); // Loading state

  useEffect(() => {
    showError("");

    const getPortfolio = async () => {
      try {
        const portfolioData = await fetchPortfolio();
        setPositions(portfolioData);
      } catch (error) {
        showError("Failed to fetch portfolio data.");
      } finally {
        setLoading(false);
      }
    };
    getPortfolio();
  }, [showError]); // Include showError in the dependency array

  if (loading) {
    return <div className="mainContainer">Loading...</div>; // Loading indicator
  }

  const isPortfolioEmpty = positions.length === 0; // Check if portfolio is empty

  return (
    <div className="mainContainer">
      <Title title="Portfolio" />
      <div className="content portfolio-content">
        <h1>Your Portfolio</h1>
        {isPortfolioEmpty ? (
          <p className="empty-portfolio-message">
            Your portfolio is empty. Please purchase stocks from the{" "}
            <Link to="/transactions">transactions page</Link>.
          </p>
        ) : (
          <ul className="portfolio-list">
            {positions.map((position) => (
              <PillBar
                key={position.ticker} // Make sure to add a unique key prop
                ticker={position.ticker}
                name={position.name}
                operation="Owns"
                shares={position.shares_owned}
                date={new Date()}
                costBasis={position.total_cost_basis}
                marketValue={position.current_market_value}
                unrealizedReturnRate={position.unrealized_return_rate}
                unrealizedProfitLoss={position.unrealized_profit_loss}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default PortfolioPage;
