from flask import Blueprint, jsonify
from config.config import get_mongo_connection

admin_bp = Blueprint('admin', __name__)
db = get_mongo_connection().db

@admin_bp.route("/api/admin/all-cases", methods=["GET"])
def get_all_cases():
    cases = list(db.cases.find())
    users = {str(user["_id"]): user["email"] for user in db.users.find()}
    
    def format_case(case):
        return {
            "id": str(case["_id"]),
            "title": case.get("title", ""),
            "description": case.get("description", ""),
            "status": case.get("status", "Unknown"),
            "case_type": case.get("case_type", "Unspecified"),
            "date": case.get("date", {}).get("$date", ""),
            "last_updated": case.get("last_updated", {}).get("$date", ""),
            "user_email": users.get(case.get("user_id", ""), "Unknown Officer")
        }

    return jsonify([format_case(c) for c in cases]), 200
