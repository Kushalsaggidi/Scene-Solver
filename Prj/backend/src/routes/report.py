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
report_bp = Blueprint('report', __name__)
@report_bp.route("/display", methods=["GET"])
def display():
    case_id = request.args.get("case_id")
    l = I.get_by_case_id(case_id)  # Your DB fetch function

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
    image_list = I.get_by_case_id(case_id)

    if not image_list:
        return "No images found for this case.", 404

    # Format data for prompt
    formatted_images = []
    for img in image_list:
        detected_objects = img.get("detected_objects", [])
        first_detected = detected_objects[0] if detected_objects else []
        formatted_images.append({
            "url": img["file_path"],
            "detected_objects": first_detected,
            "predicted_crime": img.get("predicted_crime", "Unknown"),
            "crime_type": img.get("predicted_crime_type", "Unknown"),
    })


    # Jinja template for the report prompt
    prompt_template = Template("""
You are a forensic investigator AI analyzing a crime scene based on image data.

Case ID: {{ case_id }}

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

    final_prompt = prompt_template.render(case_id=case_id, images=formatted_images)
    def stream():
        try:
            for chunk in llm.stream([HumanMessage(content=final_prompt)]):
                yield f"data: {chunk.content}\n\n"
                print(chunk.content)
        except Exception as e:
            yield f"data: Error generating report: {str(e)}\n\n"

    return Response(stream(), content_type='text/event-stream')