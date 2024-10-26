import os
import requests
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

API_URL = "https://yfapi.net/v6/finance/quote"

headers = {
    'x-api-key': os.getenv("YAHOO_FINANCE_API_KEY")
}


def fetch_instrument_data(tickers):
    return [
        {
            "ask": 0,
            "bid": 0,
            "change_percent": 0.36431292,
            "change_value": 0.83999634,
            "current_price": 231.41,
            "name": "Apple Inc.",
            "symbol": "AAPL"
        }
    ]
    # Expecting 'tickers' to be a comma-separated string
    querystring = {"symbols": tickers}

    response = requests.get(API_URL, headers=headers, params=querystring)
    if response.status_code != 200:
        raise Exception("Error fetching data from Yahoo Finance")

    data = response.json()

    # Prepare a list to hold instrument data for all requested tickers
    instruments = []

    # Check if the response contains quote data
    if data.get("quoteResponse") and data["quoteResponse"]["result"]:
        for instrument in data["quoteResponse"]["result"]:
            instruments.append({
                "name": instrument.get("longName", "N/A"),
                "bid": instrument.get("bid", "N/A"),
                "ask": instrument.get("ask", "N/A"),
                "current_price": instrument.get("regularMarketPrice", "N/A"),
                "change_value": instrument.get("regularMarketChange", "N/A"),
                "change_percent": instrument.get("regularMarketChangePercent", "N/A"),
                # Include the ticker symbol
                "symbol": instrument.get("symbol", "N/A")
            })
    else:
        raise Exception("Instrument data not found")

    return instruments
