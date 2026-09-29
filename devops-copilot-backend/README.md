# DevOps Copilot Backend

Spring Boot backend for **DevOps Copilot – AI Incident & Root Cause Assistant**.

The backend exposes a REST API for log analysis and an MCP server tool that can be invoked by an MCP-compatible client or agent.

## Technology Stack

- Java 17
- Spring Boot 4.1.1
- Spring Web MVC
- Spring AI
- Spring AI MCP Server
- Ollama
- Llama 3.2 3B
- Maven

## Backend Structure

```text
devops-copilot-backend
├── src
│   ├── main
│   │   ├── java
│   │   │   └── com/devopscopilot
│   │   │       ├── controller
│   │   │       ├── model
│   │   │       ├── service
│   │   │       ├── mcp
│   │   │       ├── DevopsCopilotApplication.java
│   │   │       └── JacksonConfig.java
│   │   └── resources
│   │       └── application.properties
│   └── test
├── pom.xml
└── README.md
```

## Prerequisites

- Java 17 or later
- Ollama
- Llama 3.2 3B model

Check Java:

```bash
java -version
```

Check Ollama:

```bash
ollama --version
```

## Ollama Setup

Pull the model:

```bash
ollama pull llama3.2:3b
```

Start the model:

```bash
ollama run llama3.2:3b
```

Keep Ollama running while using the backend.

The configured Ollama URL is:

```text
http://localhost:11434
```

## Run the Backend

Open the backend project in IntelliJ IDEA and run `DevopsCopilotApplication.java`.

The backend runs on:

```text
http://localhost:8081
```

## Health Check

Open:

```text
http://localhost:8081/api/health
```

Expected response:

```text
DevOps Copilot is running!
```

## REST API

### Analyze Incident

Endpoint:

```text
POST /api/analyze
```

Full local URL:

```text
http://localhost:8081/api/analyze
```

Request body:

```json
{
  "log": "HTTP 500 - Database connection timeout. Could not acquire connection from pool."
}
```

The response contains structured fields for error type, severity, root cause, suggested fix, summary, troubleshooting, impact, prevention, and analysis mode.

## MCP Integration

The backend exposes an MCP server at:

```text
http://localhost:8081/mcp
```

The MCP tool is:

```text
analyze_incident
```

It accepts an application log and returns structured incident analysis.

The tool is implemented in:

```text
src/main/java/com/devopscopilot/mcp/DevOpsMcpTools.java
```

## AI Processing

```text
Application Log
      ↓
Spring Boot REST API
      ↓
LogAnalysisService
      ↓
Spring AI ChatClient
      ↓
Ollama
      ↓
Llama 3.2 3B
      ↓
Structured JSON
      ↓
LogAnalysisResponse
```

## Rule-Based Fallback

If the local AI response cannot be processed, the backend provides rule-based fallback analysis.

Currently recognized patterns include:

- Database connection errors
- HTTP 500 errors
- NullPointerException
- Timeout errors
- Generic application errors

Fallback mode is shown as:

```text
RULE-BASED FALLBACK
```

## Configuration

Configuration is stored in:

```text
src/main/resources/application.properties
```

Current settings include:

```properties
server.port=8081

spring.ai.ollama.base-url=http://localhost:11434
spring.ai.ollama.chat.options.model=llama3.2:3b
spring.ai.ollama.chat.options.temperature=0.2

spring.ai.mcp.server.protocol=STREAMABLE
spring.ai.mcp.server.name=devops-copilot
spring.ai.mcp.server.version=1.0.0
```

## No Paid AI API Required

The current backend uses local Ollama inference. No cloud AI API key is required for the current implementation.

For production use, organizations should still implement authentication, authorization, log redaction, monitoring, auditing, and other security controls.

## Example Log

```text
2026-09-26 10:31:42 ERROR PaymentService
HTTP 500 - Database connection timeout.
Could not acquire connection from pool.
```

The backend can return a structured analysis including:

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

## Backend Flow

```text
React Frontend
      │
      │ POST /api/analyze
      ▼
LogAnalysisController
      │
      ▼
LogAnalysisService
      │
      ├───────────────┐
      │               │
      ▼               ▼
Spring AI          Fallback
      │               │
      ▼               │
Ollama                │
      │               │
      ▼               │
Llama 3.2 3B         │
      │               │
      └───────┬───────┘
              ▼
      LogAnalysisResponse
              │
              ▼
        React Frontend
```

## Future Backend Enhancements

- Persistent incident database
- Authentication and authorization
- Incident correlation
- Kubernetes diagnostics
- CI/CD integration
- Monitoring platform integration
- Automatic incident ingestion
- GitHub/GitLab integration
- Automated remediation
- Enterprise audit logging

## Status

- ✅ Spring Boot backend
- ✅ REST API
- ✅ Local Ollama AI
- ✅ Llama 3.2 3B
- ✅ Spring AI ChatClient
- ✅ MCP server
- ✅ `analyze_incident` MCP tool
- ✅ Structured incident response
- ✅ Rule-based fallback
- ✅ Health endpoint
- ✅ CORS support for React frontend

**DevOps Copilot — AI Incident & Root Cause Assistant**
