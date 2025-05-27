from flask import Blueprint, request, jsonify, current_app
from flask_cors import cross_origin
from flask_mail import Message
from datetime import datetime
from config.config import mail
import traceback

# New blueprint for invitation functionality
invitation_bp = Blueprint('invitation', __name__)

def send_invitation_email(email):
    try:
        print("[send_invitation_email] Preparing to send email to:", email)
        message_body = """
        Hi,

        I need your help in this part of the forensic investigation project. Your expertise and collaboration 
        would be invaluable in analyzing the evidence and uncovering the details necessary to solve this case. 
        Please join us to contribute and share your insights. Let me know if you have any questions or need 
        further information to get started.

        Thanks so much for your time and support.

        Best regards,
        SceneSolver Team
        """
        msg = Message(
            subject="Invitation to collaborate on forensic investigation",
            sender=current_app.config['MAIL_USERNAME'],
            recipients=[email],
            body=message_body
        )
        print("[send_invitation_email] Sending email...")
        mail.send(msg)
        print("[send_invitation_email] Email sent successfully!")
        return True, "Invitation email sent successfully"
    except Exception as e:
        print("[send_invitation_email] Error sending invitation email:", e)        
        return False, str(e)

@invitation_bp.route('/send-invitation', methods=['POST', 'OPTIONS'])
@cross_origin(origins=["http://localhost:8080"])

def send_invitation():
    # Allow preflight OPTIONS request to pass
    if request.method == 'OPTIONS':
        return '', 200

    try:
        print("[send_invitation] Received request to send invitation")
        data = request.get_json()
        print("[send_invitation] Request JSON data:", data)
        email = data.get('email')

        if not email:
            return jsonify({"error": "Email is required"}), 400

        # No MongoDB storage here, just send email
        print("[send_invitation] Sending invitation email to:", email)
        success, message = send_invitation_email(email)
        if success:
            print("[send_invitation] Invitation email sent successfully")
            return jsonify({"status": "success", "message": message}), 200
        else:
            print("[send_invitation] Failed to send invitation email:", message)
            return jsonify({"status": "error", "message": message}), 500

    except Exception as e:
        print("[send_invitation] Server error:", e)
        return jsonify({"error": "Internal server error"}), 500
