import React, { useState, useEffect } from "react";
import { fetchPortfolio } from "../services/stockService";
import "../styles/PortfolioPage.css";

function PortfolioPage() {
  const [positions, setPositions] = useState([]);
  const [expandedIndices, setExpandedIndices] = useState([]);

  useEffect(() => {
    const getPortfolio = async () => {
      const portfolioData = await fetchPortfolio();
      setPositions(portfolioData);
    };
    getPortfolio();
  }, []);

  const toggleDetails = (index) => {
    if (expandedIndices.includes(index)) {
      setExpandedIndices(expandedIndices.filter((i) => i !== index));
    } else {
      setExpandedIndices([...expandedIndices, index]);
    }
  };

  return (
    <div className="mainContainer">
      <div className="content portfolio-content">
        <h1>Your Portfolio</h1>
        <ul className="portfolio-list">
          {positions.map((position, index) => (
            <li
              key={index}
              onClick={() => toggleDetails(index)}
              className={`portfolio-item ${
                expandedIndices.includes(index) ? "expanded" : ""
              }`}
            >
              <h3>{position.name || position.ticker.toUpperCase()}</h3>
              {expandedIndices.includes(index) && (
                <div className="position-details">
                  <p>
                    Cost Basis:{" "}
                    <span className="price">${position.total_cost_basis}</span>
                  </p>
                  <p>
                    Market Value:{" "}
                    <span className="price">
                      ${position.current_market_value}
                    </span>
                  </p>
                  <p
                    className={`profit-loss ${
                      position.unrealized_profit_loss >= 0
                        ? "positive"
                        : "negative"
                    }`}
                  >
                    Unrealized Return Rate:{" "}
                    <span
                      className={`change ${
                        position.unrealized_return_rate >= 0
                          ? "positive"
                          : "negative"
                      }`}
                    >
                      {position.unrealized_return_rate}%
                    </span>
                  </p>
                  <p
                    className={`profit-loss ${
                      position.unrealized_profit_loss >= 0
                        ? "positive"
                        : "negative"
                    }`}
                  >
                    Unrealized Profit/Loss:
                    <span
                      className={`change ${
                        position.unrealized_profit_loss >= 0
                          ? "positive"
                          : "negative"
                      }`}
                    >
                      {" "}
                      {position.unrealized_profit_loss < 0
                        ? `-$${Math.abs(position.unrealized_profit_loss)}`
                        : `$${position.unrealized_profit_loss}`}
                    </span>
                  </p>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default PortfolioPage;
