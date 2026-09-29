# DevOps Copilot – AI Incident & Root Cause Assistant

DevOps Copilot is an AI-powered incident analysis assistant that helps developers and DevOps teams understand application errors and logs faster.

Users can paste an application log, upload a `.log` or `.txt` file, or select a sample incident. DevOps Copilot analyzes the incident using local AI and provides a structured explanation including the probable root cause, severity, suggested fix, troubleshooting steps, impact, and prevention recommendations.

The project uses **Spring Boot, React, Ollama/Llama 3.2, and Model Context Protocol (MCP)**.

---

## 🚨 Problem

Application incidents often require developers to manually inspect:

- Application logs
- Stack traces
- HTTP errors
- Database errors
- Service timeouts
- Recent application changes
- Dependent service failures

This investigation can take significant time, especially when an incident contains large or complicated logs.

DevOps Copilot provides a simple interface where an engineer can submit an incident log and receive a structured analysis.

---

## 💡 Solution

DevOps Copilot converts an application log into an actionable incident analysis.

### Input

The user can:

- Paste an application log
- Upload a `.log` file
- Upload a `.txt` file
- Select a sample incident

### Analysis

The backend sends the incident to the local AI model through Spring AI and Ollama.

### Output

The system provides:

- Error Type
- Severity
- Possible Root Cause
- Suggested Fix
- Incident Summary
- Troubleshooting Steps
- Impact
- Prevention Recommendations

---

## ✨ Features

### Log Analysis

- Paste application logs
- Upload `.log` and `.txt` files
- Multiple sample incidents
- AI-powered analysis
- Rule-based fallback analysis

### Incident Analysis

- Error classification
- Severity detection
- Possible root cause
- Suggested fix
- Incident summary
- Troubleshooting steps
- Impact analysis
- Prevention recommendations

### Visual Analysis

The UI presents a root-cause analysis chain:

```text
Log
 ↓
Detected Error
 ↓
Root Cause
 ↓
Suggested Fix
```

### Incident Dashboard

The dashboard keeps track of analyzed incidents in the browser and displays counts for:

- Total incidents
- Critical incidents
- High severity incidents
- Medium severity incidents
- Low severity incidents

### Incident History

Previously analyzed incidents are stored locally using browser `localStorage`.

Users can:

- View previous incidents
- Reopen an incident
- Clear incident history

### Incident Reports

Users can:

- Copy an incident report
- Download an incident report as a text file

---

## 🏗️ Architecture

```text
                   ┌─────────────────────┐
                   │       User          │
                   │ Paste / Upload Log  │
                   └──────────┬──────────┘
                              │
                              ▼
                   ┌─────────────────────┐
                   │    React + Vite     │
                   │    Frontend         │
                   └──────────┬──────────┘
                              │ REST API
                              ▼
                   ┌─────────────────────┐
                   │   Spring Boot       │
                   │   Backend           │
                   └──────────┬──────────┘
                              │
                    ┌─────────┴─────────┐
                    │                   │
                    ▼                   ▼
          ┌─────────────────┐   ┌─────────────────┐
          │ Spring AI       │   │ MCP Server      │
          │ Chat Client     │   │ analyze_incident│
          └────────┬────────┘   └────────┬────────┘
                   │                     │
                   └──────────┬──────────┘
                              ▼
                   ┌─────────────────────┐
                   │ Ollama              │
                   │ Llama 3.2 3B        │
                   │ Local AI Model      │
                   └──────────┬──────────┘
                              │
                              ▼
                   ┌─────────────────────┐
                   │ Structured Incident │
                   │ Analysis            │
                   └─────────────────────┘
```

---

## 🔗 MCP Integration

DevOps Copilot exposes an MCP tool named:

```text
analyze_incident
```

The tool accepts an application log and returns a structured incident analysis.

The MCP tool is implemented using Spring AI MCP server support.

This allows an MCP-compatible client or agent to invoke the incident analysis capability as a tool.

---

## 🤖 Local AI

The project uses **Ollama** with **Llama 3.2 3B**.

The AI model runs locally on the developer's machine.

This provides:

- No external AI API key
- No dependency on a paid AI API
- Local log processing
- Lower privacy exposure for development logs
- Offline-capable AI inference after the model is downloaded

---

## 🧰 Technology Stack

### Frontend

- React
- Vite
- JavaScript
- HTML
- CSS

### Backend

- Java 17
- Spring Boot
- Spring Web
- Spring AI
- Maven

### AI

- Ollama
- Llama 3.2 3B

### AI Integration

- Model Context Protocol (MCP)
- Spring AI MCP Server

### Development

- IntelliJ IDEA
- Git
- GitHub
- npm
- Maven

---

## 📂 Project Structure

```text
DevOps-Copilot-Full-Project
│
├── devops-copilot-backend
│   ├── src
│   │   └── main
│   │       └── java
│   │           └── com
│   │               └── devopscopilot
│   │                   ├── controller
│   │                   ├── model
│   │                   ├── service
│   │                   └── mcp
│   ├── pom.xml
│   └── README.md
│
├── devops-copilot-frontend
│   ├── src
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── style.css
│   ├── package.json
│   └── README.md
│
└── README.md
```

---

## ⚙️ Prerequisites

Install:

- Java 17 or later
- Node.js
- npm
- Ollama

Verify:

```bash
java -version
node -v
npm -v
ollama --version
```

---

## 🧠 Ollama Setup

Pull the model:

```bash
ollama pull llama3.2:3b
```

Start the model:

```bash
ollama run llama3.2:3b
```

Keep Ollama running while using DevOps Copilot.

---

## ▶️ Running the Backend

Open the backend project:

```text
devops-copilot-backend
```

Run the Spring Boot application from IntelliJ.

Backend:

```text
http://localhost:8081
```

Health endpoint:

```text
http://localhost:8081/api/health
```

---

## ▶️ Running the Frontend

Open a terminal inside:

```text
devops-copilot-frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Frontend:

```text
http://localhost:5173
```

---

## 🔄 Application Flow

```text
1. User uploads or pastes an application log
                    ↓
2. React sends the log to Spring Boot
                    ↓
3. Spring Boot sends the incident to the AI layer
                    ↓
4. Ollama runs Llama 3.2 locally
                    ↓
5. AI generates structured incident analysis
                    ↓
6. Spring Boot returns the analysis
                    ↓
7. React displays the result
```

---

## 🧪 Example Incident

### Input

```text
2026-09-26 10:31:42 ERROR PaymentService
HTTP 500 - Database connection timeout.
Could not acquire connection from pool.
```

### Analysis

```text
Error Type:
Database Connection Error

Severity:
HIGH

Possible Root Cause:
Database connectivity or connection pool timeout.

Suggested Fix:
Check database availability, connectivity,
credentials and connection pool configuration.
```

The UI additionally displays troubleshooting steps, impact, and prevention recommendations.

---

## 🔐 Privacy-Friendly Development

DevOps Copilot supports local AI processing during development.

Application logs are sent to the locally running Ollama model rather than requiring a cloud AI API.

For production deployments, organizations should still apply their own security controls, log redaction policies, authentication, authorization, and data-retention requirements.

---

## 🛠️ Current Limitations

This project is currently designed as a hackathon/demo application.

Production environments would require additional capabilities such as:

- Authentication and authorization
- Centralized incident storage
- Database persistence
- Role-based access
- Production monitoring
- Log redaction
- Audit logging
- Enterprise security controls
- Scalable AI infrastructure

---

## 🚀 Future Enhancements

Potential future improvements include:

- Integration with real monitoring platforms
- Automatic incident ingestion
- Kubernetes and container diagnostics
- CI/CD pipeline integration
- GitHub/GitLab integration
- Cloud deployment
- Advanced incident correlation
- Multi-service root-cause analysis
- Automated remediation workflows
- Voice-based incident investigation through compatible agent/voice experiences

---

## 🎯 Hackathon Concept

DevOps Copilot demonstrates how an AI-powered assistant can turn raw application logs into structured incident intelligence.

Instead of manually searching through logs, an engineer can provide the incident and quickly receive:

```text
What happened?
      ↓
What is the probable cause?
      ↓
How severe is it?
      ↓
What should I check?
      ↓
How can I fix it?
      ↓
How can I prevent it?
```

---

## 📌 Project Status

Current working capabilities:

- ✅ React frontend
- ✅ Spring Boot backend
- ✅ Local Ollama AI
- ✅ Llama 3.2 3B
- ✅ MCP server
- ✅ `analyze_incident` MCP tool
- ✅ Log upload
- ✅ Sample incidents
- ✅ Root-cause analysis
- ✅ Severity classification
- ✅ Troubleshooting recommendations
- ✅ Impact analysis
- ✅ Prevention recommendations
- ✅ Incident history
- ✅ Severity dashboard
- ✅ Incident report copy/download

---

## 👩‍💻 Development

Built as an AI-powered DevOps incident analysis project using local AI and MCP.

**DevOps Copilot — AI Incident & Root Cause Assistant**
