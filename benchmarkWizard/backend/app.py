from flask import Flask, request, jsonify, Response
from flask_cors import CORS
from supabase import create_client
import os
import xml.etree.ElementTree as ET
from dotenv import load_dotenv
from requests.auth import HTTPBasicAuth
load_dotenv()
import requests

app = Flask(__name__)
CORS(app)

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

@app.route('/submit-xml', methods=['POST'])
def submit_xml():
    try:
        xml_data = request.data.decode('utf-8')
        print("Sending XML to Energy Star:\n", xml_data)

        url = "https://portfoliomanager.energystar.gov/wstest/account/478321/property"
        username = "PulseIQTest"
        password = "Pulseiq123"

        response = requests.post(
            url,
            data=xml_data,
            headers={"Content-Type": "application/xml"},
            auth=HTTPBasicAuth(username, password)
        )

        return jsonify({
            "status": response.status_code,
            "responseText": response.text,
            "location": response.headers.get("Location")
        }), response.status_code

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)
