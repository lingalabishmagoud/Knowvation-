from dotenv import load_dotenv
import os
import google.generativeai as genai

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
print("API Key loaded:", os.getenv("GEMINI_API_KEY") is not None)
try:
    models = [m.name for m in genai.list_models() if 'generateContent' in m.supported_generation_methods]
    print("Available models:", models)
except Exception as e:
    print("Error:", e)
