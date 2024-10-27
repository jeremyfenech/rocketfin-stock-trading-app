import config from '../config';

const { API_BASE_URL } = config;

const handleResponse = async (response) => {
  if (!response.ok) {
    // Attempt to parse the error response as JSON
    const errorData = await response.json().catch(() => null);
    
    // If there's an "error" field in the response, use it; otherwise, fallback to a default message
    const errorMessage = errorData?.error || "An error occurred";
    throw new Error(errorMessage);
  }
  return response.json();
};

export const fetchRecentTransactions = async (limit = null) => {
  const url = limit 
    ? `${API_BASE_URL}/transactions?limit=${limit}`
    : `${API_BASE_URL}/transactions`;

  const response = await fetch(url);
  return handleResponse(response);
};

export const fetchPortfolioStatus = async () => {
  const response = await fetch(`${API_BASE_URL}/portfolio/status`);
  return handleResponse(response);
};

export const fetchPortfolio = async () => {
  const response = await fetch(`${API_BASE_URL}/portfolio`);
  return handleResponse(response);
};

export const searchInstrument = async (ticker) => {
  const response = await fetch(`${API_BASE_URL}/instruments/search?ticker=${ticker}`);
  return handleResponse(response);
};

export const buyShares = async (ticker, shares) => {
  const response = await fetch(`${API_BASE_URL}/transactions/buy`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ticker, shares }),
  });
  return handleResponse(response);
};

export const sellShares = async (ticker, shares) => {
  const response = await fetch(`${API_BASE_URL}/transactions/sell`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ticker, shares }),
  });
  return handleResponse(response);
};
