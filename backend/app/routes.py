from flask import request, jsonify
from flask import Blueprint, request, jsonify
from .models import db, Transaction, Portfolio
from .services import fetch_instrument_data
from sqlalchemy import func

api = Blueprint('api', __name__)


@api.route('/instruments/search', methods=['GET'])
def search_instrument():
    """
    Search for an instrument by its ticker symbol and include the amount owned in the portfolio.
    ---
    parameters:
      - name: ticker
        in: query
        type: string
        required: true
        description: The ticker symbol of the instrument to search for.
    responses:
      200:
        description: Successful search returning instrument data, including name, current price, bid, ask, change value, change percentage, and shares owned in the portfolio.
        schema:
          type: object
          properties:
            symbol:
              type: string
              description: The ticker symbol of the instrument.
            name:
              type: string
              description: The name of the instrument.
            current_price:
              type: number
              format: float
              description: The current market price of the instrument.
            bid:
              type: number
              format: float
              description: The current bid price for the instrument.
            ask:
              type: number
              format: float
              description: The current ask price for the instrument.
            change_value:
              type: number
              format: float
              description: The change in price from the previous trading session.
            change_percent:
              type: number
              format: float
              description: The percentage change in price from the previous trading session.
            shares_owned:
              type: number
              format: int
              description: The number of shares owned in the portfolio.
      400:
        description: Invalid ticker symbol.
        schema:
          type: object
          properties:
            error:
              type: string
              description: Error message indicating the issue.
    """
    ticker = request.args.get('ticker')
    
    # Fetch portfolio details
    portfolio = Portfolio.query.all()

    # Initialize shares owned
    shares_owned = 0
    for p in portfolio:
        if p.ticker.upper() == ticker.upper():
            shares_owned = p.shares_owned
            break

    try:
        # Fetch instrument data, expecting it to return a list
        instrument_data_list = fetch_instrument_data(ticker)
    except Exception as e:
        return jsonify({"error": str(e)})

    # Look for the specific instrument data in the list
    instrument_data = next((item for item in instrument_data_list if item['symbol'].upper() == ticker.upper()), None)

    if instrument_data is None:
        return jsonify({"error": "Instrument not found."}), 404

    # Include shares owned in the response
    instrument_data['shares_owned'] = shares_owned
    
    return jsonify(instrument_data)


@api.route('/transactions/buy', methods=['POST'])
def buy_shares():
    """
    Buy shares of a specified instrument.
    ---
    parameters:
      - name: body
        in: body
        required: true
        schema:
          type: object
          properties:
            ticker:
              type: string
              description: The ticker symbol of the instrument.
            shares:
              type: number
              format: float
              description: The number of shares to buy.
    responses:
      201:
        description: Shares purchased successfully.
        schema:
          type: object
          properties:
            message:
              type: string
              description: Success message indicating purchase.
      400:
        description: Invalid request or not enough shares.
        schema:
          type: object
          properties:
            error:
              type: string
              description: Error message indicating the issue.
    """
    data = request.json
    ticker = data.get('ticker')
    shares = float(data.get('shares'))

    if (shares <= 0):
        return jsonify({"error": "Invalid number of shares."}), 400

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
    """
    Sell shares of a specified instrument.
    ---
    parameters:
      - name: body
        in: body
        required: true
        schema:
          type: object
          properties:
            ticker:
              type: string
              description: The ticker symbol of the instrument.
            shares:
              type: number
              format: float
              description: The number of shares to sell.
    responses:
      201:
        description: Shares sold successfully.
        schema:
          type: object
          properties:
            message:
              type: string
              description: Success message indicating sale.
      400:
        description: Invalid request or not enough shares.
        schema:
          type: object
          properties:
            error:
              type: string
              description: Error message indicating the issue.
    """
    data = request.json
    ticker = data.get('ticker')
    shares = float(data.get('shares'))  # Convert shares to float

    if (shares <= 0):
        return jsonify({"error": "Invalid number of shares."}), 400

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
        return jsonify({"error": "Not enough shares to sell."}), 400

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
    """
    Retrieve a list of recent transactions.
    ---
    parameters:
      - name: limit
        in: query
        type: integer
        required: false
        description: Limit the number of transactions returned.
    responses:
      200:
        description: A list of transactions retrieved successfully, including ticker, shares, operation type, price, and date.
        schema:
          type: array
          items:
            type: object
            properties:
              ticker:
                type: string
                description: The ticker symbol of the instrument.
              shares:
                type: number
                description: The number of shares bought or sold.
              operation:
                type: string
                description: The operation type (buy/sell).
              price:
                type: number
                format: float
                description: The price at which shares were bought or sold.
              date:
                type: string
                format: date-time
                description: The date and time of the transaction.
    """
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
    """
    Retrieve the current user's portfolio details.
    ---
    responses:
      200:
        description: Successful retrieval of portfolio data, including ticker, name, total cost basis, shares owned, current market value, unrealized profit/loss, and unrealized return rate.
        schema:
          type: array
          items:
            type: object
            properties:
              ticker:
                type: string
                description: The ticker symbol of the instrument in the portfolio.
              name:
                type: string
                description: The name of the instrument.
              total_cost_basis:
                type: number
                format: float
                description: Total cost basis of shares owned.
              shares_owned:
                type: number
                description: The number of shares owned.
              current_market_value:
                type: number
                format: float
                description: Current market value of the shares owned based on the latest market price.
              unrealized_profit_loss:
                type: number
                format: float
                description: Unrealized profit or loss based on the current market value.
              unrealized_return_rate:
                type: number
                format: float
                description: Unrealized return rate percentage based on the cost basis.
    """
    # Fetch portfolio details
    portfolio = Portfolio.query.all()

    # Initialize an empty list to hold portfolio data
    portfolio_data = []

    # Gather all tickers from the portfolio and convert to uppercase
    tickers = [p.ticker.upper() for p in portfolio]

    if not tickers:
        return jsonify([])

    # Fetch instrument data for all tickers at once
    try:
        instrument_data_list = fetch_instrument_data(','.join(tickers))
    except Exception as e:
        # instrument_data_list = []  # Handle error gracefully
        raise Exception("Error fetching instrument data.")

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
    """
    Retrieve summary status of the user's portfolio.
    ---
    responses:
      200:
        description: Successful retrieval of portfolio status, including total shares owned, total cost basis, total current market value, total unrealized profit/loss, and total unrealized return rate.
        schema:
          type: object
          properties:
            total_shares_owned:
              type: number
              description: Total number of shares owned in the portfolio.
            total_cost_basis:
              type: number
              format: float
              description: Total cost basis of shares owned.
            total_current_market_value:
              type: number
              format: float
              description: Total current market value of the portfolio based on the latest market prices.
            total_unrealized_profit_loss:
              type: number
              format: float
              description: Total unrealized profit or loss for the portfolio.
            total_unrealized_return_rate:
              type: number
              format: float
              description: Total unrealized return rate percentage based on the cost basis.
    """
    # Fetch portfolio details
    portfolio = Portfolio.query.all()
    
    if not portfolio:
        return jsonify([]) 

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
