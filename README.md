# PRISM EDU 

> **Smart Student Support & Dropout Prediction Platform**  
> **Hack2Ignite 2026 — Problem Statement ED-05**  
> **Team Pheonix | Trinity College of Engineering and Research, Pune**

##  Overview

**PRISM EDU** is a web-based student support and predictive analytics platform designed to help educational institutions identify students who may need support at an early stage.

The platform combines student academic and engagement data with machine learning insights, faculty intervention tools, AI-powered learning support, counselling support, scholarship information, and career opportunities.

### Core Objective

**Student Data → Predictive Analysis → Early Identification → Faculty Action → Student Support → Better Student Outcomes**

---
###Login credentials##

Admin:
id : admin@prismedu.com
password : password@123

Faculty:
id: faculty1@prismedu.com
passs : password@123

Student :
id : aryan.verma@kjei.edu.in
password : Aryan@0510

---
##  Problem Statement

Student dropout can be influenced by multiple factors such as academic performance, attendance, engagement, financial difficulties, and lack of timely support.

Traditional systems often store student information without converting it into actionable insights.

PRISM EDU addresses this gap by bringing student data, predictive analytics, faculty monitoring, and support services together in one platform.

---

##  Proposed Solution

PRISM EDU provides separate experiences for students, faculty, and administrators.

The system can use existing admission and academic information, continuously collect relevant student activity, and generate predictive insights that help faculty identify students who may require timely intervention.

Students can also access learning resources, AI assistance, counselling support, scholarships, and career opportunities.

---

##  Key Features

###  Predictive Analytics
- Uses student data for predictive assessment.
- Helps identify early dropout-risk indicators.
- Provides actionable insights for faculty.
- Supports continuous monitoring and intervention.

###  Faculty Dashboard
- Manage and monitor students.
- View academic performance and attendance.
- Track student engagement.
- Review predictive insights.
- Identify areas where students need support.
- Record and track interventions.

###  Student Portal
- Access academic information.
- View learning resources.
- Track progress.
- Use AI-powered academic assistance.
- Access counselling and support options.
- Explore scholarships and financial support.
- Discover career opportunities.

###  AI Learning Agent
Provides students with AI-powered academic assistance for:
- Subject doubts
- Concept explanations
- Examples
- Learning guidance
- Practice and revision

###  AI Counselling & Support
Provides basic personal and emotional support and guides students toward appropriate resources.

The platform can also provide college counsellor contact information for students who want human support.

###  Scholarship Support
Students can explore:
- Scholarships
- Eligibility information
- Benefits
- Application requirements
- Deadlines
- Educational financial support

###  Career Opportunities
Provides access to relevant:
- Jobs
- Internships
- Certifications
- Skill-development opportunities

###  Learning Resources
Faculty can provide:
- Notes
- PDFs
- Videos
- Assignments
- Quizzes
- Practice material

---

##  How PRISM EDU Works

```text
Existing Student Data
        ↓
Initial Predictive Assessment
        ↓
Student Academic & Engagement Activity
        ↓
Continuous Data Collection
        ↓
AI + ML Analysis
        ↓
Faculty Insights
        ↓
Timely Intervention
        ↓
Student Support
        ↓
Progress & Outcomes
        ↓
Updated Analytics
```

### Intervention Loop

```text
Identify → Understand → Intervene → Monitor → Measure → Improve
```

---

##  System Architecture

```text
                    ┌─────────────────────┐
                    │   Student / Faculty │
                    │      / Admin        │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │     Next.js Web     │
                    │    Application      │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   Backend / APIs    │
                    │      FastAPI        │
                    └──────┬───────┬──────┘
                           │       │
              ┌────────────┘       └────────────┐
              ▼                                 ▼
     ┌─────────────────┐              ┌─────────────────┐
     │ Supabase /      │              │ Python ML       │
     │ PostgreSQL      │              │ Service         │
     └─────────────────┘              └────────┬────────┘
                                               │
                                               ▼
                                    ┌─────────────────────┐
                                    │ Predictive Insights │
                                    └──────────┬──────────┘
                                               │
                                               ▼
                                    ┌─────────────────────┐
                                    │ Faculty Intervention│
                                    └─────────────────────┘
```

---

##  Technology Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 |
| UI | React 18, TypeScript, Tailwind CSS |
| Backend | Python FastAPI |
| Database | Supabase / PostgreSQL |
| Vector Search | pgvector |
| Machine Learning | Python, scikit-learn, pandas |
| AI | OpenAI GPT-4o-mini |
| Deployment | Vercel + backend services |

---

##  Project Structure

```text
PRISM--EDU/
│
├── app/                 # Next.js application
├── components/          # Reusable UI components
├── lib/                 # Application utilities and services
├── public/              # Static assets
├── ml_service/          # Python ML / FastAPI service
├── tests/               # Project tests
├── supabase/            # Supabase-related configuration
├── package.json
├── next.config.*
├── tailwind.config.*
└── README.md
```

---

##  Getting Started

### Prerequisites

- Node.js
- npm
- Python 3.x
- Git
- Supabase project
- Required API credentials

### 1. Clone the Repository

```bash
git clone https://github.com/nayanshirpure327/PRISM--EDU.git
cd PRISM--EDU
```

### 2. Install Frontend Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env.local` file and add the environment variables required by the project.

Example:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_api_key
```

> Never commit real API keys or passwords to GitHub.

### 4. Start the Development Server

```bash
npm run dev
```

Open `http://localhost:3000`.

### 5. Run the ML Service

Navigate to the ML service directory and install its Python dependencies according to the project's requirements.

```bash
cd ml_service
pip install -r requirements.txt
```

Start the FastAPI service using the command specified by the project configuration.

---

##  Data Privacy & Security

PRISM EDU handles sensitive student-related information, so privacy and controlled access are important.

Key considerations include:

- Role-based access
- Secure authentication
- Protected student information
- Input validation
- Secure API communication
- Controlled access to predictive insights
- Protection of API credentials

Predictive analytics should be treated as a **support signal**, not a guaranteed prediction of a student's future.

---

##  Predictive Analytics Approach

PRISM EDU uses machine learning to analyze relevant student information and identify patterns associated with dropout risk.

Potential data categories include:

- Admission information
- Academic performance
- Attendance
- Assignment and quiz performance
- Learning activity
- Engagement indicators
- Other authorized institutional data

The goal is to help faculty **identify students who may need attention early**, so appropriate support can be provided.

---

##  Model Improvement

```text
Historical Student Data
        ↓
Data Preparation
        ↓
Model Training
        ↓
Model Evaluation
        ↓
Deployment
        ↓
Prediction
        ↓
Faculty Intervention
        ↓
Validated Student Outcome
        ↓
Future Model Improvement
```

Model retraining should use validated historical outcomes rather than retraining blindly after every individual student activity.

---

##  User Roles

### Student
- Access learning resources
- Ask academic questions
- Receive basic support
- Find scholarships
- Explore career opportunities
- Monitor academic progress

### Faculty
- Manage student information
- Monitor academic progress
- Track attendance and engagement
- Review predictive insights
- Identify areas requiring attention
- Take and record interventions

### Admin
- Platform management
- Student/faculty management
- Institutional data management
- System-level configuration

---

##  Expected Impact

### Students
-  Better learning support
-  Accessible counselling support
-  Scholarship awareness
-  Career opportunities

### Faculty
-  Better student monitoring
-  Early identification of students needing support
-  Data-driven insights
-  Timely intervention

### Institution
-  Early identification
-  Better student support
-  Supports dropout reduction
-  Data-driven student retention efforts

---

##  Demo

**Live Prototype:**  
https://prism-edu.vercel.app/

**GitHub Repository:**  
https://github.com/nayanshirpure327/PRISM--EDU

---

##  Testing

The repository includes project tests for validating application functionality.

Run the available test commands defined in `package.json` and the relevant service configuration.

Example:

```bash
npm test
```

---

##  Research Areas

- Student Dropout Prediction using Machine Learning
- Educational Data Mining
- Student Attendance and Engagement Analytics
- Predictive Analytics in Education
- AI Chatbots in Education
- Student Counselling and Support Systems

### Selected References

1. Predicting Student Dropouts with Machine Learning: An Empirical Study in Finnish Higher Education  
   https://doi.org/10.1016/j.techsoc.2024.102474

2. A Study on Dropout Prediction for University Students Using Machine Learning  
   https://doi.org/10.3390/app132112004

3. Student Dropout Prediction  
   https://pmc.ncbi.nlm.nih.gov/articles/PMC7334184/

4. Predicting Student Dropout: A Machine Learning Approach  
   https://doi.org/10.1080/21568235.2020.1718520

5. Role of AI Chatbots in Education: Systematic Literature Review  
   https://doi.org/10.1186/s41239-023-00426-1

---

##  Team Pheonix

**Hack2Ignite 2026 — Problem Statement ED-05**

**Trinity College of Engineering and Research, Pune**

- Omkar Potare
- Aniket Vishwakarma
- Yugal Padole
- Nayan Shirpure

---

##  Vision

> **Identify Early • Support Better • Reduce Dropout**

PRISM EDU aims to help institutions move from reactive student support to **early, data-driven intervention**.

---

##  License

This project was developed as a hackathon prototype for **Hack2Ignite 2026**.
