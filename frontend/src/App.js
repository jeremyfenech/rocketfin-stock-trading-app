import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import NavBar from './components/NavBar';
import HomePage from './pages/HomePage';
import PortfolioPage from './pages/PortfolioPage';
import TransactionPage from './pages/TransactionPage';
import './styles/App.css';

function App() {
  return (
    <Router>
      <NavBar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/portfolio" element={<PortfolioPage />} />
        <Route path="/transactions" element={<TransactionPage />} />
      </Routes>
    </Router>
  );
}

export default App;
