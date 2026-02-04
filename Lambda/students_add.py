import json
import boto3

dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table("Students")

def add_student(event):
    body = json.loads(event.get("body") or "{}")

    table.put_item(Item={
        "studentId": body["studentId"],
        "email": body["email"],
        "name": body["name"]
    })

    return {
        "statusCode": 201,
        "body": json.dumps(body)
    }