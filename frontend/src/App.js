import React, { useState, useCallback } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import NavBar from "./components/NavBar";
import HomePage from "./pages/HomePage";
import PortfolioPage from "./pages/PortfolioPage";
import TransactionPage from "./pages/TransactionPage";
import ErrorMessage from "./components/ErrorMessage"; // Assuming you have an error component
import "./styles/App.css";

function App() {
  const [errorMessage, setErrorMessage] = useState("");

  const showError = useCallback((message) => {
    setErrorMessage(message);
  }, []);

  const clearError = () => {
    setErrorMessage("");
  };

  return (
    <Router>
      <NavBar />
      {errorMessage && (
        <ErrorMessage message={errorMessage} clearError={clearError} onClose={() => setErrorMessage("")} />
      )}
      <Routes>
        <Route path="/" element={<HomePage showError={showError} clearError={clearError} />} />
        <Route path="/portfolio" element={<PortfolioPage showError={showError} clearError={clearError} />} />
        <Route path="/transactions" element={<TransactionPage showError={showError} clearError={clearError} />} />
      </Routes>
    </Router>
  );
}

export default App;
