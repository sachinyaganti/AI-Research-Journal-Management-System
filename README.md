# 📚 AI-Enabled Research Journal Management System

<p align="center">
  <img src="https://img.shields.io/badge/Java-21-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white" />
  <img src="https://img.shields.io/badge/Spring%20Boot-4.1.1-6DB33F?style=for-the-badge&logo=springboot&logoColor=white" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/PostgreSQL-18-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" />
  <img src="https://img.shields.io/badge/FastAPI-0.141-009688?style=for-the-badge&logo=fastapi&logoColor=white" />
  <img src="https://img.shields.io/badge/JWT-Security-000000?style=for-the-badge" />
</p>

<p align="center">
  <strong>A full-stack platform for managing the complete research manuscript lifecycle with AI-assisted document analysis.</strong>
</p>

<p align="center">
  <a href="#-overview">Overview</a> •
  <a href="#-features">Features</a> •
  <a href="#-ai-capabilities">AI</a> •
  <a href="#-architecture">Architecture</a> •
  <a href="#-setup">Setup</a> •
  <a href="#-api-overview">API</a> •
  <a href="#-roadmap">Roadmap</a>
</p>

---

## 🌟 Overview

The **AI-Enabled Research Journal Management System** is a full-stack web application designed to digitize and streamline the academic research publication workflow.

It connects **Authors, Reviewers, and Editors** in one role-based platform and supports manuscript submission, PDF upload, reviewer assignment, peer review, revisions, editorial decisions, decision history, and publication workflow.

The system uses a modular architecture:

- ⚛️ **React 19 + Vite** — frontend
- ☕ **Java 21 + Spring Boot 4.1.1** — core REST backend
- 🐘 **PostgreSQL** — application database
- 🐍 **Python + FastAPI** — AI/document-analysis service
- 🔐 **Spring Security + JWT + BCrypt** — authentication and authorization
- 🤖 **Groq integration** — AI-assisted manuscript/content analysis

---

# 🎯 Problem Statement

Research publication workflows often involve multiple disconnected activities:

1. Authors prepare and submit manuscripts.
2. Editors screen submissions and assign reviewers.
3. Reviewers evaluate manuscripts and submit recommendations.
4. Authors revise papers when required.
5. Editors make final decisions.
6. Accepted papers move toward publication.

Managing these activities manually can make it difficult to maintain consistent status tracking, review history, manuscript versions, document processing, and editorial decisions.

### Project Objective

Build a centralized, secure, and extensible journal-management platform that combines:

- Role-based workflow management
- Manuscript and PDF management
- Reviewer assignment and review handling
- Revision and decision tracking
- AI-assisted document analysis
- Similarity analysis
- AI-content analysis
- A separate AI service that can evolve independently from the main backend

---

# ✨ Features

## 👨‍🎓 Author

- Registration and login
- Author dashboard
- Create manuscripts
- Edit manuscript details
- Submit manuscripts
- Upload research-paper PDFs
- Track manuscript status
- View review outcomes
- Submit revised manuscripts
- Track manuscript versions and history

## 🔍 Reviewer

- Secure login
- Reviewer dashboard
- View assigned manuscripts
- Access manuscript information
- Review assigned papers
- Submit review feedback
- Provide recommendations
- Track assigned review work

## 👨‍💼 Editor

- Editor dashboard
- View submitted manuscripts
- Assign reviewers
- Monitor reviewer assignments
- View submitted reviews
- Request revisions
- Make editorial decisions
- Track decision history
- Accept or reject manuscripts
- Manage publication workflow

## 📄 Document Processing

- PDF upload
- PDF validation
- Empty-file validation
- PDF text extraction
- Page-count detection
- Extracted-text reporting
- Detection of PDFs without readable text

---

# 🤖 AI Capabilities

The project contains a dedicated **FastAPI AI service** instead of embedding AI processing directly inside the Spring Boot application.

### Current AI modules

| Module | Current capability |
|---|---|
| 📄 PDF Screening | Validates PDFs and extracts readable text |
| 📝 Manuscript Analysis | Performs structured manuscript analysis |
| 🤖 AI Content Analysis | Analyzes manuscript content for AI-generated-content indicators |
| 🔎 Similarity Analysis | Calculates similarity information between supplied content |
| 🧠 LLM Analysis | Provides the AI/LLM processing layer used by manuscript analysis |
| 🔗 Backend AI Clients | Spring Boot clients communicate with the FastAPI service |

> **Implementation note:** The current similarity engine uses normalized word-set overlap (Jaccard similarity), not an embedding-based semantic similarity model. Results are therefore lexical similarity indicators and should be interpreted accordingly.
>
> The manuscript-analysis LLM layer currently uses Groq with the `openai/gpt-oss-20b` model and requests structured JSON output for abstract quality, methodology, results, conclusion, writing quality, relevance, missing sections, writing issues, and suggestions.

### AI processing flow

```text
Research Paper PDF
        │
        ▼
┌──────────────────────┐
│ PDF Screening        │
│ + Text Extraction    │
└──────────┬───────────┘
           │
           ▼
┌─────────────────────────────┐
│ FastAPI AI Service          │
│                             │
│ Manuscript Analysis         │
│ AI Content Analysis         │
│ Similarity Analysis         │
└────────────┬────────────────┘
             │
             ▼
      Analysis Response
             │
             ▼
┌─────────────────────────────┐
│ Spring Boot Backend         │
│ AI Client / REST Layer      │
└────────────┬────────────────┘
             │
             ▼
       React Dashboard
```

> **Responsible AI:** AI analysis is intended as decision-support functionality. Final editorial and peer-review decisions should remain under authorized human review.

---

# 🔌 AI Service Endpoints

The FastAPI service exposes the following analysis endpoints under `/api/analysis`.

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/health` | AI service health check |
| POST | `/api/analysis/screen-pdf` | Validate and extract text from PDF |
| POST | `/api/analysis/manuscript` | Analyze manuscript content |
| POST | `/api/analysis/ai-content` | Analyze AI-generated-content indicators |
| POST | `/api/analysis/similarity` | Perform similarity analysis |

### PDF screening

The PDF endpoint:

- Accepts PDF uploads
- Rejects non-PDF files
- Rejects empty files
- Extracts readable text
- Returns page count
- Returns character count
- Reports when no readable text is available

Example response structure:

```json
{
  "file_name": "research-paper.pdf",
  "page_count": 8,
  "character_count": 24567,
  "extracted_text": "..."
}
```

---

# 🔐 Authentication & Security

The Spring Boot backend uses:

- **Spring Security**
- **JWT authentication**
- **BCrypt password hashing**
- **Role-based authorization**
- Protected REST endpoints
- Server-side authorization

### Authentication flow

```text
User
  │
  ▼
Login
  │
  ▼
Spring Security
  │
  ├── Validate credentials
  └── Load user role
  │
  ▼
JWT Token
  │
  ▼
Protected REST Request
  │
  ▼
JWT Validation
  │
  ▼
Role-Based Authorization
  │
  ▼
Controller / Service
```

### Security rule

Never commit:

```text
.env
API keys
Groq API keys
JWT secrets
Database passwords
Private credentials
```

Use environment variables or secure secret management for production deployments.

---

# 👥 User Roles

| Capability | Author | Reviewer | Editor |
|---|:---:|:---:|:---:|
| Register / Login | ✅ | ✅ | ✅ |
| Create manuscript | ✅ | — | — |
| Edit own manuscript | ✅ | — | — |
| Upload PDF | ✅ | — | — |
| Submit manuscript | ✅ | — | — |
| View assigned manuscripts | — | ✅ | ✅ |
| Submit review | — | ✅ | — |
| Assign reviewers | — | — | ✅ |
| Request revision | — | — | ✅ |
| View reviewer feedback | — | — | ✅ |
| Make editorial decision | — | — | ✅ |
| Manage publication workflow | — | — | ✅ |

---

# 🔄 Manuscript Workflow

```text
AUTHOR
  │
  │ Create + Submit Manuscript
  ▼
SUBMITTED
  │
  ▼
EDITOR
  │
  │ Assign Reviewer
  ▼
REVIEWER
  │
  │ Review + Recommendation
  ▼
EDITOR
  │
  ├───────────────┬────────────────┐
  │               │                │
  ▼               ▼                ▼
ACCEPTED       REVISION         REJECTED
  │            REQUIRED            │
  ▼               │                ▼
PUBLISHED         ▼              CLOSED
             RESUBMISSION
                  │
                  ▼
              RE-REVIEW
                  │
                  ▼
                EDITOR
```

---

# 📌 Manuscript Lifecycle

```text
SUBMITTED
    │
    ▼
UNDER_REVIEW
    │
    ├───────────────┐
    │               │
    ▼               ▼
ACCEPTED       REVISION_REQUIRED
    │               │
    ▼               ▼
PUBLISHED       RESUBMITTED
                    │
                    ▼
                UNDER_REVIEW

REJECTED
```

---

# 📄 Manuscript Version Management

The system supports a revision-oriented workflow:

```text
Manuscript
   │
   ├── Version 1 → Initial Submission
   │
   ├── Version 2 → Revised Manuscript
   │
   ├── Version 3 → Further Revision
   │
   └── Final Version
```

This keeps revisions connected to the original manuscript workflow and supports traceability of the publication process.

---

# 🏗️ System Architecture

```text
                         ┌────────────────────────┐
                         │         USERS          │
                         │ Author / Reviewer /     │
                         │ Editor                 │
                         └───────────┬────────────┘
                                     │
                                     ▼
                         ┌────────────────────────┐
                         │    React 19 + Vite     │
                         │       Frontend         │
                         └───────────┬────────────┘
                                     │
                                  REST API
                                     │
                                     ▼
              ┌──────────────────────────────────────────┐
              │          Spring Boot Backend             │
              │                                          │
              │ Authentication / JWT / Security          │
              │ Manuscripts / Files / Reviews            │
              │ Reviewer Assignments / Decisions         │
              │ AI Service Clients                       │
              └───────────────┬──────────────┬───────────┘
                              │              │
                              │              │ HTTP
                              │              ▼
                              │    ┌─────────────────────┐
                              │    │   FastAPI AI        │
                              │    │      Service        │
                              │    │                     │
                              │    │ PDF Screening       │
                              │    │ Manuscript Analysis │
                              │    │ AI Content Analysis │
                              │    │ Similarity Analysis │
                              │    └─────────────────────┘
                              │
                              ▼
                    ┌─────────────────────┐
                    │     PostgreSQL      │
                    │ research_journal_db │
                    └─────────────────────┘
```

### Architectural benefits

- Separation of concerns
- Independent AI service
- Secure backend authorization
- Easier testing and maintenance
- Clear service boundaries
- Future-ready for Docker and cloud deployment

---

# 🧩 Technology Stack

## Frontend

| Technology | Version / Role |
|---|---|
| React | 19.x |
| Vite | 8.x |
| React Router | 7.x |
| Axios | HTTP client |
| JavaScript / JSX | Application logic |
| CSS | Application styling |
| Oxlint | Linting |

> The current frontend package does **not** use Tailwind CSS; styling is implemented through the project's CSS files.

## Backend

| Technology | Version / Role |
|---|---|
| Java | 21 |
| Spring Boot | 4.1.1 |
| Spring Data JPA | Persistence |
| Spring Security | Authentication / authorization |
| Spring Web MVC | REST APIs |
| JWT / JJWT | Token authentication |
| PostgreSQL Driver | Database connectivity |
| Lombok | Java development |
| Maven | Build and dependency management |

## AI Service

| Technology | Version / Role |
|---|---|
| Python | AI service |
| FastAPI | 0.141.1 |
| Uvicorn | 0.52.4 |
| Pydantic | Request/response validation |
| Groq | LLM API integration |
| python-dotenv | Environment configuration |
| pypdf | PDF text extraction |

## Database

```text
PostgreSQL
Database: research_journal_db
```

---

# 📂 Project Structure

```text
AI-Research-Journal-Management-System/
│
├── 📂 backend/
│   ├── pom.xml
│   └── src/
│       ├── main/
│       │   ├── java/com/researchjournal/
│       │   │   ├── client/
│       │   │   │   ├── AIAnalysisClient.java
│       │   │   │   ├── AIContentAnalysisClient.java
│       │   │   │   ├── PdfExtractionClient.java
│       │   │   │   └── SimilarityAnalysisClient.java
│       │   │   ├── config/
│       │   │   ├── controller/
│       │   │   ├── dto/
│       │   │   ├── entity/
│       │   │   ├── repository/
│       │   │   ├── security/
│       │   │   └── service/
│       │   └── resources/
│       │       └── application.properties
│       └── test/
│
├── 📂 frontend/
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── context/
│       │   └── AuthContext.jsx
│       ├── pages/
│       │   ├── AuthorDashboard.jsx
│       │   ├── CreateManuscriptPage.jsx
│       │   ├── EditManuscriptPage.jsx
│       │   ├── EditorDashboard.jsx
│       │   ├── EditorDecisionPage.jsx
│       │   ├── LoginPage.jsx
│       │   ├── ManuscriptReviewsPage.jsx
│       │   ├── RegisterPage.jsx
│       │   ├── ReviewerDashboard.jsx
│       │   └── WriteReviewPage.jsx
│       └── routes/
│           ├── AppRoutes.jsx
│           └── ProtectedRoute.jsx
│
├── 📂 ai-service/
│   ├── requirements.txt
│   ├── test_ai_content.py
│   └── app/
│       ├── main.py
│       ├── models/
│       │   ├── ai_content_analysis.py
│       │   ├── manuscript_analysis.py
│       │   ├── pdf_screening.py
│       │   └── similarity_analysis.py
│       ├── routes/
│       │   ├── ai_content_analysis.py
│       │   ├── manuscript_analysis.py
│       │   ├── pdf_screening.py
│       │   └── similarity_analysis.py
│       └── services/
│           ├── ai_content_service.py
│           ├── llm_analysis_service.py
│           ├── manuscript_analysis_service.py
│           ├── pdf_extraction_service.py
│           └── similarity_analysis_service.py
│
├── .gitignore
├── PROJECT_RULES.md
└── README.md
```

---

# ⚙️ Setup

## Prerequisites

Install:

- Git
- JDK 21
- Maven
- Node.js and npm
- Python 3.x
- PostgreSQL 18
- A Groq API key if using the LLM-backed AI functionality

Verify:

```bash
git --version
java -version
mvn -version
node --version
npm --version
python --version
psql --version
```

---

## 1. Clone the Repository

```bash
git clone https://github.com/sachinyaganti/AI-Research-Journal-Management-System.git
cd AI-Research-Journal-Management-System
```

---

## 2. Configure PostgreSQL

Create the application database:

```sql
CREATE DATABASE research_journal_db;
```

Configure the backend in:

```text
backend/src/main/resources/application.properties
```

Example:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/research_journal_db
spring.datasource.username=YOUR_USERNAME
spring.datasource.password=YOUR_PASSWORD
```

---

## 3. Configure AI Environment

Create an environment file for the AI service if required by your local configuration.

Example:

```env
GROQ_API_KEY=YOUR_GROQ_API_KEY
```

Do **not** commit the real API key.

---

## 4. Start the Spring Boot Backend

Windows:

```powershell
cd backend
.mvnw.cmd clean install
.mvnw.cmd spring-boot:run
```

Or, when Maven is installed globally:

```bash
cd backend
mvn clean install
mvn spring-boot:run
```

Default backend:

```text
http://localhost:8080
```

---

## 5. Start the React Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Default Vite development server:

```text
http://localhost:5173
```

Production build:

```bash
npm run build
```

Lint:

```bash
npm run lint
```

---

## 6. Start the FastAPI AI Service

Open another terminal:

```bash
cd ai-service
python -m venv venv
```

### Windows

```powershell
venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Start the service:

```bash
uvicorn app.main:app --reload --port 8001
```

The AI service is configured for the Spring Boot clients at:

```text
http://localhost:8001
```

Start it on port `8001` so the backend AI clients can communicate with it.

Health check:

```text
http://localhost:8000/health
```

FastAPI documentation:

```text
http://localhost:8000/docs
```

---

# 🔗 Service Communication

> **Important local configuration:** The Spring Boot AI clients currently use `http://localhost:8001` as their FastAPI base URL. If you change the AI-service port or host, update the corresponding client configuration in `backend/src/main/java/com/researchjournal/client/` as well.

The application uses the following local development services:

| Service | Default URL | Purpose |
|---|---|---|
| React/Vite | `http://localhost:5173` | Frontend |
| Spring Boot | `http://localhost:8080` | Main REST backend |
| FastAPI | `http://localhost:8000` | AI/document processing |
| PostgreSQL | `localhost:5432` | Database |

The Spring Boot backend contains dedicated clients for communicating with AI functionality, including:

- `AIAnalysisClient`
- `AIContentAnalysisClient`
- `PdfExtractionClient`
- `SimilarityAnalysisClient`

---

# 🧪 Testing

## Backend

Run the backend test suite:

```bash
cd backend
mvn test
```

## AI Service

The repository contains AI-content testing support:

```bash
cd ai-service
pytest
```

## Frontend

Build validation:

```bash
cd frontend
npm run build
```

Lint validation:

```bash
npm run lint
```

### Recommended functional testing

- Registration and login
- JWT authentication
- Role-based authorization
- Manuscript creation
- Manuscript editing
- PDF upload
- PDF extraction
- Reviewer assignment
- Review submission
- Revision workflow
- Editorial decisions
- Decision history
- AI manuscript analysis
- AI-content analysis
- Similarity analysis
- Backend-to-FastAPI communication

---

# 📊 Current Implementation

| Module | Status |
|---|:---:|
| React + Vite frontend | ✅ |
| Author dashboard | ✅ |
| Reviewer dashboard | ✅ |
| Editor dashboard | ✅ |
| Manuscript creation/editing | ✅ |
| Manuscript submission | ✅ |
| PDF upload | ✅ |
| Reviewer assignment | ✅ |
| Review management | ✅ |
| Revision workflow | ✅ |
| Editorial decisions | ✅ |
| Decision history | ✅ |
| JWT authentication | ✅ |
| Spring Security | ✅ |
| BCrypt password hashing | ✅ |
| PostgreSQL persistence | ✅ |
| FastAPI AI service | ✅ |
| PDF screening/extraction | ✅ |
| Manuscript analysis | ✅ |
| AI-content analysis | ✅ |
| Similarity analysis | ✅ |
| Groq/LLM analysis layer | ✅ |
| AI reviewer recommendation | 🚧 Planned |
| Docker deployment | 🚧 Planned |
| CI/CD | 🚧 Planned |
| Cloud deployment | 🚧 Planned |

---

# 🖥️ Application Screenshots

Recommended screenshots for the repository:

```text
screenshots/
├── login.png
├── registration.png
├── author-dashboard.png
├── manuscript-submission.png
├── pdf-upload.png
├── reviewer-dashboard.png
├── review-page.png
├── editor-dashboard.png
├── reviewer-assignment.png
├── ai-analysis.png
└── decision-history.png
```

Add images using:

```md
![Author Dashboard](screenshots/author-dashboard.png)
```

---

# 🚀 Roadmap

## 🤖 AI

- Semantic reviewer recommendation
- Better manuscript classification
- Research-paper summarization
- Keyword and topic extraction
- Citation/reference analysis
- Improved similarity detection
- AI-assisted review summarization
- Research trend analysis

## 📊 Analytics

- Editorial performance dashboards
- Reviewer workload analytics
- Manuscript processing time
- Acceptance/rejection statistics
- Publication trends

## 🔔 Notifications

- Email notifications
- Reviewer assignment alerts
- Revision reminders
- Editorial decision notifications
- Publication notifications

## ☁️ Deployment

- Docker containers
- GitHub Actions CI/CD
- Cloud deployment
- Kubernetes
- Production monitoring
- Centralized logging
- Automated integration tests

---

# 🛡️ Responsible AI

The AI components are designed to assist the research-publication workflow, not replace human editorial judgment.

Production deployment should consider:

- False positives and false negatives
- AI-result explainability
- Human verification
- Manuscript privacy
- Protection of unpublished research
- Secure API-key management
- Auditability of AI-assisted decisions

---

# 💡 What This Project Demonstrates

This project demonstrates practical experience with:

- Full-stack web development
- React application architecture
- REST API development
- Spring Boot
- Spring Security
- JWT authentication
- Role-based authorization
- PostgreSQL and JPA
- File upload and PDF processing
- Python FastAPI
- LLM/API integration
- AI-assisted document analysis
- Similarity analysis
- Microservice-style architecture
- API-to-API communication
- Workflow/state management
- Testing and debugging

---

# 🎓 Academic Project

This project was developed as an academic full-stack software project focused on applying **software engineering, database management, web development, security, document processing, and AI integration** to a real-world research publication workflow.

---

# 👨‍💻 Developer

## Yaganti Deepak Sachin Sai Chowdary

**B.Tech — Computer Science and Engineering**  
**KLEF Deemed to be University**

urlGitHub Profilehttps://github.com/sachinyaganti

---

# 🔗 Repository

urlAI-Research-Journal-Management-Systemhttps://github.com/sachinyaganti/AI-Research-Journal-Management-System

---

# 📄 License

This project is developed for **academic and educational purposes**.

---

<p align="center">
  <strong>📚 Research • 🤖 AI • 🔐 Security • ⚛️ Full Stack • 🚀 Automation</strong>
  <br/>
  Building a smarter digital workflow for academic publishing.
</p>
