from flask import Blueprint, request, jsonify, Response, stream_with_context
import os
import time
import io
from PIL import Image
import sys
import json
import subprocess
from flask_cors import cross_origin
from langchain.chains import LLMChain
import datetime
from langchain.schema import HumanMessage
from jinja2 import Template
import google.generativeai as genai
from config.config import llm
from model.image import I
from langchain_core.prompts import PromptTemplate
from config.config import get_mongo_connection
from bson import ObjectId
db = get_mongo_connection()

report_bp = Blueprint('report', __name__)
@report_bp.route("/display", methods=["GET"])
def display():
    case_id = request.args.get("case_id")
    case_data = db.db.cases.find_one({"_id":ObjectId(case_id)})
    print("case_data:", case_data)
    officer_id=case_data["officer"]
    if isinstance(case_data['officer'], ObjectId):
        officer_id = str(case_data['officer'])
    l=db.db.images.find({'case_id':case_id,"user_id":officer_id})
    # l = I.get_by_case_id(case_id)  # Your DB fetch function

    print("case_id:", case_id)
    print("records:", l)

    # Format the results
    analysis_results = []
    for i in l:
        result = {
            "imageUrl": i.get("file_path"),
            "crimeType": i.get("predicted_crime_type", "Unknown"),
            "description": i.get("predicted_crime", "No description"),
            "confidence": round(i.get("confidence_score", 0) * 100, 2)
        }
        analysis_results.append(result)

    return jsonify(analysis_results)


@report_bp.route("/generate", methods=["POST"])
def generate_report():


    case_id = request.args.get("case_id")

    db = get_mongo_connection()
    # Fetch images
    case_data = db.db.cases.find_one({"_id":ObjectId(case_id)})
    officer_id = case_data['officer']
    if isinstance(case_data['officer'], ObjectId):
        officer_id = str(case_data['officer'])
    image_list=db.db.images.find({'case_id':case_id,"user_id":officer_id})
    # image_list = I.get_by_case_id(case_id)
    if not image_list:
        return jsonify({"error": "No images found for this case."}), 404

    # Connect to MongoDB
    if db is None:
        return jsonify({"error": "Failed to connect to database"}), 500

    # Fetch case details from 'cases' collection
    try:
        case = db["db.cases"].find_one({"_id": ObjectId(case_id)})
    except Exception as e:
        return jsonify({"error": f"Invalid case_id: {str(e)}"}), 400
    if not case:
        return jsonify({"error": "Case not found in database."}), 404

    title = case.get("title", "Unknown Case")
    user_id = case.get("officer")
    description = case.get("description", "No description provided.")
    case_type = case.get("case_type", "Unknown")

    # Fetch user email from 'users' collection
    user = db["users"].find_one({"_id": ObjectId(user_id)})
    if not user:
        return jsonify({"error": "User not found."}), 404

    email = user.get("email", "unknown@email.com")
    name = email.split("@")[0]  # Extract name from email

    # Format image data
    formatted_images = []
    analysis_results = []

    for img in image_list:
        detected_objects = img.get("detected_objects", [])
        first_detected = detected_objects[0] if detected_objects else []

        formatted_images.append({
            "url": img.get("file_path"),
            "detected_objects": first_detected,
            "predicted_crime": img.get("predicted_crime", "Unknown"),
            "crime_type": img.get("predicted_crime_type", "Unknown"),
        })

        analysis_results.append({
            "imageUrl": img.get("file_path"),
            "crimeType": img.get("predicted_crime_type", "Unknown"),
            "description": img.get("predicted_crime", "No description"),
            "confidence": round(img.get("confidence_score", 0) * 100, 2)
        })

    # Jinja template for report
    prompt_template = Template("""
You are a forensic investigator AI analyzing a crime scene based on image data.

Case Details:
- Case ID: {{ case_id }}
- Title: {{ title }}
- Case Investigator: {{ name }}
- Description: {{ description }}
- Type: {{ case_type }}

Images and Observations:
{% for image in images %}
- Image URL: {{ image.url }}
  - Detected Objects: {{ image.detected_objects | join(", ") }}
  - Predicted Crime Type: {{ image.crime_type }}
  - Crime Description: {{ image.predicted_crime }}
{% endfor %}

Generate a detailed forensic report including:
- Scene interpretation
- Suspected activities
- Evidence based on object detection
- Crime categorization
- Suggestions for further investigation
""")

    final_prompt = prompt_template.render(
        case_id=case_id,
        title=title,
        name=name,
        description=description,
        case_type=case_type,
        images=formatted_images
    )

    # Call LLM
    try:
        response = llm([HumanMessage(content=final_prompt)])
        report_text = response.content
        db["db.cases"].update_one(
            {"_id": ObjectId(case_id)},
            {"$set": {"report": report_text}}
        )
    except Exception as e:
        return jsonify({"error": f"Error generating report: {str(e)}"}), 500

    return jsonify({
        "report": report_text,
        "images": analysis_results
    })

    
@report_bp.route("/fetch", methods=["GET"])
def fetch_saved_report():
    case_id = request.args.get("case_id")

    # Connect to MongoDB
    db = get_mongo_connection()
    if db is None:
        return jsonify({"error": "Failed to connect to database"}), 500

    # Validate and fetch case
    try:
        case = db["db.cases"].find_one({"_id": ObjectId(case_id)})
    except Exception as e:
        return jsonify({"error": f"Invalid case_id: {str(e)}"}), 400

    if not case:
        return jsonify({"error": "Case not found."}), 404

    # Get report
    report = case.get("report", None)
    if not report:
        return jsonify({"message": "No report saved for this case."}), 404

    return jsonify({
        "report": report
    }), 200