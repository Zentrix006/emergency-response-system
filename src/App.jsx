import { HashRouter as Router, Routes, Route, Link } from "react-router-dom";
import Admin from "./pages/Admin";
import Report from "./pages/Report";
import Staff from "./pages/Staff";
import Reception from "./pages/Reception";
import StaffProfile from "./pages/StaffProfile";

const styles = {
  homePage: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #0a0a0a 0%, #1a0a0a 100%)",
    color: "white",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    padding: "24px",
  },
  card: {
    width: "100%",
    maxWidth: "920px",
    background: "rgba(20, 20, 20, 0.82)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    borderRadius: "18px",
    padding: "38px 34px",
    position: "relative",
    overflow: "hidden",
    boxShadow:
      "0 22px 60px rgba(0, 0, 0, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.08)",
    animation: "fadeSlideIn 700ms ease-out",
  },
  glowOrb: {
    position: "absolute",
    width: "320px",
    height: "320px",
    borderRadius: "50%",
    right: "-120px",
    top: "-120px",
    background:
      "radial-gradient(circle, rgba(255, 59, 59, 0.22), rgba(255, 59, 59, 0))",
    pointerEvents: "none",
  },
  badge: {
    display: "inline-block",
    padding: "6px 12px",
    borderRadius: "999px",
    fontSize: "11px",
    fontWeight: "700",
    letterSpacing: "0.8px",
    textTransform: "uppercase",
    background: "rgba(255, 59, 59, 0.18)",
    border: "1px solid rgba(255, 59, 59, 0.4)",
    color: "#ff6b6b",
    marginBottom: "14px",
  },
  content: {
    position: "relative",
    zIndex: 1,
  },
  title: {
    fontSize: "34px",
    fontWeight: "800",
    letterSpacing: "0.5px",
    marginBottom: "10px",
  },
  subtitle: {
    color: "#b3b3b3",
    fontSize: "15px",
    lineHeight: "1.7",
    maxWidth: "760px",
    marginBottom: "26px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "12px",
    marginBottom: "24px",
  },
  item: {
    background: "rgba(255, 255, 255, 0.03)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    borderRadius: "12px",
    padding: "16px",
    transition:
      "transform 220ms ease, border-color 220ms ease, box-shadow 220ms ease",
  },
  itemTitle: {
    fontSize: "15px",
    fontWeight: "700",
    marginBottom: "8px",
  },
  itemBody: {
    fontSize: "13px",
    color: "#a8a8a8",
    lineHeight: "1.6",
  },
  routesWrap: {
    borderTop: "1px solid rgba(255, 255, 255, 0.08)",
    paddingTop: "18px",
  },
  routesTitle: {
    fontSize: "13px",
    textTransform: "uppercase",
    letterSpacing: "0.8px",
    color: "#9d9d9d",
    marginBottom: "10px",
    fontWeight: "700",
  },
  routeList: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    marginBottom: "20px",
  },
  routeBadge: {
    padding: "7px 12px",
    borderRadius: "8px",
    background: "rgba(255, 59, 59, 0.14)",
    border: "1px solid rgba(255, 107, 107, 0.35)",
    color: "#ffb1b1",
    fontSize: "12px",
    fontWeight: "600",
    letterSpacing: "0.2px",
  },
  buttonRow: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
    gap: "12px",
  },
  navButton: {
    textDecoration: "none",
    color: "white",
    border: "1px solid rgba(255, 255, 255, 0.12)",
    borderRadius: "12px",
    padding: "14px 16px",
    background: "rgba(255, 255, 255, 0.04)",
    transition:
      "transform 220ms ease, box-shadow 220ms ease, border-color 220ms ease",
    animation: "fadeSlideIn 850ms ease-out",
  },
  navButtonTitle: {
    fontSize: "14px",
    fontWeight: "700",
    marginBottom: "5px",
  },
  navButtonSub: {
    fontSize: "12px",
    color: "#ababab",
    lineHeight: "1.5",
  },
};

const keyframes = `
  @keyframes fadeSlideIn {
    from {
      opacity: 0;
      transform: translateY(14px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .home-card-item:hover {
    transform: translateY(-4px);
    border-color: rgba(255, 107, 107, 0.45) !important;
    box-shadow: 0 10px 24px rgba(255, 59, 59, 0.18);
  }

  .home-nav-button:hover {
    transform: translateY(-3px);
    border-color: rgba(255, 107, 107, 0.55) !important;
    box-shadow: 0 10px 24px rgba(255, 59, 59, 0.2);
  }
`;

function Home() {
  return (
    <div style={styles.homePage}>
      <div style={styles.card}>
        <style>{keyframes}</style>
        <div style={styles.glowOrb} />

        <div style={styles.content}>
          <div style={styles.badge}>Emergency Response Platform</div>
          <div style={styles.title}>Hotel Emergency Alert Management System</div>
          <div style={styles.subtitle}>
            This project provides a real-time emergency response workflow for
            multi-floor facilities. Guests can raise alerts from room QR links,
            while staff and admins instantly monitor, assign, update, and
            resolve incidents from live dashboards.
          </div>

          <div style={styles.grid}>
            <div style={styles.item} className="home-card-item">
              <div style={styles.itemTitle}>Rapid Reporting</div>
              <div style={styles.itemBody}>
                Room-specific reporting page allows users to trigger Fire,
                Medical, or Security alerts in seconds.
              </div>
            </div>

            <div style={styles.item} className="home-card-item">
              <div style={styles.itemTitle}>Live Staff Dashboard</div>
              <div style={styles.itemBody}>
                Operational team tracks active incidents, floor distribution,
                and status progression in a visual map-first interface.
              </div>
            </div>

            <div style={styles.item} className="home-card-item">
              <div style={styles.itemTitle}>Admin Control</div>
              <div style={styles.itemBody}>
                Central panel for incident oversight, prioritization, response
                updates, and final resolution/deletion actions.
              </div>
            </div>

            <div style={styles.item} className="home-card-item">
              <div style={styles.itemTitle}>Booking Availability</div>
              <div style={styles.itemBody}>
                Reception can check room availability, register visitors, and
                manage stay duration for active rooms.
              </div>
            </div>
          </div>

          <div style={styles.routesWrap}>
            <div style={styles.routesTitle}>Available Pages</div>

            <div style={styles.routeList}>
              <span style={styles.routeBadge}>/admin</span>
              <span style={styles.routeBadge}>/staff</span>
              <span style={styles.routeBadge}>/report?room=301</span>
              <span style={styles.routeBadge}>/reception</span>
            </div>

            <div style={styles.buttonRow}>
              <Link
                to="/admin"
                style={styles.navButton}
                className="home-nav-button"
              >
                <div style={styles.navButtonTitle}>Open Admin Panel</div>
                <div style={styles.navButtonSub}>
                  Manage active alerts, statuses, and incident lifecycle.
                </div>
              </Link>

              <Link
                to="/staff"
                style={styles.navButton}
                className="home-nav-button"
              >
                <div style={styles.navButtonTitle}>Open Staff Dashboard</div>
                <div style={styles.navButtonSub}>
                  Track floor alerts in real-time with map-based view.
                </div>
              </Link>

              <Link
                to="/report?room=301"
                style={styles.navButton}
                className="home-nav-button"
              >
                <div style={styles.navButtonTitle}>Test Report Page</div>
                <div style={styles.navButtonSub}>
                  Simulate alert creation flow for a sample room.
                </div>
              </Link>

              <Link
                to="/reception"
                style={styles.navButton}
                className="home-nav-button"
              >
                <div style={styles.navButtonTitle}>Open Reception</div>
                <div style={styles.navButtonSub}>
                  Check room availability and create visitor check-ins.
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/report" element={<Report />} />
        <Route path="/staff" element={<Staff />} />
        <Route path="/reception" element={<Reception />} />
        <Route path="/staffs/:staffId" element={<StaffProfile />} />
      </Routes>
    </Router>
  );
}
