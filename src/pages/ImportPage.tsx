import { useState, useRef } from "react";
import type { DragEvent, ChangeEvent } from "react";
import Papa from "papaparse";
import axios from "axios";
import API_URL from "../services/api";

interface Row {
  [key: string]: string;
}

interface Anomaly {
  row: number;
  type: string;
  message: string;
  color: string;
}

type ImportStatus = "idle" | "loading" | "success" | "error";

export default function ImportPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [filename, setFilename] = useState<string>("");
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [dragging, setDragging] = useState(false);
  const [importStatus, setImportStatus] = useState<ImportStatus>("idle");
  const [importResult, setImportResult] = useState<{ imported: number; skipped: number } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parseFile = (file: File) => {
    setFilename(file.name);
    setImportStatus("idle");
    setImportResult(null);
    setErrorMsg("");

    Papa.parse<Row>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data;
        setRows(data);

        const found: Anomaly[] = [];
        const seen = new Set<string>();

        data.forEach((row, i) => {
          const rowNum = i + 1;
          const cleanAmt = String(row.amount || "").replace(/[₹$,\s]/g, "");
          const amt = Number(cleanAmt);
          const key = `${row.date}-${row.description}-${amt}-${row.paid_by}`;

          if (!row.paid_by?.trim()) {
            found.push({ row: rowNum, type: "Missing Payer", message: `Row ${rowNum}: No payer name`, color: "#ef4444" });
          }
          if (isNaN(amt) || amt <= 0) {
            found.push({ row: rowNum, type: "Invalid Amount", message: `Row ${rowNum}: "${row.amount}"`, color: "#f59e0b" });
          }
          if (seen.has(key)) {
            found.push({ row: rowNum, type: "Duplicate", message: `Row ${rowNum}: Duplicate entry`, color: "#8b5cf6" });
          } else {
            seen.add(key);
          }
          if (row.currency === "USD") {
            found.push({ row: rowNum, type: "USD Currency", message: `Row ${rowNum}: Foreign currency`, color: "#06b6d4" });
          }
          if (row.description?.toLowerCase().includes("settlement")) {
            found.push({ row: rowNum, type: "Settlement", message: `Row ${rowNum}: Settlement row`, color: "#10b981" });
          }
        });

        setAnomalies(found);
      },
    });
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.name.endsWith(".csv")) parseFile(file);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) parseFile(file);
  };

  const handleSave = async () => {
    if (!rows.length) return;
    setImportStatus("loading");
    try {
      const res = await axios.post(`${API_URL}/api/import`, {
        rows,
        filename,
        flagged: anomalies.length,
      });
      setImportResult({ imported: res.data.imported, skipped: res.data.skipped });
      setImportStatus("success");
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Unknown error";
      setErrorMsg(typeof msg === "string" ? msg : JSON.stringify(msg));
      setImportStatus("error");
    }
  };

  const countByType = (type: string) => anomalies.filter((a) => a.type === type).length;
  const missingPayer = countByType("Missing Payer");
  const invalidAmt = countByType("Invalid Amount");
  const duplicates = countByType("Duplicate");
  const usdRows = countByType("USD Currency");
  const settlements = countByType("Settlement");
  const cleanRows = rows.length - new Set(anomalies.map((a) => a.row)).size;

  const previewCols = rows.length > 0 ? Object.keys(rows[0]).slice(0, 5) : [];
  const previewRows = rows.slice(0, 5);

  return (
    <div style={s.page}>
      {/* Page Header */}
      <header style={s.header}>
        <div>
          <h1 style={s.title}>CSV Import</h1>
          <p style={s.subtitle}>Upload your expense CSV and validate before saving to the database.</p>
        </div>
        {rows.length > 0 && (
          <div style={s.fileBadge}>
            <span style={s.fileIcon}>📄</span>
            <span style={s.fileName}>{filename}</span>
            <span style={s.fileMeta}>{rows.length} rows</span>
          </div>
        )}
      </header>

      {/* Drop Zone */}
      <div
        style={{
          ...s.dropZone,
          ...(dragging ? s.dropZoneActive : {}),
          ...(rows.length > 0 ? s.dropZoneFilled : {}),
        }}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          style={{ display: "none" }}
          onChange={handleChange}
        />
        {rows.length === 0 ? (
          <>
            <div style={s.dropIcon}>{dragging ? "📂" : "☁️"}</div>
            <p style={s.dropTitle}>{dragging ? "Drop it!" : "Drag & drop your CSV file"}</p>
            <p style={s.dropHint}>or click to browse — only .csv files accepted</p>
            <div style={s.dropButton}>Browse File</div>
          </>
        ) : (
          <>
            <div style={s.dropIcon}>✅</div>
            <p style={s.dropTitle}>{filename}</p>
            <p style={s.dropHint}>{rows.length} rows parsed · click to replace</p>
          </>
        )}
      </div>

      {/* Parsed Stats + Anomalies */}
      {rows.length > 0 && (
        <>
          {/* Stats Row */}
          <div style={s.statsGrid}>
            <div style={s.statCard}>
              <div style={s.statValue}>{rows.length}</div>
              <div style={s.statLabel}>Total Rows</div>
            </div>
            <div style={{ ...s.statCard, borderLeft: "3px solid #10b981" }}>
              <div style={{ ...s.statValue, color: "#10b981" }}>{cleanRows}</div>
              <div style={s.statLabel}>Clean Rows</div>
            </div>
            <div style={{ ...s.statCard, borderLeft: "3px solid #f59e0b" }}>
              <div style={{ ...s.statValue, color: "#f59e0b" }}>{anomalies.length}</div>
              <div style={s.statLabel}>Anomalies</div>
            </div>
            <div style={{ ...s.statCard, borderLeft: "3px solid #8b5cf6" }}>
              <div style={{ ...s.statValue, color: "#8b5cf6" }}>{duplicates}</div>
              <div style={s.statLabel}>Duplicates</div>
            </div>
          </div>

          {/* Anomaly Badges */}
          {anomalies.length > 0 && (
            <section style={s.anomalySection}>
              <h2 style={s.sectionTitle}>⚠️ Anomaly Detection</h2>
              <div style={s.badgeRow}>
                {missingPayer > 0 && <span style={{ ...s.badge, background: "rgba(239,68,68,0.1)", color: "#ef4444" }}>👤 Missing Payer — {missingPayer}</span>}
                {invalidAmt > 0 && <span style={{ ...s.badge, background: "rgba(245,158,11,0.1)", color: "#f59e0b" }}>⚠️ Invalid Amount — {invalidAmt}</span>}
                {duplicates > 0 && <span style={{ ...s.badge, background: "rgba(139,92,246,0.1)", color: "#8b5cf6" }}>🔁 Duplicates — {duplicates}</span>}
                {usdRows > 0 && <span style={{ ...s.badge, background: "rgba(6,182,212,0.1)", color: "#06b6d4" }}>💵 USD Currency — {usdRows}</span>}
                {settlements > 0 && <span style={{ ...s.badge, background: "rgba(16,185,129,0.1)", color: "#10b981" }}>💸 Settlements — {settlements}</span>}
              </div>

              {/* Anomaly Detail List */}
              <div style={s.anomalyList}>
                {anomalies.slice(0, 8).map((a, i) => (
                  <div key={i} style={s.anomalyRow}>
                    <span style={{ ...s.anomalyDot, background: a.color }} />
                    <span style={{ ...s.anomalyType, color: a.color }}>{a.type}</span>
                    <span style={s.anomalyMsg}>{a.message}</span>
                  </div>
                ))}
                {anomalies.length > 8 && (
                  <p style={{ color: "var(--text)", fontSize: "13px", marginTop: "8px", fontFamily: "var(--sans)" }}>
                    +{anomalies.length - 8} more anomalies…
                  </p>
                )}
              </div>
            </section>
          )}

          {/* Preview Table */}
          <section>
            <h2 style={s.sectionTitle}>👁️ Data Preview <span style={{ fontSize: "14px", fontWeight: 400, color: "var(--text)" }}>(first 5 rows)</span></h2>
            <div style={s.tableWrapper}>
              <table style={s.table}>
                <thead>
                  <tr>
                    <th style={s.th}>#</th>
                    {previewCols.map((col) => (
                      <th key={col} style={s.th}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewRows.map((row, i) => (
                    <tr key={i} style={s.tr} className="import-preview-row">
                      <td style={{ ...s.td, color: "var(--text)", fontSize: "12px" }}>{i + 1}</td>
                      {previewCols.map((col) => (
                        <td key={col} style={s.td}>{row[col] || <span style={{ color: "var(--text)", opacity: 0.4 }}>—</span>}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Save Button + Result */}
          <div style={s.saveSection}>
            {importStatus === "success" && importResult && (
              <div style={s.successBanner}>
                <span style={{ fontSize: "20px" }}>🎉</span>
                <div>
                  <strong style={{ color: "#10b981", fontFamily: "var(--sans)" }}>Import Successful!</strong>
                  <p style={{ margin: "4px 0 0 0", fontSize: "14px", color: "var(--text)", fontFamily: "var(--sans)" }}>
                    {importResult.imported} rows saved · {importResult.skipped} skipped · Import log updated
                  </p>
                </div>
              </div>
            )}

            {importStatus === "error" && (
              <div style={s.errorBanner}>
                <span style={{ fontSize: "20px" }}>❌</span>
                <div>
                  <strong style={{ color: "#ef4444", fontFamily: "var(--sans)" }}>Import Failed</strong>
                  <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "var(--text)", fontFamily: "var(--mono)" }}>{errorMsg}</p>
                </div>
              </div>
            )}

            <button
              style={{
                ...s.saveButton,
                ...(importStatus === "loading" ? s.saveButtonLoading : {}),
                ...(importStatus === "success" ? s.saveButtonSuccess : {}),
              }}
              onClick={handleSave}
              disabled={importStatus === "loading" || rows.length === 0}
            >
              {importStatus === "loading" && <span style={s.btnSpinner} />}
              {importStatus === "idle" && "💾 Save to Database"}
              {importStatus === "loading" && "Importing…"}
              {importStatus === "success" && "✅ Saved Successfully"}
              {importStatus === "error" && "🔁 Retry Import"}
            </button>

            {rows.length > 0 && importStatus === "idle" && (
              <p style={s.saveHint}>
                {cleanRows} clean rows will be saved · {anomalies.length} anomalous rows will be skipped
              </p>
            )}
          </div>
        </>
      )}

      {/* Styles injected once */}
      <style>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .import-preview-row:hover td { background: var(--social-bg) !important; }
      `}</style>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  page: {
    padding: "40px",
    display: "flex",
    flexDirection: "column",
    gap: "32px",
    maxWidth: "960px",
    margin: "0 auto",
    width: "100%",
    boxSizing: "border-box",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
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
    fontSize: "15px",
    fontFamily: "var(--sans)",
  },
  fileBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 16px",
    background: "var(--code-bg)",
    border: "1px solid var(--border)",
    borderRadius: "10px",
    fontFamily: "var(--sans)",
    fontSize: "14px",
  },
  fileIcon: { fontSize: "16px" },
  fileName: { color: "var(--text-h)", fontWeight: 500, maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
  fileMeta: { color: "var(--text)", fontSize: "12px", background: "var(--social-bg)", padding: "2px 8px", borderRadius: "20px" },

  // Drop Zone
  dropZone: {
    border: "2px dashed var(--border)",
    borderRadius: "20px",
    padding: "60px 32px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "12px",
    cursor: "pointer",
    background: "var(--code-bg)",
    transition: "all 0.25s ease",
    textAlign: "center",
  },
  dropZoneActive: {
    border: "2px dashed var(--accent)",
    background: "rgba(168,85,247,0.05)",
    transform: "scale(1.01)",
  },
  dropZoneFilled: {
    padding: "32px",
    border: "2px dashed #10b981",
    background: "rgba(16,185,129,0.03)",
  },
  dropIcon: { fontSize: "48px", lineHeight: 1 },
  dropTitle: {
    fontFamily: "var(--heading)",
    fontSize: "20px",
    fontWeight: 600,
    color: "var(--text-h)",
    margin: 0,
  },
  dropHint: {
    fontFamily: "var(--sans)",
    fontSize: "14px",
    color: "var(--text)",
    margin: 0,
  },
  dropButton: {
    marginTop: "8px",
    padding: "10px 24px",
    background: "var(--accent)",
    color: "white",
    borderRadius: "10px",
    fontWeight: 600,
    fontSize: "14px",
    fontFamily: "var(--sans)",
    pointerEvents: "none",
  },

  // Stats
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
    gap: "14px",
  },
  statCard: {
    padding: "20px",
    background: "var(--code-bg)",
    border: "1px solid var(--border)",
    borderRadius: "14px",
    cursor: "default",
    userSelect: "none",
  },
  statValue: {
    fontSize: "32px",
    fontWeight: 700,
    fontFamily: "var(--heading)",
    color: "var(--text-h)",
    lineHeight: 1,
  },
  statLabel: {
    fontSize: "12px",
    color: "var(--text)",
    fontFamily: "var(--sans)",
    marginTop: "6px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },

  // Anomalies
  anomalySection: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  sectionTitle: {
    fontFamily: "var(--heading)",
    fontSize: "20px",
    fontWeight: 600,
    margin: 0,
    color: "var(--text-h)",
  },
  badgeRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
  },
  badge: {
    padding: "6px 14px",
    borderRadius: "20px",
    fontSize: "13px",
    fontWeight: 600,
    fontFamily: "var(--sans)",
  },
  anomalyList: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    background: "var(--code-bg)",
    border: "1px solid var(--border)",
    borderRadius: "12px",
    padding: "16px 20px",
  },
  anomalyRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontFamily: "var(--sans)",
    fontSize: "13px",
  },
  anomalyDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    flexShrink: 0,
  },
  anomalyType: {
    fontWeight: 600,
    minWidth: "120px",
    fontSize: "13px",
  },
  anomalyMsg: {
    color: "var(--text)",
  },

  // Preview Table
  tableWrapper: {
    overflowX: "auto",
    borderRadius: "14px",
    border: "1px solid var(--border)",
    background: "var(--code-bg)",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "14px",
    fontFamily: "var(--sans)",
  },
  th: {
    padding: "12px 16px",
    background: "var(--social-bg)",
    borderBottom: "1px solid var(--border)",
    color: "var(--text-h)",
    fontWeight: 600,
    fontSize: "13px",
    textAlign: "left" as const,
    whiteSpace: "nowrap",
  },
  tr: {
    borderBottom: "1px solid var(--border)",
    transition: "background 0.15s",
  },
  td: {
    padding: "12px 16px",
    color: "var(--text-h)",
    verticalAlign: "middle",
    maxWidth: "180px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },

  // Save Section
  saveSection: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
    paddingBottom: "40px",
  },
  successBanner: {
    display: "flex",
    alignItems: "flex-start",
    gap: "14px",
    padding: "18px 20px",
    background: "rgba(16,185,129,0.08)",
    border: "1px solid rgba(16,185,129,0.25)",
    borderRadius: "12px",
  },
  errorBanner: {
    display: "flex",
    alignItems: "flex-start",
    gap: "14px",
    padding: "18px 20px",
    background: "rgba(239,68,68,0.08)",
    border: "1px solid rgba(239,68,68,0.25)",
    borderRadius: "12px",
  },
  saveButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    padding: "16px 40px",
    background: "var(--accent)",
    color: "white",
    border: "none",
    borderRadius: "14px",
    fontWeight: 700,
    fontSize: "16px",
    cursor: "pointer",
    fontFamily: "var(--sans)",
    transition: "all 0.2s ease",
    letterSpacing: "0.2px",
    alignSelf: "flex-start",
    boxShadow: "0 4px 24px rgba(168,85,247,0.3)",
  },
  saveButtonLoading: {
    background: "#6d28d9",
    cursor: "not-allowed",
    opacity: 0.85,
  },
  saveButtonSuccess: {
    background: "#059669",
    boxShadow: "0 4px 24px rgba(5,150,105,0.3)",
  },
  btnSpinner: {
    display: "inline-block",
    width: "16px",
    height: "16px",
    border: "2px solid rgba(255,255,255,0.3)",
    borderTop: "2px solid white",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  saveHint: {
    fontFamily: "var(--sans)",
    fontSize: "13px",
    color: "var(--text)",
    margin: 0,
  },
};