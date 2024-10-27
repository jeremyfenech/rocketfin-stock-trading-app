import React, { useState, useEffect } from "react";
import { fetchRecentTransactions } from "../services/stockService";
import { useNavigate } from "react-router-dom";
import PillBar from "../components/PillBar";
import "../styles/AllTransactions.css";
import Title from '../components/Title';

function AllTransactions({ showError }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const getData = async () => {
      try {
        const allTransactions = await fetchRecentTransactions();
        setTransactions(allTransactions);
      } catch (error) {
        showError("Failed to fetch all transactions.");
      } finally {
        setLoading(false);
      }
    };
    getData();
  }, [showError]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="mainContainer">
      <Title title="Transaction History" />
      <div className="content">
        <button className="back-button" onClick={() => navigate('/')}>
          &lt;&lt; Back
        </button>
        
        <h1>All Transactions</h1>
                
        <ul>
          {transactions.map((transaction) => (
            <PillBar
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

export default AllTransactions;
