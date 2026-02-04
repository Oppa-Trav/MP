import json
import boto3

dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table("Students")

def delete_student(student_id):
    table.delete_item(Key={"studentId": student_id})

    return {
        "statusCode": 200,
        "body": json.dumps({"deleted": True})
    }