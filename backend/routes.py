from flask import request, jsonify
from flask import Blueprint, request, jsonify
from models import db, Transaction, Portfolio
from services import fetch_instrument_data
from sqlalchemy import func

api = Blueprint('api', __name__)


@api.route('/instruments/search', methods=['GET'])
def search_instrument():
    ticker = request.args.get('ticker')
    data = fetch_instrument_data(ticker)
    return jsonify(data)


@api.route('/transactions/buy', methods=['POST'])
def buy_shares():
    data = request.json
    ticker = data.get('ticker')
    shares = float(data.get('shares'))

    if (shares <= 0):
        return jsonify({"error": "Invalid number of shares"}), 400

    # Fetch current price of the instrument
    try:
        instrument_data = fetch_instrument_data(ticker)
        # Extract the current price
        price = instrument_data[0]['current_price']
    except Exception as e:
        return jsonify({"message": str(e)}), 400

    # Logic to record the purchase in the database
    # Check if the portfolio exists; if not, create it
    existing_portfolio = Portfolio.query.filter(func.lower(
        Portfolio.ticker) == ticker.lower()).first()

    if existing_portfolio:
        existing_portfolio.shares_owned += shares
        existing_portfolio.total_cost_basis += price * shares
    else:
        new_portfolio = Portfolio(
            ticker=ticker, total_cost_basis=price * shares, shares_owned=shares)
        db.session.add(new_portfolio)

    # Record the transaction
    transaction = Transaction(
        ticker=ticker, shares=shares, operation='buy', price=price)
    db.session.add(transaction)
    db.session.commit()

    return jsonify({"message": "Shares purchased!"}), 201


@api.route('/transactions/sell', methods=['POST'])
def sell_shares():
    data = request.json
    ticker = data.get('ticker')
    shares = float(data.get('shares'))  # Convert shares to float

    if (shares <= 0):
        return jsonify({"error": "Invalid number of shares"}), 400

    # Fetch current price of the instrument
    try:
        instrument_data = fetch_instrument_data(ticker)
        # Extract the current price
        price = instrument_data[0]['current_price']
    except Exception as e:
        return jsonify({"message": str(e)}), 400

    # Check if the portfolio exists
    portfolio = Portfolio.query.filter(func.lower(
        Portfolio.ticker) == ticker.lower()).first()

    if not portfolio or portfolio.shares_owned < shares:
        return jsonify({"error": "Not enough shares to sell"}), 400

    # Record the transaction
    transaction = Transaction(
        ticker=ticker, shares=shares, operation="sell", price=price)
    db.session.add(transaction)

    # Update the portfolio
    portfolio.shares_owned -= shares
    # Adjust cost basis (if needed, based on your policy)
    portfolio.total_cost_basis -= shares * price

    if portfolio.shares_owned == 0:
        # Remove from portfolio if all shares are sold
        db.session.delete(portfolio)

    db.session.commit()  # Save changes to the database
    return jsonify({"message": "Shares sold!"}), 201


@api.route('/transactions', methods=['GET'])
def get_transactions():
    # Get the 'limit' parameter from the query string, default to None if not provided
    limit = request.args.get('limit', default=None, type=int)

    # Fetch transactions from the database, ordered by date in descending order
    query = Transaction.query.order_by(Transaction.date.desc())
    
    # Apply limit if specified
    if limit is not None:
        query = query.limit(limit)

    transactions = query.all()
    
    # Format the transactions for JSON response
    return jsonify([{
        'ticker': t.ticker,
        'shares': t.shares,
        'operation': t.operation,
        'price': t.price,
        'date': t.date.strftime('%Y-%m-%d %H:%M:%S')
    } for t in transactions])


@api.route('/portfolio', methods=['GET'])
def get_portfolio():
    # Fetch portfolio details
    portfolio = Portfolio.query.all()

    # Initialize an empty list to hold portfolio data
    portfolio_data = []

    # Gather all tickers from the portfolio and convert to uppercase
    tickers = [p.ticker.upper() for p in portfolio]

    # Fetch instrument data for all tickers at once
    try:
        instrument_data_list = fetch_instrument_data(','.join(tickers))
    except Exception as e:
        # instrument_data_list = []  # Handle error gracefully
        raise Exception("Error fetching instrument data")

    # Create a dictionary for easy lookup of instrument data by ticker
    instrument_data_dict = {
        data['symbol'].upper(): data for data in instrument_data_list}

    for p in portfolio:
        # Convert ticker to uppercase for case-insensitive lookup
        instrument_data = instrument_data_dict.get(p.ticker.upper(), {})
        current_price = instrument_data.get('current_price', 0.0)
        name = instrument_data.get('name')

        # Calculate current market value
        current_market_value = current_price * p.shares_owned

        # Calculate Unrealized Profit/Loss
        unrealized_profit_loss = current_market_value - p.total_cost_basis

        # Calculate Unrealized Return Rate and round to 2 decimal places
        unrealized_return_rate = round(
            (unrealized_profit_loss / p.total_cost_basis) * 100, 2) if p.total_cost_basis > 0 else 0

        # Append the processed data to the portfolio_data list
        portfolio_data.append({
            'ticker': p.ticker,
            'name': name,
            'total_cost_basis': p.total_cost_basis,
            'shares_owned': p.shares_owned,
            'current_market_value': current_market_value,
            'unrealized_profit_loss': unrealized_profit_loss,
            'unrealized_return_rate': unrealized_return_rate
        })

    return jsonify(portfolio_data)


@api.route('/portfolio/status', methods=['GET'])
def get_portfolio_status():
    # Fetch portfolio details
    portfolio = Portfolio.query.all()

    total_shares_owned = 0
    total_cost_basis = 0.0
    total_current_market_value = 0.0
    total_unrealized_profit_loss = 0.0

    # Gather all tickers from the portfolio and convert to uppercase
    tickers = [p.ticker.upper() for p in portfolio]

    # Fetch instrument data for all tickers at once
    try:
        instrument_data_list = fetch_instrument_data(','.join(tickers))
    except Exception as e:
        instrument_data_list = []  # Handle error gracefully

    # Create a dictionary for easy lookup of instrument data by ticker
    instrument_data_dict = {
        data['symbol'].upper(): data for data in instrument_data_list}

    for p in portfolio:
        # Convert ticker to uppercase for case-insensitive lookup
        instrument_data = instrument_data_dict.get(p.ticker.upper(), {})
        current_price = instrument_data.get('current_price', 0.0)

        # Calculate current market value
        current_market_value = current_price * p.shares_owned

        # Update totals
        total_shares_owned += p.shares_owned
        total_cost_basis += p.total_cost_basis
        total_current_market_value += current_market_value
        total_unrealized_profit_loss += (current_market_value -
                                         p.total_cost_basis)

    # Calculate total unrealized return rate
    total_unrealized_return_rate = round((
        (total_unrealized_profit_loss / total_cost_basis) * 100
        if total_cost_basis > 0 else 0
    ), 2)

    # Return aggregated data
    return jsonify({
        'total_shares_owned': total_shares_owned,
        'total_cost_basis': total_cost_basis,
        'total_current_market_value': total_current_market_value,
        'total_unrealized_profit_loss': total_unrealized_profit_loss,
        'total_unrealized_return_rate': total_unrealized_return_rate
    })
