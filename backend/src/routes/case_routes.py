import datetime
from scripts.analyze_image import upload_and_save_image
from bson import ObjectId
from flask import Blueprint, request, jsonify
from bson.json_util import dumps
import json
import traceback
from config.config import get_mongo_connection
from middleware.auth import require_jwt as token_required
from model.case import Case  # Import your Case model
import traceback
from datetime import datetime




# Create Blueprint without a trailing slash
case_bp = Blueprint('cases', __name__)
db= get_mongo_connection()  # Assuming you have a function to get the MongoDB connection

users_collection = db['users']
# Define the route at the root path
@case_bp.route('', methods=['GET'])  # Note: no slash here
@token_required
def get_cases():

    try:
        # Get user_id from query parameters
        user_id = request.args.get('user_id')
        print("the id is " ,user_id)
        # If no user_id in query params, try to get from token
        if not user_id and hasattr(request, 'user') and hasattr(request.user, 'user_id'):
            user_id = request.user.user_id
        
        if not user_id:
            return jsonify({"error": "User ID is required"}), 400
        
        # Find cases by user_id
        cases = list(Case.find_by_user_id(user_id))
        
        # Convert ObjectId to string for JSON serialization
        cases_json = json.loads(dumps(cases))
        
        return jsonify(cases_json), 200
    except Exception as e:
        print(f"Error getting cases: {e}")
        traceback.print_exc()
        return jsonify({"error": "Server error"}), 500

@case_bp.route('/create', methods=['POST'])
@token_required
def create_case():

    try:
        data = request.get_json()
        
        # Get user_id from request body or query parameters
        user_id = data.get('user_id') or request.args.get('user_id')
        
        # If no user_id in request, try to get from token
        if not user_id and hasattr(request, 'user') and hasattr(request.user, 'user_id'):
            user_id = request.user.user_id
        
        if not user_id:
            return jsonify({"error": "User ID is required"}), 400
        
        # Create new case
        new_case = Case(
            title=data.get('title'),
            user_id=user_id,
            description=data.get('description', ''),
            case_type=data.get('type', 'Unspecified'),
            status=data.get('status', 'New'),
            suspect=data.get('suspect',""),
            browserlocation=data.get('browserlocation',""),
            location=data.get('location', ''),
            date_of_incident=data.get('dateOfIncident'),
            tags=data.get('tags', [])
        )
        
        # Save the case
        case_id = new_case.save()
        
        return jsonify({
            "message": "Case created successfully", 
            "case_id": str(case_id)
        }), 201
    except Exception as e:
        print(f"Error creating case: {e}")
        traceback.print_exc()
        return jsonify({"error": "Server error"}), 500

@case_bp.route('/<case_id>', methods=['GET'])
@token_required
def get_case(case_id):
    t
    try:
        # Find case by ID
        case = Case.find_by_id(case_id)
        
        if not case:
            return jsonify({"error": "Case not found"}), 404
        
        # Convert ObjectId to string for JSON serialization
        case_json = json.loads(dumps(case))
        
        return jsonify(case_json), 200
    except Exception as e:
        print(f"Error getting case: {e}")
        traceback.print_exc()
        return jsonify({"error": "Server error"}), 500

@case_bp.route('/<case_id>', methods=['PUT'])
@token_required
def update_case(case_id):

    try:
        data = request.get_json()
        
        # Find case by ID
        case = Case.find_by_id(case_id)
        
        if not case:
            return jsonify({"error": "Case not found"}), 404
        
        # Update case fields
        updates = {}
        if 'title' in data:
            updates['title'] = data['title']
        if 'description' in data:
            updates['description'] = data['description']
        if 'type' in data:
            updates['case_type'] = data['type']
        if 'status' in data:
            updates['status'] = data['status']
        if 'location' in data:
            updates['location'] = data['location']
        if 'dateOfIncident' in data:
            updates['date_of_incident'] = data['dateOfIncident']
        if 'tags' in data:
            updates['tags'] = data['tags']
        
        # Always update last_updated timestamp
        updates['last_updated'] = datetime.utcnow()
        
        # Update case in database
        result = Case.update(case_id, updates)
        
        if result:
            return jsonify({"message": "Case updated successfully"}), 200
        else:
            return jsonify({"error": "Failed to update case"}), 500
    except Exception as e:
        print(f"Error updating case: {e}")
        traceback.print_exc()
        return jsonify({"error": "Server error"}), 500

@case_bp.route('/<case_id>', methods=['DELETE'])
@token_required
def delete_case(case_id):

    try:
        # Find case by ID
        case = Case.find_by_id(case_id)
        
        if not case:
            return jsonify({"error": "Case not found"}), 404
        
        # Delete case and related data
        result = Case.delete(case_id)
        
        if result:
            return jsonify({"message": "Case deleted successfully"}), 200
        else:
            return jsonify({"error": "Failed to delete case"}), 500
    except Exception as e:
        print(f"Error deleting case: {e}")
        traceback.print_exc()
        return jsonify({"error": "Server error"}), 500
from flask import Blueprint, request, jsonify
from bson.json_util import dumps
import json
import traceback
from middleware.auth import require_jwt as token_required
from model.case import Case  # Import your Case model

# Create Blueprint without a trailing slash
case_bp = Blueprint('cases', __name__)

# Define the route at the root path
@case_bp.route('', methods=['GET'])  # Note: no slash here
@token_required
def get_cases():

    try:
        # Get user_id from query parameters
        user_id = request.args.get('user_id')
        # If no user_id in query params, try to get from token
        if not user_id and hasattr(request, 'user') and hasattr(request.user, 'user_id'):
            user_id = request.user.user_id
        
        if not user_id:
            return jsonify({"error": "User ID is required"}), 400
        
        # Find cases by user_id
        cases = list(Case.find_by_user_id(user_id))
        commoncases=list(db.db.cases.find({'officer':ObjectId(user_id)}))
        all_cases=cases+commoncases
        # Convert ObjectId to string for JSON serialization
        cases_json = json.loads(dumps(all_cases))
    
        
        return jsonify(cases_json), 200
    except Exception as e:
        print(f"Error getting cases: {e}")
        traceback.print_exc()
        return jsonify({"error": "Server error"}), 500

@case_bp.route('/create', methods=['POST'])
@token_required
def create_case():

    try:
        data = request.get_json()
        
        # Get user_id from request body or query parameters
        user_id = data.get('user_id') or request.args.get('user_id')
        
        # If no user_id in request, try to get from token
        if not user_id and hasattr(request, 'user') and hasattr(request.user, 'user_id'):
            user_id = request.user.user_id
        
        if not user_id:
            return jsonify({"error": "User ID is required"}), 400
        
        # Create new case
        new_case = Case(
            title=data.get('title'),
            user_id=user_id,
            description=data.get('description', ''),
            case_type=data.get('type', 'Unspecified'),
            status=data.get('status', 'New'),
            location=data.get('location', ''),
            date_of_incident=data.get('dateOfIncident'),
            tags=data.get('tags', []),
            officer=user_id
        )
        case_id = new_case.save()

        result = users_collection.update_one(
        {'_id': ObjectId(user_id)},
        {'$push': {'cases': ObjectId(case_id)}}
    )
        
        # Save the case
        
        return jsonify({
            "message": "Case created successfully", 
            "case_id": str(case_id)
        }), 201
    except Exception as e:
        print(f"Error creating case: {e}")
        traceback.print_exc()
        return jsonify({"error": "Server error"}), 500
@case_bp.route('/createCommon', methods=['POST'])
@token_required
def create_common_case():

    try:
        data = request.get_json()
        
        # Get user_id from request body or query parameters
        user_id = data.get('user_id') or request.args.get('user_id')
        
        # If no user_id in request, try to get from token
        if not user_id and hasattr(request, 'user') and hasattr(request.user, 'user_id'):
            user_id = request.user.user_id
        
        if not user_id:
            return jsonify({"error": "User ID is required"}), 400
        
        pipeline = [
            {
                "$match": {
                    "role": "investigator"   
                }
                
            },
            {
                "$match": { "role": { "$ne": "common" } }

            },
            {
                "$project": {
                    "cases_count": { "$size": { "$ifNull": ["$cases", []] } }
                }
            },
            {
                "$sort": { "cases_count": 1 }  # Sort ascending by number of cases
            },
            {
                "$limit": 1  # Get only the user with least cases
            },
            {
                "$project": {
                    "_id": 1  # Only keep _id field
                }
            }
        ]



        result = list(users_collection.aggregate(pipeline))
        print(result)
        if result:
            user_with_least_cases = result[0]['_id']
        else:
            user_with_least_cases = None


        # Create new case
        new_case = Case(
            title=data.get('title'),
            user_id=user_id,
            description=data.get('description', ''),
            case_type=data.get('type', 'Unspecified'),
            status=data.get('status', 'New'),
            location=data.get('location', ''),
            date_of_incident=data.get('dateOfIncident'),
            tags=data.get('tags', []),
            officer=user_with_least_cases
        )
        
        # Save the case
        case_id = new_case.save()
        result = users_collection.update_one(
        {'_id': ObjectId(user_with_least_cases)},
        {'$push': {'cases': ObjectId(case_id)}}
        )
        result = users_collection.update_one(
        {'_id': ObjectId(user_id)},
        {'$push': {'cases': ObjectId(case_id)}}
        )
        # After case is saved
        db.db.conversations.insert_one({
            "case_id": str(case_id),
            "userIds": user_id,
            "messages": []
        })



        
        return jsonify({
            "message": "Case created successfully", 
            "case_id": str(case_id)
        }), 201
    except Exception as e:
        print(f"Error creating case: {e}")
        traceback.print_exc()
        return jsonify({"error": "Server error"}), 500

@case_bp.route('/<case_id>', methods=['GET'])
@token_required
def get_case(case_id):

    try:
        # Find case by ID
        case = Case.find_by_id(case_id)
        
        if not case:
            return jsonify({"error": "Case not found"}), 404
        
        # Convert ObjectId to string for JSON serialization
        case_json = json.loads(dumps(case))
        
        return jsonify(case_json), 200
    except Exception as e:
        print(f"Error getting case: {e}")
        traceback.print_exc()
        return jsonify({"error": "Server error"}), 500

@case_bp.route('/<case_id>', methods=['PUT'])
@token_required
def update_case(case_id):

    try:
        data = request.get_json()
        
        # Find case by ID
        case = Case.find_by_id(case_id)
        
        if not case:
            return jsonify({"error": "Case not found"}), 404
        
        # Update case fields
        updates = {}
        if 'title' in data:
            updates['title'] = data['title']
        if 'description' in data:
            updates['description'] = data['description']
        if 'type' in data:
            updates['case_type'] = data['type']
        if 'status' in data:
            updates['status'] = data['status']
        if 'location' in data:
            updates['location'] = data['location']
        if 'dateOfIncident' in data:
            updates['date_of_incident'] = data['dateOfIncident']
        if 'tags' in data:
            updates['tags'] = data['tags']
        
        # Always update last_updated timestamp
        updates['last_updated'] = datetime.utcnow()
        
        # Update case in database
        result = Case.update(case_id, updates)
        
        if result:
            return jsonify({"message": "Case updated successfully"}), 200
        else:
            return jsonify({"error": "Failed to update case"}), 500
    except Exception as e:
        print(f"Error updating case: {e}")
        traceback.print_exc()
        return jsonify({"error": "Server error"}), 500

@case_bp.route('/<case_id>', methods=['DELETE'])
@token_required
def delete_case(case_id):

    try:
        # Find case by ID
        case = Case.find_by_id(case_id)
        
        if not case:
            return jsonify({"error": "Case not found"}), 404
        
        # Delete case and related data
        result = Case.delete(case_id)
        
        if result:
            return jsonify({"message": "Case deleted successfully"}), 200
        else:
            return jsonify({"error": "Failed to delete case"}), 500
    except Exception as e:
        print(f"Error deleting case: {e}")
        traceback.print_exc()
        return jsonify({"error": "Server error"}), 500
@case_bp.route('/all-cases', methods=['GET'])  # Final path: /api/cases/all-cases
def get_all_cases():

    try:
        # Map user _id to email
        users = {str(user["_id"]): user.get("email", "Unknown") for user in db.users.find()}

        # Group images by case_id
        images_by_case = {}
        for image in db.db.images.find():
            case_id = str(image.get("case_id"))
            file_path = image.get("file_path")
            if file_path:
                images_by_case.setdefault(case_id, []).append(file_path)

        # Get all cases and add image URLs
        cases = list(db.db.cases.find())
        formatted_cases = []
        for case in cases:
            case_id = str(case["_id"])
            formatted_cases.append({
                "id": case_id,
                "title": case.get("title", ""),
                "description": case.get("description", ""),
                "status": case.get("status", "Unknown"),
                "case_type": case.get("case_type", "Unspecified"),
                "officer":users.get(str(case.get("officer")), "Unknown Officer"),
                "location": case.get("location", ""),
                "date_of_incident": case.get("date_of_incident", ""),
                "tags": case.get("tags", []),
                "user_email": users.get(str(case.get("user_id")), "Unknown Officer"),
                "last_updated": case.get("last_updated", ""),
                "images": images_by_case.get(case_id, [])  # Add related image URLs
            })

        return jsonify(formatted_cases), 200



    except Exception as e:
        print("Error in /api/cases/all-cases:", e)
        return jsonify({"error": "Server error"}), 500
    

def convert_objectids(obj):

    if isinstance(obj, list):
        return [convert_objectids(item) for item in obj]
    elif isinstance(obj, dict):
        new_obj = {}
        for k, v in obj.items():
            new_obj[k] = convert_objectids(v)
        return new_obj
    elif isinstance(obj, ObjectId):
        return str(obj)
    elif isinstance(obj, datetime):
        return obj.isoformat()  # Optional: convert datetime to ISO string
    else:
        return obj


@case_bp.route('/reference/<string:caseId>', methods=['GET'])
def get_references(caseId):

    try:
        object_id = ObjectId(caseId)
        case_data = Case.find_by_id(object_id)

        if not case_data:
            return jsonify({"error": "Case not found"}), 404

        case_type = case_data.get("case_type")
        if not case_type:
            return jsonify({"error": "Missing case_type"}), 400

        references = list(db.db.cases.find({"case_type": case_type,"status":"closed" ,"_id": {"$ne": object_id}}))
        # print(references)
        # Convert ObjectId to string for each document in references
        references = [convert_objectids(ref) for ref in references]

        return jsonify(references), 200

    except Exception as e:
        import traceback
        print("❌ Error in /reference/<caseId>:")
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@case_bp.route('/getRoles/<string:caseId>', methods=['GET'])
def get_roles(caseId):

    try:
   
        object_id = ObjectId(caseId)
        case_data = Case.find_by_id(object_id)
        

        if not case_data or 'user_id' not in case_data:
            return jsonify({"error": "Case or user_id not found"}), 404

        user_id = case_data['user_id']

        # Verify the ObjectId conversion
        user_obj_id = ObjectId(user_id)

        # Query the user collection
        user_doc = users_collection.find_one({'_id': user_obj_id})

        if not user_doc:
            return jsonify({"error": "User not found"}), 404
        if 'role' not in user_doc:
            return jsonify({"error": "Role not found for user"}), 404

        return jsonify({"role": user_doc['role']}), 200

    except Exception as e:
        print('Error in getting role:', str(e))
        return jsonify({"error": str(e)}), 500

@case_bp.route('/getUsermail/<string:caseId>', methods=['GET'])
def get_usermail(caseId):

    try:
        object_id = ObjectId(caseId)
        case_data = Case.find_by_id(object_id)
        
        if not case_data or 'user_id' not in case_data:
            return jsonify({"error": "Case or user_id not found"}), 404
        user_id = case_data['user_id']
        user_obj_id = ObjectId(user_id)
        user_doc = users_collection.find_one({'_id': user_obj_id})
        
        if not user_doc:
            return jsonify({"error": "User not found"}), 404
        if 'email' not in user_doc:
            return jsonify({"error": "Email not found for user"}), 404
        return jsonify({"email": user_doc['email']}), 200
    except Exception as e:
        print('Error in getting usermail:', str(e))
        return jsonify({"error": str(e)}), 500
        
@case_bp.route('/getOfficermail/<string:caseId>', methods=['GET'])
def get_officermail(caseId):

    try:
        object_id = ObjectId(caseId)
        case_data = Case.find_by_id(object_id)
        # print("Case data:", case_data)
        if not case_data or 'officer' not in case_data:
            return jsonify({"error": "Case or user_id not found"}), 404
        user_id = case_data['officer']
        user_doc = users_collection.find_one({'_id': user_id})
        # print("User doc from DB:", user_doc)
        if not user_doc:
            return jsonify({"error": "User not found"}), 404
        if 'email' not in user_doc:
            return jsonify({"error": "Email not found for user"}), 404
        return jsonify({"email": user_doc['email']}), 200
    except Exception as e:
        print('Error in getting usermail:', str(e))
        return jsonify({"error": str(e)}), 500
        

@case_bp.route('/upload/<string:caseId>', methods=['POST', 'OPTIONS'])  # ← Add OPTIONS
@token_required
def upload_image_route(caseId):

    if request.method == 'OPTIONS':
        return '', 200  # Preflight response

    file = request.files['image']
    user_email = request.user['user_id']
    result = upload_and_save_image(file, case_id=caseId, user_id=user_email)
    return jsonify(result),200


@case_bp.route('/images/<string:caseId>', methods=['GET'])
def get_case_images(caseId):

    try:
        
        case_data = db.db.cases.find_one({"_id":ObjectId(caseId)})
        # Fetch images with only file_path and case_id
        images = list(db.db.images.find(
            {"case_id": caseId,"user_id":case_data['user_id']},
            
            {"file_path": 1, "case_id": 1, "_id": 0,
             }  # exclude _id
        ))

        if not images:
            return jsonify({"message": "No images found for this case"}), 200

        # Ensure all values are JSON serializable
        def safe_serialize(img):
            return {
                "file_path": img.get("file_path", ""),
                "case_id": str(img.get("case_id", ""))
            }

        images_data = [safe_serialize(img) for img in images]

        return jsonify(images_data), 200

    except Exception as e:
        print(f"❌ Error fetching images for case {caseId}: {e}")
        return jsonify({"error": str(e)}), 500

@case_bp.route('/getfilee/<string:caseId>',methods=['GET'])
def filee_route(caseId):

    try:
        case = db.db.cases.find_one({"_id": ObjectId(caseId)})
        if case:
            if(ObjectId(case['user_id'])==ObjectId(case['officer']) ):
                return jsonify({"message": "investigator"}),200
            else :
                return jsonify({"message": "common"}),200
        else:
            return jsonify({"error": "Case not found"}),404
        
    except Exception as e:
        print(f"❌ Error checking case {caseId}: {e}")
        return jsonify({"error": str(e)}), 500

@case_bp.route('/endcase/<string:caseId>',methods=['GET'])
def end_case(caseId):

    try:
        case = db.db.cases.find_one({"_id": ObjectId(caseId)})
        if case:
            db.db.cases.update_one({"_id": ObjectId(case['_id'])}, {"$set":
                                                                    {"status": "closed"}})
            return jsonify({"message": "Case closed"}), 200
        else:
            return jsonify({"error": "No open cases found"}), 404
    except Exception as e:
        print(f"❌ Error closing case: {e}")

@case_bp.route('/reopencase/<string:caseId>',methods=['GET'])
def reopen_case(caseId):
    
    try:
        case = db.db.cases.find_one({"_id": ObjectId(caseId)})
        if case:
            db.db.cases.update_one({"_id": ObjectId(case['_id'])}, {"$set":
                                                                    {"status": "reopen"}})
            return jsonify({"message": "Case Reopen"}), 200
        else:
            return jsonify({"error": "No open cases found"}), 404
    except Exception as e:
        print(f"❌ Error closing case: {e}")

@case_bp.route('/getstatus/<string:caseId>',methods=['GET'])
def get_status(caseId):
    # Your logic here
    case = Case.find_by_id(caseId)  # This should return a dict or object

    if case is None:
        return jsonify({"error": "Case not found"}), 404

    return jsonify({
        "caseId": caseId,
        "status": case['status']  # assuming this exists
    }), 200


@case_bp.route('/fetch_img_analysis/<string:caseId>',methods=['GET'])
def fetch_img_analysis(caseId):
    try:
        case_data = db.db.cases.find_one({"_id":ObjectId(caseId)})
        officer_id = case_data['officer']
        if isinstance(case_data['officer'], ObjectId):
            officer_id = str(case_data['officer'])
        img=db.db.images.find({'case_id':caseId,"user_id":officer_id})
        analysis_results = []
        for image in img:
            analysis_results.append({
                "imageUrl": image.get("file_path"),
                "crimeType": image.get("predicted_crime_type", "Unknown"),
                "description": image.get("predicted_crime", "No description"),
                "confidence": round(image.get("confidence_score", 0) * 100, 2)
            })
        return jsonify({"analysis_results": analysis_results}), 200
        
    
    except Exception as e:
        print(f"❌ Error getting image analysis: {e}")
        return jsonify({"images":img}), 404

                    
