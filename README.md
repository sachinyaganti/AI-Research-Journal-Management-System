# 📚 AI-Enabled Research Journal Management System

<p align="center">
  <img src="https://img.shields.io/badge/AI-Enabled-6C63FF?style=for-the-badge" />
  <img src="https://img.shields.io/badge/React-Vite-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/Java-Spring%20Boot-6DB33F?style=for-the-badge&logo=springboot&logoColor=white" />
  <img src="https://img.shields.io/badge/PostgreSQL-Database-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" />
  <img src="https://img.shields.io/badge/Python-FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" />
</p>

<p align="center">
  <strong>A modern full-stack platform for managing the complete academic research publication workflow.</strong>
</p>

<p align="center">
  <a href="#-overview">Overview</a> •
  <a href="#-features">Features</a> •
  <a href="#-architecture">Architecture</a> •
  <a href="#-workflow">Workflow</a> •
  <a href="#-setup">Setup</a> •
  <a href="#-future-scope">Future Scope</a>
</p>

---

## 🌟 Overview

The **AI-Enabled Research Journal Management System** is a full-stack web application designed to digitize and streamline the academic research publication process.

The platform connects **Authors, Reviewers, and Editors** through a centralized workflow for:

> 📝 Manuscript Submission → 👨‍⚖️ Reviewer Assignment → 🔍 Peer Review → 🔄 Revision → ✅ Editorial Decision → 📖 Publication

The system combines:

* ⚛️ **React + Vite** for the frontend
* ☕ **Java + Spring Boot** for backend services
* 🐘 **PostgreSQL** for data management
* 🐍 **Python + FastAPI** for AI services
* 🔐 **JWT + Spring Security** for authentication and authorization

---

# 🎯 Problem Statement

Traditional research-paper management can involve multiple disconnected tools such as:

* Email
* Spreadsheets
* Shared folders
* Word/PDF documents
* Manual reviewer assignment
* Manual status tracking

This can make it difficult to maintain a structured publication workflow.

### 💡 Proposed Solution

This project provides a centralized platform where each participant gets a dedicated workspace.

```text
                         RESEARCH JOURNAL PLATFORM

        ┌─────────────┐
        │   AUTHOR    │
        └──────┬──────┘
               │
               │ Submit Manuscript
               ▼
        ┌─────────────┐
        │   EDITOR    │
        └──────┬──────┘
               │
               │ Assign Reviewer
               ▼
        ┌─────────────┐
        │  REVIEWER   │
        └──────┬──────┘
               │
               │ Submit Review
               ▼
        ┌─────────────┐
        │   EDITOR    │
        └──────┬──────┘
               │
          ┌────┴─────┐
          ▼          ▼
       ACCEPT     REVISION
          │          │
          ▼          ▼
      PUBLISH    RESUBMIT
```

---

# ✨ Key Features

<table>
<tr>
<td width="33%" align="center">

### 👨‍🎓 Author Portal

Submit and manage research manuscripts.

* Manuscript submission
* PDF/document upload
* Submission tracking
* Revision submission
* Editorial decisions

</td>

<td width="33%" align="center">

### 🔍 Reviewer Portal

Review assigned manuscripts.

* Assigned papers
* Manuscript access
* Review submission
* Recommendations
* Review tracking

</td>

<td width="33%" align="center">

### 👨‍💼 Editor Portal

Manage the complete editorial workflow.

* Manuscript management
* Reviewer assignment
* Review monitoring
* Editorial decisions
* Publication workflow

</td>
</tr>

<tr>
<td width="33%" align="center">

### 🤖 AI Services

AI-ready architecture for intelligent research workflows.

* Text analysis
* Summarization
* Keyword extraction
* Similarity analysis

</td>

<td width="33%" align="center">

### 🔐 Secure Authentication

Role-based application security.

* JWT authentication
* BCrypt password hashing
* Protected APIs
* Role-based authorization

</td>

<td width="33%" align="center">

### 📊 Centralized Management

Everything in one platform.

* Users
* Manuscripts
* Reviews
* Revisions
* Editorial decisions

</td>
</tr>
</table>

---

# 🧩 Technology Stack

## 🎨 Frontend

<p>
<img src="https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB"/>
<img src="https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white"/>
<img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black"/>
<img src="https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white"/>
<img src="https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white"/>
</p>

## ⚙️ Backend

<p>
<img src="https://img.shields.io/badge/Java-21-ED8B00?style=flat-square&logo=openjdk&logoColor=white"/>
<img src="https://img.shields.io/badge/Spring%20Boot-6DB33F?style=flat-square&logo=springboot&logoColor=white"/>
<img src="https://img.shields.io/badge/Spring%20Security-6DB33F?style=flat-square&logo=springsecurity&logoColor=white"/>
<img src="https://img.shields.io/badge/Maven-C71A36?style=flat-square&logo=apachemaven&logoColor=white"/>
</p>

## 🗄️ Database

<p>
<img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white"/>
</p>

## 🤖 AI Service

<p>
<img src="https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white"/>
<img src="https://img.shields.io/badge/FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white"/>
<img src="https://img.shields.io/badge/Uvicorn-499848?style=flat-square"/>
</p>

## 🛠️ Development

<p>
<img src="https://img.shields.io/badge/Git-F05032?style=flat-square&logo=git&logoColor=white"/>
<img src="https://img.shields.io/badge/GitHub-181717?style=flat-square&logo=github&logoColor=white"/>
<img src="https://img.shields.io/badge/Postman-FF6C37?style=flat-square&logo=postman&logoColor=white"/>
</p>

---

# 🏗️ System Architecture

```text
                         ┌──────────────────────┐
                         │       USERS          │
                         │                      │
                         │ Author │ Reviewer    │
                         │        │ Editor      │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │   React + Vite       │
                         │    Frontend UI       │
                         └──────────┬───────────┘
                                    │
                              REST APIs
                                    │
                                    ▼
                 ┌──────────────────────────────────┐
                 │       Spring Boot Backend         │
                 │                                  │
                 │ Authentication                   │
                 │ Manuscript Management             │
                 │ Reviewer Assignment               │
                 │ Review Management                 │
                 │ Editorial Workflow                │
                 └───────────────┬──────────────────┘
                                 │
                  ┌──────────────┴──────────────┐
                  │                             │
                  ▼                             ▼
        ┌───────────────────┐        ┌───────────────────┐
        │    PostgreSQL     │        │  Python FastAPI   │
        │     Database      │        │    AI Service     │
        └───────────────────┘        └───────────────────┘
```

---

# 🔐 Security Architecture

The application uses **JWT-based authentication** with Spring Security.

```text
┌──────────────┐
│     User     │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Login API    │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Authentication│
│ + BCrypt     │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ JWT Token    │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Protected API│
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Role-Based   │
│ Authorization│
└──────────────┘
```

### 🔑 Supported Roles

|       Role       | Access                                                  |
| :--------------: | ------------------------------------------------------- |
| 👨‍🎓 **AUTHOR** | Submit manuscripts, upload revisions, track submissions |
|  🔍 **REVIEWER** | Access assigned manuscripts and submit reviews          |
| 👨‍💼 **EDITOR** | Manage manuscripts, reviewers, reviews and decisions    |

---

# 🔄 Research Publication Workflow

```text
                    ┌───────────────┐
                    │    AUTHOR     │
                    └───────┬───────┘
                            │
                     Submit Manuscript
                            │
                            ▼
                    ┌───────────────┐
                    │    EDITOR     │
                    └───────┬───────┘
                            │
                     Assign Reviewer
                            │
                            ▼
                    ┌───────────────┐
                    │   REVIEWER    │
                    └───────┬───────┘
                            │
                       Submit Review
                            │
                            ▼
                    ┌───────────────┐
                    │    EDITOR     │
                    └───────┬───────┘
                            │
                  ┌─────────┴──────────┐
                  │                    │
                  ▼                    ▼
             ACCEPTED              REVISION
                  │                    │
                  ▼                    ▼
             PUBLISHED             RESUBMIT
                                       │
                                       ▼
                                  NEW REVIEW
```

### 📌 Manuscript Lifecycle

```text
SUBMITTED
    ↓
UNDER_REVIEW
    ↓
┌───────────────┐
│               │
▼               ▼
ACCEPTED     REVISION_REQUIRED
│               │
▼               ▼
PUBLISHED     RESUBMITTED
                │
                ▼
           UNDER_REVIEW

REJECTED ←──────┘
```

---

# 📁 Project Structure

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

# ⚙️ Getting Started

## 1️⃣ Clone Repository

```bash
git clone https://github.com/sachinyaganti/AI-Research-Journal-Management-System.git

cd AI-Research-Journal-Management-System
```

---

## 2️⃣ Database Setup

Create the PostgreSQL database:

```sql
CREATE DATABASE research_journal_db;
```

Configure:

```text
backend/src/main/resources/application.properties
```

Example:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/research_journal_db
spring.datasource.username=YOUR_USERNAME
spring.datasource.password=YOUR_PASSWORD
```

> ⚠️ Never commit database passwords, API keys, JWT secrets, or other credentials.

---

## 3️⃣ Start Backend

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

## 4️⃣ Start Frontend

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend:

```text
http://localhost:5173
```

---

## 5️⃣ Start AI Service

```bash
cd ai-service
```

Create virtual environment:

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

Start FastAPI:

```bash
uvicorn main:app --reload
```

---

# 🧪 Testing

The system can be tested through:

### 🔹 Frontend Testing

* Login
* Registration
* Dashboard navigation
* Manuscript submission
* PDF upload
* Reviewer workflow
* Editorial workflow

### 🔹 Backend Testing

* REST APIs
* Authentication
* Authorization
* Database operations
* Reviewer assignment
* Manuscript management

### 🔹 API Testing

Use **Postman** or PowerShell.

Example:

```powershell
Invoke-RestMethod `
  -Uri "http://localhost:8080/api/..." `
  -Method GET `
  -Headers @{ Authorization = "Bearer YOUR_JWT_TOKEN" }
```

---

# 🤖 AI Integration

The AI architecture is designed as an independent microservice.

```text
                    Spring Boot
                        │
                        │ REST Request
                        ▼
                ┌───────────────┐
                │   FastAPI     │
                │   AI Service  │
                └───────┬───────┘
                        │
                        ▼
                ┌───────────────┐
                │ AI / NLP      │
                │ Processing    │
                └───────┬───────┘
                        │
                        ▼
                   AI Response
                        │
                        ▼
                    Frontend
```

This architecture makes it easier to add new AI capabilities without tightly coupling them to the main backend.

---

# 📊 Development Status

| Module                    | Status |
| :------------------------ | :----: |
| 🎨 React Frontend         |    ✅   |
| ⚙️ Spring Boot Backend    |    ✅   |
| 🗄️ PostgreSQL            |    ✅   |
| 🔐 Authentication         |    ✅   |
| 🛡️ JWT Security          |    ✅   |
| 👥 Role-Based Access      |    ✅   |
| 📝 Manuscript Management  |    ✅   |
| 👨‍⚖️ Reviewer Assignment |    ✅   |
| 🔍 Review Workflow        |   🚧   |
| 🔄 Revision Workflow      |   🚧   |
| 📄 PDF Management         |   🚧   |
| 🤖 AI Service             |   🚧   |
| 🧠 AI Analysis            |   🚧   |
| ☁️ Cloud Deployment       |   🚧   |

---

# 🔮 Future Scope

### 🤖 Intelligent Research Assistance

* AI-based manuscript summarization
* Keyword extraction
* Semantic similarity analysis
* Automated reviewer recommendations
* AI-assisted manuscript analysis

### 📊 Analytics

* Editorial analytics dashboard
* Reviewer performance analytics
* Publication statistics
* Manuscript processing metrics

### ☁️ DevOps & Deployment

* Docker containerization
* CI/CD with GitHub Actions
* Cloud deployment
* Kubernetes orchestration
* Automated testing pipelines

### 📧 Notifications

* Email notifications
* Reviewer assignment notifications
* Revision reminders
* Editorial decision notifications

---

# 🖥️ Screenshots

> Add application screenshots here as the UI evolves.

### 🔐 Login

```text
screenshots/login.png
```

### 👨‍🎓 Author Dashboard

```text
screenshots/author-dashboard.png
```

### 🔍 Reviewer Dashboard

```text
screenshots/reviewer-dashboard.png
```

### 👨‍💼 Editor Dashboard

```text
screenshots/editor-dashboard.png
```

### 📝 Manuscript Management

```text
screenshots/manuscript-management.png
```

---

# 🚀 Project Highlights

<table>
<tr>
<td align="center">⚛️<br><strong>Modern Frontend</strong><br>React + Vite</td>
<td align="center">☕<br><strong>Robust Backend</strong><br>Spring Boot</td>
<td align="center">🐘<br><strong>Reliable Storage</strong><br>PostgreSQL</td>
</tr>
<tr>
<td align="center">🤖<br><strong>AI Ready</strong><br>FastAPI</td>
<td align="center">🔐<br><strong>Secure</strong><br>JWT + Spring Security</td>
<td align="center">📄<br><strong>Document Workflow</strong><br>Manuscript Management</td>
</tr>
</table>

---

# 👨‍💻 Developer

### Yaganti Deepak Sachin Sai Chowdary

🎓 **B.Tech — Computer Science & Engineering**
🏫 **KLEF Deemed to be University**

<p>
<a href="https://github.com/sachinyaganti">
<img src="https://img.shields.io/badge/GitHub-sachinyaganti-181717?style=for-the-badge&logo=github"/>
</a>
</p>

---

# 📌 Repository

<p align="center">

<a href="https://github.com/sachinyaganti/AI-Research-Journal-Management-System">

<img src="https://img.shields.io/badge/⭐%20View%20Project-GitHub-181717?style=for-the-badge&logo=github"/>

</a>

</p>

---

# 📄 License

This project is developed for **academic and educational purposes**.

---

<p align="center">

### 💡 Building a smarter workflow for academic research management.

**AI • Research • Automation • Full Stack Development**

</p>
