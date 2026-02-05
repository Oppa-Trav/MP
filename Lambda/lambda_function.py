import json
import os

from students_fetch import fetch_students
from students_add import add_student
from students_update import update_student
from students_delete import delete_student

# ✅ Put your ALB origin here (or set it as a Lambda env var ALLOWED_ORIGINS)
# Example:
# ALLOWED_ORIGINS="http://localhost:3000,http://studen-loadb-m4imwg14htij-517490578.us-east-1.elb.amazonaws.com"
DEFAULT_ALLOWED_ORIGINS = "http://localhost:3000"
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", DEFAULT_ALLOWED_ORIGINS)
ALLOWED_ORIGINS_SET = {o.strip() for o in ALLOWED_ORIGINS.split(",") if o.strip()}

def cors_headers_for(event: dict):
    """
    Return CORS headers that allow localhost + your deployed ALB origin.
    We reflect the request Origin if it's in the allow list.
    """
    origin = (event.get("headers") or {}).get("origin") or (event.get("headers") or {}).get("Origin")

    # If Origin is allowed, reflect it. Otherwise do NOT allow.
    allow_origin = origin if origin in ALLOWED_ORIGINS_SET else ""

    return {
        "Access-Control-Allow-Origin": allow_origin,
        "Access-Control-Allow-Headers": "Content-Type,Authorization",
        "Access-Control-Allow-Methods": "OPTIONS,GET,POST,PUT,DELETE",
        # Important when reflecting specific origins (not "*")
        "Access-Control-Allow-Credentials": "true",
        "Vary": "Origin",
    }

def with_cors(event: dict, resp: dict):
    """
    Ensure correct Lambda proxy response shape + always apply CORS headers.
    """
    headers = cors_headers_for(event)

    if not isinstance(resp, dict):
        return {
            "statusCode": 500,
            "headers": headers,
            "body": json.dumps({"error": "Invalid response from handler"}),
        }

    # Merge headers (handler headers win only if they don't overwrite CORS)
    resp_headers = resp.get("headers") or {}
    resp["headers"] = {**resp_headers, **headers}

    # API Gateway expects body string
    if "body" in resp and not isinstance(resp["body"], str):
        resp["body"] = json.dumps(resp["body"])

    # Default body if missing
    if "body" not in resp:
        resp["body"] = ""

    return resp

def lambda_handler(event, context):
    method = event.get("httpMethod")
    path = event.get("path", "")
    student_id = (event.get("pathParameters") or {}).get("studentId")

    # ✅ Preflight OPTIONS must return correct CORS too
    if method == "OPTIONS":
        return {
            "statusCode": 200,
            "headers": cors_headers_for(event),
            "body": ""
        }

    # Routes
    if method == "GET" and path == "/students":
        return with_cors(event, fetch_students())

    if method == "POST" and path == "/students":
        return with_cors(event, add_student(event))

    # Your API Gateway likely maps /students/{studentId}
    if method == "PUT" and student_id:
        return with_cors(event, update_student(student_id, event))

    if method == "DELETE" and student_id:
        return with_cors(event, delete_student(student_id))

    return with_cors(event, {
        "statusCode": 404,
        "body": {"error": "Route not found"},
    })