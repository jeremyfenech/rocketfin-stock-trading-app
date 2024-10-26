import React, { useState } from "react";
import "../styles/PillBar.css"; // Ensure to have your styles here

function PillBar({
  ticker,
  name,
  operation,
  shares,
  date,
  costBasis,
  marketValue,
  unrealizedReturnRate,
  unrealizedProfitLoss,
  price,
  fullTimestamp,
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleDetails = () => {
    setIsExpanded((prev) => !prev);
  };

  const formattedDateTime = new Date(date).toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  });

  return (
    <li
      onClick={toggleDetails}
      className={`portfolio-item ${isExpanded ? "expanded" : ""}`}
      aria-expanded={isExpanded}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          toggleDetails();
        }
      }}
    >
      <h3>{name || ticker.toUpperCase()}</h3>
      {operation} <span className="price">{shares}</span> shares on{" "}
      {formattedDateTime}
      {isExpanded && (
        <div className="position-details">
          {/* Show cost basis even if it's zero */}
          {costBasis !== null && costBasis !== undefined && (
            <p>
              Cost Basis: <span className="price">${costBasis}</span>
            </p>
          )}
          {/* Show market value even if it's zero */}
          {marketValue !== null && marketValue !== undefined && (
            <p>
              Market Value: <span className="price">${marketValue}</span>
            </p>
          )}
          {/* Show unrealized return rate, even if it's zero */}
          {unrealizedReturnRate !== null &&
            unrealizedReturnRate !== undefined && (
              <p
                className={`profit-loss ${
                  unrealizedReturnRate >= 0 ? "positive" : "negative"
                }`}
              >
                Unrealized Return Rate:{" "}
                <span
                  className={`change ${
                    unrealizedReturnRate >= 0 ? "positive" : "negative"
                  }`}
                >
                  {unrealizedReturnRate}%
                </span>
              </p>
            )}
          {/* Show unrealized profit/loss, even if it's zero */}
          {unrealizedProfitLoss !== null &&
            unrealizedProfitLoss !== undefined && (
              <p
                className={`profit-loss ${
                  unrealizedProfitLoss >= 0 ? "positive" : "negative"
                }`}
              >
                Unrealized Profit/Loss:{" "}
                <span
                  className={`change ${
                    unrealizedProfitLoss >= 0 ? "positive" : "negative"
                  }`}
                >
                  {unrealizedProfitLoss < 0
                    ? `-€${Math.abs(unrealizedProfitLoss)}`
                    : `€${unrealizedProfitLoss}`}
                </span>
              </p>
            )}
          {/* Show price even if it's zero */}
          {price !== null && price !== undefined && (
            <p>
              Price: <span className="price">${price}</span>
            </p>
          )}
          {/* Show full timestamp if it's provided */}
          {fullTimestamp !== null && fullTimestamp !== undefined && (
            <p>
              Full Timestamp: <span className="price">{fullTimestamp}</span>
            </p>
          )}
        </div>
      )}
    </li>
  );
}

export default PillBar;
