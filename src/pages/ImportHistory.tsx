import { useEffect, useState } from "react";
import axios from "axios";

interface ImportLog {
  id: string;
  filename: string;
  importedAt: string;
  totalRows: number;
  imported: number;
  skipped: number;
  flagged: number;
}

export default function ImportHistory() {
  const [logs, setLogs] = useState<ImportLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/api/imports");
      setLogs(res.data);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Failed to load import history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  if (loading) {
    return (
      <div style={styles.centerContainer}>
        <div style={styles.spinner}></div>
        <p style={{ marginTop: "16px", color: "var(--text)", fontFamily: "var(--sans)" }}>Loading import logs...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.centerContainer}>
        <div style={styles.errorCard}>
          <h3 style={{ color: "#ef4444", margin: "0 0 10px 0", fontFamily: "var(--heading)" }}>Data Load Failed</h3>
          <p style={{ color: "var(--text)", marginBottom: "16px", fontFamily: "var(--sans)" }}>{error}</p>
          <button style={styles.primaryButton} onClick={fetchHistory}>
            Retry Load
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.historyContainer}>
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>Import Logs History</h1>
          <p style={styles.subtitle}>Audit logs of all CSV uploads, row import counts, and parsing flags.</p>
        </div>
        <button style={styles.refreshButton} onClick={fetchHistory}>
          <svg style={styles.refreshIcon} viewBox="0 0 24 24">
            <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
          </svg>
          Sync History
        </button>
      </header>

      {logs.length === 0 ? (
        <div style={styles.emptyState}>
          <p style={{ color: "var(--text)", marginBottom: "8px" }}>No import log entries found in the database.</p>
          <p style={{ fontSize: "14px", color: "var(--text)" }}>Imported sheets will automatically register audit logs here.</p>
        </div>
      ) : (
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Date & Time</th>
                <th style={styles.th}>Filename</th>
                <th style={{ ...styles.th, textAlign: "center" }}>Total Rows</th>
                <th style={{ ...styles.th, textAlign: "center" }}>Imported Successfully</th>
                <th style={{ ...styles.th, textAlign: "center" }}>Skipped</th>
                <th style={{ ...styles.th, textAlign: "center" }}>Flagged Issues</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => {
                const date = log.importedAt ? new Date(log.importedAt).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit"
                }) : "N/A";
                
                return (
                  <tr key={log.id} style={styles.tr} className="history-table-row">
                    <td style={{ ...styles.td, color: "var(--text-h)", fontWeight: 500 }}>{date}</td>
                    <td style={{ ...styles.td, color: "var(--text-h)" }}>
                      <span style={styles.fileIcon}>📄</span> {log.filename}
                    </td>
                    <td style={{ ...styles.td, textAlign: "center", fontWeight: 600 }}>{log.totalRows}</td>
                    <td style={{ ...styles.td, textAlign: "center" }}>
                      <span style={{
                        ...styles.statusBadge,
                        color: "#10b981",
                        background: "rgba(16, 185, 129, 0.1)"
                      }}>
                        {log.imported} rows
                      </span>
                    </td>
                    <td style={{ ...styles.td, textAlign: "center" }}>
                      <span style={{
                        ...styles.statusBadge,
                        color: log.skipped > 0 ? "#ef4444" : "var(--text)",
                        background: log.skipped > 0 ? "rgba(239, 68, 68, 0.1)" : "var(--social-bg)"
                      }}>
                        {log.skipped} rows
                      </span>
                    </td>
                    <td style={{ ...styles.td, textAlign: "center" }}>
                      <span style={{
                        ...styles.statusBadge,
                        color: log.flagged > 0 ? "#f59e0b" : "var(--text)",
                        background: log.flagged > 0 ? "rgba(245, 158, 11, 0.1)" : "var(--social-bg)"
                      }}>
                        {log.flagged} flagged
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  historyContainer: {
    padding: "40px",
    display: "flex",
    flexDirection: "column",
    gap: "32px",
    textAlign: "left",
    background: "var(--bg)",
    minHeight: "100%",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "16px",
  },
  title: {
    fontFamily: "var(--heading)",
    fontSize: "36px",
    fontWeight: 700,
    margin: 0,
    color: "var(--text-h)",
    letterSpacing: "-1px",
  },
  subtitle: {
    margin: "8px 0 0 0",
    color: "var(--text)",
    fontSize: "16px",
    fontFamily: "var(--sans)",
  },
  refreshButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 18px",
    background: "var(--social-bg)",
    border: "1px solid var(--border)",
    borderRadius: "10px",
    color: "var(--text-h)",
    fontWeight: 500,
    fontSize: "14px",
    cursor: "pointer",
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
    fontFamily: "var(--sans)",
  },
  refreshIcon: {
    width: "16px",
    height: "16px",
    fill: "currentColor",
  },
  emptyState: {
    padding: "60px 20px",
    textAlign: "center",
    border: "1.5px dashed var(--border)",
    borderRadius: "16px",
    background: "var(--code-bg)",
    fontFamily: "var(--sans)",
  },
  tableWrapper: {
    width: "100%",
    overflowX: "auto",
    borderRadius: "14px",
    border: "1px solid var(--border)",
    background: "var(--code-bg)",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "15px",
    fontFamily: "var(--sans)",
  },
  th: {
    padding: "16px 20px",
    background: "var(--social-bg)",
    borderBottom: "1px solid var(--border)",
    color: "var(--text-h)",
    fontWeight: 600,
    fontSize: "14px",
  },
  tr: {
    borderBottom: "1px solid var(--border)",
    transition: "background-color 0.2s ease",
  },
  td: {
    padding: "16px 20px",
    color: "var(--text)",
    verticalAlign: "middle",
  },
  fileIcon: {
    marginRight: "6px",
    fontSize: "16px",
  },
  statusBadge: {
    display: "inline-flex",
    alignItems: "center",
    padding: "4px 10px",
    borderRadius: "30px",
    fontSize: "13px",
    fontWeight: 500,
  },
  centerContainer: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "400px",
    width: "100%",
  },
  spinner: {
    width: "40px",
    height: "40px",
    border: "3px solid var(--border)",
    borderTop: "3px solid var(--accent)",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  errorCard: {
    padding: "32px",
    background: "var(--code-bg)",
    border: "1px solid #fecaca",
    borderRadius: "16px",
    textAlign: "center",
    maxWidth: "400px",
  },
  primaryButton: {
    padding: "10px 20px",
    background: "var(--accent)",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontWeight: 600,
    cursor: "pointer",
    transition: "opacity 0.2s ease",
    fontFamily: "var(--sans)",
  },
};

// Add standard inline animations injection style block dynamically
if (typeof document !== "undefined") {
  const styleEl = document.createElement("style");
  styleEl.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    .history-table-row:hover {
      background-color: var(--social-bg) !important;
    }
  `;
  document.head.appendChild(styleEl);
}
