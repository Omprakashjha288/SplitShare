import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import ImportPage from "./pages/ImportPage";
import ImportHistory from "./pages/ImportHistory";
import Settlements from "./pages/Settlements";

function Navigation() {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <nav style={styles.navBar}>
      <div style={styles.navContainer}>
        <div style={styles.logoContainer}>
          <span style={styles.logoIcon}>💸</span>
          <span style={styles.logoText}>SplitShare</span>
        </div>

        <div style={styles.tabsContainer}>
          <Link
            to="/dashboard"
            style={{
              ...styles.tabLink,
              ...(currentPath === "/dashboard" ? styles.tabLinkActive : {}),
            }}
          >
            📊 Dashboard
          </Link>
          <Link
            to="/"
            style={{
              ...styles.tabLink,
              ...(currentPath === "/" ? styles.tabLinkActive : {}),
            }}
          >
            📥 CSV Import
          </Link>
          <Link
            to="/imports"
            style={{
              ...styles.tabLink,
              ...(currentPath === "/imports" ? styles.tabLinkActive : {}),
            }}
          >
            📋 Import Logs
          </Link>
          <Link
            to="/settlements"
            style={{
              ...styles.tabLink,
              ...(currentPath === "/settlements" ? styles.tabLinkActive : {}),
            }}
          >
            🤝 Settlements
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default function App() {
  return (
    <Router>
      <div style={styles.appWrapper}>
        <Navigation />

        {/* Main Content Area */}
        <main style={styles.mainContent}>
          <Routes>
            <Route path="/" element={<ImportPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/imports" element={<ImportHistory />} />
            <Route path="/settlements" element={<Settlements />} />
          </Routes>
        </main>

        {/* Modern footer */}
        <footer style={styles.footer}>
          <p>© 2026 SplitShare. Built with premium style and design precision.</p>
        </footer>
      </div>
    </Router>
  );
}

const styles: Record<string, React.CSSProperties> = {
  appWrapper: {
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh",
    width: "100%",
    background: "var(--bg)",
  },
  navBar: {
    position: "sticky",
    top: 0,
    zIndex: 100,
    background: "var(--social-bg)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    borderBottom: "1px solid var(--border)",
    padding: "0 24px",
  },
  navContainer: {
    maxWidth: "1100px",
    margin: "0 auto",
    height: "72px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logoContainer: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  logoIcon: {
    fontSize: "26px",
  },
  logoText: {
    fontFamily: "var(--heading)",
    fontSize: "20px",
    fontWeight: 700,
    color: "var(--text-h)",
    letterSpacing: "-0.5px",
  },
  tabsContainer: {
    display: "flex",
    gap: "6px",
    background: "var(--code-bg)",
    padding: "4px",
    borderRadius: "10px",
    border: "1px solid var(--border)",
    flexWrap: "wrap",
  },
  tabLink: {
    padding: "8px 16px",
    borderRadius: "8px",
    textDecoration: "none",
    color: "var(--text)",
    fontSize: "14px",
    fontWeight: 500,
    cursor: "pointer",
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
    display: "inline-flex",
    alignItems: "center",
    fontFamily: "var(--sans)",
  },
  tabLinkActive: {
    background: "var(--bg)",
    color: "var(--accent)",
    boxShadow: "0 4px 12px rgba(170, 59, 255, 0.08)",
    fontWeight: 600,
  },
  mainContent: {
    flex: 1,
    width: "100%",
    maxWidth: "1100px",
    margin: "0 auto",
    boxSizing: "border-box",
  },
  footer: {
    padding: "24px",
    borderTop: "1px solid var(--border)",
    background: "var(--code-bg)",
    textAlign: "center",
    fontSize: "13px",
    color: "var(--text)",
    fontFamily: "var(--sans)",
  },
};