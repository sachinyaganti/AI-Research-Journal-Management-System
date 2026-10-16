import json
import urllib.request

pdf_response_path = r"C:\Users\sachi\AppData\Local\Temp\pdf-response.json"

with open(pdf_response_path, "r", encoding="utf-8") as file:
    pdf_response = json.load(file)

text = pdf_response["extracted_text"]

print("Characters:", len(text))

payload = json.dumps({
    "text": text
}).encode("utf-8")

request = urllib.request.Request(
    "http://127.0.0.1:8001/api/analysis/ai-content",
    data=payload,
    headers={
        "Content-Type": "application/json"
    },
    method="POST",
)

with urllib.request.urlopen(request, timeout=60) as response:

    result = json.loads(
        response.read().decode("utf-8")
    )

print("\nAI CONTENT ASSESSMENT")
print("=====================")

print(
    "AI content indicator:",
    result["ai_content_indicator"]
)

print(
    "Human writing indicator:",
    result["human_writing_indicator"]
)

print(
    "Confidence:",
    result["confidence"]
)

print(
    "Signals:",
    result["signals"]
)

print(
    "Explanation:",
    result["explanation"]
)