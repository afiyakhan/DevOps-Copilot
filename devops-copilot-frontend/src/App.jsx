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

  const analyzeLog = async () => {
    if (!log.trim()) {
      setError("Please enter an application log.");
      return;
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
          body: JSON.stringify({ log }),
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
        log: log,
        result: data,
      };

      setHistory((previous) => [
        historyItem,
        ...previous,
      ]);
    } catch (err) {
      setError(
        "Unable to connect to DevOps Copilot. Make sure Spring Boot is running on port 8081."
      );
    } finally {
      setLoading(false);
    }
  };

  const loadSample = (sampleName = "Database Timeout") => {
    setLog(sampleLogs[sampleName]);
    setFileName("");
    setResult(null);
    setError("");
    setCopied(false);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];

    if (!file) {
      return;
    }

    if (
      !file.name.toLowerCase().endsWith(".log") &&
      !file.name.toLowerCase().endsWith(".txt")
    ) {
      setError("Please upload a .log or .txt file.");
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      setLog(e.target.result);
      setFileName(file.name);
      setResult(null);
      setError("");
      setCopied(false);
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

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const createReportText = () => {
    if (!result) {
      return "";
    }

    const troubleshooting =
      result.troubleshootingSteps?.length > 0
        ? result.troubleshootingSteps
            .map((step, index) => `${index + 1}. ${step}`)
            .join("\n")
        : "No troubleshooting steps available.";

    const prevention =
      result.prevention?.length > 0
        ? result.prevention
            .map((item, index) => `${index + 1}. ${item}`)
            .join("\n")
        : "No prevention recommendations available.";

    return `
DEVOPS COPILOT - INCIDENT REPORT

Error Type:
${result.errorType}

Severity:
${result.severity}

Possible Root Cause:
${result.possibleRootCause}

Suggested Fix:
${result.suggestedFix}

Incident Summary:
${result.incidentSummary}

Troubleshooting Steps:
${troubleshooting}

Impact:
${result.impact || "Not available"}

Prevention:
${prevention}

Analysis Mode:
${result.analysisMode || "LOCAL AI"}

Original Log:
${log}
`.trim();
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
        stats[severity]++;
      }
    });

    return stats;
  }, [history]);

  const steps = result?.troubleshootingSteps || [];

  const prevention = result?.prevention || [];

  return (
    <div className="page">

      {/* ================= HEADER ================= */}

      <header className="hero">
        <div>
          <div className="badge">
            DEVOPS COPILOT
          </div>

          <h1>
            AI Incident & Root Cause Assistant
          </h1>

          <p>
            Upload or paste an application log and get
            AI-powered incident analysis, probable root
            cause, severity, troubleshooting and prevention.
          </p>
        </div>

        <div className="hero-status">
          <span className="dot"></span>
          Local AI + MCP Ready
        </div>
      </header>

      <main className="content">

        {/* ================= ANALYZER ================= */}

        <section className="panel">

          <div className="panel-title">

            <div>
              <h2>
                Analyze Application Log
              </h2>

              <p>
                Upload a .log/.txt file, paste an error,
                or try one of the sample incidents.
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

          {/* Sample buttons */}

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

          {/* Upload */}

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

          {/* Log textarea */}

          <textarea
            value={log}
            onChange={(e) => {
              setLog(e.target.value);
              setFileName("");
            }}
            placeholder="Paste your application error, stack trace, or service log here..."
            rows={12}
          />

          {/* Analyze */}

          <button
            className="primary"
            onClick={analyzeLog}
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

        {/* ================= RESULT ================= */}

        {result && (
          <section className="panel result">

            {/* Result Header */}

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
                className={`severity ${String(
                  result.severity || ""
                ).toLowerCase()}`}
              >
                {result.severity}
              </div>

            </div>

            {/* ================= VISUAL ROOT CAUSE CHAIN ================= */}

            <div className="root-chain">

              <div className="chain-title">
                Root Cause Analysis
              </div>

              <div className="chain">

                <div className="chain-item">
                  <span>📄</span>
                  <strong>Log</strong>
                  <small>Detected incident</small>
                </div>

                <div className="chain-arrow">
                  →
                </div>

                <div className="chain-item">
                  <span>🚨</span>
                  <strong>
                    {result.errorType}
                  </strong>
                  <small>Error detected</small>
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
                  <strong>Fix</strong>
                  <small>
                    {result.suggestedFix}
                  </small>
                </div>

              </div>

            </div>

            {/* ================= MAIN RESULT GRID ================= */}

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

              {/* Troubleshooting */}

              <article className="result-box wide">

                <h3>
                  🔧 Troubleshooting Steps
                </h3>

                {steps.length > 0 ? (
                  <ol className="steps">
                    {steps.map(
                      (step, index) => (
                        <li key={index}>
                          {step}
                        </li>
                      )
                    )}
                  </ol>
                ) : (
                  <p>
                    No troubleshooting steps
                    available.
                  </p>
                )}

              </article>

              {/* Impact */}

              <article className="result-box">

                <h3>
                  ⚠️ Impact
                </h3>

                <p>
                  {result.impact ||
                    "Impact information is not available."}
                </p>

              </article>

              {/* Prevention */}

              <article className="result-box">

                <h3>
                  🛡️ Prevention
                </h3>

                {prevention.length > 0 ? (
                  <ul className="prevention">
                    {prevention.map(
                      (item, index) => (
                        <li key={index}>
                          {item}
                        </li>
                      )
                    )}
                  </ul>
                ) : (
                  <p>
                    No prevention recommendations
                    available.
                  </p>
                )}

              </article>

            </div>

            {/* ================= REPORT ACTIONS ================= */}

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

            {/* Analysis mode */}

            <div className="mode">
              Analysis mode:{" "}
              <strong>
                {result.analysisMode ||
                  "LOCAL AI"}
              </strong>
            </div>

          </section>
        )}

        {/* ================= SEVERITY DASHBOARD ================= */}

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
              <span>All Incidents</span>
              <strong>
                {history.length}
              </strong>
            </div>

            <div className="dashboard-card">
              <span>Critical</span>
              <strong>
                {severityStats.CRITICAL}
              </strong>
            </div>

            <div className="dashboard-card">
              <span>High</span>
              <strong>
                {severityStats.HIGH}
              </strong>
            </div>

            <div className="dashboard-card">
              <span>Medium</span>
              <strong>
                {severityStats.MEDIUM}
              </strong>
            </div>

            <div className="dashboard-card">
              <span>Low</span>
              <strong>
                {severityStats.LOW}
              </strong>
            </div>

          </div>

        </section>

        {/* ================= HISTORY ================= */}

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
                        className={`severity-small ${String(
                          item.result?.severity ||
                            ""
                        ).toLowerCase()}`}
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

        {/* ================= TECHNOLOGY ================= */}

        <section className="technology">

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
              Model Context Protocol
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
        DevOps Copilot • Spring Boot + React +
        Ollama + MCP
      </footer>

    </div>
  );
}

export default App;