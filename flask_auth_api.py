# PawPal Authentication API - Flask Backend
# This is a production-ready authentication API using Flask

from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
import datetime
import os
import re
import dotenv
from functools import wraps
from dotenv import load_dotenv

import logging
load_dotenv()

from urllib.parse import quote_plus

app = Flask(__name__)

# Configuration
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'your-secret-key-change-in-production')
# app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///pawpal.db')

# ==================== DATABASE SETUP ====================
db_host = os.getenv("DB_HOST")
db_port = os.getenv("DB_PORT")
db_name = os.getenv("DB_NAME")
db_user = os.getenv("DB_USER")
db_password = os.getenv("DB_PASSWORD") 

# Build database URI safely. Fall back to sqlite for local development if env not set.
if all([db_host, db_port, db_name, db_user, db_password]):
    safe_password = quote_plus(db_password)
    app.config['SQLALCHEMY_DATABASE_URI'] = f'postgresql://{db_user}:{safe_password}@{db_host}:{db_port}/{db_name}'
else:
    # Use DATABASE_URL if provided, otherwise default to a local sqlite file for dev
    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///pawpal.db')

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize extensions
db = SQLAlchemy(app)
# Enable CORS for development - allow requests from any origin
CORS(app, resources={
    r"/auth/*": {"origins": "*"},
    r"/pets/*": {"origins": "*"}
}, supports_credentials=True)

# ==================== MODELS ====================

class User(db.Model):
    user_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    is_active = db.Column(db.Boolean, default=True)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            'user_id': self.user_id,
            'name': self.name,
            'email': self.email,
            'created_at': self.created_at.isoformat(),
            'is_active': self.is_active
        }
    
class Pet(db.Model):
    pet_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    species = db.Column(db.String(50), nullable=False)
    breed = db.Column(db.String(100), nullable=True)
    age = db.Column(db.Integer, nullable=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.user_id'), nullable=False)

    def to_dict(self):
        return {
            'pet_id': self.pet_id,
            'name': self.name,
            'species': self.species,
            'breed': self.breed,
            'age': self.age,
            'user_id': self.user_id
        }

class Medication(db.Model):
    medication_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    dosage = db.Column(db.String(100), nullable=False)
    start_time = db.Column(db.DateTime, nullable=False)
    end_time = db.Column(db.DateTime, nullable=True)
    frequency = db.Column(db.String(100), nullable=False)
    pet_id = db.Column(db.Integer, db.ForeignKey('pet.pet_id'), nullable=False)

    def to_dict(self):
        return {
            'medication_id': self.medication_id,
            'name': self.name,
            'dosage': self.dosage,
            'frequency': self.frequency,
            'pet_id': self.pet_id,
            'start_time': self.start_time.isoformat() if self.start_time else None,
            'end_time': self.end_time.isoformat() if self.end_time else None
        }


# ==================== HELPERS ====================

def validate_email(email):
    pattern = r'^[^\s@]+@[^\s@]+\.[^\s@]+$'
    return re.match(pattern, email) is not None

def validate_password(password):
    return len(password) >= 6

def generate_token(user_id):
    payload = {
        'user_id': user_id,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(days=7)  # Token expires in 7 days
    }
    token = jwt.encode(payload, app.config['SECRET_KEY'], algorithm='HS256')
    # PyJWT may return bytes on some versions; ensure string
    if isinstance(token, bytes):
        token = token.decode('utf-8')
    return token

def verify_token(token):
    try:
        payload = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
        return payload['user_id']
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

def token_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = None
        auth_header = request.headers.get('Authorization')
        
        if auth_header:
            try:
                token = auth_header.split(' ')[1]  # Bearer TOKEN
            except IndexError:
                return jsonify({'error': 'Invalid authorization header format'}), 401
        
        if not token:
            return jsonify({'error': 'Token is missing'}), 401
        
        user_id = verify_token(token)
        if user_id is None:
            return jsonify({'error': 'Token is invalid or expired'}), 401
        
        current_user = User.query.get(user_id)
        if not current_user or not current_user.is_active:
            return jsonify({'error': 'User not found or inactive'}), 401
        
        return f(current_user, *args, **kwargs)
    return decorated_function

# ==================== ROUTES ====================

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'timestamp': datetime.datetime.utcnow().isoformat()})

@app.route('/auth/signup', methods=['POST'])
def signup():
    try:
        data = request.get_json()
        
        # Validation
        name = data.get('name', '').strip()
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        confirm_password = data.get('confirmPassword', '')
        
        if not all([name, email, password, confirm_password]):
            return jsonify({'error': 'All fields are required'}), 400
        
        if not validate_email(email):
            return jsonify({'error': 'Please enter a valid email address'}), 400
        
        if not validate_password(password):
            return jsonify({'error': 'Password must be at least 6 characters long'}), 400
        
        if password != confirm_password:
            return jsonify({'error': 'Passwords do not match'}), 400
        
        # Check if user already exists
        existing_user = User.query.filter_by(email=email).first()
        if existing_user:
            return jsonify({'error': 'An account with this email already exists'}), 409
        
        # Create new user
        user = User(name=name, email=email)
        user.set_password(password)
        
        db.session.add(user)
        db.session.commit()
        
        # Generate token
        token = generate_token(user.user_id)
        
        # Return user data with token
        user_data = user.to_dict()
        user_data['token'] = token
        
        return jsonify({
            'message': 'Account created successfully',
            'user': user_data
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/auth/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        
        if not email or not password:
            return jsonify({'error': 'Email and password are required'}), 400
        
        # Find user
        user = User.query.filter_by(email=email).first()
        
        if not user or not user.check_password(password):
            return jsonify({'error': 'Invalid email or password'}), 401
        
        if not user.is_active:
            return jsonify({'error': 'Account is disabled'}), 401
        
        # Generate token
        token = generate_token(user.user_id)
        
        # Return user data with token
        user_data = user.to_dict()
        user_data['token'] = token
        
        return jsonify({
            'message': 'Login successful',
            'user': user_data
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/auth/logout', methods=['POST'])
@token_required
def logout(current_user):
    # In a more sophisticated system, you might blacklist the token
    # For now, we'll just return success (client will remove token)
    return jsonify({'message': 'Logout successful'}), 200

@app.route('/auth/me', methods=['GET'])
@token_required
def get_current_user(current_user):
    return jsonify({'user': current_user.to_dict()}), 200

@app.route('/auth/change-password', methods=['POST'])
@token_required
def change_password(current_user):
    try:
        data = request.get_json()
        
        current_password = data.get('currentPassword', '')
        new_password = data.get('newPassword', '')
        confirm_password = data.get('confirmPassword', '')
        
        if not all([current_password, new_password, confirm_password]):
            return jsonify({'error': 'All fields are required'}), 400
        
        if not current_user.check_password(current_password):
            return jsonify({'error': 'Current password is incorrect'}), 400
        
        if not validate_password(new_password):
            return jsonify({'error': 'New password must be at least 6 characters long'}), 400
        
        if new_password != confirm_password:
            return jsonify({'error': 'New passwords do not match'}), 400
        
        # Update password
        current_user.set_password(new_password)
        db.session.commit()
        
        return jsonify({'message': 'Password changed successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Internal server error'}), 500

 # ==================== PET ROUTES ====================
 
# Create a new pet
@app.route('/pets/create', methods=['POST'])
@token_required
def create_pet(current_user):
    data = request.get_json()
    name = data.get('name', '').strip()
    species = data.get('species', '').strip()
    breed = data.get('breed', '').strip()
    age = data.get('age')

    if not all([name, species]):
        return jsonify({'error': 'Name and species are required'}), 400

    pet = Pet(name=name, species=species, breed=breed, age=age, user_id=current_user.user_id)
    db.session.add(pet)
    db.session.commit()

    return jsonify({'message': 'Pet created successfully', 'pet': pet.to_dict()}), 201

# Get pet by ID
@app.route('/pets', methods=['GET'])
@token_required
def get_pets(current_user):
    pets = Pet.query.filter_by(user_id=current_user.user_id).all()
    # Return an empty list if user has no pets (200)
    return jsonify([{
        'id': pet.pet_id,
        'name': pet.name,
        'species': pet.species,
        'breed': pet.breed,
        'age': pet.age
    } for pet in pets]), 200

# Update a Pet
@app.route('/pets/<int:pet_id>', methods=['PUT'])
@token_required
def update_pet(current_user, pet_id):
    data = request.get_json() or {}
    pet = Pet.query.filter_by(pet_id=pet_id, user_id=current_user.user_id).first()
    if not pet:
        return jsonify({'error': 'Pet not found'}), 404

    # Update allowed fields if provided
    name = data.get('name')
    species = data.get('species')
    breed = data.get('breed')
    age = data.get('age')

    if name is not None:
        pet.name = name.strip()
    if species is not None:
        pet.species = species.strip()
    if breed is not None:
        pet.breed = breed.strip()
    if age is not None:
        try:
            pet.age = int(age)
        except (ValueError, TypeError):
            return jsonify({'error': 'Age must be an integer'}), 400

    db.session.commit()
    return jsonify({'message': 'Pet updated successfully', 'pet': pet.to_dict()}), 200

# Delete a Pet
@app.route('/pets/<int:pet_id>', methods=['DELETE'])
@token_required
def delete_pet(current_user, pet_id):
    pet = Pet.query.filter_by(pet_id=pet_id, user_id=current_user.user_id).first()
    if not pet:
        return jsonify({'error': 'Pet not found'}), 404
    
    db.session.delete(pet)
    db.session.commit()
    
    return jsonify({'message': 'Pet deleted successfully'}), 200

# ==================== ERROR HANDLERS ====================

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(405)
def method_not_allowed(error):
    return jsonify({'error': 'Method not allowed'}), 405

@app.errorhandler(500)
def internal_error(error):
    db.session.rollback()
    return jsonify({'error': 'Internal server error'}), 500

# ==================== MAIN ====================

if __name__ == '__main__':
    # Create tables on startup (Flask 3-compatible replacement for before_first_request)
    with app.app_context():
        db.create_all()
    
    # Run the app
    app.run(debug=True, host='0.0.0.0', port=5001)
