# DevOps Copilot Frontend

React + Vite frontend for **DevOps Copilot – AI Incident & Root Cause Assistant**.

The frontend provides an easy-to-use interface for submitting application logs and displaying AI-powered incident analysis returned by the Spring Boot backend.

## Technology Stack

* React
* Vite
* JavaScript
* HTML
* CSS
* Browser Local Storage

## Project Structure

```text
devops-copilot-frontend
│
├── src
│   ├── App.jsx
│   ├── main.jsx
│   └── style.css
│
├── package.json
├── package-lock.json
└── README.md
```

## Prerequisites

Install:

* Node.js
* npm

Check Node.js:

```bash
node -v
```

Check npm:

```bash
npm -v
```

## Install Dependencies

Open a terminal inside:

```text
devops-copilot-frontend
```

Run:

```bash
npm install
```

## Start the Frontend

Run:

```bash
npm run dev
```

Then open:

```text
http://localhost:5173
```

## Backend Connection

The frontend sends incident logs to the Spring Boot backend.

API:

```text
POST http://localhost:8081/api/analyze
```

The Spring Boot backend must be running before using **Analyze Incident**.

## Frontend Features

### Log Input

Users can paste:

* Application errors
* Stack traces
* HTTP errors
* Database errors
* Service timeout logs

### Log File Upload

The application supports:

```text
.log
.txt
```

The selected file is read in the browser and its contents are placed into the log editor.

### Sample Incidents

Available sample incidents:

* Database Timeout
* Null Pointer
* HTTP 500
* Service Timeout

### AI Incident Analysis

After clicking **Analyze Incident**, the UI displays:

* Error Type
* Severity
* Possible Root Cause
* Suggested Fix
* Incident Summary
* Troubleshooting Steps
* Impact
* Prevention

### Root Cause Analysis

The result page visually shows:

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

The dashboard displays counts for:

* All Incidents
* Critical
* High
* Medium
* Low

### Incident History

Analyzed incidents are stored in browser `localStorage`.

Users can:

* View previous incidents
* Reopen an incident
* Clear history

### Incident Reports

Users can:

* Copy an incident report
* Download an incident report as a `.txt` file

Example filename:

```text
devops-copilot-incident-report.txt
```

## Testing

### Test Sample Log

1. Open `http://localhost:5173`.
2. Click **Database Timeout**.
3. Click **Analyze Incident**.
4. Verify the incident analysis appears.

### Test File Upload

Create a file named:

```text
test.log
```

Add an application error, upload it, and verify that the log appears in the editor.

### Test History

1. Analyze an incident.
2. Refresh the browser.
3. Verify that the incident remains in **Incident History**.

### Test Reports

After analysis, test:

```text
Copy Report
```

and:

```text
Download Report
```

## Development Commands

Install dependencies:

```bash
npm install
```

Start development server:

```bash
npm run dev
```

Build the application:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Privacy

The frontend stores incident history in browser `localStorage`.

Uploaded `.log` and `.txt` files are read in the browser and their text is sent to the local backend when the user clicks **Analyze Incident**.

For production deployments, appropriate authentication, authorization, log redaction, and data-retention controls should be added.

## Future Enhancements

Possible improvements include:

* Dark mode
* Advanced incident filtering
* Search incident history
* JSON report export
* PDF report export
* Real-time incident monitoring
* Kubernetes dashboard
* CI/CD pipeline view
* Authentication
* Team collaboration
* Voice-based incident interaction

## Current Status

* ✅ React + Vite
* ✅ Log input
* ✅ `.log` upload
* ✅ `.txt` upload
* ✅ Sample incidents
* ✅ Backend REST integration
* ✅ AI result display
* ✅ Root-cause analysis view
* ✅ Severity display
* ✅ Troubleshooting steps
* ✅ Impact display
* ✅ Prevention display
* ✅ Incident dashboard
* ✅ Incident history
* ✅ Browser local storage
* ✅ Copy report
* ✅ Download report
* ✅ Responsive UI

---

**DevOps Copilot — AI Incident & Root Cause Assistant**
