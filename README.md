# AI-Enabled Research Journal Management System

An **AI-enabled full-stack research journal management platform** designed to streamline the complete research paper workflow, including manuscript submission, reviewer assignment, review management, revisions, editorial decisions, and publication.

The system combines a **React frontend**, **Java Spring Boot backend**, **PostgreSQL database**, and a **Python FastAPI AI service** to provide an integrated platform for managing academic research publications.

---

## 🚀 Project Overview

Managing research papers manually can involve multiple disconnected processes such as manuscript submission, reviewer assignment, review tracking, revisions, and editorial decisions.

This project provides a centralized platform where:

* Authors can submit and manage manuscripts.
* Editors can manage submissions and assign reviewers.
* Reviewers can access assigned manuscripts and submit reviews.
* Authors can upload revised manuscripts.
* Editors can make publication decisions.
* AI services can assist with research-paper analysis.
* The complete workflow can be tracked through role-based dashboards.

---

## 🎯 Objectives

The main objectives of the system are:

* Digitize the research journal publication workflow.
* Provide separate dashboards for different user roles.
* Simplify manuscript submission and management.
* Automate reviewer assignment and review workflows.
* Support manuscript revision and editorial decisions.
* Integrate AI capabilities into the research workflow.
* Maintain research-paper and user information securely.
* Provide a scalable full-stack architecture.

---

## ✨ Key Features

### 👨‍🎓 Author

* User registration and login
* Author dashboard
* Submit research manuscripts
* View submitted manuscripts
* Track manuscript status
* Upload revised manuscripts
* View reviewer/editor decisions
* Manage research-paper information

### 👨‍⚖️ Reviewer

* Reviewer dashboard
* View assigned manuscripts
* Access manuscript documents
* Submit reviews
* Provide recommendations and comments
* Track assigned review tasks

### 👨‍💼 Editor

* Editor dashboard
* View submitted manuscripts
* Manage manuscripts
* Assign reviewers
* Monitor review progress
* Review reviewer recommendations
* Make editorial decisions
* Manage publication workflow

### 🤖 AI Features

The project includes a dedicated Python-based AI service that can be integrated with the research-paper workflow.

Potential AI-assisted capabilities include:

* Research-paper content analysis
* Text processing
* Research-paper summarization
* Keyword extraction
* Similarity analysis
* AI-assisted manuscript evaluation

The AI service is implemented separately using **FastAPI**, allowing it to communicate with the main Spring Boot application.

---

## 🏗️ System Architecture

```text
                         ┌──────────────────────┐
                         │       User           │
                         │ Author / Reviewer /  │
                         │       Editor         │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │    React Frontend    │
                         │      + Vite           │
                         └──────────┬───────────┘
                                    │ REST API
                                    ▼
                     ┌─────────────────────────────┐
                     │      Spring Boot Backend    │
                     │                             │
                     │  Authentication             │
                     │  User Management            │
                     │  Manuscript Management      │
                     │  Reviewer Assignment        │
                     │  Review Management          │
                     │  Editorial Workflow         │
                     └──────────────┬──────────────┘
                                    │
                     ┌──────────────┴──────────────┐
                     ▼                             ▼
          ┌────────────────────┐       ┌────────────────────┐
          │    PostgreSQL      │       │   Python FastAPI   │
          │     Database       │       │     AI Service     │
          └────────────────────┘       └────────────────────┘
```

---

## 🛠️ Technology Stack

### Frontend

* React.js
* Vite
* JavaScript
* HTML5
* CSS3

### Backend

* Java
* Spring Boot
* Spring Security
* REST APIs
* Maven
* JWT Authentication

### Database

* PostgreSQL

### AI Service

* Python
* FastAPI
* Uvicorn
* AI/ML and NLP components

### Development Tools

* Git
* GitHub
* Visual Studio Code
* Postman
* PowerShell

---

## 📂 Project Structure

```text
AI-Research-Journal-Management-System/
│
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   │   └── com/
│   │   │   │       └── researchjournal/
│   │   │   │           ├── controller/
│   │   │   │           ├── service/
│   │   │   │           ├── repository/
│   │   │   │           ├── model/
│   │   │   │           ├── security/
│   │   │   │           └── config/
│   │   │   │
│   │   │   └── resources/
│   │   │       └── application.properties
│   │   │
│   │   └── test/
│   │
│   └── pom.xml
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
├── ai-service/
│   ├── main.py
│   ├── requirements.txt
│   └── ...
│
├── database/
│   └── schema.sql
│
├── .gitignore
└── README.md
```

> Folder names may vary slightly depending on the current repository structure.

---

# 🔐 Authentication & Authorization

The system uses **Spring Security and JWT-based authentication**.

The authentication flow is:

```text
User
  │
  ▼
Login
  │
  ▼
Spring Boot Authentication
  │
  ▼
JWT Token
  │
  ▼
Frontend stores token
  │
  ▼
Token sent with API requests
  │
  ▼
JWT Authentication Filter
  │
  ▼
Role-Based Authorization
```

Different roles have access to different features:

| Role     | Main Responsibilities                       |
| -------- | ------------------------------------------- |
| AUTHOR   | Submit and manage manuscripts               |
| REVIEWER | Review assigned manuscripts                 |
| EDITOR   | Manage manuscripts, reviewers and decisions |

---

# 📄 Manuscript Workflow

The overall manuscript workflow is:

```text
Author
  │
  ▼
Submit Manuscript
  │
  ▼
Editor Receives Submission
  │
  ▼
Reviewer Assignment
  │
  ▼
Reviewer Reviews Manuscript
  │
  ▼
Review Submitted
  │
  ▼
Editor Evaluates Review
  │
  ├───────────────┐
  ▼               ▼
Accept          Revision
  │               │
  ▼               ▼
Publish      Revised Manuscript
                  │
                  ▼
             Further Review
```

Possible manuscript statuses include:

```text
SUBMITTED
UNDER_REVIEW
REVISION_REQUIRED
RESUBMITTED
ACCEPTED
REJECTED
PUBLISHED
```

---

# 🗄️ Database

The application uses **PostgreSQL** for persistent data storage.

Example database:

```text
research_journal_db
```

The database stores information related to:

* Users
* Authors
* Reviewers
* Editors
* Manuscripts
* Reviewer assignments
* Reviews
* Editorial decisions
* Manuscript revisions
* Publication information

---

# 🔌 REST API

The Spring Boot backend exposes REST APIs for communication with the React frontend.

Typical API categories include:

```text
/api/auth
/api/users
/api/manuscripts
/api/reviews
/api/reviewers
/api/editor
```

Example authentication flow:

```http
POST /api/auth/login
```

Example request:

```json
{
  "email": "user@example.com",
  "password": "password"
}
```

The server returns an authentication token that can be used for protected endpoints.

---

# 🤖 AI Service

The AI component is implemented as a separate **Python FastAPI service**.

Architecture:

```text
Spring Boot Backend
        │
        │ HTTP Request
        ▼
   FastAPI AI Service
        │
        ▼
 AI / NLP Processing
        │
        ▼
     Result
        │
        ▼
Spring Boot Backend
        │
        ▼
 React Frontend
```

This separation allows the AI components to evolve independently from the core application.

---

# ⚙️ Installation & Setup

## 1. Clone the Repository

```bash
git clone https://github.com/sachinyaganti/AI-Research-Journal-Management-System.git
```

```bash
cd AI-Research-Journal-Management-System
```

---

# 2. Configure PostgreSQL

Create the database:

```sql
CREATE DATABASE research_journal_db;
```

Configure the database connection in:

```text
backend/src/main/resources/application.properties
```

Example:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/research_journal_db
spring.datasource.username=YOUR_USERNAME
spring.datasource.password=YOUR_PASSWORD
```

Do not commit real database passwords or API keys to GitHub.

---

# 3. Run the Spring Boot Backend

Navigate to the backend:

```bash
cd backend
```

Build the project:

```bash
mvn clean install
```

Run the application:

```bash
mvn spring-boot:run
```

The backend will normally run on:

```text
http://localhost:8080
```

---

# 4. Run the React Frontend

Open another terminal:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The frontend will normally be available at:

```text
http://localhost:5173
```

---

# 5. Run the AI Service

Navigate to the AI service:

```bash
cd ai-service
```

Create a virtual environment:

### Windows

```bash
python -m venv venv
```

Activate it:

```bash
venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Run the FastAPI service:

```bash
uvicorn main:app --reload
```

The AI service can then be accessed through its configured local port.

---

# 🧪 Testing

The application can be tested at multiple levels.

### Backend Testing

* REST API testing
* Authentication testing
* Authorization testing
* Manuscript workflow testing
* Reviewer assignment testing
* Database integration testing

### Frontend Testing

* Login and registration
* Dashboard navigation
* Manuscript submission
* File upload
* Reviewer workflow
* Editorial workflow

### API Testing

Tools such as **Postman** or PowerShell can be used to test REST endpoints.

Example:

```powershell
Invoke-RestMethod `
  -Uri "http://localhost:8080/api/..." `
  -Method GET `
  -Headers @{ Authorization = "Bearer YOUR_JWT_TOKEN" }
```

---

# 🔒 Security

The project follows basic security practices including:

* JWT-based authentication
* Password hashing using BCrypt
* Role-based authorization
* Protected REST endpoints
* Environment-based configuration
* Sensitive credentials excluded from Git

### Environment Variables

Sensitive values such as:

```text
DATABASE_PASSWORD
JWT_SECRET
API_KEY
```

should be stored using environment variables or local configuration files.

Never commit:

```text
.env
API keys
passwords
JWT secrets
private credentials
```

to the repository.

---

# 📊 Current Development Status

| Module                | Status        |
| --------------------- | ------------- |
| React Frontend        | ✅ Implemented |
| Spring Boot Backend   | ✅ Implemented |
| PostgreSQL Database   | ✅ Implemented |
| User Authentication   | ✅ Implemented |
| JWT Security          | ✅ Implemented |
| Role-Based Access     | ✅ Implemented |
| Manuscript Management | ✅ Implemented |
| Reviewer Assignment   | ✅ Implemented |
| Review Workflow       | 🚧 Developing |
| Manuscript Revision   | 🚧 Developing |
| PDF Management        | 🚧 Developing |
| AI Service            | 🚧 Developing |
| AI-Assisted Analysis  | 🚧 Developing |
| Deployment            | 🚧 Developing |

---

# 🔮 Future Scope

Future improvements planned for the system include:

* AI-based manuscript summarization
* Automated keyword extraction
* Semantic similarity checking
* AI-assisted reviewer recommendation
* Advanced plagiarism detection integration
* Research-paper quality analysis
* Email notifications
* Automated workflow notifications
* Advanced analytics dashboard
* Cloud deployment
* Docker containerization
* CI/CD pipeline
* Kubernetes-based deployment
* Improved document management

---

# 🌐 Deployment

The application is designed to support deployment using modern cloud and DevOps technologies.

Possible deployment architecture:

```text
                 GitHub
                    │
                    ▼
                CI / CD
                    │
        ┌───────────┼───────────┐
        ▼           ▼           ▼
     Frontend    Backend     AI Service
        │           │           │
        ▼           ▼           ▼
      Cloud       Cloud       Cloud
                    │
                    ▼
                PostgreSQL
```

---

# 👥 User Roles

### Author

Responsible for submitting research manuscripts, tracking submissions, and responding to revision requests.

### Reviewer

Responsible for reviewing assigned research papers and providing feedback and recommendations.

### Editor

Responsible for managing manuscripts, assigning reviewers, evaluating reviews, and making editorial decisions.

---

# 💡 Why This Project?

Traditional research publication workflows often involve emails, spreadsheets, documents, and multiple disconnected systems.

This project brings these processes into a **single centralized platform**, reducing manual coordination and providing a structured workflow for authors, reviewers, and editors.

The integration of an independent AI service also provides a foundation for introducing intelligent capabilities into academic publishing.

---

# 📸 Screenshots

Screenshots of the application will be added here.

Example:

```text
screenshots/
├── login.png
├── author-dashboard.png
├── reviewer-dashboard.png
├── editor-dashboard.png
├── manuscript-submission.png
├── reviewer-assignment.png
└── ai-analysis.png
```

---

# 👨‍💻 Developer

**Yaganti Deepak Sachin Sai Chowdary**

B.Tech – Computer Science and Engineering
KLEF Deemed to be University

### GitHub

https://github.com/sachinyaganti

### Project Repository

https://github.com/sachinyaganti/AI-Research-Journal-Management-System

---

# ⭐ Acknowledgement

This project was developed as a full-stack academic software project to explore:

* Full-stack application development
* REST API development
* Database management
* Authentication and authorization
* Research workflow automation
* Artificial intelligence integration
* Software engineering practices

---

## 📌 License

This project is intended for **academic and educational purposes**.
