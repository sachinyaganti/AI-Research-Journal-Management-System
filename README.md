# AI-Enabled Research Journal Management System

A full-stack academic journal workflow application for manuscript submission, reviewer assignment, peer review, revisions, editorial decisions, publication tracking, and AI-assisted document analysis.

## Technology stack

- **Frontend:** React 19, Vite 8, React Router, Axios
- **Backend:** Java 21, Spring Boot 4.1.x, Spring Security, Spring Data JPA
- **Database:** PostgreSQL
- **AI service:** Python, FastAPI, Pydantic, pypdf
- **LLM integration:** Groq (optional; configure an API key privately)
- **Authentication:** JWT and BCrypt

> Version badges and package versions can drift. Check each component's `package.json`, `pom.xml`, and `requirements.txt` for the exact installed versions.

## Features

### Author workflow
- Register and sign in.
- Create, edit, and submit manuscripts.
- Upload research-paper PDFs.
- Track manuscript status and review outcomes.
- Submit revised files and author response notes where enabled.
- View revision history where enabled.

### Reviewer workflow
- View manuscripts assigned to the reviewer.
- Inspect manuscript details and available PDF files.
- Submit ratings, author-facing feedback, confidential editor comments, and a recommendation.

### Editor workflow
- Review submissions and assign reviewers.
- Monitor review progress and read submitted reviews.
- Request revisions and record editorial decisions.
- Track manuscript status and decision history.
- Manage publication metadata and view the public publications page where configured.

### AI/document analysis
- Validate PDF uploads and extract readable text.
- Generate structured manuscript-quality feedback.
- Produce text-pattern indicators related to AI-generated writing.
- Compare manuscripts using lexical similarity analysis.
- Use Groq-powered analysis when configured, with fallback behavior where implemented.

**Important limitations:** AI-writing indicators are not proof of authorship. Similarity based on word-set/Jaccard overlap is lexical rather than semantic and can miss paraphrases or flag common wording. Treat AI outputs as decision-support signals, not as substitutes for human review.

## Architecture

```text
React + Vite frontend
        |
        v
Spring Boot REST API ------ PostgreSQL
        |
        v
FastAPI AI service
  |       |        |
  PDF   Manuscript Similarity/content
```

## Repository layout

```text
AI-Research-Journal-Management-System/
├── backend/       # Spring Boot API and persistence
├── frontend/      # React/Vite web application
├── ai-service/    # FastAPI analysis service
├── .gitignore
├── PROJECT_RULES.md
└── README.md
```

## Prerequisites

Install Git, JDK 21, Maven (or the project's Maven wrapper), Node.js/npm, Python 3, and PostgreSQL. A Groq API key is optional for LLM-backed functionality.

Verify the installations:

```powershell
git --version
java -version
mvn -version
node --version
npm --version
python --version
psql --version
```

## Local setup

### 1. Clone the repository

```powershell
git clone https://github.com/sachinyaganti/AI-Research-Journal-Management-System.git
cd AI-Research-Journal-Management-System
```

### 2. Configure PostgreSQL

Create the database:

```sql
CREATE DATABASE research_journal_db;
```

Configure the connection in `backend/src/main/resources/application.properties` (or use environment variables if supported by your local configuration). Example:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/research_journal_db
spring.datasource.username=YOUR_DB_USERNAME
spring.datasource.password=YOUR_DB_PASSWORD
```

Do not commit real database credentials.

### 3. Start the backend

In a terminal:

```powershell
cd backend
mvn clean test
mvn spring-boot:run
```

If the repository includes a Maven wrapper, you can use `.\mvnw.cmd` in place of `mvn`.

Default backend URL: `http://localhost:8080`

### 4. Start the frontend

In a second terminal:

```powershell
cd frontend
npm install
npm run dev
```

Default Vite URL: `http://localhost:5173`

Validate the frontend:

```powershell
npm run build
npm run lint
```

### 5. Start the AI service

In a third terminal:

```powershell
cd ai-service
python -m venv venv
.\venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Default AI service URL: `http://localhost:8000`

Health check: `http://localhost:8000/health`  
Interactive API docs: `http://localhost:8000/docs`

The checked-in Spring Boot AI clients use `http://localhost:8000` as their base URL. If you change the port, update all relevant client configuration consistently.

### 6. Configure Groq (optional)

Set `GROQ_API_KEY` in the environment or the private environment file expected by the AI service. Never commit a real key. If using a `.env` file, ensure it is ignored by Git.

## API overview

The FastAPI service currently registers these routes:

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/health` | Health check |
| `POST` | `/api/analysis/screen-pdf` | Validate and extract PDF text |
| `POST` | `/api/analysis/manuscript` | Analyze manuscript metadata/content |
| `POST` | `/api/analysis/ai-content` | Return AI-content text indicators |
| `POST` | `/api/analysis/similarity` | Compare text against candidates |

The Spring Boot backend exposes the main application APIs. Inspect the controller classes for the exact endpoint paths, request bodies, and authorization requirements.

## Testing checklist

Run automated checks:

```powershell
# Backend
cd backend
mvn clean test

# Frontend (from repository root after returning)
cd ..\frontend
npm run build
npm run lint

# AI service
cd ..\ai-service
python -m pytest
```

Not every test command is guaranteed to pass until dependencies and environment variables are configured. Record actual test output before describing the project as fully verified.

Manually test the main end-to-end flows:

1. Register and log in with each supported role.
2. Confirm protected routes reject missing or invalid tokens.
3. Create, edit, and submit a manuscript as an author.
4. Upload a valid PDF and verify extraction; test empty, invalid, and scanned PDFs.
5. Assign a reviewer as an editor.
6. Submit a review as the assigned reviewer.
7. Confirm confidential comments are only visible to authorized editors.
8. Request a revision, upload the revision, and verify status/history.
9. Record an editorial decision and test the publication flow.
10. Call each AI endpoint and confirm Spring Boot can reach FastAPI.
11. Test behavior when the Groq key is absent or the provider is unavailable.

## Current verification status

Feature code being present in the repository does not by itself prove that the whole application works. Before a release or demo, run the backend tests, frontend build/lint, AI tests, and the end-to-end checks above. In particular, retest role authorization and reviewer assignment with a fresh token.

## Security and responsible AI

- Keep API keys, JWT secrets, and database passwords out of Git.
- Use environment variables or a secret manager for deployment.
- Protect unpublished manuscripts and reviewer comments.
- Enforce authorization on the backend, not only in the frontend.
- AI and similarity results can be inaccurate; humans must make editorial decisions.
- Before production, add integration tests, logging/monitoring, backups, and deployment-specific security configuration.

## Roadmap

- Improve semantic similarity and reviewer recommendations.
- Add notifications and editorial analytics.
- Expand automated integration and authorization tests.
- Add containerized deployment and CI/CD.
- Deploy frontend, backend, AI service, and database with secure configuration.

## Developer

**Yaganti Deepak Sachin Sai Chowdary**  
B.Tech — Computer Science and Engineering, KLEF Deemed to be University

- GitHub: https://github.com/sachinyaganti
- Repository: https://github.com/sachinyaganti/AI-Research-Journal-Management-System

---

Academic project for exploring full-stack development, secure workflow management, document processing, and AI-assisted research publishing.
