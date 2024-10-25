const API_BASE_URL = 'http://localhost:5000/api';

export const fetchRecentTransactions = async () => {
  const response = await fetch(`${API_BASE_URL}/transactions`);
  return await response.json();
};

export const fetchPortfolioStatus = async () => {
  const response = await fetch(`${API_BASE_URL}/portfolio/status`);
  return await response.json();
};

export const fetchPortfolio = async () => {
  const response = await fetch(`${API_BASE_URL}/portfolio`);
  return await response.json();
};

export const searchInstrument = async (ticker) => {
  const response = await fetch(`${API_BASE_URL}/instruments/search?ticker=${ticker}`);
  if (!response.ok) throw new Error('Instrument not found');

  const data = await response.json();
  return data;
};

export const buyShares = async (ticker, shares) => {
  await fetch(`${API_BASE_URL}/transactions/buy`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ticker, shares }),
  });
};

export const sellShares = async (ticker, shares) => {
  await fetch(`${API_BASE_URL}/transactions/sell`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ticker, shares }),
  });
};
