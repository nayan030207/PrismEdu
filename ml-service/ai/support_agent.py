import os
from typing import List, Dict, Any, Optional
from openai import OpenAI
from supabase import create_client, Client

SYSTEM_PROMPT = """You are the PRISM Institutional Support Companion.
Your role is to offer warm, supportive, and practical guidance to students experiencing personal stress, workload challenges, or seeking institutional resources.

CRITICAL BOUNDARIES & INSTRUCTIONS:
1. You are an AI informational assistant, NOT a certified therapist, doctor, or psychologist.
2. If a student expresses acute crisis, self-harm thoughts, or severe clinical distress, IMMEDIATELY urge them to contact the campus emergency desk, call a crisis helpline, or visit the campus wellness centre right away.
3. Your main objective is to connect students with on-campus support services:
   - On-campus professional counsellors
   - Academic advisory & tutoring
   - Financial aid & scholarship cells
   - Student welfare departments
4. Keep answers supportive, encouraging, concise, and resource-oriented.
"""

def get_supabase() -> Optional[Client]:
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    if url and key:
        return create_client(url, key)
    return None

def get_openai_client() -> Optional[OpenAI]:
    api_key = os.getenv("OPENAI_API_KEY")
    if api_key and not api_key.startswith("sk-your"):
        return OpenAI(api_key=api_key)
    return None

def fetch_counsellor_directory() -> str:
    """Fetch active institutional counsellors to inject into prompt context"""
    supabase = get_supabase()
    if not supabase:
        return (
            "- Dr. Aruna Sharma (Wellness & Stress Management) | wellness.counsellor@prismedu.com | Student Welfare Block B, Rm 204\n"
            "- Prof. Rajesh Ramanathan (Personal Mentorship & Academic Stress) | mentorship@prismedu.com | Academic Block C, Rm 112"
        )
    try:
        res = supabase.table("counsellors").select("name, specialization, email, mobile, availability, office_location").eq("is_active", True).execute()
        if res.data:
            lines = []
            for c in res.data:
                lines.append(f"- {c['name']} ({c.get('specialization', 'General Support')}): Email {c.get('email')}, Phone {c.get('mobile')}, Location: {c.get('office_location')}, Hours: {c.get('availability')}")
            return "\n".join(lines)
    except Exception:
        pass
    return "Campus Wellness Centre: Block B, Room 204 | Helpline: +91 9822334455"

def chat(question: str, history: List[Dict[str, str]] = [], student_id: Optional[str] = None) -> str:
    """Generate supportive guidance and connect with campus support"""
    counsellor_info = fetch_counsellor_directory()
    openai_client = get_openai_client()

    if not openai_client:
        # High quality built-in supportive response for demo/offline
        return (
            "Thank you for reaching out. College life and academic demands can sometimes feel overwhelming, and it is completely normal to seek guidance and balance.\n\n"
            "Here are immediate ways we can support you right here on campus:\n\n"
            "**1. Speak with Campus Counsellors (Free & Confidential):**\n"
            f"{counsellor_info}\n\n"
            "**2. Academic Support:**\n"
            "If workload or conceptual doubts are causing stress, your faculty mentor and tutoring sessions are available without any penalty.\n\n"
            "**3. Need Financial Guidance?**\n"
            "Institutional scholarships and flexible student aid programs are available in the Financial Support tab.\n\n"
            "*Remember: You don't have to carry the pressure alone. Reaching out to Dr. Aruna Sharma or your mentor is a safe and proactive step forward.*"
        )

    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "system", "content": f"Available Campus Counselling Resources:\n{counsellor_info}"}
    ]
    for m in history[-6:]:
        messages.append({"role": m.get("role", "user"), "content": m.get("content", "")})
    messages.append({"role": "user", "content": question})

    try:
        response = openai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages,
            max_tokens=600,
            temperature=0.7,
        )
        return response.choices[0].message.content or "We are here for you. Please reach out to your campus counsellor."
    except Exception as e:
        return (
            "We are here to support you. Please reach out directly to the Campus Wellness Centre at Block B, Room 204 "
            "or contact Dr. Aruna Sharma at wellness.counsellor@prismedu.com."
        )
