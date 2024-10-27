import json
import pytest
from app import create_app, db
from app.models import Transaction, Portfolio

@pytest.fixture
def app():
    # Create and configure a new app instance for each test
    app = create_app()
    
    # Create a test client
    app.config['TESTING'] = True
    with app.app_context():
        db.create_all()  # Create tables
        yield app  # This will run the tests
        db.drop_all()  # Cleanup after tests

@pytest.fixture
def client(app):
    return app.test_client()

@pytest.fixture
def sample_portfolio(client):
    # Create a sample portfolio for testing
    portfolio = Portfolio(ticker='AAPL', total_cost_basis=1000, shares_owned=10)
    db.session.add(portfolio)
    db.session.commit()
    return portfolio

def test_search_instrument(client):
    response = client.get('/api/instruments/search?ticker=AAPL')
    assert response.status_code == 200
    data = json.loads(response.data)  # Load the JSON response

    # Check that the response is a list and contains at least one item
    assert isinstance(data, dict)
    assert len(data) > 0

    # Check that 'current_price' is in the first item of the list
    assert 'current_price' in data

def test_search_instrument_invalid_ticker(client):
    response = client.get('/api/instruments/search?ticker=INVALID')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert 'error' in data
    assert data['error'] == 'Instrument data not found.'

def test_buy_shares(client):
    response = client.post('/api/transactions/buy', json={
        'ticker': 'AAPL',
        'shares': 5
    })
    assert response.status_code == 201
    assert b'Shares purchased!' in response.data

    # Verify the transaction was recorded
    transaction = Transaction.query.filter_by(ticker='AAPL').first()
    assert transaction is not None
    assert transaction.shares == 5

def test_buy_invalid_shares(client):
    response = client.post('/api/transactions/buy', json={
        'ticker': 'AAPL',
        'shares': -5
    })
    assert response.status_code == 400
    assert b'Invalid number of shares' in response.data

def test_buy_invalid_ticker(client):
    response = client.post('/api/transactions/buy', json={
        'ticker': 'INVALID',
        'shares': 5
    })
    assert response.status_code == 400  # Assuming the service returns 400 for invalid tickers
    assert b'message' in response.data  # Check for error message

def test_sell_shares(client, sample_portfolio):
    # First buy some shares
    client.post('/api/transactions/buy', json={
        'ticker': 'AAPL',
        'shares': 5
    })

    response = client.post('/api/transactions/sell', json={
        'ticker': 'AAPL',
        'shares': 5
    })
    assert response.status_code == 201
    assert b'Shares sold!' in response.data

    # Verify the transaction was recorded
    transaction = Transaction.query.filter_by(ticker='AAPL', operation='sell').first()
    assert transaction is not None

def test_sell_not_enough_shares(client):
    response = client.post('/api/transactions/sell', json={
        'ticker': 'AAPL',
        'shares': 5
    })
    assert response.status_code == 400
    assert b'Not enough shares to sell' in response.data

def test_sell_invalid_shares(client, sample_portfolio):
    response = client.post('/api/transactions/sell', json={
        'ticker': 'AAPL',
        'shares': -5
    })
    assert response.status_code == 400
    assert b'Invalid number of shares' in response.data

def test_get_transactions(client):
    client.post('/api/transactions/buy', json={
        'ticker': 'AAPL',
        'shares': 5
    })
    response = client.get('/api/transactions')
    assert response.status_code == 200
    transactions = json.loads(response.data)
    assert len(transactions) > 0

def test_get_transactions_with_limit(client):
    for _ in range(3):
        client.post('/api/transactions/buy', json={
            'ticker': 'AAPL',
            'shares': 5
        })
    
    response = client.get('/api/transactions?limit=2')
    assert response.status_code == 200
    transactions = json.loads(response.data)
    assert len(transactions) == 2

def test_get_portfolio(client, sample_portfolio):
    response = client.get('/api/portfolio')
    assert response.status_code == 200
    portfolio_data = json.loads(response.data)
    assert len(portfolio_data) > 0
    assert portfolio_data[0]['ticker'] == 'AAPL'

def test_get_portfolio_status(client, sample_portfolio):
    response = client.get('/api/portfolio/status')
    assert response.status_code == 200
    status_data = json.loads(response.data)
    assert 'total_shares_owned' in status_data
    assert 'total_cost_basis' in status_data
    assert 'total_current_market_value' in status_data
    assert 'total_unrealized_profit_loss' in status_data
    assert 'total_unrealized_return_rate' in status_data

def test_get_portfolio_empty(client):
    portfolio_entry = Portfolio.query.filter_by(ticker='AAPL').first()
    if portfolio_entry:
        db.session.delete(portfolio_entry)
        db.session.commit()
    
    response = client.get('/api/portfolio')
    assert response.status_code == 200
    assert response.json == []  # Example expected empty portfolio response

def test_get_portfolio_status_no_portfolio(client):
    # Ensure the portfolio is empty
    db.session.query(Portfolio).delete()
    db.session.commit()

    response = client.get('/api/portfolio/status')
    assert response.status_code == 200

    status_data = json.loads(response.data)
    assert isinstance(status_data, list)  # Ensure it's a list
    assert len(status_data) == 0  # Expect an empty list

