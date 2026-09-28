# 📚 AI-Enabled Research Journal Management System

<p align="center">
  <img src="https://img.shields.io/badge/AI-Enabled-6C63FF?style=for-the-badge"/>
  <img src="https://img.shields.io/badge/React-Vite-61DAFB?style=for-the-badge&logo=react&logoColor=black"/>
  <img src="https://img.shields.io/badge/Tailwind%20CSS-38B2AC?style=for-the-badge&logo=tailwindcss&logoColor=white"/>
  <img src="https://img.shields.io/badge/Java%2021-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white"/>
  <img src="https://img.shields.io/badge/Spring%20Boot-6DB33F?style=for-the-badge&logo=springboot&logoColor=white"/>
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white"/>
  <img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white"/>
</p>

<p align="center">
  <strong>A full-stack, AI-enabled platform for managing the complete research journal publication lifecycle.</strong>
</p>

<p align="center">
  <a href="#-overview">Overview</a> •
  <a href="#-features">Features</a> •
  <a href="#-architecture">Architecture</a> •
  <a href="#-workflow">Workflow</a> •
  <a href="#-technology-stack">Tech Stack</a> •
  <a href="#-installation">Installation</a>
</p>

---

## 🌟 Overview

The **AI-Enabled Research Journal Management System** is a full-stack web application developed to streamline and digitize the academic research publication process.

The system provides a centralized platform connecting:

* 👨‍🎓 **Authors**
* 🔍 **Reviewers**
* 👨‍💼 **Editors**

It supports the complete manuscript lifecycle, from **paper submission and reviewer assignment to review, revision, editorial decision, and publication**.

The application follows a modular architecture consisting of a React frontend, Spring Boot REST backend, PostgreSQL database, and an independent Python FastAPI AI service.

---

# 🎯 Project Objectives

The system is designed to:

* Digitize research-paper submission and management.
* Provide role-based dashboards and workflows.
* Simplify reviewer assignment.
* Manage manuscript reviews and revisions.
* Track editorial decisions and decision history.
* Maintain different versions of manuscripts.
* Support publication workflows.
* Provide AI-assisted research-paper analysis.
* Provide an architecture for intelligent reviewer recommendations.
* Secure application APIs using JWT authentication and role-based authorization.

---

# ✨ Features

## 👨‍🎓 Author Module

Authors can:

* Register and authenticate.
* Submit research manuscripts.
* View submitted manuscripts.
* Track manuscript status.
* View review and editorial outcomes.
* Submit revised manuscript versions.
* Track manuscript history.
* View publication decisions.

---

## 🔍 Reviewer Module

Reviewers can:

* Authenticate securely.
* View assigned manuscripts.
* Access assigned research papers.
* Review manuscript submissions.
* Submit review feedback.
* Provide recommendations.
* Track assigned review tasks.

---

## 👨‍💼 Editor Module

Editors can:

* View submitted manuscripts.
* Manage manuscript workflows.
* Assign reviewers.
* Monitor reviewer assignments.
* Review submitted reviewer feedback.
* Make editorial decisions.
* Track decision history.
* Request manuscript revisions.
* Accept or reject manuscripts.
* Manage publication workflow.

---

# 🤖 AI-Enabled Architecture

The system includes a dedicated **Python FastAPI AI service** that is separated from the main Spring Boot application.

The architecture provides a foundation for intelligent research-paper processing, including:

* 📄 Research-paper analysis
* 📝 Text processing
* 🔑 Keyword extraction
* 📊 Paper analysis
* 🔎 Similarity analysis
* 👥 AI-assisted reviewer recommendation

The AI service communicates independently with the backend, allowing AI capabilities to evolve without tightly coupling them to the core application.

---

# 🔐 Authentication & Security

The application implements authentication and authorization using:

* **Spring Security**
* **JWT authentication**
* **BCrypt password hashing**
* **Role-based authorization**
* Protected REST APIs

### Authentication Flow

```text
┌──────────────┐
│     User     │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│    Login     │
└──────┬───────┘
       │
       ▼
┌────────────────────┐
│ Spring Security    │
│ Authentication     │
└──────────┬─────────┘
           │
           ▼
     ┌───────────┐
     │ JWT Token │
     └─────┬─────┘
           │
           ▼
┌──────────────────────┐
│ Protected REST APIs  │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ Role-Based Access    │
└──────────────────────┘
```

---

# 👥 User Roles

|       Role       | Responsibilities                                               |
| :--------------: | -------------------------------------------------------------- |
| 👨‍🎓 **AUTHOR** | Submit manuscripts, manage submissions, submit revisions       |
|  🔍 **REVIEWER** | Review assigned manuscripts and submit recommendations         |
| 👨‍💼 **EDITOR** | Manage manuscripts, reviewers, reviews and editorial decisions |

---

# 🔄 Manuscript Workflow

The core research publication workflow is:

```text
                 ┌──────────────┐
                 │    AUTHOR    │
                 └──────┬───────┘
                        │
                  Submit Paper
                        │
                        ▼
                 ┌──────────────┐
                 │    EDITOR    │
                 └──────┬───────┘
                        │
                 Assign Reviewer
                        │
                        ▼
                 ┌──────────────┐
                 │   REVIEWER   │
                 └──────┬───────┘
                        │
                   Submit Review
                        │
                        ▼
                 ┌──────────────┐
                 │    EDITOR    │
                 └──────┬───────┘
                        │
              ┌─────────┴─────────┐
              │                   │
              ▼                   ▼
          ACCEPTED             REVISION
              │                   │
              ▼                   ▼
          PUBLISHED          RESUBMISSION
                                  │
                                  ▼
                              RE-REVIEW
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

# 📜 Decision History

The backend maintains manuscript decision information so that editorial outcomes can be tracked over time.

Example:

```text
Manuscript
    │
    ├── Submitted
    │
    ├── Under Review
    │
    ├── Revision Required
    │
    ├── Resubmitted
    │
    ├── Accepted
    │
    └── Published
```

Editors can retrieve the decision history associated with a manuscript.

---

# 📄 Manuscript Version Management

The system supports manuscript revisions and version tracking.

```text
Manuscript
    │
    ├── Version 1
    │      └── Initial Submission
    │
    ├── Version 2
    │      └── Revised Manuscript
    │
    ├── Version 3
    │      └── Further Revision
    │
    └── Final Version
```

This allows revised submissions to remain associated with the original manuscript workflow.

---

# 🏗️ System Architecture

```text
                         ┌───────────────────────┐
                         │         USERS         │
                         │                       │
                         │ Author │ Reviewer      │
                         │        │ Editor        │
                         └───────────┬───────────┘
                                     │
                                     ▼
                         ┌───────────────────────┐
                         │    React + Vite       │
                         │   Tailwind CSS UI     │
                         └───────────┬───────────┘
                                     │
                                  REST API
                                     │
                                     ▼
                  ┌────────────────────────────────┐
                  │       Spring Boot Backend       │
                  │                                │
                  │ Authentication                 │
                  │ JWT Security                   │
                  │ Manuscript Management          │
                  │ Reviewer Assignment            │
                  │ Review Management              │
                  │ Revision Management             │
                  │ Editorial Decisions            │
                  │ Decision History               │
                  │ Publication Workflow           │
                  └───────────────┬────────────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    │                           │
                    ▼                           ▼
          ┌────────────────────┐      ┌────────────────────┐
          │    PostgreSQL      │      │   Python FastAPI   │
          │      Database      │      │    AI Service      │
          └────────────────────┘      └────────────────────┘
```

---

# 🧩 Technology Stack

## 🎨 Frontend

| Technology   | Purpose               |
| ------------ | --------------------- |
| React        | User interface        |
| Vite         | Frontend build tool   |
| Tailwind CSS | UI styling            |
| JavaScript   | Application logic     |
| REST APIs    | Backend communication |

---

## ⚙️ Backend

| Technology      | Purpose                        |
| --------------- | ------------------------------ |
| Java 21         | Backend programming            |
| Spring Boot     | REST API development           |
| Spring Security | Authentication & authorization |
| JWT             | Token-based authentication     |
| BCrypt          | Password hashing               |
| Maven           | Dependency management          |

---

## 🗄️ Database

| Technology | Purpose                 |
| ---------- | ----------------------- |
| PostgreSQL | Persistent data storage |
| SQL        | Database operations     |

Database:

```text
research_journal_db
```

---

## 🤖 AI Service

| Technology        | Purpose                   |
| ----------------- | ------------------------- |
| Python            | AI service development    |
| FastAPI           | AI REST service           |
| Uvicorn           | ASGI server               |
| NLP/AI components | Research-paper processing |

---

# 📂 Project Structure

```text
AI-Research-Journal-Management-System/
│
├── 📂 backend/
│   ├── 📂 src/
│   │   ├── 📂 main/
│   │   │   ├── 📂 java/
│   │   │   │   └── 📂 com/researchjournal/
│   │   │   │       ├── 📂 controller/
│   │   │   │       ├── 📂 service/
│   │   │   │       ├── 📂 repository/
│   │   │   │       ├── 📂 model/
│   │   │   │       ├── 📂 security/
│   │   │   │       └── 📂 config/
│   │   │   │
│   │   │   └── 📂 resources/
│   │   │       └── application.properties
│   │   │
│   │   └── 📂 test/
│   │
│   └── pom.xml
│
├── 📂 frontend/
│   ├── 📂 src/
│   │   ├── 📂 components/
│   │   ├── 📂 pages/
│   │   ├── 📂 services/
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── 📂 public/
│   ├── package.json
│   └── vite.config.js
│
├── 📂 ai-service/
│   ├── main.py
│   ├── requirements.txt
│   └── ...
│
├── 📂 database/
│   └── schema.sql
│
├── .gitignore
└── README.md
```

---

# ⚙️ Installation

## 1. Clone Repository

```bash
git clone https://github.com/sachinyaganti/AI-Research-Journal-Management-System.git
```

```bash
cd AI-Research-Journal-Management-System
```

---

# 2. PostgreSQL Setup

Create the database:

```sql
CREATE DATABASE research_journal_db;
```

Configure the database in:

```text
backend/src/main/resources/application.properties
```

Example:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/research_journal_db
spring.datasource.username=YOUR_USERNAME
spring.datasource.password=YOUR_PASSWORD
```

> ⚠️ Keep credentials outside the repository.

---

# 3. Run Spring Boot Backend

```bash
cd backend
```

Build:

```bash
mvn clean install
```

Run:

```bash
mvn spring-boot:run
```

Backend:

```text
http://localhost:8080
```

---

# 4. Run React Frontend

Open a new terminal:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Run:

```bash
npm run dev
```

Frontend:

```text
http://localhost:5173
```

---

# 5. Run AI Service

Open another terminal:

```bash
cd ai-service
```

Create a virtual environment:

```bash
python -m venv venv
```

Windows:

```bash
venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Run FastAPI:

```bash
uvicorn main:app --reload
```

---

# 🧪 Testing

The system supports testing of:

### Frontend

* Authentication
* Role-based dashboards
* Manuscript submission
* Manuscript management
* Reviewer workflows
* Editorial workflows
* Revision workflows

### Backend

* Authentication APIs
* JWT authorization
* Manuscript APIs
* Reviewer assignment APIs
* Review APIs
* Editorial decision APIs
* Decision-history APIs

### API Testing

REST APIs can be tested using Postman or PowerShell.

Example:

```powershell
Invoke-RestMethod `
  -Uri "http://localhost:8080/api/..." `
  -Method GET `
  -Headers @{ Authorization = "Bearer YOUR_JWT_TOKEN" }
```

---

# 🛡️ Security Practices

The project follows security practices including:

* JWT-based authentication
* BCrypt password hashing
* Role-based authorization
* Protected API endpoints
* Server-side authorization
* Environment-based secret management
* Git exclusion of sensitive credentials

Never commit:

```text
.env
API keys
JWT secrets
Database passwords
Private credentials
```

---

# 📊 Current Implementation

| Module                        |       Status      |
| :---------------------------- | :---------------: |
| 🎨 React + Vite Frontend      |   ✅ Implemented   |
| 💨 Tailwind CSS UI            |   ✅ Implemented   |
| ☕ Spring Boot Backend         |   ✅ Implemented   |
| 🗄️ PostgreSQL Database       |   ✅ Implemented   |
| 🔐 JWT Authentication         |   ✅ Implemented   |
| 🛡️ Spring Security           |   ✅ Implemented   |
| 🔑 BCrypt Password Hashing    |   ✅ Implemented   |
| 👥 Role-Based Authorization   |   ✅ Implemented   |
| 📝 Manuscript Management      |   ✅ Implemented   |
| 👨‍⚖️ Reviewer Assignment     |   ✅ Implemented   |
| 🔍 Review Management          |   ✅ Implemented   |
| 🔄 Manuscript Revisions       |   ✅ Implemented   |
| 📜 Decision History           |   ✅ Implemented   |
| ✅ Editorial Decisions         |   ✅ Implemented   |
| 📖 Publication Workflow       |   ✅ Implemented   |
| 🤖 FastAPI AI Service         | 🚧 In Development |
| 🧠 AI Paper Analysis          | 🚧 In Development |
| 👥 AI Reviewer Recommendation | 🚧 In Development |
| ☁️ Cloud Deployment           |     🚧 Planned    |

---

# 🚀 Future Scope

## 🤖 AI Enhancements

* AI-based manuscript summarization
* Automated keyword extraction
* Semantic similarity analysis
* AI-assisted reviewer recommendation
* Intelligent manuscript classification
* Research-paper quality analysis

## 📊 Analytics

* Editorial analytics
* Reviewer activity analytics
* Manuscript processing statistics
* Publication statistics
* Workflow performance dashboards

## ☁️ DevOps

* Docker containerization
* GitHub Actions CI/CD
* Cloud deployment
* Kubernetes orchestration
* Automated integration testing

## 📧 Notifications

* Email notifications
* Reviewer assignment alerts
* Revision reminders
* Editorial decision notifications
* Publication notifications

---

# 🖥️ Application Screenshots

Add screenshots to the repository under:

```text
screenshots/
```

Recommended screenshots:

```text
screenshots/
├── login.png
├── registration.png
├── author-dashboard.png
├── manuscript-submission.png
├── reviewer-dashboard.png
├── review-page.png
├── editor-dashboard.png
├── reviewer-assignment.png
├── decision-history.png
└── publication-workflow.png
```

Example:

### 🔐 Login

![Login](screenshots/login.png)

### 👨‍🎓 Author Dashboard

![Author Dashboard](screenshots/author-dashboard.png)

### 🔍 Reviewer Dashboard

![Reviewer Dashboard](screenshots/reviewer-dashboard.png)

### 👨‍💼 Editor Dashboard

![Editor Dashboard](screenshots/editor-dashboard.png)

---

# 📈 Project Highlights

<p align="center">

|                          |                                                         |
| :----------------------: | :-----------------------------------------------------: |
|     ⚛️ **Modern UI**     |               React + Vite + Tailwind CSS               |
|   ☕ **Robust Backend**   |                  Java 21 + Spring Boot                  |
|       🔐 **Secure**      |              JWT + Spring Security + BCrypt             |
|   🗄️ **Reliable Data**  |                        PostgreSQL                       |
| 📄 **Research Workflow** | Submission → Review → Revision → Decision → Publication |
|      🤖 **AI Ready**     |               Dedicated FastAPI AI Service              |
|     👥 **Role Based**    |                Author • Reviewer • Editor               |

</p>

---

# 🎓 Academic Project

This project was developed as a **team-based academic full-stack project** with the objective of applying software engineering, database management, web development, security, and AI concepts to a real-world research publication workflow.

---

# 👨‍💻 Developer

## Yaganti Deepak Sachin Sai Chowdary

**B.Tech — Computer Science and Engineering**
**KLEF Deemed to be University**

<p>
<a href="https://github.com/sachinyaganti">
<img src="https://img.shields.io/badge/GitHub-sachinyaganti-181717?style=for-the-badge&logo=github"/>
</a>
</p>

---

# 🔗 Repository

<p align="center">

<a href="https://github.com/sachinyaganti/AI-Research-Journal-Management-System">

<img src="https://img.shields.io/badge/⭐%20View%20Repository-GitHub-181717?style=for-the-badge&logo=github"/>

</a>

</p>

---

# 📄 License

This project is developed for **academic and educational purposes**.

---

<p align="center">

### 📚 AI • Research • Automation • Full-Stack Development

**Building a smarter digital workflow for academic publishing.**

</p>
