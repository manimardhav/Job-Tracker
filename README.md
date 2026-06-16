
# 🚀 JobTracker AI — Production-Grade Application Pipeline

An enterprise-ready, AI-augmented job tracking and career intelligence ecosystem. Built using **FastAPI** and powered by **Llama 3.3 (via Groq Cloud)**, this system automates the job tracking lifecycle and uses advanced LLM inference to instantly extract technical requirements and generate real-time interview questions from unstructured job descriptions.

[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.13-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![Groq Cloud](https://img.shields.io/badge/Groq_Cloud-Llama_3.3-orange?style=for-the-badge)](https://console.groq.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

---

## 💡 Key Architectural Pillars

*   **Automated LLM Parsing Engine:** Replaced static string matching with structured JSON generation from a 70B parameter model (`llama-3.3-70b-versatile`), enforcing strict output schemas without prompt leakage.
*   **High-Performance REST Architecture:** Leverages FastAPI's asynchronous ASGI structure for non-blocking I/O operations and lightning-fast request handling.
*   **Robust Data Integrity:** Implements compile-time and runtime type safety using **Pydantic v2** validation schemas, ensuring complete sanitization of user payloads.
*   **State Persistence & Scalability:** Designed with clean separation of concerns, utilizing transactional file-based storage with auto-incrementing transactional IDs to handle local state seamlessly.

---

## 🛠️ System Architecture & Tech Stack
[ React Client ] ──( HTTP / JSON )──> [ FastAPI Server ] ──> [ Groq Cloud LLM ]
│
( File System I/O )
▼
[ jobs.json Storage ]

* **Backend Framework:** FastAPI (Python 3.13)
* **Inference Engine:** Groq Cloud API (`Llama-3.3-70b-versatile`)
* **Data Validation:** Pydantic Validation Models
* **Production Server:** Uvicorn ASGI Server

---

## 🚦 REST API Specifications

### Core Endpoints

| Method | Endpoint | Functional Description | Payload / Query | Status Code |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/jobs` | Retrieve all applications | `?search=Google` \| `?status=Applied` | `200 OK` |
| **GET** | `/jobs/{id}` | Fetch a target application | Path Variable: `id` | `200 OK` / `404` |
| **POST** | `/jobs` | Initialize a new application record | JSON Body (Validated) | `201 Created` |
| **PATCH** | `/jobs/{id}` | Execute delta updates on a record | JSON Partial Body | `200 OK` |
| **DELETE** | `/jobs/{id}` | Purge an application record | Path Variable: `id` | `200 OK` |
| **POST** | `/analyze` | Stream job description to Groq AI | `{"description": "..."}` | `200 OK` |

### AI Analysis Response Schema (`POST /analyze`)
```json
{
  "skills": ["React.js", "Python", "FastAPI", "Docker", "AWS Cloud Adoption Framework"],
  "questions": [
    "How do you implement custom validation decorators using Pydantic in FastAPI?",
    "Explain your strategy for migrating monolithic storage systems to cloud-native endpoints."
  ],
  "tip": "Align your portfolio's system design diagrams specifically with AWS CAF migration workflows before interviewing."
}
