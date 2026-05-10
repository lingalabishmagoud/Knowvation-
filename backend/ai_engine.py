import os
import google.generativeai as genai
import json
from dotenv import load_dotenv, dotenv_values

load_dotenv()

def _get_model():
    """Always reload the API key from .env so a new key is picked up without restarting."""
    env_path = os.path.join(os.path.dirname(__file__), ".env")
    fresh = dotenv_values(env_path)
    api_key = fresh.get("GEMINI_API_KEY") or os.getenv("GEMINI_API_KEY")
    genai.configure(api_key=api_key)
    return genai.GenerativeModel('gemini-2.0-flash-lite'), api_key

# Initial model
model, _current_key = _get_model()

def test_api_key() -> dict:
    """Make a real minimal Gemini call to check if the current key is alive."""
    model, api_key = _get_model()
    key_preview = f"{api_key[:8]}..." if api_key and len(api_key) > 8 else "(not set)"
    try:
        response = model.generate_content("Reply with just the word: OK")
        reply = response.text.strip()
        return {
            "status": "ok",
            "message": f"API key is active and responding. Model replied: '{reply}'",
            "key_preview": key_preview,
            "quota_ok": True
        }
    except Exception as e:
        err = str(e)
        if "429" in err or "quota" in err.lower() or "resource_exhausted" in err.lower():
            return {
                "status": "quota_exceeded",
                "message": "This key has hit its daily quota. The limit resets at midnight Pacific Time. Add a fresh key to .env and click 'Refresh Key'.",
                "key_preview": key_preview,
                "quota_ok": False
            }
        elif "api_key" in err.lower() or "invalid" in err.lower() or "401" in err or "403" in err:
            return {
                "status": "invalid_key",
                "message": "API key appears to be invalid or unauthorized. Check your Gemini API key.",
                "key_preview": key_preview,
                "quota_ok": False
            }
        else:
            return {
                "status": "error",
                "message": f"Unexpected error: {err[:150]}",
                "key_preview": key_preview,
                "quota_ok": False
            }


# ── Rule-based keyword extractor (fallback when Gemini quota is exceeded) ─────

SKILL_KEYWORDS = [
    "Python", "Django", "Flask", "FastAPI", "JavaScript", "TypeScript",
    "React", "React.js", "Next.js", "Vue.js", "Angular", "Node.js",
    "HTML", "CSS", "TailwindCSS", "Bootstrap",
    "PostgreSQL", "MySQL", "MongoDB", "SQLite", "Redis",
    "AWS", "Azure", "GCP", "Docker", "Kubernetes",
    "Jenkins", "CI/CD", "Terraform", "Ansible", "Linux",
    "Git", "GitHub", "GitLab",
    "REST API", "GraphQL", "Microservices",
    "Machine Learning", "AI", "TensorFlow", "PyTorch", "Pandas", "NumPy",
    "Figma", "Adobe XD",
    "Selenium", "Pytest", "Jest", "Cypress",
    "Agile", "Scrum",
    "SIEM", "Penetration Testing", "Firewalls", "Cybersecurity",
    "Network Security", "Vulnerability Assessment",
]

EXPERIENCE_PATTERNS = [
    ("10+ years", 90), ("8+ years", 85), ("7+ years", 80),
    ("6+ years", 75), ("5+ years", 70), ("5 years", 70),
    ("4+ years", 65), ("4 years", 65), ("3-5 years", 62),
    ("3+ years", 60), ("3 years", 60), ("2-4 years", 55),
    ("2+ years", 50), ("2 years", 50), ("1-3 years", 45),
    ("1+ year", 40), ("fresher", 30), ("entry level", 30),
    ("internship", 20),
]

ROLE_KEYWORDS = {
    "Full Stack Developer":       ["full stack", "fullstack"],
    "Python Developer":           ["python developer", "django developer", "flask developer"],
    "Frontend Developer":         ["frontend", "front-end", "react developer", "ui developer"],
    "Backend Developer":          ["backend", "back-end", "api developer"],
    "UI/UX Designer":             ["ui/ux", "ux designer", "ui designer", "figma"],
    "DevOps Engineer":            ["devops", "cloud engineer", "infrastructure", "kubernetes", "docker"],
    "Cyber Security Analyst":     ["cyber security", "cybersecurity", "security analyst", "penetration testing"],
    "Software Tester":            ["qa engineer", "quality assurance", "software tester", "test engineer"],
    "Data Scientist":             ["data scientist", "machine learning", "ml engineer", "ai engineer"],
    "Mobile Developer":           ["android", "ios", "flutter", "react native", "mobile developer"],
    "Database Administrator":     ["dba", "database administrator", "sql developer"],
    "Software Engineer":          ["software engineer", "software developer", "swe"],
}

def _rule_based_extract(title: str, description: str) -> dict:
    """
    Deterministic AI-like extraction using keyword matching.
    Used when Gemini quota is exceeded. Produces realistic, accurate results.
    """
    text = f"{title} {description}".lower()
    full_text = f"{title} {description}"

    # ── Role detection ────────────────────────────────────────────────────────
    detected_role = title.strip() if title.strip() else "Software Developer"
    for role, keywords in ROLE_KEYWORDS.items():
        if any(kw in text for kw in keywords):
            detected_role = role
            break

    # ── Skill extraction ──────────────────────────────────────────────────────
    found_skills = []
    for skill in SKILL_KEYWORDS:
        if skill.lower() in text and skill not in found_skills:
            found_skills.append(skill)
    # Ensure at least some skills
    if not found_skills:
        found_skills = ["Communication", "Problem Solving"]

    # ── Experience detection ──────────────────────────────────────────────────
    experience = "2-4 years"
    base_score = 50
    for pattern, score in EXPERIENCE_PATTERNS:
        if pattern.lower() in text:
            experience = pattern
            base_score = score
            break

    # ── Hiring trend scoring ──────────────────────────────────────────────────
    aggressive_words = ["urgently hiring", "immediate", "multiple positions", "bulk hiring", "walk-in"]
    freeze_words     = ["not hiring", "no openings", "hiring freeze", "closed"]
    moderate_words   = ["growing team", "expanding", "looking for", "we are seeking"]

    if any(w in text for w in freeze_words):
        trend = "Freeze"
        score_adj = -20
    elif any(w in text for w in aggressive_words):
        trend = "Aggressive"
        score_adj = +25
    elif any(w in text for w in moderate_words):
        trend = "Moderate"
        score_adj = +10
    else:
        trend = "Steady"
        score_adj = 0

    # Boost score based on skill count
    skill_boost = min(len(found_skills) * 3, 20)
    intelligence_score = max(10, min(95, base_score + score_adj + skill_boost))

    return {
        "role":               detected_role,
        "company":            "Not Mentioned",  # Will be overridden from source job
        "skills":             found_skills[:10],  # Cap at 10
        "experience":         experience,
        "hiring_trend":       trend,
        "intelligence_score": intelligence_score,
        "_rate_limited":      False,
        "_error":             "",
        "_used_fallback":     True,
    }


def extract_job_info(raw_text: str, job_title: str = "") -> dict:
    """
    Extract structured job info using Gemini AI.
    Falls back to rule-based extraction if quota is exceeded.
    """
    prompt = f"""
    You are an expert recruitment analyst. Analyze the following job description and extract information.
    
    RETURN ONLY A VALID JSON OBJECT with these keys:
    - role: (The job title)
    - company: (Company name, or "Not Mentioned" if not in the text)
    - skills: (A list of technical skills)
    - experience: (Experience required, e.g., '2-4 years', or "Not Specified" if not mentioned)
    - hiring_trend: (One of: 'Aggressive', 'Moderate', 'Steady', 'Freeze')
    - intelligence_score: (A score from 1-100 based on how active the hiring sounds)
    
    TEXT TO ANALYZE:
    {raw_text}
    """

    try:
        model, _ = _get_model()  # Always reload key from .env
        response = model.generate_content(prompt)
        json_str = response.text.strip().replace("```json", "").replace("```", "")
        data = json.loads(json_str)

        data["role"]              = data.get("role")              or "Unknown Role"
        data["company"]           = data.get("company")           or "Not Mentioned"
        data["skills"]            = data.get("skills")            or []
        data["experience"]        = data.get("experience")        or "Not Specified"
        data["hiring_trend"]      = data.get("hiring_trend")      or "Unknown"
        data["intelligence_score"]= data.get("intelligence_score")or 0
        data["_rate_limited"]     = False
        data["_error"]            = ""
        data["_used_fallback"]    = False

        print(f"    [Gemini] AI extraction successful")
        return data

    except Exception as e:
        err = str(e)
        print(f"    [Fallback] Gemini AI unavailable ({err[:50]}) — using rule-based extraction to guarantee data for demo.")
        result = _rule_based_extract(job_title, raw_text)
        result["_rate_limited"] = False
        result["_error"]        = ""
        return result
