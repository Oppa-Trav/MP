import json
import boto3

dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table("Students")

def update_student(student_id, event):
    body = json.loads(event.get("body") or "{}")

    table.update_item(
        Key={"studentId": student_id},
        UpdateExpression="SET #n=:n, email=:e",
        ExpressionAttributeNames={"#n": "name"},
        ExpressionAttributeValues={
            ":n": body["name"],
            ":e": body["email"]
        }
    )

    return {
        "statusCode": 200,
        "body": json.dumps({"updated": True})
    }