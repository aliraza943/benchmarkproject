from flask import Flask, request, jsonify, Response
from flask_cors import CORS
from supabase import create_client
import os
import xml.etree.ElementTree as ET
from dotenv import load_dotenv
from requests.auth import HTTPBasicAuth
load_dotenv()
import requests
import traceback  # Add this near your other imports


app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})


SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

@app.route('/send-magic-link', methods=['POST'])
def send_magic_link():
    data = request.get_json()
    email = data.get("email")
    if not email:
        return jsonify({"error": "Email is required"}), 400

    try:
        response = supabase.auth.sign_in_with_otp({
            "email": email,
            "options": {
                "email_redirect_to": "http://localhost:5173/addProperty"
            }
        })
        
        # The response structure doesn't have an error attribute directly
        # It returns a data object on success
        return jsonify({"message": "Magic link sent!"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/submit-form', methods=['POST'])
def submit_form():
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    try:
        user = supabase.auth.get_user(token).user
        data = request.get_json()
        print(f"Received submission from {user.email}: {data}")
        return jsonify({
            "message": f"Thanks {user.email}, your message was received!",
            "received": data
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 401
    

@app.route('/submit-xml', methods=['POST', 'OPTIONS'])
def submit_xml():
    if request.method == 'OPTIONS':
        # Handle preflight request (CORS)
        response = Response()
        response.headers['Access-Control-Allow-Origin'] = 'http://localhost:5173'  # Your React app's URL
        response.headers['Access-Control-Allow-Methods'] = 'POST, OPTIONS'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
        return response

    try:
        # Only execute the actual POST request if not a preflight (OPTIONS)
        xml_data = request.data.decode('utf-8')
        print("Sending XML to ENERGY STAR:\n", xml_data)

        url = "https://portfoliomanager.energystar.gov/wstest/account/478321/property"
        username = "PulseIQTest"
        password = "Pulseiq123"

        response = requests.post(
            url,
            data=xml_data,
            headers={"Content-Type": "application/xml"},
            auth=HTTPBasicAuth(username, password)
        )

        print("Status Code:", response.status_code)
        print("Response Headers:", response.headers)
        print("Response Text:\n", response.text)

        # Parse XML response to extract <id>
        id_value = None
        if response.status_code == 201:
            try:
                root = ET.fromstring(response.text)
                id_element = root.find('id')
                if id_element is not None:
                    id_value = id_element.text
            except ET.ParseError as e:
                print("XML parsing error:", e)

        return jsonify({
            "status": response.status_code,
            "id": id_value,
            "responseText": response.text,
            "location": response.headers.get("Location")
        }), response.status_code

    except Exception as e:
        error_trace = traceback.format_exc()
        print("Exception occurred:\n", error_trace)
        return jsonify({
            "error": str(e),
            "trace": error_trace
        }), 500

@app.route('/submit-propertyUse', methods=['POST'])
def submit_property_Use():
    try:
        xml_data = request.data.decode('utf-8')
        print("Received XML:\n", xml_data)

        # Get property ID from query parameter
        property_id = request.args.get("id")
        if not property_id:
            return jsonify({"error": "Missing 'id' query parameter"}), 400

        # Build the URL using the property ID
        url = f"https://portfoliomanager.energystar.gov/wstest/property/{property_id}/propertyUse"

        username = "PulseIQTest"
        password = "Pulseiq123"

        response = requests.post(
            url,
            data=xml_data,
            headers={"Content-Type": "application/xml"},
            auth=HTTPBasicAuth(username, password)
        )

        print("Status Code:", response.status_code)
        print("Response Headers:", response.headers)
        print("Response Text:\n", response.text)

        return jsonify({
            "status": response.status_code,
            "id": property_id,
            "responseText": response.text,
            "location": response.headers.get("Location")
        }), response.status_code

    except Exception as e:
        error_trace = traceback.format_exc()
        print("Exception occurred:\n", error_trace)
        return jsonify({
            "error": str(e),
            "trace": error_trace
        }), 500
if __name__ == "__main__":
    app.run(debug=True)
