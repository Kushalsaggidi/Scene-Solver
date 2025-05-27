import random
import datetime
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart


from bson import ObjectId
from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from dotenv import load_dotenv

from config.config import get_mongo_connection  # Your MongoDB connection function
from middleware.auth import create_token, require_jwt         # Your JWT token creator

load_dotenv()

auth_bp = Blueprint('auth', __name__)

# MongoDB users collection (used everywhere)
mongo = get_mongo_connection()
users_collection = mongo['users']

ADMIN_EMAIL = "saggkushal@gmail.com"
JWT_SECRET = os.getenv("JWT_SECRET", "default_secret")


MAIL_USERNAME = os.getenv("MAIL_USERNAME")
MAIL_PASSWORD = os.getenv("MAIL_PASSWORD")

# -------------------------------
# Register Route
# -------------------------------
@auth_bp.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')

        if not email or not password:
            return jsonify({'message': 'Email and password required'}), 400

        # Role assignment
        role = "admin" if email == ADMIN_EMAIL else "investigator"

        # Check if user already exists
        existing_user = users_collection.find_one({'email': email})
        if existing_user:
            return jsonify({'message': 'User already exists'}), 400

        # Hash password
        hashed_password = generate_password_hash(password)

        # Create user document
        user_doc = {
            'email': email,
            'password': hashed_password,
            'role': role,
            'created_at': datetime.datetime.utcnow()
        }

        # Insert user and get inserted id
        result = users_collection.insert_one(user_doc)
        user_id = result.inserted_id

        # Create JWT token
        token = create_token(email, role=role, user_id=str(user_id))

        # Return token and user info
        return jsonify({
            'token': token,
            'user': {
                'id': str(user_id),
                'email': email,
                'role': role
            }
        }), 201

    except Exception as e:
        print("Register Error:", e)
        return jsonify({'message': 'Server error'}), 500


# -------------------------------
# Login Route
# -------------------------------
@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')

        if not email or not password:
            return jsonify({'error': 'Email and password required'}), 400

        # Find user
        user = users_collection.find_one({'email': email})
        if not user:
            print(f"Login failed: user not found for email {email}")
            return jsonify({'error': 'User not found'}), 400

        # Check password
        if not check_password_hash(user['password'], password):
            print(f"Login failed: invalid password for email {email}")
            return jsonify({'error': 'Invalid credentials'}), 401

        role = user.get('role', 'investigator')

        # Create token with user info
        token = create_token(email, role=role, user_id=str(user['_id']))

        # Return token and user info
        return jsonify({
            'token': token,
            'user': {
                'id': str(user['_id']),
                'email': email,
                'role': role
            }
        }),201

    except Exception as e:
        print("Login Error:", e)
        return jsonify({'error': 'Server error'}), 500


def send_reset_email(to_email, reset_code):
    try:
        smtp_server = "smtp.gmail.com"
        smtp_port = 587

        # Create message
        msg = MIMEMultipart()
        msg['From'] = MAIL_USERNAME
        msg['To'] = to_email
        msg['Subject'] = "Password Reset Code"

        body = f"Your password reset code is: {reset_code}\n\nIf you did not request this, please ignore."
        msg.attach(MIMEText(body, 'plain'))

        # Connect and send mail
        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()
        server.login(MAIL_USERNAME, MAIL_PASSWORD)
        server.send_message(msg)
        server.quit()
        print(f"Reset email sent to {to_email}")
        return True

    except Exception as e:
        print("Failed to send reset email:", e)
        return False


@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    try:
        data = request.get_json()
        email = data.get('email')

        if not email:
            return jsonify({'status': 400, 'message': 'Email required'}), 400

        user = users_collection.find_one({'email': email})
        if not user:
            return jsonify({'status': 404, 'message': 'User not found'}), 404

        # Generate 6-digit reset code
        reset_code = str(random.randint(100000, 999999))

        # Save reset code and expiry (10 minutes)
        users_collection.update_one(
            {'email': email},
            {'$set': {
                'reset_code': reset_code,
                'reset_code_expiry': datetime.datetime.utcnow() + datetime.timedelta(minutes=10)
            }}
        )

        # Send reset code by email
        email_sent = send_reset_email(email, reset_code)
        if not email_sent:
            return jsonify({'status': 500, 'message': 'Failed to send reset email'}), 500

        return jsonify({'status': 200, 'message': 'Reset code sent to email'}), 200

    except Exception as e:
        print("Forgot Password Error:", e)
        return jsonify({'status': 500, 'message': 'Server error'}), 500

# -------------------------------
# Reset Password Route
# -------------------------------
@auth_bp.route('/reset-password', methods=['POST'])
def reset_password():
    try:
        data = request.get_json()
        email = data.get('email')
        code = data.get('resetcode')
        new_password = data.get('newpassword')
        confirm_password = data.get('confirmpassword')

        if not all([email, code, new_password, confirm_password]):
            return jsonify({'status': 400, 'message': 'All fields are required'}), 400

        if new_password != confirm_password:
            return jsonify({'status': 400, 'message': 'Passwords do not match'}), 400

        user = users_collection.find_one({'email': email})

        if not user:
            return jsonify({'status': 404, 'message': 'User not found'}), 404

        if user.get('reset_code') != code:
            return jsonify({'status': 400, 'message': 'Invalid reset code'}), 400

        if datetime.datetime.utcnow() > user.get('reset_code_expiry', datetime.datetime.utcnow()):
            return jsonify({'status': 400, 'message': 'Reset code expired'}), 400

        # Hash new password and update
        hashed_password = generate_password_hash(new_password)

        users_collection.update_one(
            {'email': email},
            {
                '$set': {'password': hashed_password},
                '$unset': {'reset_code': '', 'reset_code_expiry': ''}
            }
        )

        return jsonify({'status': 200, 'message': 'Password reset successful'}), 200

    except Exception as e:
        print("Reset Password Error:", e)
        return jsonify({'status': 500, 'message': 'Server error'}), 500
    
@auth_bp.route('/dashboard/<user_id>', methods=['GET'])
def get_user_profile(user_id):
    mongo = get_mongo_connection()
    users_collection = mongo['users']

    try:
        user = users_collection.find_one({"_id": ObjectId(user_id)})
        if not user:
            return jsonify({"error": "User not found"}), 404

        user_data = {
            "email": user.get("email", "")

        }
        return jsonify(user_data), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500