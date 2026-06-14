import { useEffect, useState } from "react";
import axios from "axios";

interface Person {
  userId: string;
  name: string;
  amount: number;
}

interface Transaction {
  from: string;
  to: string;
  amount: number;
}

interface SettlementsData {
  creditors: Person[];
  debtors: Person[];
  transactions: Transaction[];
}

export default function Settlements() {
  const [data, setData] = useState<SettlementsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettlements = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/api/settlements");
      setData(res.data);
      setError(null);
    } catch (err: any) {
      setError(err?.message || "Failed to load settlements");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettlements();
    // Inject hover styles once
    const existing = document.getElementById("settlement-styles");
    if (!existing) {
      const styleEl = document.createElement("style");
      styleEl.id = "settlement-styles";
      styleEl.textContent = `
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .settlement-card:hover {
          background-color: var(--social-bg) !important;
          transform: translateY(-1px);
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
        }
      `;
      document.head.appendChild(styleEl);
    }
  }, []);

  if (loading) {
    return (
      <div style={styles.centerContainer}>
        <div style={styles.spinner}></div>
        <p style={{ marginTop: "16px", color: "var(--text)", fontFamily: "var(--sans)" }}>
          Calculating settlements...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.centerContainer}>
        <div style={styles.errorCard}>
          <h3 style={{ color: "#ef4444", margin: "0 0 10px 0", fontFamily: "var(--heading)" }}>
            Load Failed
          </h3>
          <p style={{ color: "var(--text)", marginBottom: "16px", fontFamily: "var(--sans)" }}>
            {error}
          </p>
          <button style={styles.primaryButton} onClick={fetchSettlements}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { creditors = [], debtors = [], transactions = [] } = data || {};
  const totalSettlementAmount = transactions.reduce((sum, t) => sum + t.amount, 0);

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>Settlements</h1>
          <p style={styles.subtitle}>
            Who owes whom — calculated using minimum cash flow algorithm.
          </p>
        </div>
        <button style={styles.refreshButton} onClick={fetchSettlements}>
          <svg style={styles.refreshIcon} viewBox="0 0 24 24">
            <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
          </svg>
          Recalculate
        </button>
      </header>

      {/* Summary stat */}
      <div style={styles.summaryRow}>
        {/* Total to settle — highlighted with left accent stripe */}
        <div style={styles.summaryCardHighlight}>
          <span style={styles.summaryIcon}>💸</span>
          <div>
            <div style={styles.summaryLabel}>Total to Settle</div>
            <div style={{ ...styles.summaryValue, color: "var(--accent)" }}>
              ₹{totalSettlementAmount.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
            </div>
          </div>
        </div>
        <div style={styles.summaryCard}>
          <span style={styles.summaryIcon}>📤</span>
          <div>
            <div style={styles.summaryLabel}>Transactions Needed</div>
            <div style={styles.summaryValue}>{transactions.length}</div>
          </div>
        </div>
        <div style={styles.summaryCard}>
          <span style={styles.summaryIcon}>🟢</span>
          <div>
            <div style={styles.summaryLabel}>Creditors</div>
            <div style={{ ...styles.summaryValue, color: "#10b981" }}>{creditors.length}</div>
          </div>
        </div>
        <div style={styles.summaryCard}>
          <span style={styles.summaryIcon}>🔴</span>
          <div>
            <div style={styles.summaryLabel}>Debtors</div>
            <div style={{ ...styles.summaryValue, color: "#ef4444" }}>{debtors.length}</div>
          </div>
        </div>
      </div>

      {/* Transactions — who pays whom */}
      <section>
        <h2 style={styles.sectionTitle}>💳 Settlement Transactions</h2>
        <p style={{ color: "var(--text)", fontFamily: "var(--sans)", fontSize: "14px", margin: "0 0 16px 0" }}>
          Minimum number of payments needed to settle all balances.
        </p>
        {transactions.length === 0 ? (
          <div style={styles.emptyState}>
            <p style={{ color: "var(--text)", margin: 0 }}>🎉 All balances are settled!</p>
          </div>
        ) : (
          <div style={styles.transactionList}>
            {transactions.map((t, idx) => (
              <div key={idx} style={styles.transactionCard} className="settlement-card">
                <div style={styles.transactionLeft}>
                  <span style={styles.avatar}>{t.from[0]}</span>
                  <div>
                    <div style={styles.personName}>{t.from}</div>
                    <div style={styles.personRole}>pays</div>
                  </div>
                </div>

                <div style={styles.arrowSection}>
                  <div style={styles.arrowAmount}>
                    ₹{t.amount.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                  </div>
                  <svg style={styles.arrowIcon} viewBox="0 0 24 24">
                    <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" />
                  </svg>
                </div>

                <div style={styles.transactionRight}>
                  <span style={{ ...styles.avatar, background: "rgba(16,185,129,0.15)", color: "#10b981" }}>
                    {t.to[0]}
                  </span>
                  <div>
                    <div style={styles.personName}>{t.to}</div>
                    <div style={styles.personRole}>receives</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Balance Breakdown */}
      <section style={styles.sectionRow}>
        {/* Creditors */}
        <div style={{ ...styles.balanceSection, flex: 1 }}>
          <h2 style={styles.sectionTitle}>🟢 Creditors</h2>
          <p style={{ color: "var(--text)", fontSize: "13px", fontFamily: "var(--sans)", margin: "0 0 12px 0" }}>
            Paid more than their share
          </p>
          {creditors.length === 0 ? (
            <div style={styles.emptyState}>
              <p style={{ color: "var(--text)", margin: 0, fontSize: "14px" }}>No creditors</p>
            </div>
          ) : (
            <div style={styles.balanceList}>
              {creditors
                .sort((a, b) => b.amount - a.amount)
                .map((c) => (
                  <div key={c.userId} style={styles.balanceRow}>
                    <div style={styles.balanceLeft}>
                      <span style={{ ...styles.avatar, width: "32px", height: "32px", fontSize: "13px", background: "rgba(16,185,129,0.12)", color: "#10b981" }}>
                        {c.name[0]}
                      </span>
                      <span style={styles.personName}>{c.name}</span>
                    </div>
                    <span style={{ ...styles.balanceBadge, color: "#10b981", background: "rgba(16,185,129,0.1)" }}>
                      +₹{c.amount.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Debtors */}
        <div style={{ ...styles.balanceSection, flex: 1 }}>
          <h2 style={styles.sectionTitle}>🔴 Debtors</h2>
          <p style={{ color: "var(--text)", fontSize: "13px", fontFamily: "var(--sans)", margin: "0 0 12px 0" }}>
            Owe more than they paid
          </p>
          {debtors.length === 0 ? (
            <div style={styles.emptyState}>
              <p style={{ color: "var(--text)", margin: 0, fontSize: "14px" }}>No debtors</p>
            </div>
          ) : (
            <div style={styles.balanceList}>
              {debtors
                .sort((a, b) => b.amount - a.amount)
                .map((d) => (
                  <div key={d.userId} style={styles.balanceRow}>
                    <div style={styles.balanceLeft}>
                      <span style={{ ...styles.avatar, width: "32px", height: "32px", fontSize: "13px", background: "rgba(239,68,68,0.12)", color: "#ef4444" }}>
                        {d.name[0]}
                      </span>
                      <span style={styles.personName}>{d.name}</span>
                    </div>
                    <span style={{ ...styles.balanceBadge, color: "#ef4444", background: "rgba(239,68,68,0.1)" }}>
                      -₹{d.amount.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: "40px",
    display: "flex",
    flexDirection: "column",
    gap: "36px",
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
    transition: "all 0.2s ease",
    fontFamily: "var(--sans)",
  },
  refreshIcon: {
    width: "16px",
    height: "16px",
    fill: "currentColor",
  },
  summaryRow: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "16px",
  },
  summaryCard: {
    padding: "20px 24px",
    background: "var(--code-bg)",
    border: "1px solid var(--border)",
    borderRadius: "14px",
    display: "flex",
    alignItems: "center",
    gap: "16px",
    cursor: "default",
    userSelect: "none",
  },
  summaryCardHighlight: {
    padding: "20px 24px",
    background: "rgba(168,85,247,0.05)",
    border: "1px solid var(--border)",
    borderLeft: "4px solid var(--accent)",
    borderRadius: "14px",
    display: "flex",
    alignItems: "center",
    gap: "16px",
    cursor: "default",
    userSelect: "none",
  },
  summaryIcon: {
    fontSize: "28px",
    lineHeight: 1,
  },
  summaryLabel: {
    fontSize: "12px",
    color: "var(--text)",
    fontFamily: "var(--sans)",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    fontWeight: 500,
  },
  summaryValue: {
    fontSize: "24px",
    fontWeight: 700,
    color: "var(--text-h)",
    fontFamily: "var(--heading)",
    marginTop: "2px",
  },
  sectionTitle: {
    fontFamily: "var(--heading)",
    fontSize: "20px",
    fontWeight: 600,
    margin: "0 0 4px 0",
    color: "var(--text-h)",
  },
  transactionList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  transactionCard: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "20px 24px",
    background: "var(--code-bg)",
    border: "1px solid var(--border)",
    borderRadius: "16px",
    transition: "all 0.2s ease",
    gap: "16px",
  },
  transactionLeft: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    flex: 1,
  },
  transactionRight: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    flex: 1,
    justifyContent: "flex-end",
  },
  arrowSection: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "4px",
    flex: 0,
    minWidth: "120px",
  },
  arrowAmount: {
    fontFamily: "var(--mono)",
    fontWeight: 700,
    fontSize: "18px",
    color: "var(--accent)",
    whiteSpace: "nowrap",
  },
  arrowIcon: {
    width: "28px",
    height: "28px",
    fill: "var(--accent)",
    opacity: 0.7,
  },
  avatar: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    background: "rgba(170, 59, 255, 0.12)",
    color: "var(--accent)",
    fontWeight: 700,
    fontSize: "16px",
    textTransform: "uppercase" as const,
    flexShrink: 0,
  },
  personName: {
    fontWeight: 600,
    color: "var(--text-h)",
    fontFamily: "var(--sans)",
    fontSize: "15px",
  },
  personRole: {
    fontSize: "12px",
    color: "var(--text)",
    fontFamily: "var(--sans)",
  },
  sectionRow: {
    display: "flex",
    gap: "28px",
    flexWrap: "wrap",
  },
  balanceSection: {
    minWidth: "280px",
  },
  balanceList: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  balanceRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "14px 18px",
    background: "var(--code-bg)",
    border: "1px solid var(--border)",
    borderRadius: "12px",
  },
  balanceLeft: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  balanceBadge: {
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "13px",
    fontWeight: 600,
    fontFamily: "var(--mono)",
  },
  emptyState: {
    padding: "32px 20px",
    textAlign: "center",
    border: "1.5px dashed var(--border)",
    borderRadius: "14px",
    background: "var(--code-bg)",
    fontFamily: "var(--sans)",
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
    fontFamily: "var(--sans)",
  },
};

