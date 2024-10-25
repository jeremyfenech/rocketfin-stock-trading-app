from flask_sqlalchemy import SQLAlchemy
import datetime

db = SQLAlchemy()

class Transaction(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    ticker = db.Column(db.String(10), nullable=False)
    shares = db.Column(db.Integer, nullable=False)
    operation = db.Column(db.String(4), nullable=False)  # buy or sell
    price = db.Column(db.Float, nullable=False)
    date = db.Column(db.DateTime, default=datetime.datetime.now(datetime.timezone.utc))

    def __repr__(self):
        return f"<Transaction {self.ticker} {self.operation} {self.shares}>"

class Portfolio(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    ticker = db.Column(db.String(10), nullable=False)
    total_cost_basis = db.Column(db.Float, nullable=False)
    shares_owned = db.Column(db.Integer, nullable=False)

    def __repr__(self):
        return f"<Portfolio {self.ticker} {self.shares_owned}>"
