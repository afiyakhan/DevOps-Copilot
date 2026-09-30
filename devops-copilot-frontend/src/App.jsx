
import { useEffect, useMemo, useState } from "react";

const sampleLogs = {
  "Database Timeout":
    "2026-09-26 10:31:42 ERROR PaymentService - HTTP 500 - Database connection timeout. Could not acquire connection from pool.",

  "Null Pointer":
    "2026-09-26 11:12:05 ERROR UserService - java.lang.NullPointerException: Cannot invoke method getName() because user is null.",

  "HTTP 500":
    "2026-09-26 12:05:31 ERROR OrderService - HTTP 500 Internal Server Error while processing order request.",

  "Service Timeout":
    "2026-09-26 13:45:22 ERROR PaymentService - Request timed out while waiting for downstream payment service response.",
};

function App() {
  const [log, setLog] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fileName, setFileName] = useState("");
  const [history, setHistory] = useState([]);
  const [copied, setCopied] = useState(false);

  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);

  useEffect(() => {
    const savedHistory = localStorage.getItem("devopsCopilotHistory");

    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch {
        setHistory([]);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "devopsCopilotHistory",
      JSON.stringify(history)
    );
  }, [history]);

  const buildAssistantSummary = (data) => {
    return (
      "I analyzed the incident.\n\n" +
      "Error: " +
      data.errorType +
      "\n" +
      "Severity: " +
      data.severity +
      "\n\n" +
      "Root cause: " +
      data.possibleRootCause +
      "\n\n" +
      "Suggested fix: " +
      data.suggestedFix
    );
  };

  const analyzeLog = async (customLog) => {
    const logToAnalyze =
      customLog !== undefined && customLog !== null
        ? customLog
        : log;

    if (!logToAnalyze || !logToAnalyze.trim()) {
      setError("Please enter an application log.");
      return null;
    }

    setLoading(true);
    setError("");
    setResult(null);
    setCopied(false);

    try {
      const response = await fetch(
        "http://localhost:8081/api/analyze",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            log: logToAnalyze,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Backend returned an error.");
      }

      const data = await response.json();

      setResult(data);

      const historyItem = {
        id: Date.now(),
        date: new Date().toLocaleString(),
        log: logToAnalyze,
        result: data,
      };

      setHistory((previous) => {
        return [historyItem, ...previous];
      });

      return data;
    } catch (err) {
      setError(
        "Unable to connect to DevOps Copilot. Make sure Spring Boot is running on port 8081."
      );

      return null;
    } finally {
      setLoading(false);
    }
  };

  const loadSample = (sampleName) => {
    const name = sampleName || "Database Timeout";
    const selectedLog = sampleLogs[name];

    setLog(selectedLog);
    setFileName("");
    setResult(null);
    setError("");
    setCopied(false);

    setChatMessages([
      {
        role: "assistant",
        text:
          "I loaded the " +
          name +
          " incident.\n\n" +
          "You can ask me to analyze it, explain the root cause, " +
          "describe the impact, suggest a fix, or recommend prevention steps.",
      },
    ]);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];

    if (!file) {
      return;
    }

    const lowerName = file.name.toLowerCase();

    if (
      !lowerName.endsWith(".log") &&
      !lowerName.endsWith(".txt")
    ) {
      setError("Please upload a .log or .txt file.");
      return;
    }

    const reader = new FileReader();

    reader.onload = (eventObject) => {
      const content = eventObject.target.result;

      setLog(content);
      setFileName(file.name);
      setResult(null);
      setError("");
      setCopied(false);

      setChatMessages([
        {
          role: "assistant",
          text:
            "I loaded " +
            file.name +
            ".\n\n" +
            "Ask me to analyze the incident when you are ready.",
        },
      ]);
    };

    reader.onerror = () => {
      setError("Unable to read the selected file.");
    };

    reader.readAsText(file);
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem("devopsCopilotHistory");
  };

  const loadHistoryItem = (item) => {
    setLog(item.log);
    setResult(item.result);
    setFileName("");
    setError("");
    setCopied(false);

    setChatMessages([
      {
        role: "assistant",
        text:
          "I reopened the " +
          (item.result?.errorType || "incident") +
          " analysis.\n\n" +
          "You can ask follow-up questions about this incident.",
      },
    ]);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const createReportText = () => {
    if (!result) {
      return "";
    }

    let troubleshooting = "No troubleshooting steps available.";

    if (
      result.troubleshootingSteps &&
      result.troubleshootingSteps.length > 0
    ) {
      troubleshooting = result.troubleshootingSteps
        .map((step, index) => {
          return index + 1 + ". " + step;
        })
        .join("\n");
    }

    let prevention = "No prevention recommendations available.";

    if (
      result.prevention &&
      result.prevention.length > 0
    ) {
      prevention = result.prevention
        .map((item, index) => {
          return index + 1 + ". " + item;
        })
        .join("\n");
    }

    return [
      "DEVOPS COPILOT - INCIDENT REPORT",
      "",
      "Error Type:",
      result.errorType,
      "",
      "Severity:",
      result.severity,
      "",
      "Possible Root Cause:",
      result.possibleRootCause,
      "",
      "Suggested Fix:",
      result.suggestedFix,
      "",
      "Incident Summary:",
      result.incidentSummary,
      "",
      "Troubleshooting Steps:",
      troubleshooting,
      "",
      "Impact:",
      result.impact || "Not available",
      "",
      "Prevention:",
      prevention,
      "",
      "Analysis Mode:",
      result.analysisMode || "LOCAL AI",
      "",
      "Original Log:",
      log,
    ].join("\n");
  };

  const copyReport = async () => {
    const report = createReportText();

    if (!report) {
      return;
    }

    try {
      await navigator.clipboard.writeText(report);
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      setError("Unable to copy the incident report.");
    }
  };

  const downloadReport = () => {
    const report = createReportText();

    if (!report) {
      return;
    }

    const blob = new Blob([report], {
      type: "text/plain;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "devops-copilot-incident-report.txt";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  const severityStats = useMemo(() => {
    const stats = {
      CRITICAL: 0,
      HIGH: 0,
      MEDIUM: 0,
      LOW: 0,
    };

    history.forEach((item) => {
      const severity = String(
        item.result?.severity || ""
      ).toUpperCase();

      if (stats[severity] !== undefined) {
        stats[severity] = stats[severity] + 1;
      }
    });

    return stats;
  }, [history]);

  const sendChatMessage = async (messageOverride) => {
    const message =
      messageOverride !== undefined && messageOverride !== null
        ? messageOverride.trim()
        : chatInput.trim();

    if (!message) {
      return;
    }

    setChatInput("");

    setChatMessages((previous) => {
      return [
        ...previous,
        {
          role: "user",
          text: message,
        },
      ];
    });

    if (!log || !log.trim()) {
      setChatMessages((previous) => {
        return [
          ...previous,
          {
            role: "assistant",
            text:
              "Please paste or upload an application log first.\n\n" +
              "Then I can analyze the incident and answer your questions.",
          },
        ];
      });

      return;
    }

    setChatLoading(true);
    setError("");

    const lower = message.toLowerCase();

    try {
      let currentResult = result;

      if (!currentResult) {
        currentResult = await analyzeLog(log);
      }

      if (!currentResult) {
        throw new Error("Analysis failed.");
      }

      let responseText = "";

      if (
        lower.includes("root cause") ||
        lower.includes("why")
      ) {
        responseText =
          "The possible root cause is:\n\n" +
          currentResult.possibleRootCause;
      } else if (
        lower.includes("impact") ||
        lower.includes("affect")
      ) {
        responseText =
          "The expected impact is:\n\n" +
          currentResult.impact;
      } else if (
        lower.includes("fix") ||
        lower.includes("solve") ||
        lower.includes("troubleshoot") ||
        lower.includes("solution")
      ) {
        const troubleshooting =
          currentResult.troubleshootingSteps || [];

        responseText =
          "Suggested fix:\n\n" +
          currentResult.suggestedFix +
          "\n\n" +
          "Troubleshooting steps:\n\n" +
          troubleshooting
            .map((step, index) => {
              return index + 1 + ". " + step;
            })
            .join("\n");
      } else if (
        lower.includes("prevent") ||
        lower.includes("future")
      ) {
        const prevention =
          currentResult.prevention || [];

        responseText =
          "Prevention recommendations:\n\n" +
          prevention
            .map((item, index) => {
              return index + 1 + ". " + item;
            })
            .join("\n");
      } else if (
        lower.includes("severity") ||
        lower.includes("serious")
      ) {
        responseText =
          "The detected severity is " +
          currentResult.severity +
          ".";
      } else if (
        lower.includes("summary") ||
        lower.includes("summarize")
      ) {
        responseText =
          "Incident summary:\n\n" +
          currentResult.incidentSummary;
      } else if (
        lower.includes("analy") ||
        lower.includes("incident") ||
        lower.includes("error")
      ) {
        responseText =
          buildAssistantSummary(currentResult);
      } else {
        responseText =
          "I analyzed the current incident.\n\n" +
          "Error: " +
          currentResult.errorType +
          "\n" +
          "Severity: " +
          currentResult.severity +
          "\n\n" +
          "You can ask me about the root cause, impact, " +
          "suggested fix, troubleshooting steps, severity, " +
          "summary, or prevention.";
      }

      setChatMessages((previous) => {
        return [
          ...previous,
          {
            role: "assistant",
            text: responseText,
          },
        ];
      });
    } catch {
      setChatMessages((previous) => {
        return [
          ...previous,
          {
            role: "assistant",
            text:
              "I could not complete the incident analysis.\n\n" +
              "Please make sure Spring Boot and Ollama are running.",
          },
        ];
      });
    } finally {
      setChatLoading(false);
    }
  };

  const quickChat = (message) => {
    sendChatMessage(message);
  };

  const steps = result?.troubleshootingSteps || [];
  const prevention = result?.prevention || [];

  return (
    <div className="page">
      <header className="hero">
        <div>
          <div className="badge">
            DEVOPS COPILOT
          </div>

          <h1>
            AI Incident & Root Cause Assistant
          </h1>

          <p>
            Analyze application incidents with local AI,
            MCP-powered tooling and a conversational Alexa+
            style experience.
          </p>
        </div>

        <div className="hero-status">
          <span className="dot"></span>
          Local AI + MCP Ready
        </div>
      </header>

      <main className="content">
        <section className="panel alexa-panel">
          <div className="alexa-header">
            <div>
              <div className="eyebrow">
                CONVERSATIONAL INCIDENT ASSISTANT
              </div>

              <h2>
                ✦ DevOps Copilot
              </h2>

              <p>
                Alexa+ style conversational web experience
                for incident investigation.
              </p>
            </div>

            <div className="alexa-badge">
              SIMULATED ALEXA+ EXPERIENCE
            </div>
          </div>

          <div className="chat-window">
            {chatMessages.length === 0 ? (
              <div className="chat-empty">
                <div className="chat-icon">
                  ✦
                </div>

                <h3>
                  How can I help with your incident?
                </h3>

                <p>
                  Load or upload a log, then ask a
                  question about the incident.
                </p>
              </div>
            ) : (
              chatMessages.map((message, index) => (
                <div
                  className={"chat-message " + message.role}
                  key={index}
                >
                  <div className="chat-avatar">
                    {message.role === "user" ? "U" : "✦"}
                  </div>

                  <div className="chat-bubble">
                    {message.text}
                  </div>
                </div>
              ))
            )}

            {chatLoading && (
              <div className="chat-message assistant">
                <div className="chat-avatar">
                  ✦
                </div>

                <div className="chat-bubble typing">
                  Analyzing incident...
                </div>
              </div>
            )}
          </div>

          <div className="quick-actions">
            <button
              className="quick-chip"
              onClick={() =>
                quickChat("Analyze this incident")
              }
            >
              Analyze incident
            </button>

            <button
              className="quick-chip"
              onClick={() =>
                quickChat("What is the root cause?")
              }
            >
              Root cause
            </button>

            <button
              className="quick-chip"
              onClick={() =>
                quickChat("What is the impact?")
              }
            >
              Impact
            </button>

            <button
              className="quick-chip"
              onClick={() =>
                quickChat("How do I fix this?")
              }
            >
              Fix
            </button>

            <button
              className="quick-chip"
              onClick={() =>
                quickChat("How can I prevent this?")
              }
            >
              Prevention
            </button>
          </div>

          <div className="chat-input-row">
            <input
              value={chatInput}
              onChange={(event) =>
                setChatInput(event.target.value)
              }
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  sendChatMessage();
                }
              }}
              placeholder="Ask about the incident..."
            />

            <button
              className="primary chat-send"
              onClick={() => sendChatMessage()}
              disabled={chatLoading}
            >
              {chatLoading ? "..." : "Send"}
            </button>
          </div>
        </section>

        <section className="panel">
          <div className="panel-title">
            <div>
              <h2>
                Analyze Application Log
              </h2>

              <p>
                Upload a .log/.txt file, paste an
                error, or try a sample incident.
              </p>
            </div>

            <button
              className="secondary"
              onClick={() =>
                loadSample("Database Timeout")
              }
            >
              Load Sample
            </button>
          </div>

          <div className="sample-area">
            <span className="sample-label">
              Sample Logs:
            </span>

            {Object.keys(sampleLogs).map(
              (sampleName) => (
                <button
                  key={sampleName}
                  className="sample-chip"
                  onClick={() =>
                    loadSample(sampleName)
                  }
                >
                  {sampleName}
                </button>
              )
            )}
          </div>

          <div className="upload-area">
            <label className="upload-button">
              📁 Upload Log File

              <input
                type="file"
                accept=".log,.txt,text/plain"
                onChange={handleFileUpload}
                hidden
              />
            </label>

            {fileName && (
              <span className="file-name">
                Selected: {fileName}
              </span>
            )}
          </div>

          <textarea
            value={log}
            onChange={(event) => {
              setLog(event.target.value);
              setFileName("");
            }}
            placeholder="Paste your application error, stack trace, or service log here..."
            rows={12}
          />

          <button
            className="primary"
            onClick={() => analyzeLog()}
            disabled={loading}
          >
            {loading
              ? "Analyzing incident..."
              : "Analyze Incident"}
          </button>

          {error && (
            <div className="error">
              {error}
            </div>
          )}
        </section>

        {result && (
          <section className="panel result">
            <div className="result-header">
              <div>
                <div className="eyebrow">
                  INCIDENT ANALYSIS
                </div>

                <h2>
                  {result.errorType}
                </h2>
              </div>

              <div
                className={
                  "severity " +
                  String(result.severity || "").toLowerCase()
                }
              >
                {result.severity}
              </div>
            </div>

            <div className="root-chain">
              <div className="chain-title">
                Root Cause Analysis
              </div>

              <div className="chain">
                <div className="chain-item">
                  <span>📄</span>
                  <strong>
                    Log
                  </strong>
                  <small>
                    Detected incident
                  </small>
                </div>

                <div className="chain-arrow">
                  →
                </div>

                <div className="chain-item">
                  <span>🚨</span>
                  <strong>
                    {result.errorType}
                  </strong>
                  <small>
                    Error detected
                  </small>
                </div>

                <div className="chain-arrow">
                  →
                </div>

                <div className="chain-item">
                  <span>🔍</span>
                  <strong>
                    Root Cause
                  </strong>
                  <small>
                    {result.possibleRootCause}
                  </small>
                </div>

                <div className="chain-arrow">
                  →
                </div>

                <div className="chain-item">
                  <span>🛠️</span>
                  <strong>
                    Fix
                  </strong>
                  <small>
                    {result.suggestedFix}
                  </small>
                </div>
              </div>
            </div>

            <div className="grid">
              <article className="result-box wide">
                <h3>
                  🔍 Possible Root Cause
                </h3>

                <p>
                  {result.possibleRootCause}
                </p>
              </article>

              <article className="result-box">
                <h3>
                  🛠️ Suggested Fix
                </h3>

                <p>
                  {result.suggestedFix}
                </p>
              </article>

              <article className="result-box">
                <h3>
                  📋 Incident Summary
                </h3>

                <p>
                  {result.incidentSummary}
                </p>
              </article>

              <article className="result-box wide">
                <h3>
                  🔧 Troubleshooting Steps
                </h3>

                {steps.length > 0 ? (
                  <ol className="steps">
                    {steps.map((step, index) => (
                      <li key={index}>
                        {step}
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p>
                    No troubleshooting steps available.
                  </p>
                )}
              </article>

              <article className="result-box">
                <h3>
                  ⚠️ Impact
                </h3>

                <p>
                  {result.impact ||
                    "Impact information is not available."}
                </p>
              </article>

              <article className="result-box">
                <h3>
                  🛡️ Prevention
                </h3>

                {prevention.length > 0 ? (
                  <ul className="prevention">
                    {prevention.map((item, index) => (
                      <li key={index}>
                        {item}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>
                    No prevention recommendations available.
                  </p>
                )}
              </article>
            </div>

            <div className="report-actions">
              <button
                className="secondary"
                onClick={copyReport}
              >
                {copied
                  ? "✓ Report Copied"
                  : "📋 Copy Report"}
              </button>

              <button
                className="secondary"
                onClick={downloadReport}
              >
                ⬇️ Download Report
              </button>
            </div>

            <div className="mode">
              Analysis mode:{" "}
              <strong>
                {result.analysisMode || "LOCAL AI"}
              </strong>
            </div>
          </section>
        )}

        <section className="panel">
          <div className="panel-title">
            <div>
              <h2>
                Incident Dashboard
              </h2>

              <p>
                Severity overview from analyzed
                incidents stored in this browser.
              </p>
            </div>
          </div>

          <div className="dashboard-grid">
            <div className="dashboard-card">
              <span>
                All Incidents
              </span>

              <strong>
                {history.length}
              </strong>
            </div>

            <div className="dashboard-card">
              <span>
                Critical
              </span>

              <strong>
                {severityStats.CRITICAL}
              </strong>
            </div>

            <div className="dashboard-card">
              <span>
                High
              </span>

              <strong>
                {severityStats.HIGH}
              </strong>
            </div>

            <div className="dashboard-card">
              <span>
                Medium
              </span>

              <strong>
                {severityStats.MEDIUM}
              </strong>
            </div>

            <div className="dashboard-card">
              <span>
                Low
              </span>

              <strong>
                {severityStats.LOW}
              </strong>
            </div>
          </div>
        </section>

        <section className="panel">
          <div className="panel-title">
            <div>
              <h2>
                Incident History
              </h2>

              <p>
                Previously analyzed incidents are
                saved locally in your browser.
              </p>
            </div>

            {history.length > 0 && (
              <button
                className="secondary"
                onClick={clearHistory}
              >
                Clear History
              </button>
            )}
          </div>

          {history.length === 0 ? (
            <div className="empty-history">
              <div className="empty-icon">
                🕘
              </div>

              <h3>
                No incidents yet
              </h3>

              <p>
                Analyze your first application log
                and it will appear here.
              </p>
            </div>
          ) : (
            <div className="history-list">
              {history.map((item) => (
                <div
                  className="history-item"
                  key={item.id}
                >
                  <div className="history-info">
                    <div className="history-top">
                      <strong>
                        {item.result?.errorType ||
                          "Application Error"}
                      </strong>

                      <span
                        className={
                          "severity-small " +
                          String(
                            item.result?.severity || ""
                          ).toLowerCase()
                        }
                      >
                        {item.result?.severity}
                      </span>
                    </div>

                    <small>
                      {item.date}
                    </small>

                    <p>
                      {item.result?.incidentSummary}
                    </p>
                  </div>

                  <button
                    className="secondary"
                    onClick={() =>
                      loadHistoryItem(item)
                    }
                  >
                    View
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="technology">
          <div>
            <strong>
              ✦ Alexa+ Experience
            </strong>

            <span>
              Conversational Web Simulation
            </span>
          </div>

          <div>
            <strong>
              🧠 Local AI
            </strong>

            <span>
              Ollama + Llama 3.2
            </span>
          </div>

          <div>
            <strong>
              ⚙️ Backend
            </strong>

            <span>
              Spring Boot
            </span>
          </div>

          <div>
            <strong>
              🔗 MCP
            </strong>

            <span>
              Streamable HTTP
            </span>
          </div>

          <div>
            <strong>
              ⚛️ Frontend
            </strong>

            <span>
              React + Vite
            </span>
          </div>
        </section>
      </main>

      <footer>
        DevOps Copilot • React + Spring Boot +
        Ollama + MCP
      </footer>
    </div>
  );
}

export default App;

