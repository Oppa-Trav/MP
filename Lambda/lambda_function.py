import json
from students_fetch import fetch_students
from students_add import add_student
from students_update import update_student
from students_delete import delete_student

CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "OPTIONS,GET,POST,PUT,DELETE"
}

def lambda_handler(event, context):
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
        "body": json.dumps({"error": "Not found"})
    })