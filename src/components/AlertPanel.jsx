import { useState } from "react";
import { db } from "../firebase";
import { doc, updateDoc } from "firebase/firestore";

const ALERT_CONFIG = {
  Fire: {
    color: "#ff3b3b",
    gradient: "linear-gradient(135deg, #ff3b3b 0%, #8b0000 100%)",
    icon: "🔥",
    severity: "Critical"
  },
  Medical: {
    color: "#ffa500",
    gradient: "linear-gradient(135deg, #ffa500 0%, #cc7000 100%)",
    icon: "🏥",
    severity: "High"
  },
  Security: {
    color: "#00bfff",
    gradient: "linear-gradient(135deg, #00bfff 0%, #005f87 100%)",
    icon: "🔒",
    severity: "Medium"
  }
};

const STATUS_CONFIG = {
  Pending: { color: "#fbbf24", icon: "⏳", label: "Pending" },
  Responding: { color: "#f97316", icon: "🚗", label: "Responding" },
  Completed: { color: "#38bdf8", icon: "📝", label: "Completed" },
  Resolved: { color: "#4ade80", icon: "✅", label: "Resolved" }
};

const DEPT_CONFIG = {
  Fire: { icon: "🔥", color: "#ff3b3b" },
  Medical: { icon: "🏥", color: "#ffa500" },
  Security: { icon: "🔒", color: "#00bfff" }
};

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: "12px"
  },
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "300px",
    color: "#555",
    fontSize: "14px",
    gap: "12px",
    padding: "40px 20px",
    background: "rgba(0, 0, 0, 0.2)",
    borderRadius: "12px",
    border: "1px solid rgba(255, 255, 255, 0.05)"
  },
  alertCard: (isSelected, color) => ({
    background: isSelected
      ? `${color}22`
      : "rgba(30, 30, 30, 0.8)",
    border: isSelected
      ? `2px solid ${color}`
      : `1px solid rgba(255, 255, 255, 0.05)`,
    borderRadius: "12px",
    padding: "16px",
    cursor: "pointer",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    boxShadow: isSelected
      ? `0 8px 32px ${color}44, inset 0 1px 0 rgba(255, 255, 255, 0.1)`
      : "0 2px 8px rgba(0, 0, 0, 0.3)",
    transform: isSelected ? "translateX(4px) scale(1.02)" : "translateX(0) scale(1)",
    position: "relative",
    overflow: "hidden"
  }),
  cardGloss: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "1px",
    background: "rgba(255, 255, 255, 0.1)"
  },
  cardContent: {
    position: "relative",
    zIndex: 1
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "14px",
    gap: "12px"
  },
  alertTypeHeader: {
    display: "flex",
    alignItems: "center",
    gap: "10px"
  },
  alertIcon: {
    fontSize: "20px",
    lineHeight: "1"
  },
  alertTitle: (color) => ({
    fontSize: "16px",
    fontWeight: "700",
    color: color,
    letterSpacing: "0.5px"
  }),
  severityBadge: (color) => ({
    marginLeft: "auto",
    background: `${color}22`,
    color: color,
    padding: "4px 10px",
    borderRadius: "6px",
    fontSize: "11px",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    border: `1px solid ${color}44`
  }),
  cardBody: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    marginBottom: "14px"
  },
  infoRow: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    fontSize: "13px",
    color: "#aaa"
  },
  infoLabel: {
    fontWeight: "600",
    color: "#ccc",
    minWidth: "50px"
  },
  infoValue: {
    color: "#ddd"
  },
  statusRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px"
  },
  statusIcon: {
    fontSize: "16px",
    lineHeight: "1"
  },
  statusText: (color) => ({
    fontWeight: "600",
    color: color
  }),
  deptBadge: (dept) => {
    const config = DEPT_CONFIG[dept] || { icon: "❓", color: "#888" };
    return {
      display: "inline-flex",
      alignItems: "center",
      gap: "6px",
      background: `${config.color}15`,
      color: config.color,
      padding: "4px 10px",
      borderRadius: "6px",
      fontSize: "12px",
      fontWeight: "600",
      border: `1px solid ${config.color}33`
    };
  },
  actionsContainer: {
    display: "flex",
    gap: "8px",
    marginTop: "12px",
    paddingTop: "12px",
    borderTop: "1px solid rgba(255, 255, 255, 0.05)"
  },
  actionButton: (status, isLoading) => {
    const config = STATUS_CONFIG[status];
    return {
      flex: 1,
      padding: "10px 12px",
      background: `${config.color}22`,
      border: `1px solid ${config.color}44`,
      borderRadius: "8px",
      color: config.color,
      fontSize: "13px",
      fontWeight: "600",
      cursor: isLoading ? "not-allowed" : "pointer",
      transition: "all 0.2s ease",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "6px",
      opacity: isLoading ? 0.6 : 1,
      transform: isLoading ? "scale(0.95)" : "scale(1)",
      textTransform: "uppercase",
      letterSpacing: "0.5px",
      whiteSpace: "nowrap"
    };
  },
  actionButtonHover: (status) => {
    const config = STATUS_CONFIG[status];
    return {
      background: `${config.color}33`,
      boxShadow: `0 4px 12px ${config.color}33`
    };
  },
  sortButtons: {
    display: "flex",
    gap: "8px",
    marginBottom: "16px",
    flexWrap: "wrap"
  },
  sortButton: (isActive) => ({
    padding: "8px 14px",
    background: isActive
      ? "linear-gradient(135deg, #ff3b3b 0%, #ff6b6b 100%)"
      : "rgba(50, 50, 50, 0.6)",
    color: "white",
    border: isActive ? "1px solid #ff3b3b" : "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "600",
    transition: "all 0.2s ease"
  })
};

export default function AlertPanel({ alerts, selectedAlert, onSelectAlert, loading }) {
  const [sortBy, setSortBy] = useState("recent");
  const [updatingId, setUpdatingId] = useState(null);
  const [hoveredButton, setHoveredButton] = useState(null);

  if (loading) {
    return (
      <div style={styles.emptyState}>
        <div style={{ fontSize: "24px" }}>⏳</div>
        <div>Loading alerts...</div>
      </div>
    );
  }

  if (!alerts.length) {
    return (
      <div style={styles.emptyState}>
        <div style={{ fontSize: "40px" }}>✨</div>
        <div>No active alerts</div>
        <div style={{ fontSize: "12px", color: "#666" }}>
          All systems operational
        </div>
      </div>
    );
  }

  const sortedAlerts = [...alerts].sort((a, b) => {
    if (sortBy === "recent") {
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    } else if (sortBy === "priority") {
      const priorityMap = { Fire: 0, Medical: 1, Security: 2 };
      return priorityMap[a.type] - priorityMap[b.type];
    } else if (sortBy === "status") {
      const statusMap = { Pending: 0, Responding: 1, Completed: 2, Resolved: 3 };
      return statusMap[a.status] - statusMap[b.status];
    }
    return 0;
  });

  const updateStatus = async (id, newStatus) => {
    setUpdatingId(id);
    try {
      await updateDoc(doc(db, "alerts", id), { 
        status: newStatus,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status");
    }
    setUpdatingId(null);
  };

  const handleStatusClick = (e, id, status) => {
    e.stopPropagation();
    updateStatus(id, status);
  };

  return (
    <div style={styles.container}>
      {/* Sort Buttons */}
      <div style={styles.sortButtons}>
        {["recent", "priority", "status"].map((sort) => (
          <button
            key={sort}
            onClick={() => setSortBy(sort)}
            style={styles.sortButton(sortBy === sort)}
          >
            {sort === "recent" && "⏱️ Recent"}
            {sort === "priority" && "⚡ Priority"}
            {sort === "status" && "📊 Status"}
          </button>
        ))}
      </div>

      {/* Alerts List */}
      <div style={styles.container}>
        {sortedAlerts.map((alert) => {
          const isSelected = selectedAlert?.id === alert.id;
          const config = ALERT_CONFIG[alert.type];
          const statusConfig = STATUS_CONFIG[alert.status];

          return (
            <div
              key={alert.id}
              onClick={() => onSelectAlert?.(alert)}
              style={styles.alertCard(isSelected, config.color)}
            >
              <div style={styles.cardGloss} />

              <div style={styles.cardContent}>
                {/* Header */}
                <div style={styles.cardHeader}>
                  <div style={styles.alertTypeHeader}>
                    <div style={styles.alertIcon}>{config.icon}</div>
                    <div style={styles.alertTitle(config.color)}>
                      {alert.type}
                    </div>
                  </div>
                  <div style={styles.severityBadge(config.color)}>
                    {config.severity}
                  </div>
                </div>

                {/* Body */}
                <div style={styles.cardBody}>
                  <div style={styles.infoRow}>
                    <span style={styles.infoLabel}>🏠 Room:</span>
                    <span style={styles.infoValue}>{alert.room}</span>
                  </div>

                  <div style={styles.infoRow}>
                    <span style={styles.infoLabel}>📊 Status:</span>
                    <span style={styles.statusRow}>
                      <span style={styles.statusIcon}>
                        {statusConfig?.icon}
                      </span>
                      <span style={styles.statusText(statusConfig?.color || "#888")}>
                        {alert.status}
                      </span>
                    </span>
                  </div>

                  <div style={styles.infoRow}>
                    <span style={styles.infoLabel}>🏢 Dept:</span>
                    <span style={styles.deptBadge(alert.assignedDept)}>
                      {DEPT_CONFIG[alert.assignedDept]?.icon} {alert.assignedDept}
                    </span>
                  </div>

                  {alert.assignedStaffName && (
                    <div style={styles.infoRow}>
                      <span style={styles.infoLabel}>👤 Staff:</span>
                      <span style={styles.infoValue}>{alert.assignedStaffName}</span>
                    </div>
                  )}
                </div>

                {/* Timestamp */}
                {alert.createdAt && (
                  <div style={{
                    fontSize: "11px",
                    color: "#666",
                    marginBottom: "12px",
                    paddingBottom: "12px",
                    borderBottom: "1px solid rgba(255, 255, 255, 0.05)"
                  }}>
                    {new Date(alert.createdAt).toLocaleTimeString()}
                  </div>
                )}

                {/* Action Buttons */}
                <div style={styles.actionsContainer}>
                  <button
                    style={{
                      ...styles.actionButton("Responding", updatingId === alert.id),
                      ...(hoveredButton === `${alert.id}-responding` ? styles.actionButtonHover("Responding") : {})
                    }}
                    onClick={(e) => handleStatusClick(e, alert.id, "Responding")}
                    onMouseEnter={() => setHoveredButton(`${alert.id}-responding`)}
                    onMouseLeave={() => setHoveredButton(null)}
                    disabled={updatingId === alert.id}
                  >
                    🚗 Responding
                  </button>
                  <button
                    style={{
                      ...styles.actionButton("Resolved", updatingId === alert.id),
                      ...(hoveredButton === `${alert.id}-resolved` ? styles.actionButtonHover("Resolved") : {})
                    }}
                    onClick={(e) => handleStatusClick(e, alert.id, "Resolved")}
                    onMouseEnter={() => setHoveredButton(`${alert.id}-resolved`)}
                    onMouseLeave={() => setHoveredButton(null)}
                    disabled={updatingId === alert.id}
                  >
                    ✅ Resolved
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}