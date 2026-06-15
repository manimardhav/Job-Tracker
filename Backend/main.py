from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, validator
from typing import Optional
from datetime import datetime
from dotenv import load_dotenv
from google import genai
import json
import os

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

FILE_NAME = "jobs.json"

VALID_STATUSES = ["Applied", "Interview", "Rejected", "Offered"]

# -----------------------------------------------
# Job model — validates every field strictly
# -----------------------------------------------
class Job(BaseModel):
    company: str
    role: str
    status: str
    date: str

    # Runs automatically when job is created
    @validator("company")
    def company_not_empty(cls, v):
        if not v.strip():
            raise ValueError("Company name cannot be empty")
        return v.strip()

    @validator("role")
    def role_not_empty(cls, v):
        if not v.strip():
            raise ValueError("Role cannot be empty")
        return v.strip()

    @validator("status")
    def status_must_be_valid(cls, v):
        if v not in VALID_STATUSES:
            raise ValueError(f"Status must be one of: {VALID_STATUSES}")
        return v

    @validator("date")
    def date_must_be_valid(cls, v):
        try:
            # Checks if date is in YYYY-MM-DD format
            datetime.strptime(v, "%Y-%m-%d")
        except ValueError:
            raise ValueError("Date must be in YYYY-MM-DD format. Example: 2024-06-01")
        return v

# -----------------------------------------------
# UpdateJob — all fields optional for PATCH
# Same validators apply
# -----------------------------------------------
class UpdateJob(BaseModel):
    company: Optional[str] = None
    role: Optional[str] = None
    status: Optional[str] = None
    date: Optional[str] = None

    @validator("company")
    def company_not_empty(cls, v):
        if v is not None and not v.strip():
            raise ValueError("Company name cannot be empty")
        return v.strip() if v else v

    @validator("status")
    def status_must_be_valid(cls, v):
        if v is not None and v not in VALID_STATUSES:
            raise ValueError(f"Status must be one of: {VALID_STATUSES}")
        return v

    @validator("date")
    def date_must_be_valid(cls, v):
        if v is not None:
            try:
                datetime.strptime(v, "%Y-%m-%d")
            except ValueError:
                raise ValueError("Date must be in YYYY-MM-DD format. Example: 2024-06-01")
        return v

def load_jobs():
    if os.path.exists(FILE_NAME):
        with open(FILE_NAME, "r") as f:
            return json.load(f)
    return []

def save_jobs(jobs):
    with open(FILE_NAME, "w") as f:
        json.dump(jobs, f, indent=4)

# -----------------------------------------------
# Generates next simple ID — 1, 2, 3, 4...
# -----------------------------------------------
def get_next_id(jobs):
    if not jobs:
        return 1
    return max(job["id"] for job in jobs) + 1

# -----------------------------------------------
# GET /jobs
# -----------------------------------------------

@app.get("/jobs")
def get_jobs(search: str = None):
    jobs = load_jobs()

    # If search term provided, filter jobs
    if search:
        jobs = [
            job for job in jobs
            if search.lower() in job["company"].lower()
            or search.lower() in job["role"].lower()
        ]

    return jobs

# GET /jobs?status=Applied
@app.get("/jobs")
def get_jobs(search: str = None, status: str = None):
    jobs = load_jobs()

    if search:
        jobs = [
            job for job in jobs
            if search.lower() in job["company"].lower()
            or search.lower() in job["role"].lower()
        ]

    if status:
        jobs = [job for job in jobs if job["status"] == status]

    return jobs

@app.get("/jobs/{job_id}")
def get_job(job_id: int):
    jobs = load_jobs()

    for job in jobs:
        if job["id"] == job_id:
            return job

    # If no job found with that ID
    raise HTTPException(status_code=404, detail=f"Job with ID {job_id} not found")

# -----------------------------------------------
# POST /jobs
# -----------------------------------------------
@app.post("/jobs")
def add_job(job: Job):
    jobs = load_jobs()
    new_job = job.dict()
    new_job["id"] = get_next_id(jobs)  # Simple number: 1, 2, 3
    jobs.append(new_job)
    save_jobs(jobs)
    return {"message": "Job added", "id": new_job["id"]}

# -----------------------------------------------
# PATCH /jobs/{id} — update only sent fields
# -----------------------------------------------
@app.patch("/jobs/{job_id}")
def update_job(job_id: int, updated: UpdateJob):
    jobs = load_jobs()

    for job in jobs:
        if job["id"] == job_id:
            if updated.company is not None:
                job["company"] = updated.company
            if updated.role is not None:
                job["role"] = updated.role
            if updated.status is not None:
                job["status"] = updated.status
            if updated.date is not None:
                job["date"] = updated.date

            save_jobs(jobs)
            return {"message": "Job updated", "job": job}

    raise HTTPException(status_code=404, detail="Job not found")

# -----------------------------------------------
# DELETE /jobs/{id}
# -----------------------------------------------
@app.delete("/jobs/{job_id}")
def delete_job(job_id: int):
    jobs = load_jobs()

    for i, job in enumerate(jobs):
        if job["id"] == job_id:
            removed = jobs.pop(i)
            save_jobs(jobs)
            return {"message": f"Deleted {removed['company']}"}

    raise HTTPException(status_code=404, detail="Job not found")


GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

class JobDescription(BaseModel):
    description: str

from groq import Groq

@app.post("/analyze")
async def analyze_job(body: JobDescription):
    body.description = body.description.replace("\n", " ").replace("\r", " ")

    if not body.description.strip():
        raise HTTPException(status_code=400, detail="Description cannot be empty")

    GROQ_API_KEY = os.getenv("GROQ_API_KEY")

    if not GROQ_API_KEY:
        raise HTTPException(status_code=500, detail="API key not configured")

    try:
        client = Groq(api_key=GROQ_API_KEY)

        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert career coach. Always respond with valid JSON only. No markdown, no backticks, no explanation."
                },
                {
                    "role": "user",
                    "content": f"""
                    Analyze this job description and return ONLY a JSON object with exactly these keys:
                    - "skills": list of 6-8 key technical skills required
                    - "questions": list of 8 likely interview questions for this specific role
                    - "tip": one specific actionable preparation tip

                    Job Description: {body.description}
                    """
                }
            ],
            temperature=0.7,
            max_tokens=1000
        )

        text = response.choices[0].message.content.strip()
        text = text.replace("```json", "").replace("```", "").strip()

        result = json.loads(text)
        return result

    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="AI returned invalid response. Try again.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI analysis failed: {str(e)}")