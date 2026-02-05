import json

from students_fetch import fetch_students
from students_add import add_student
from students_update import update_student
from students_delete import delete_student

CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
    "Access-Control-Allow-Methods": "OPTIONS,GET,POST,PUT,DELETE",
    "Vary": "Origin",
}

def with_cors(resp: dict):
    if not isinstance(resp, dict):
        return {
            "statusCode": 500,
            "headers": CORS_HEADERS,
            "body": json.dumps({"error": "Invalid response from handler"})
        }

    resp["headers"] = {**CORS_HEADERS, **(resp.get("headers") or {})}

    # API Gateway expects body as a string
    if "body" in resp and not isinstance(resp["body"], str):
        resp["body"] = json.dumps(resp["body"])

    if "body" not in resp:
        resp["body"] = ""

    return resp

def lambda_handler(event, context):
    # Preflight
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS_HEADERS, "body": ""}

    method = event.get("httpMethod")
    path = event.get("path", "")
    student_id = (event.get("pathParameters") or {}).get("studentId")

    if method == "GET" and path == "/students":
        return with_cors(fetch_students())

    if method == "POST" and path == "/students":
        return with_cors(add_student(event))

    if method == "PUT" and student_id:
        return with_cors(update_student(student_id, event))

    if method == "DELETE" and student_id:
        return with_cors(delete_student(student_id))

    return with_cors({
        "statusCode": 404,
        "body": {"error": "Route not found"}
    })