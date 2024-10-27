import os

class Config:
    # Set the base directory to the current directory
    BASE_DIR = os.path.abspath(os.path.dirname(__file__))  
    # Define the path to the instance folder in the parent directory
    INSTANCE_DIR = os.path.join(BASE_DIR, '..', 'instance')
    
    # Create the instance directory if it does not exist
    os.makedirs(INSTANCE_DIR, exist_ok=True)
    
    # Set the database URI to the instance folder
    DATABASE_PATH = os.path.join(INSTANCE_DIR, 'rocketfin.db')
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL", f"sqlite:///{DATABASE_PATH}")
    
    SQLALCHEMY_TRACK_MODIFICATIONS = False
