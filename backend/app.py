from flask import Flask
from models import db
from routes import api
from config import Config
from flask_cors import CORS

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    db.init_app(app)
    
    CORS(app)

    with app.app_context():
        db.create_all()  # Create tables if they don't exist

    app.register_blueprint(api, url_prefix='/api')
    return app

app = create_app()

if __name__ == '__main__':
    app.run(debug=True)
    # app.run(host='0.0.0.0', port=5000)
