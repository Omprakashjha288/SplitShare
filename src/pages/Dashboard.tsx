import { useEffect, useState } from "react";
import axios from "axios";
import API_URL from "../services/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

interface User {
  id: string;
  name: string;
  email: string;
}

interface Expense {
  id: string;
  description: string;
  amount: string | number;
  currency: string;
  amountInr: string | number;
  splitType: string;
  date: string;
  createdAt: string;
  paidBy?: User;
}

interface Spender {
  paidById: string;
  name: string;
  amountInr: string | number;
}

interface ImportHistory {
  id: string;
  filename: string;
  importedAt: string;
  totalRows: number;
  imported: number;
  skipped: number;
  flagged: number;
}

interface MonthlySpending {
  month: string;
  amount: number;
}

interface DashboardData {
  totalUsers: number;
  totalExpense: string | number;
  totalExpenses: number;
  totalGroups: number;
  totalImports: number;
  topSpenders: Spender[];
  recentExpenses: Expense[];
  recentImports: ImportHistory[];
  monthlySpending: MonthlySpending[];
}

const PIE_COLORS = ["#a855f7", "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#06b6d4", "#ec4899"];

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/dashboard`);
      setData(res.data);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Failed to load dashboard statistics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div style={styles.centerContainer}>
        <div style={styles.spinner}></div>
        <p style={{ marginTop: "16px", color: "var(--text)", fontFamily: "var(--sans)" }}>Loading dashboard insights...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.centerContainer}>
        <div style={styles.errorCard}>
          <h3 style={{ color: "#ef4444", margin: "0 0 10px 0", fontFamily: "var(--heading)" }}>Data Load Failed</h3>
          <p style={{ color: "var(--text)", marginBottom: "16px", fontFamily: "var(--sans)" }}>{error}</p>
          <button style={styles.primaryButton} onClick={fetchDashboardData}>
            Retry Load
          </button>
        </div>
      </div>
    );
  }

  const totalExpenseVal = Number(data?.totalExpense || 0);
  const totalUsersVal = data?.totalUsers || 0;
  const totalExpenseRecordsVal = data?.totalExpenses || 0;
  const totalImportsVal = data?.totalImports || 0;
  
  const topSpenders = data?.topSpenders || [];
  const recentExpenses = data?.recentExpenses || [];
  const recentImports = data?.recentImports || [];
  const monthlySpending = data?.monthlySpending || [];

  // Find max spender amount for progress bars
  const maxSpenderAmount = topSpenders.length > 0 
    ? Math.max(...topSpenders.map(s => Number(s.amountInr))) 
    : 1;

  return (
    <div style={styles.dashboardContainer}>
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>Dashboard Analytics</h1>
          <p style={styles.subtitle}>Aggregated metrics, spending graphs, and audit history log.</p>
        </div>
        <button style={styles.refreshButton} onClick={fetchDashboardData}>
          <svg style={styles.refreshIcon} viewBox="0 0 24 24">
            <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
          </svg>
          Sync Data
        </button>
      </header>

      {/* Analytics KPI Cards Grid */}
      <section style={styles.grid}>
        <div style={{ ...styles.card, ...styles.cardPrimary }}>
          <div style={styles.cardHeader}>
            <span style={styles.cardIcon}>₹</span>
            <span style={styles.cardLabel}>Total Outflow</span>
          </div>
          <h2 style={styles.cardValue}>₹{totalExpenseVal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</h2>
          <p style={styles.cardMeta}>Aggregated group expenses</p>
        </div>

        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <span style={{ ...styles.cardIcon, color: "#10b981", background: "rgba(16, 185, 129, 0.1)" }}>👤</span>
            <span style={styles.cardLabel}>Total Users</span>
          </div>
          <h2 style={styles.cardValue}>{totalUsersVal}</h2>
          <p style={styles.cardMeta}>Registered active contributors</p>
        </div>

        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <span style={{ ...styles.cardIcon, color: "#3b82f6", background: "rgba(59, 130, 246, 0.1)" }}>🧾</span>
            <span style={styles.cardLabel}>Expense Records</span>
          </div>
          <h2 style={styles.cardValue}>{totalExpenseRecordsVal}</h2>
          <p style={styles.cardMeta}>Total expense entries in database</p>
        </div>

        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <span style={{ ...styles.cardIcon, color: "#f59e0b", background: "rgba(245, 158, 11, 0.1)" }}>📥</span>
            <span style={styles.cardLabel}>Recent Imports</span>
          </div>
          <h2 style={styles.cardValue}>{totalImportsVal}</h2>
          <p style={styles.cardMeta}>CSV import sessions logged</p>
        </div>
      </section>

      {/* Charts and Leaderboard Section */}
      <section style={styles.sectionRow}>
        {/* Monthly Spending Bar Chart */}
        <div style={{ ...styles.subSection, flex: 2 }}>
          <h2 style={styles.sectionTitle}>Monthly Outflow Trend</h2>
          <div style={styles.chartWrapper}>
            {monthlySpending.length === 0 ? (
              <div style={styles.chartEmpty}>
                <p style={{ color: "var(--text)" }}>Import expenses to generate monthly outflow charts.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={monthlySpending} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis 
                    dataKey="month" 
                    stroke="var(--text)" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <YAxis 
                    stroke="var(--text)" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(val) => `₹${val}`}
                  />
                  <Tooltip
                    contentStyle={styles.chartTooltip}
                    labelStyle={{ fontWeight: "bold", color: "var(--text-h)" }}
                    formatter={(val: any) => [`₹${Number(val).toLocaleString()}`, "Expenses"]}
                  />
                  <Bar 
                    dataKey="amount" 
                    fill="var(--accent)" 
                    radius={[6, 6, 0, 0]} 
                    maxBarSize={45}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Top Spenders Leaderboard */}
        <div style={{ ...styles.subSection, flex: 1 }}>
          <h2 style={styles.sectionTitle}>Top Contributors</h2>
          <div style={styles.leaderboardWrapper}>
            {topSpenders.length === 0 ? (
              <p style={{ color: "var(--text)", padding: "24px", textAlign: "center" }}>No spend data.</p>
            ) : (
              <div style={styles.leaderboardList}>
                {topSpenders.map((spender, idx) => {
                  const percentage = (Number(spender.amountInr) / maxSpenderAmount) * 100;
                  return (
                    <div key={spender.paidById} style={styles.spenderItem}>
                      <div style={styles.spenderDetails}>
                        <div style={styles.spenderLeft}>
                          <span style={styles.rankBadge}>{idx + 1}</span>
                          <span style={styles.spenderName}>{spender.name}</span>
                        </div>
                        <span style={styles.spenderAmount}>
                          ₹{Number(spender.amountInr).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                        </span>
                      </div>
                      <div style={styles.progressBarBg}>
                        <div style={{ ...styles.progressBarFill, width: `${percentage}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Top Spenders Pie Chart */}
      <section style={styles.subSection}>
        <h2 style={styles.sectionTitle}>🥧 Spend Distribution</h2>
        <p style={{ color: "var(--text)", fontFamily: "var(--sans)", fontSize: "14px", margin: "0 0 16px 0" }}>
          Proportional share of total expenses per contributor.
        </p>
        {topSpenders.length === 0 ? (
          <div style={styles.emptyState}>
            <p style={{ color: "var(--text)" }}>No spend data yet. Import a CSV to see distribution.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie
                data={topSpenders.slice(0, 7).map(s => ({ name: s.name, value: Number(s.amountInr) }))}
                cx="50%"
                cy="50%"
                outerRadius={120}
                innerRadius={60}
                dataKey="value"
                paddingAngle={3}
                label={((props: any) => `${props.name || ''} ${((props.percent ?? 0) * 100).toFixed(0)}%`) as any}
                labelLine={false}
              >
                {topSpenders.slice(0, 7).map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={styles.chartTooltip}
                formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, "Paid"]}
              />
              <Legend
                iconType="circle"
                iconSize={10}
                formatter={(val) => <span style={{ color: "var(--text-h)", fontFamily: "var(--sans)", fontSize: "13px" }}>{val}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </section>

      {/* Lists Section */}
      <section style={styles.sectionRow}>
        {/* Recent Outflows Table */}
        <div style={{ ...styles.subSection, flex: 2 }}>
          <h2 style={styles.sectionTitle}>Recent Shared Outflows</h2>
          {recentExpenses.length === 0 ? (
            <div style={styles.emptyState}>
              <p style={{ color: "var(--text)" }}>No recent expenses found.</p>
            </div>
          ) : (
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Date</th>
                    <th style={styles.th}>Description</th>
                    <th style={styles.th}>Paid By</th>
                    <th style={{ ...styles.th, textAlign: "right" }}>Amount (INR)</th>
                  </tr>
                </thead>
                <tbody>
                  {recentExpenses.map((exp) => {
                    const date = exp.date ? new Date(exp.date).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short"
                    }) : "N/A";
                    return (
                      <tr key={exp.id} style={styles.tr} className="dashboard-table-row">
                        <td style={styles.td}>{date}</td>
                        <td style={{ ...styles.td, fontWeight: 500, color: "var(--text-h)" }}>{exp.description}</td>
                        <td style={styles.td}>
                          <span style={styles.badge}>{exp.paidBy?.name || "Unknown"}</span>
                        </td>
                        <td style={{ ...styles.td, textAlign: "right", fontWeight: 600, color: "var(--text-h)", fontFamily: "var(--mono)", fontSize: "14px" }}>
                          ₹{Number(exp.amountInr).toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Imports History Log */}
        <div style={{ ...styles.subSection, flex: 1 }}>
          <h2 style={styles.sectionTitle}>Recent CSV Imports</h2>
          {recentImports.length === 0 ? (
            <div style={styles.emptyState}>
              <p style={{ color: "var(--text)" }}>No import logs recorded.</p>
            </div>
          ) : (
            <div style={styles.logList}>
              {recentImports.map((imp) => {
                const date = imp.importedAt ? new Date(imp.importedAt).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit"
                }) : "N/A";
                return (
                  <div key={imp.id} style={styles.logItem}>
                    <div style={styles.logHeader}>
                      <span style={styles.logFile}>📄 {imp.filename}</span>
                      <span style={styles.logTime}>{date}</span>
                    </div>
                    <div style={styles.logStats}>
                      <span style={styles.logStatBadge}>Total: {imp.totalRows}</span>
                      <span style={{ ...styles.logStatBadge, color: "#10b981", background: "rgba(16, 185, 129, 0.1)" }}>
                        Saved: {imp.imported}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  dashboardContainer: {
    padding: "40px",
    display: "flex",
    flexDirection: "column",
    gap: "36px",
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
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "24px",
  },
  card: {
    padding: "24px",
    background: "var(--code-bg)",
    border: "1px solid var(--border)",
    borderRadius: "16px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  cardPrimary: {
    background: "linear-gradient(135deg, var(--accent-bg), rgba(170, 59, 255, 0.02))",
    borderColor: "var(--accent-border)",
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  cardIcon: {
    width: "28px",
    height: "28px",
    background: "var(--accent-bg)",
    color: "var(--accent)",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "8px",
    fontWeight: "bold",
    fontSize: "14px",
  },
  cardLabel: {
    fontSize: "14px",
    fontWeight: 500,
    color: "var(--text)",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    fontFamily: "var(--sans)",
  },
  cardValue: {
    margin: 0,
    fontSize: "32px",
    fontWeight: 700,
    color: "var(--text-h)",
    fontFamily: "var(--heading)",
  },
  cardMeta: {
    margin: 0,
    fontSize: "13px",
    color: "var(--text)",
    fontFamily: "var(--sans)",
  },
  sectionRow: {
    display: "flex",
    flexDirection: "row",
    gap: "28px",
    flexWrap: "wrap",
  },
  subSection: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    minWidth: "300px",
  },
  sectionTitle: {
    fontFamily: "var(--heading)",
    fontSize: "22px",
    fontWeight: 600,
    margin: 0,
    color: "var(--text-h)",
  },
  chartWrapper: {
    background: "var(--code-bg)",
    border: "1px solid var(--border)",
    borderRadius: "16px",
    padding: "24px",
    minHeight: "320px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  chartEmpty: {
    textAlign: "center",
    fontFamily: "var(--sans)",
  },
  chartTooltip: {
    background: "var(--bg)",
    border: "1px solid var(--border)",
    borderRadius: "8px",
    boxShadow: "var(--shadow)",
    fontFamily: "var(--sans)",
  },
  leaderboardWrapper: {
    background: "var(--code-bg)",
    border: "1px solid var(--border)",
    borderRadius: "16px",
    padding: "24px",
    height: "320px",
    boxSizing: "border-box",
  },
  leaderboardList: {
    display: "flex",
    flexDirection: "column",
    gap: "18px",
    height: "100%",
    overflowY: "auto",
  },
  spenderItem: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  spenderDetails: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: "14px",
    fontFamily: "var(--sans)",
  },
  spenderLeft: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  rankBadge: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "20px",
    height: "20px",
    background: "var(--social-bg)",
    borderRadius: "50%",
    fontSize: "11px",
    fontWeight: "bold",
    color: "var(--text-h)",
  },
  spenderName: {
    fontWeight: 500,
    color: "var(--text-h)",
  },
  spenderAmount: {
    fontWeight: 600,
    color: "var(--text-h)",
  },
  progressBarBg: {
    height: "6px",
    background: "var(--social-bg)",
    borderRadius: "3px",
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    background: "linear-gradient(90deg, var(--accent), #d8b4fe)",
    borderRadius: "3px",
  },
  emptyState: {
    padding: "40px 20px",
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
    padding: "14px 18px",
    background: "var(--social-bg)",
    borderBottom: "1px solid var(--border)",
    color: "var(--text-h)",
    fontWeight: 600,
    fontSize: "13px",
  },
  tr: {
    borderBottom: "1px solid var(--border)",
    transition: "background-color 0.2s ease",
  },
  td: {
    padding: "14px 18px",
    color: "var(--text)",
    verticalAlign: "middle",
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    padding: "3px 8px",
    borderRadius: "30px",
    background: "var(--social-bg)",
    color: "var(--text-h)",
    fontSize: "12px",
    fontWeight: 500,
    border: "1px solid var(--border)",
  },
  logList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  logItem: {
    background: "var(--code-bg)",
    border: "1px solid var(--border)",
    borderRadius: "12px",
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  logHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontFamily: "var(--sans)",
  },
  logFile: {
    fontWeight: 500,
    color: "var(--text-h)",
    fontSize: "14px",
  },
  logTime: {
    fontSize: "12px",
    color: "var(--text)",
  },
  logStats: {
    display: "flex",
    gap: "8px",
  },
  logStatBadge: {
    padding: "3px 8px",
    borderRadius: "4px",
    background: "var(--social-bg)",
    color: "var(--text)",
    fontSize: "11px",
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
    .dashboard-table-row:hover {
      background-color: var(--social-bg) !important;
    }
  `;
  document.head.appendChild(styleEl);
}
