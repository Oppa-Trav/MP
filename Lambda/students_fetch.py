import json
import boto3

dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table("Students")

def fetch_students():
    resp = table.scan()
    return {
        "statusCode": 200,
        "body": json.dumps(resp.get("Items", []))
    }