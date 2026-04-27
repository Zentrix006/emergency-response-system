import { useEffect, useState } from "react";
import { generateRoomsForFloor } from "../utils/rooms";

const ALERT_CONFIG = {
  Fire: {
    gradient: "linear-gradient(135deg, #ff3b3b 0%, #8b0000 100%)",
    color: "#ff3b3b",
    icon: "🔥",
    severity: "Critical"
  },
  Medical: {
    gradient: "linear-gradient(135deg, #ffa500 0%, #cc7000 100%)",
    color: "#ffa500",
    icon: "🏥",
    severity: "High"
  },
  Security: {
    gradient: "linear-gradient(135deg, #00bfff 0%, #005f87 100%)",
    color: "#00bfff",
    icon: "🔒",
    severity: "Medium"
  }
};

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: "24px"
  },
  floorSelector: {
    display: "flex",
    gap: "12px",
    padding: "16px",
    background: "rgba(0, 0, 0, 0.3)",
    borderRadius: "12px",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(255, 255, 255, 0.05)",
    flexWrap: "wrap",
    alignItems: "center"
  },
  floorLabel: {
    fontSize: "12px",
    fontWeight: "700",
    color: "#999",
    textTransform: "uppercase",
    letterSpacing: "1.5px",
    marginRight: "16px"
  },
  buttonGroup: {
    display: "flex",
    gap: "10px"
  },
  floorButton: (isSelected, hasAlerts) => ({
    padding: "10px 20px",
    background: isSelected
      ? "linear-gradient(135deg, #ff3b3b 0%, #ff6b6b 100%)"
      : "rgba(50, 50, 50, 0.6)",
    color: "white",
    border: `1px solid ${isSelected ? "#ff3b3b" : "rgba(255, 255, 255, 0.08)"}`,
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "14px",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    boxShadow: isSelected ? "0 4px 15px rgba(255, 59, 59, 0.3)" : "none",
    position: "relative"
  }),
  alertIndicator: {
    position: "absolute",
    top: "-4px",
    right: "-4px",
    width: "8px",
    height: "8px",
    background: "#ff3b3b",
    borderRadius: "50%",
    boxShadow: "0 0 8px rgba(255, 59, 59, 0.8)"
  },
  gridContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
    gap: "16px",
    padding: "20px",
    background: "rgba(0, 0, 0, 0.2)",
    borderRadius: "12px",
    border: "1px solid rgba(255, 77, 77, 0.08)",
    minHeight: "400px"
  },
  roomCard: (alert, isFocused, occupied) => {
    const config = alert ? ALERT_CONFIG[alert.type] : null;
    return {
      aspectRatio: "1",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background: alert
        ? config.gradient
        : occupied
        ? "linear-gradient(135deg, #16a34a 0%, #15803d 100%)"
        : "linear-gradient(135deg, #111111 0%, #050505 100%)",
      borderRadius: "12px",
      color: "white",
      fontWeight: "600",
      cursor: alert || occupied ? "pointer" : "default",
      border: `1px solid ${isFocused ? "rgba(255, 255, 255, 0.3)" : "rgba(255, 255, 255, 0.05)"}`,
      boxShadow: isFocused
        ? `0 12px 40px ${config?.color || "#fff"}44, inset 0 1px 0 rgba(255, 255, 255, 0.2)`
        : alert
        ? `0 8px 25px ${config.color}33, inset 0 1px 0 rgba(255, 255, 255, 0.1)`
        : occupied
        ? "0 8px 20px rgba(34, 197, 94, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.08)"
        : "0 4px 10px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
      transform: isFocused ? "scale(1.12) translateY(-4px)" : alert || occupied ? "scale(1.02)" : "scale(1)",
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      position: "relative",
      overflow: "hidden"
    };
  },
  roomContent: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px",
    zIndex: 1,
    textAlign: "center"
  },
  roomNumber: {
    fontSize: "18px",
    fontWeight: "700",
    letterSpacing: "0.5px"
  },
  alertIcon: {
    fontSize: "32px",
    lineHeight: "1"
  },
  alertType: {
    fontSize: "11px",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    opacity: 0.95
  },
  pulseIndicator: {
    position: "absolute",
    width: "10px",
    height: "10px",
    background: "rgba(255, 255, 255, 0.9)",
    borderRadius: "50%",
    top: "12px",
    right: "12px",
    animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
    boxShadow: "0 0 8px rgba(255, 255, 255, 0.6)"
  },
  emptyState: {
    gridColumn: "1 / -1",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "300px",
    color: "#555",
    fontSize: "15px",
    gap: "12px"
  },
  statsContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: "12px"
  },
  statCard: (type) => {
    const config = ALERT_CONFIG[type];
    return {
      padding: "14px 16px",
      background: `${config.color}11`,
      borderRadius: "8px",
      border: `1px solid ${config.color}22`,
      display: "flex",
      alignItems: "center",
      gap: "12px",
      fontSize: "13px",
      fontWeight: "600"
    };
  },
  statIcon: {
    fontSize: "20px"
  },
  statText: (type) => ({
    color: ALERT_CONFIG[type].color
  }),
  focusedInfo: {
    padding: "14px 16px",
    background: "rgba(255, 59, 59, 0.1)",
    borderRadius: "8px",
    border: "1px solid rgba(255, 59, 59, 0.2)",
    fontSize: "13px",
    color: "#ff3b3b",
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
    gap: "12px"
  }
};

const keyframes = `
  @keyframes pulse {
    0%, 100% {
      opacity: 1;
      transform: scale(1);
    }
    50% {
      opacity: 0.5;
      transform: scale(1.3);
    }
  }
`;

const isOccupied = (profile) => {
  if (!profile?.occupied || !profile?.stayUntil) return false;
  return new Date(profile.stayUntil).getTime() > Date.now();
};

export default function FloorMap({
  alerts,
  selectedAlert,
  onSelectAlert,
  facilityConfig,
  roomProfiles = {}
}) {
  const floors = Array.from(
    { length: facilityConfig?.floors || 3 },
    (_, i) => i + 1
  );
  const roomsPerFloor = facilityConfig?.roomsPerFloor || 10;
  const [selectedFloor, setSelectedFloor] = useState(floors[0] || 1);
  const [focusedRoom, setFocusedRoom] = useState(null);

  useEffect(() => {
    if (!floors.includes(selectedFloor)) {
      setSelectedFloor(floors[0] || 1);
    }
  }, [floors, selectedFloor]);

  // Sync with selected alert from panel
  useEffect(() => {
    if (selectedAlert?.room) {
      const floor = parseInt(selectedAlert.room[0]);
      setSelectedFloor(floor);
      setFocusedRoom(selectedAlert.room);
    }
  }, [selectedAlert]);

  const activeAlerts = alerts.filter((a) => a.status !== "Resolved");
  const rooms = generateRoomsForFloor(selectedFloor, roomsPerFloor);

  const roomAlertMap = {};
  activeAlerts.forEach((a) => {
    roomAlertMap[a.room] = a;
  });

  const floorPrefix = `${selectedFloor}`;
  const floorAlerts = activeAlerts.filter((a) => a.room.startsWith(floorPrefix));
  const alertStats = {
    Fire: floorAlerts.filter(a => a.type === "Fire").length,
    Medical: floorAlerts.filter(a => a.type === "Medical").length,
    Security: floorAlerts.filter(a => a.type === "Security").length
  };

  const handleFloorChange = (floor) => {
    setSelectedFloor(floor);
    setFocusedRoom(null);
  };

  const handleRoomClick = (room) => {
    const alert = roomAlertMap[room];
    if (alert || isOccupied(roomProfiles[room])) {
      setFocusedRoom(room);
      onSelectAlert?.(alert);
    }
  };

  return (
    <div style={styles.container}>
      <style>{keyframes}</style>

      {/* Floor Selector */}
      <div style={styles.floorSelector}>
        <span style={styles.floorLabel}>📍 Floor</span>
        <div style={styles.buttonGroup}>
          {floors.map((f) => {
            const hasAlerts = activeAlerts.some((a) => a.room.startsWith(`${f}`));
            return (
              <button
                key={f}
                onClick={() => handleFloorChange(f)}
                style={{
                  ...styles.floorButton(selectedFloor === f, hasAlerts),
                  position: "relative"
                }}
              >
                Floor {f}
                {hasAlerts && selectedFloor !== f && (
                  <div style={styles.alertIndicator} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Focused Room Info */}
      {focusedRoom && roomAlertMap[focusedRoom] && (
        <div style={styles.focusedInfo}>
          <span>{ALERT_CONFIG[roomAlertMap[focusedRoom].type].icon}</span>
          <span>
            Room {focusedRoom} • {roomAlertMap[focusedRoom].type} •{" "}
            {roomAlertMap[focusedRoom].status}
          </span>
        </div>
      )}
      {focusedRoom && !roomAlertMap[focusedRoom] && isOccupied(roomProfiles[focusedRoom]) && (
        <div style={styles.focusedInfo}>
          <span>🟢</span>
          <span>
            Room {focusedRoom} occupied until{" "}
            {new Date(roomProfiles[focusedRoom].stayUntil).toLocaleString()}
          </span>
        </div>
      )}

      {/* Room Grid */}
      <div style={styles.gridContainer}>
        {rooms.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={{ fontSize: "32px" }}>📭</div>
            <div>No rooms available</div>
          </div>
        ) : (
          rooms.map((room) => {
            const alert = roomAlertMap[room];
            const occupied = isOccupied(roomProfiles[room]);
            const isFocused = focusedRoom === room;

            return (
              <div
                key={room}
                onClick={() => handleRoomClick(room)}
                style={styles.roomCard(alert, isFocused, occupied)}
                title={
                  alert
                    ? `${alert.type} - ${alert.status}`
                    : occupied
                    ? `Room ${room} occupied`
                    : `Room ${room}`
                }
              >
                {alert && <div style={styles.pulseIndicator} />}

                <div style={styles.roomContent}>
                  <div style={styles.roomNumber}>{room}</div>
                  {alert && (
                    <>
                      <div style={styles.alertIcon}>
                        {ALERT_CONFIG[alert.type].icon}
                      </div>
                      <div style={styles.alertType}>{alert.type}</div>
                    </>
                  )}
                  {!alert && occupied && (
                    <div style={styles.alertType}>Occupied</div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Stats Footer */}
      {floorAlerts.length > 0 && (
        <div style={styles.statsContainer}>
          {Object.entries(alertStats).map(([type, count]) =>
            count > 0 ? (
              <div key={type} style={styles.statCard(type)}>
                <span style={styles.statIcon}>
                  {ALERT_CONFIG[type].icon}
                </span>
                <span style={styles.statText(type)}>
                  {count} {type}
                </span>
              </div>
            ) : null
          )}
        </div>
      )}
    </div>
  );
}