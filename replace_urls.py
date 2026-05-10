import os
import glob

# URL replacements
replacements = {
    "http://127.0.0.1:8000": "https://knowvation.onrender.com",
    "http://localhost:8000": "https://knowvation.onrender.com",
    "http://localhost:3000": "https://lingalabishmagoud.github.io/Knowvation-"
}

frontend_dir = r"d:\Knowvation\frontend\src\app"

for root, _, files in os.walk(frontend_dir):
    for file in files:
        if file.endswith(".tsx") or file.endswith(".ts"):
            filepath = os.path.join(root, file)
            with open(filepath, "r", encoding="utf-8") as f:
                content = f.read()
            
            new_content = content
            for old_url, new_url in replacements.items():
                new_content = new_content.replace(old_url, new_url)
            
            if new_content != content:
                with open(filepath, "w", encoding="utf-8") as f:
                    f.write(new_content)
                print(f"Updated: {filepath}")

print("Replacement complete.")
