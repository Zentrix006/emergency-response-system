import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, doc, onSnapshot, updateDoc } from "firebase/firestore";
import AlertPanel from "../components/AlertPanel";
import FloorMap from "../components/FloorMap";
import { Canvas } from "@react-three/fiber";

function Background() {
  return (
    <Canvas 
      style={{ position: "fixed", zIndex: -1, height: "100vh", width: "100vw" }}
      camera={{ position: [0, 0, 5] }}
    >
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} intensity={1.2} />
      <pointLight position={[-10, -10, 5]} intensity={0.5} color="#00bfff" />
      
      <mesh rotation={[0.4, 0.2, 0]}>
        <sphereGeometry args={[3, 64, 64]} />
        <meshStandardMaterial 
          color="#ff3b3b" 
          wireframe 
          emissive="#ff3b3b"
          emissiveIntensity={0.15}
        />
      </mesh>
      
      <mesh position={[0, 0, -10]} scale={20}>
        <planeGeometry args={[1, 1]} />
        <meshStandardMaterial color="#0a0a0a" />
      </mesh>
    </Canvas>
  );
}

const styles = {
  container: {
    height: "100vh",
    overflow: "hidden",
    background: "linear-gradient(135deg, #0a0a0a 0%, #1a0a0a 100%)",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
  },
  wrapper: {
    display: "flex",
    height: "100%",
    color: "white",
    gap: "1px",
    background: "rgba(255, 59, 59, 0.05)"
  },
  panel: (side) => ({
    flex: side === "left" ? "0 0 32%" : "1",
    display: "flex",
    flexDirection: "column",
    background: side === "left" 
      ? "rgba(0, 0, 0, 0.6)" 
      : "rgba(10, 10, 10, 0.5)",
    backdropFilter: "blur(10px)",
    borderRight: side === "left" ? "1px solid rgba(255, 77, 77, 0.1)" : "none",
    boxShadow: side === "left" 
      ? "inset 0 0 20px rgba(255, 77, 77, 0.05)" 
      : "none"
  }),
  header: {
    padding: "0 24px",
    height: "70px",
    display: "flex",
    alignItems: "center",
    borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
    background: "rgba(0, 0, 0, 0.2)"
  },
  headerTitle: {
    fontSize: "18px",
    fontWeight: "700",
    letterSpacing: "1.2px",
    display: "flex",
    alignItems: "center",
    gap: "12px"
  },
  badge: {
    background: "linear-gradient(135deg, #ff3b3b 0%, #ff6b6b 100%)",
    color: "white",
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: "700",
    marginLeft: "auto"
  },
  content: {
    flex: 1,
    overflow: "hidden",
    display: "flex",
    flexDirection: "column"
  },
  contentScroll: {
    flex: 1,
    overflowY: "auto",
    padding: "24px",
    scrollBehavior: "smooth"
  },
  footer: {
    padding: "16px 24px",
    borderTop: "1px solid rgba(255, 255, 255, 0.05)",
    background: "rgba(0, 0, 0, 0.2)",
    fontSize: "12px",
    color: "#888",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },
  assignmentPanel: {
    margin: "12px 24px 0 24px",
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    background: "rgba(255, 255, 255, 0.04)",
    display: "flex",
    gap: "10px",
    alignItems: "end",
    flexWrap: "wrap"
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    minWidth: "180px",
    flex: "1 1 180px"
  },
  label: {
    fontSize: "11px",
    color: "#9ca3af",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: "0.6px"
  },
  input: {
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.14)",
    borderRadius: "6px",
    color: "white",
    padding: "8px 10px",
    fontSize: "13px",
    width: "100%"
  },
  assignButton: {
    background: "linear-gradient(135deg, #00bfff 0%, #005f87 100%)",
    border: "1px solid rgba(0,191,255,0.5)",
    borderRadius: "7px",
    color: "white",
    fontWeight: "700",
    padding: "9px 12px",
    cursor: "pointer",
    fontSize: "12px"
  },
  resolveButton: {
    marginTop: "6px",
    background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
    border: "1px solid rgba(34,197,94,0.6)",
    borderRadius: "6px",
    color: "white",
    fontWeight: "700",
    padding: "6px 10px",
    cursor: "pointer",
    fontSize: "11px"
  },
  taskPanel: {
    margin: "12px 24px 0 24px",
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    background: "rgba(255, 255, 255, 0.03)"
  },
  taskRow: {
    marginTop: "8px",
    padding: "8px 10px",
    borderRadius: "8px",
    border: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(255,255,255,0.03)",
    fontSize: "12px",
    color: "#d1d5db"
  },
  scrollbar: `
    ::-webkit-scrollbar {
      width: 8px;
    }
    ::-webkit-scrollbar-track {
      background: rgba(255, 77, 77, 0.03);
      border-radius: 10px;
    }
    ::-webkit-scrollbar-thumb {
      background: rgba(255, 77, 77, 0.2);
      border-radius: 10px;
      transition: background 0.3s ease;
    }
    ::-webkit-scrollbar-thumb:hover {
      background: rgba(255, 77, 77, 0.4);
    }
  `
};

export default function Staff() {
  const [alerts, setAlerts] = useState([]);
  const [roomProfiles, setRoomProfiles] = useState({});
  const [staffs, setStaffs] = useState([]);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [selectedStaffId, setSelectedStaffId] = useState("");
  const [taskViewerStaffId, setTaskViewerStaffId] = useState("");
  const [loading, setLoading] = useState(true);
  const [facilityConfig, setFacilityConfig] = useState({ floors: 3, roomsPerFloor: 10 });
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    fire: 0,
    medical: 0,
    security: 0
  });

 useEffect(() => {
  // Real-time listener - syncs all changes instantly
  const unsub = onSnapshot(
    collection(db, "alerts"),
    (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setAlerts(data);
      setLoading(false);

      // Auto-select latest if nothing selected
      if (!selectedAlert && data.length > 0) {
        setSelectedAlert(data[data.length - 1]);
      }

      // Calculate stats
      const activeAlerts = data.filter(a => a.status !== "Resolved");
      setStats({
        total: data.length,
        active: activeAlerts.length,
        fire: data.filter(a => a.type === "Fire").length,
        medical: data.filter(a => a.type === "Medical").length,
        security: data.filter(a => a.type === "Security").length
      });
    },
    (error) => {
      console.error("Error fetching alerts:", error);
      setLoading(false);
    }
  );

  return () => unsub();
}, []);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "config", "facility"), (snapshot) => {
      const config = snapshot.data();
      if (config?.floors && config?.roomsPerFloor) {
        setFacilityConfig({
          floors: Number(config.floors),
          roomsPerFloor: Number(config.roomsPerFloor)
        });
      }
    });

    return () => unsub();
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "staffs"), (snapshot) => {
      setStaffs(snapshot.docs.map((staffDoc) => ({ id: staffDoc.id, ...staffDoc.data() })));
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "rooms"), (snapshot) => {
      const profiles = {};
      snapshot.docs.forEach((roomDoc) => {
        profiles[roomDoc.id] = roomDoc.data();
      });
      setRoomProfiles(profiles);
    });

    return () => unsub();
  }, []);

  

  const handleAlertSelect = (alert) => {
    setSelectedAlert(alert);
  };

  const handleClearSelection = () => {
    setSelectedAlert(null);
    setSelectedStaffId("");
  };

  const alertDomain = selectedAlert?.type || "";
  const sameDeptStaffs = selectedAlert
    ? staffs.filter((staff) => staff.department === alertDomain)
    : [];
  const visibleAssignedTasks = alerts.filter(
    (alert) => taskViewerStaffId && alert.assignedStaffId === taskViewerStaffId
  );

  const assignStaffToAlert = async () => {
    if (!selectedAlert?.id || !selectedStaffId) return;
    const picked = sameDeptStaffs.find((staff) => staff.id === selectedStaffId);
    if (!picked) return;
    try {
      await updateDoc(doc(db, "alerts", selectedAlert.id), {
        assignedStaffId: picked.id,
        assignedStaffName: picked.name,
        assignedStaffDepartment: picked.department,
        assignedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error assigning staff to alert:", error);
      alert("Failed to assign staff.");
    }
  };

  const confirmResolved = async (alertId) => {
    try {
      await updateDoc(doc(db, "alerts", alertId), {
        status: "Resolved",
        resolvedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error confirming resolution:", error);
      alert("Failed to resolve issue.");
    }
  };

  return (
    <div style={styles.container}>
      <style>{styles.scrollbar}</style>
      <Background />

      <div style={styles.wrapper}>
        {/* LEFT PANEL - ALERTS */}
        <div style={styles.panel("left")}>
          <div style={styles.header}>
            <div style={styles.headerTitle}>
              <span>🚨</span>
              <span>Active Alerts</span>
              <span style={styles.badge}>{stats.active}</span>
            </div>
          </div>

          <div style={styles.content}>
            <div style={styles.taskPanel}>
              <div style={{ ...styles.label, marginBottom: "8px" }}>View Assigned Tasks</div>
              <div style={styles.field}>
                <select
                  value={taskViewerStaffId}
                  onChange={(e) => setTaskViewerStaffId(e.target.value)}
                  style={styles.input}
                >
                  <option value="">Select staff profile</option>
                  {staffs.map((staff) => (
                    <option key={staff.id} value={staff.id}>
                      {staff.name} ({staff.department})
                    </option>
                  ))}
                </select>
              </div>
              {taskViewerStaffId && visibleAssignedTasks.length === 0 && (
                <div style={styles.taskRow}>No tasks assigned to this staff.</div>
              )}
              {visibleAssignedTasks.map((task) => (
                <div key={task.id} style={styles.taskRow}>
                  {task.type} • Room {task.room} • {task.status}
                  {task.completedByStaffName && ` • Completed by ${task.completedByStaffName}`}
                  {task.status === "Completed" && (
                    <div>
                      <button style={styles.resolveButton} onClick={() => confirmResolved(task.id)}>
                        Confirm & Resolve
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div style={styles.contentScroll}>
              <AlertPanel
                alerts={alerts}
                selectedAlert={selectedAlert}
                onSelectAlert={handleAlertSelect}
                loading={loading}
              />
            </div>

            {alerts.length > 0 && (
              <div style={styles.footer}>
                <div>
                  <span>🔥 {stats.fire} </span>
                  <span>���� {stats.medical} </span>
                  <span>🔒 {stats.security}</span>
                </div>
                <span>{new Date().toLocaleTimeString()}</span>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANEL - FLOOR MAP */}
        <div style={styles.panel("right")}>
          <div style={styles.header}>
            <div style={styles.headerTitle}>
              <span>🗺️</span>
              <span>Floor Map</span>
              {selectedAlert && (
                <span style={{
                  marginLeft: "auto",
                  fontSize: "12px",
                  color: "#aaa"
                }}>
                  Room {selectedAlert.room} • {selectedAlert.type}
                  <button
                    onClick={handleClearSelection}
                    style={{
                      marginLeft: "12px",
                      background: "none",
                      border: "none",
                      color: "#888",
                      cursor: "pointer",
                      fontSize: "14px"
                    }}
                  >
                    ✕
                  </button>
                </span>
              )}
            </div>
          </div>

          <div style={styles.content}>
            {selectedAlert && (
              <div style={styles.assignmentPanel}>
                <div style={styles.field}>
                  <label style={styles.label}>Issue</label>
                  <input
                    disabled
                    value={`${selectedAlert.type} - Room ${selectedAlert.room}`}
                    style={styles.input}
                  />
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Department Staff ({alertDomain})</label>
                  <select
                    value={selectedStaffId}
                    onChange={(e) => setSelectedStaffId(e.target.value)}
                    style={styles.input}
                  >
                    <option value="">Select staff</option>
                    {sameDeptStaffs.map((staff) => (
                      <option key={staff.id} value={staff.id}>
                        {staff.name} ({staff.role || "Staff"})
                      </option>
                    ))}
                  </select>
                </div>
                <button onClick={assignStaffToAlert} style={styles.assignButton}>
                  Assign to Issue
                </button>
              </div>
            )}
            <div style={styles.contentScroll}>
              <FloorMap
                alerts={alerts}
                selectedAlert={selectedAlert}
                onSelectAlert={handleAlertSelect}
                facilityConfig={facilityConfig}
                roomProfiles={roomProfiles}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}