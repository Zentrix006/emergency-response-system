import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import { db } from "../firebase";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  setDoc,
  updateDoc,
  writeBatch
} from "firebase/firestore";
import { generateRoomsForFloor } from "../utils/rooms";

const ALERT_CONFIG = {
  Fire: { color: "#ff3b3b", icon: "🔥", severity: "Critical" },
  Medical: { color: "#ffa500", icon: "🏥", severity: "High" },
  Security: { color: "#00bfff", icon: "🔒", severity: "Medium" }
};

const STATUS_CONFIG = {
  Pending: { color: "#fbbf24", icon: "⏳" },
  Responding: { color: "#f97316", icon: "🚗" },
  Resolved: { color: "#4ade80", icon: "✅" }
};

const DEPT_CONFIG = {
  Fire: { icon: "🔥", color: "#ff3b3b" },
  Medical: { icon: "🏥", color: "#ffa500" },
  Security: { icon: "🔒", color: "#00bfff" }
};

const DEPARTMENTS = ["Fire", "Medical", "Security"];
const HISTORY_CLEAR_PASSWORD = "admin";

const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0a0a0a 0%, #1a0a0a 100%)",
    color: "white",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    padding: "24px"
  },
  title: { fontSize: "32px", fontWeight: "700", marginBottom: "8px", letterSpacing: "1px" },
  subtitle: { fontSize: "14px", color: "#888", fontWeight: "500", marginBottom: "16px" },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: "12px",
    marginBottom: "14px"
  },
  statCard: (color) => ({
    padding: "14px 16px",
    background: `${color}15`,
    borderRadius: "8px",
    border: `1px solid ${color}33`
  }),
  statValue: (color) => ({ fontSize: "24px", fontWeight: "700", color }),
  statLabel: { fontSize: "12px", color: "#888", textTransform: "uppercase", letterSpacing: "0.5px" },
  controls: { display: "flex", gap: "12px", marginBottom: "16px", flexWrap: "wrap" },
  controlGroup: { display: "flex", gap: "8px", flexWrap: "wrap" },
  smallBtn: (active, color) => ({
    padding: "8px 12px",
    borderRadius: "6px",
    border: `1px solid ${active ? color : "rgba(255,255,255,0.12)"}`,
    background: active ? `${color}33` : "rgba(50,50,50,0.6)",
    color: "white",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "600"
  }),
  alertsContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
    gap: "12px"
  },
  alertCard: (color) => ({
    border: `1px solid ${color}44`,
    borderRadius: "10px",
    padding: "14px",
    background: "rgba(20,20,20,0.8)"
  }),
  row: { display: "flex", justifyContent: "space-between", gap: "8px", alignItems: "center" },
  label: { fontSize: "11px", color: "#999", textTransform: "uppercase", letterSpacing: "0.5px" },
  value: { fontSize: "13px", color: "#ddd", fontWeight: "500" },
  section: {
    marginTop: "16px",
    background: "rgba(0, 0, 0, 0.35)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    borderRadius: "10px",
    padding: "16px"
  },
  sectionTitle: { fontSize: "14px", fontWeight: "700", marginBottom: "10px", color: "#ddd" },
  formRow: { display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "end" },
  field: { display: "flex", flexDirection: "column", gap: "6px", minWidth: "220px", flex: "1 1 220px" },
  fieldLabel: { fontSize: "12px", color: "#999", fontWeight: "600" },
  input: {
    background: "rgba(255, 255, 255, 0.06)",
    border: "1px solid rgba(255, 255, 255, 0.12)",
    borderRadius: "6px",
    color: "white",
    padding: "10px 12px",
    fontSize: "14px",
    width: "100%",
    boxSizing: "border-box"
  },
  textArea: {
    background: "rgba(255, 255, 255, 0.06)",
    border: "1px solid rgba(255, 255, 255, 0.12)",
    borderRadius: "6px",
    color: "white",
    padding: "10px 12px",
    fontSize: "14px",
    width: "100%",
    minHeight: "84px",
    resize: "vertical",
    boxSizing: "border-box"
  },
  button: (kind = "primary") => ({
    background:
      kind === "danger"
        ? "linear-gradient(135deg, #ef4444 0%, #f87171 100%)"
        : kind === "neutral"
        ? "linear-gradient(135deg, #374151 0%, #4b5563 100%)"
        : "linear-gradient(135deg, #00bfff 0%, #005f87 100%)",
    border: "1px solid rgba(255,255,255,0.25)",
    borderRadius: "7px",
    color: "white",
    fontWeight: "700",
    padding: "10px 14px",
    cursor: "pointer",
    fontSize: "12px"
  }),
  note: { marginTop: "8px", color: "#9ca3af", fontSize: "12px" },
  roomGrid: {
    marginTop: "12px",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(90px, 1fr))",
    gap: "8px"
  },
  roomButton: (active) => ({
    padding: "8px 10px",
    borderRadius: "8px",
    border: active ? "1px solid rgba(0,191,255,0.7)" : "1px solid rgba(255,255,255,0.15)",
    background: active ? "rgba(0,191,255,0.2)" : "rgba(255,255,255,0.04)",
    color: "white",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "700"
  }),
  tabs: { display: "flex", gap: "8px", marginBottom: "12px", flexWrap: "wrap" },
  tab: (active) => ({
    padding: "8px 12px",
    borderRadius: "7px",
    border: active ? "1px solid #00bfff" : "1px solid rgba(255,255,255,0.12)",
    background: active ? "rgba(0,191,255,0.2)" : "rgba(255,255,255,0.04)",
    color: "white",
    cursor: "pointer",
    fontWeight: "700",
    fontSize: "12px"
  }),
  staffGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "10px" },
  staffCard: {
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.03)",
    borderRadius: "8px",
    padding: "10px"
  },
  profileLink: { color: "#7ddcff", fontSize: "12px", textDecoration: "none", fontWeight: "700" },
  historyItem: {
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(255,255,255,0.03)",
    fontSize: "12px",
    color: "#d1d5db"
  }
};

export default function Admin() {
  const [alerts, setAlerts] = useState([]);
  const [historyAlerts, setHistoryAlerts] = useState([]);
  const [staffs, setStaffs] = useState([]);
  const [roomProfiles, setRoomProfiles] = useState({});
  const [facility, setFacility] = useState({ floors: 3, roomsPerFloor: 10 });
  const [facilityDraft, setFacilityDraft] = useState({ floors: 3, roomsPerFloor: 10 });
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [activeTab, setActiveTab] = useState("rooms");
  const [selectedFloor, setSelectedFloor] = useState(1);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [roomForm, setRoomForm] = useState({
    visitorName: "",
    oldProblems: "",
    presentProblems: "",
    enabled: true
  });
  const [historyPassword, setHistoryPassword] = useState("");
  const [newStaff, setNewStaff] = useState({ name: "", department: "Fire", role: "" });

  useEffect(() => onSnapshot(collection(db, "alerts"), (s) => setAlerts(s.docs.map((d) => ({ id: d.id, ...d.data() })))), []);
  useEffect(() => onSnapshot(collection(db, "alertsHistory"), (s) => {
    const list = s.docs.map((d) => ({ id: d.id, ...d.data() }));
    list.sort((a, b) => new Date(b.archivedAt || 0) - new Date(a.archivedAt || 0));
    setHistoryAlerts(list);
  }), []);
  useEffect(() => onSnapshot(collection(db, "rooms"), (s) => {
    const profiles = {};
    s.docs.forEach((d) => { profiles[d.id] = d.data(); });
    setRoomProfiles(profiles);
  }), []);
  useEffect(() => onSnapshot(collection(db, "staffs"), (s) => setStaffs(s.docs.map((d) => ({ id: d.id, ...d.data() })))), []);
  useEffect(() => onSnapshot(doc(db, "config", "facility"), (snap) => {
    const config = snap.data();
    if (config?.floors && config?.roomsPerFloor) {
      const safe = { floors: Number(config.floors), roomsPerFloor: Number(config.roomsPerFloor) };
      setFacility(safe);
      setFacilityDraft(safe);
    }
  }), []);

  useEffect(() => {
    if (selectedFloor > facility.floors) setSelectedFloor(1);
  }, [facility.floors, selectedFloor]);

  const stats = {
    total: alerts.length,
    pending: alerts.filter((a) => a.status === "Pending").length,
    responding: alerts.filter((a) => a.status === "Responding").length,
    resolved: alerts.filter((a) => a.status === "Resolved").length
  };

  const filteredAlerts = alerts.filter((a) => {
    if (filter === "all") return true;
    return a.status === (filter.charAt(0).toUpperCase() + filter.slice(1));
  });
  const sortedAlerts = [...filteredAlerts].sort((a, b) => {
    if (sortBy === "recent") return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    if (sortBy === "priority") return ({ Fire: 0, Medical: 1, Security: 2 }[a.type] || 99) - ({ Fire: 0, Medical: 1, Security: 2 }[b.type] || 99);
    return (a.room || "").localeCompare(b.room || "");
  });

  const selectedRoomProfile = selectedRoom ? roomProfiles[selectedRoom] : null;
  useEffect(() => {
    if (!selectedRoom) return;
    setRoomForm({
      visitorName: selectedRoomProfile?.visitorName || "",
      oldProblems: selectedRoomProfile?.oldProblems || "",
      presentProblems: selectedRoomProfile?.presentProblems || "",
      enabled: selectedRoomProfile?.enabled ?? true
    });
  }, [selectedRoom, selectedRoomProfile]);

  const roomList = generateRoomsForFloor(selectedFloor, facility.roomsPerFloor);
  const qrUrl = selectedRoom ? `${window.location.origin}/emergency-response-system/report?room=${selectedRoom}` : "";
  const staffByDept = useMemo(() => {
    const grouped = { Fire: [], Medical: [], Security: [] };
    staffs.forEach((s) => grouped[s.department]?.push(s));
    return grouped;
  }, [staffs]);
  const staffAlertAssignments = useMemo(() => {
    const map = {};
    alerts.forEach((alert) => {
      if (!alert.assignedStaffId) return;
      if (!map[alert.assignedStaffId]) map[alert.assignedStaffId] = [];
      map[alert.assignedStaffId].push(alert);
    });
    return map;
  }, [alerts]);

  const updateStatus = async (id, status) => {
    await updateDoc(doc(db, "alerts", id), { status, updatedAt: new Date().toISOString() });
  };
  const deleteAlert = async (id) => {
    if (window.confirm("Delete this alert?")) await deleteDoc(doc(db, "alerts", id));
  };
  const saveFacilityConfig = async () => {
    const floors = Math.max(1, Math.min(9, Number(facilityDraft.floors) || 0));
    const roomsPerFloor = Math.max(1, Math.min(99, Number(facilityDraft.roomsPerFloor) || 0));
    await setDoc(doc(db, "config", "facility"), { floors, roomsPerFloor, updatedAt: new Date().toISOString() });
  };
  const saveRoomDetails = async () => {
    if (!selectedRoom) return;
    await setDoc(doc(db, "rooms", selectedRoom), { ...roomForm, enabled: !!roomForm.enabled, updatedAt: new Date().toISOString() });
    alert(`Room ${selectedRoom} updated.`);
  };
  const copyQrLink = async () => qrUrl && navigator.clipboard.writeText(qrUrl);
  const downloadQr = () => {
    const canvas = document.getElementById("room-qr-canvas");
    if (!canvas || !selectedRoom) return;
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = `room-${selectedRoom}-qr.png`;
    a.click();
  };

  const clearAllAlertsToHistory = async () => {
    if (!alerts.length) return alert("No active alerts.");
    if (!window.confirm("Move all active alerts to history?")) return;
    const batch = writeBatch(db);
    alerts.forEach((item) => {
      const historyRef = doc(collection(db, "alertsHistory"));
      batch.set(historyRef, { ...item, archivedAt: new Date().toISOString() });
      batch.delete(doc(db, "alerts", item.id));
    });
    await batch.commit();
  };
  const clearHistoryWithPassword = async () => {
    if (historyPassword !== HISTORY_CLEAR_PASSWORD) return alert("Incorrect password.");
    if (!window.confirm("Delete all history alerts?")) return;
    const snap = await getDocs(collection(db, "alertsHistory"));
    const batch = writeBatch(db);
    snap.docs.forEach((d) => batch.delete(doc(db, "alertsHistory", d.id)));
    await batch.commit();
    setHistoryPassword("");
  };

  const createStaff = async () => {
    if (!newStaff.name.trim()) return alert("Enter staff name.");
    const staffRef = doc(collection(db, "staffs"));
    await setDoc(staffRef, {
      name: newStaff.name.trim(),
      department: newStaff.department,
      role: newStaff.role.trim() || "Staff",
      assignedIssues: [],
      createdAt: new Date().toISOString()
    });
    setNewStaff((p) => ({ ...p, name: "", role: "" }));
  };
  const deleteStaffProfile = async (staffId, staffName) => {
    if (!window.confirm(`Delete staff profile for ${staffName}?`)) return;
    try {
      await deleteDoc(doc(db, "staffs", staffId));
      const alertSnap = await getDocs(collection(db, "alerts"));
      const batch = writeBatch(db);
      alertSnap.docs.forEach((alertDoc) => {
        const alertData = alertDoc.data();
        if (alertData.assignedStaffId === staffId) {
          batch.update(doc(db, "alerts", alertDoc.id), {
            assignedStaffId: null,
            assignedStaffName: null,
            assignedStaffDepartment: null,
            updatedAt: new Date().toISOString()
          });
        }
      });
      await batch.commit();
    } catch (error) {
      console.error("Error deleting staff profile:", error);
      alert("Failed to delete staff profile.");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.title}>🧠 Admin Control Panel</div>
      <div style={styles.subtitle}>Monitor active alerts, room setup, and staff operations.</div>

      <div style={styles.statsGrid}>
        <div style={styles.statCard("#888")}><div style={styles.statValue("#fff")}>{stats.total}</div><div style={styles.statLabel}>Total Alerts</div></div>
        <div style={styles.statCard("#fbbf24")}><div style={styles.statValue("#fbbf24")}>{stats.pending}</div><div style={styles.statLabel}>Pending</div></div>
        <div style={styles.statCard("#f97316")}><div style={styles.statValue("#f97316")}>{stats.responding}</div><div style={styles.statLabel}>Responding</div></div>
        <div style={styles.statCard("#4ade80")}><div style={styles.statValue("#4ade80")}>{stats.resolved}</div><div style={styles.statLabel}>Resolved</div></div>
      </div>

      <div style={styles.controls}>
        <div style={styles.controlGroup}>
          {["all", "pending", "responding", "resolved"].map((f) => (
            <button key={f} onClick={() => setFilter(f)} style={styles.smallBtn(filter === f, "#ff3b3b")}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <div style={styles.controlGroup}>
          {["recent", "priority", "room"].map((s) => (
            <button key={s} onClick={() => setSortBy(s)} style={styles.smallBtn(sortBy === s, "#00bfff")}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {sortedAlerts.length === 0 ? (
        <div style={{ ...styles.section, textAlign: "center" }}>No alerts to display.</div>
      ) : (
        <div style={styles.alertsContainer}>
          {sortedAlerts.map((alert) => {
            const statusConfig = STATUS_CONFIG[alert.status] || STATUS_CONFIG.Pending;
            const color = ALERT_CONFIG[alert.type]?.color || "#888";
            return (
              <div key={alert.id} style={styles.alertCard(color)}>
                <div style={{ ...styles.row, marginBottom: "8px" }}>
                  <div style={{ fontWeight: "700", color }}>
                    {ALERT_CONFIG[alert.type]?.icon || "❗"} {alert.type}
                  </div>
                  <div style={{ color: statusConfig.color, fontWeight: "700" }}>
                    {statusConfig.icon} {alert.status}
                  </div>
                </div>
                <div style={{ ...styles.row, marginBottom: "8px" }}>
                  <div><div style={styles.label}>Room</div><div style={styles.value}>{alert.room}</div></div>
                  <div><div style={styles.label}>Floor</div><div style={styles.value}>Level {alert.floor}</div></div>
                </div>
                <div style={styles.row}>
                  {alert.status !== "Resolved" ? (
                    <button style={styles.button()} onClick={() => updateStatus(alert.id, "Resolved")}>Resolve</button>
                  ) : <span />}
                  <button style={styles.button("danger")} onClick={() => deleteAlert(alert.id)}>Delete</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div style={styles.section}>
        <div style={styles.tabs}>
          <button style={styles.tab(activeTab === "rooms")} onClick={() => setActiveTab("rooms")}>Rooms</button>
          <button style={styles.tab(activeTab === "staffs")} onClick={() => setActiveTab("staffs")}>Staffs</button>
        </div>

        {activeTab === "rooms" && (
          <>
            <div style={styles.sectionTitle}>🏢 Facility & Room Setup</div>
            <div style={styles.formRow}>
              <div style={styles.field}>
                <label style={styles.fieldLabel}>Floors</label>
                <input type="number" min={1} max={9} value={facilityDraft.floors} onChange={(e) => setFacilityDraft((p) => ({ ...p, floors: e.target.value }))} style={styles.input} />
              </div>
              <div style={styles.field}>
                <label style={styles.fieldLabel}>Rooms per floor</label>
                <input type="number" min={1} max={99} value={facilityDraft.roomsPerFloor} onChange={(e) => setFacilityDraft((p) => ({ ...p, roomsPerFloor: e.target.value }))} style={styles.input} />
              </div>
              <button onClick={saveFacilityConfig} style={styles.button()}>Save Configuration</button>
            </div>
            <div style={styles.note}>Current: {facility.floors} floor(s), {facility.roomsPerFloor} rooms/floor</div>

            <div style={{ ...styles.formRow, marginTop: "12px" }}>
              <div style={styles.field}>
                <label style={styles.fieldLabel}>Select Floor</label>
                <select value={selectedFloor} onChange={(e) => { setSelectedFloor(Number(e.target.value)); setSelectedRoom(null); }} style={styles.input}>
                  {Array.from({ length: facility.floors }, (_, i) => i + 1).map((floor) => (
                    <option key={floor} value={floor}>Floor {floor}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={styles.roomGrid}>
              {roomList.map((room) => (
                <button key={room} onClick={() => setSelectedRoom(room)} style={styles.roomButton(selectedRoom === room)}>
                  {room} {roomProfiles[room]?.enabled ? "●" : ""}
                </button>
              ))}
            </div>

            {selectedRoom && (
              <>
                <div style={{ ...styles.formRow, marginTop: "12px" }}>
                  <div style={styles.field}>
                    <label style={styles.fieldLabel}>Room</label>
                    <input value={selectedRoom} disabled style={styles.input} />
                  </div>
                  <div style={styles.field}>
                    <label style={styles.fieldLabel}>Visitor Name</label>
                    <input value={roomForm.visitorName} onChange={(e) => setRoomForm((p) => ({ ...p, visitorName: e.target.value }))} style={styles.input} />
                  </div>
                  <div style={styles.field}>
                    <label style={styles.fieldLabel}>Room Active</label>
                    <select value={roomForm.enabled ? "yes" : "no"} onChange={(e) => setRoomForm((p) => ({ ...p, enabled: e.target.value === "yes" }))} style={styles.input}>
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                    </select>
                  </div>
                </div>
                <div style={styles.formRow}>
                  <div style={styles.field}>
                    <label style={styles.fieldLabel}>Old Problems</label>
                    <textarea value={roomForm.oldProblems} onChange={(e) => setRoomForm((p) => ({ ...p, oldProblems: e.target.value }))} style={styles.textArea} />
                  </div>
                  <div style={styles.field}>
                    <label style={styles.fieldLabel}>Present Problems</label>
                    <textarea value={roomForm.presentProblems} onChange={(e) => setRoomForm((p) => ({ ...p, presentProblems: e.target.value }))} style={styles.textArea} />
                  </div>
                </div>
                <div style={{ ...styles.formRow, marginTop: "8px" }}>
                  <button onClick={saveRoomDetails} style={styles.button()}>Save Room</button>
                  <button onClick={copyQrLink} style={styles.button("neutral")}>Copy QR Link</button>
                  <button onClick={downloadQr} style={styles.button("neutral")}>Download QR</button>
                  <QRCodeCanvas id="room-qr-canvas" value={qrUrl} size={120} bgColor="#ffffff" fgColor="#111111" />
                </div>
                <div style={styles.note}>{qrUrl}</div>
              </>
            )}
          </>
        )}

        {activeTab === "staffs" && (
          <>
            <div style={styles.sectionTitle}>👨‍⚕️ Staff Management</div>
            <div style={styles.formRow}>
              <div style={styles.field}>
                <label style={styles.fieldLabel}>Department</label>
                <select value={newStaff.department} onChange={(e) => setNewStaff((p) => ({ ...p, department: e.target.value }))} style={styles.input}>
                  {DEPARTMENTS.map((dept) => <option key={dept} value={dept}>{dept}</option>)}
                </select>
              </div>
              <div style={styles.field}>
                <label style={styles.fieldLabel}>Staff Name</label>
                <input value={newStaff.name} onChange={(e) => setNewStaff((p) => ({ ...p, name: e.target.value }))} style={styles.input} />
              </div>
              <div style={styles.field}>
                <label style={styles.fieldLabel}>Role</label>
                <input value={newStaff.role} onChange={(e) => setNewStaff((p) => ({ ...p, role: e.target.value }))} style={styles.input} />
              </div>
              <button onClick={createStaff} style={styles.button()}>Create Staff</button>
            </div>

            {DEPARTMENTS.map((dept) => (
              <div key={dept} style={{ marginTop: "14px" }}>
                <div style={styles.sectionTitle}>{DEPT_CONFIG[dept].icon} {dept}</div>
                <div style={styles.staffGrid}>
                  {(staffByDept[dept] || []).map((staff) => (
                    <div key={staff.id} style={styles.staffCard}>
                      <div style={{ fontWeight: "700" }}>{staff.name}</div>
                      <div style={styles.note}>{staff.role || "Staff"}</div>
                      <div style={styles.note}>Open issues: {(staff.assignedIssues || []).length}</div>
                      <div style={styles.note}>
                        Alert assignments: {(staffAlertAssignments[staff.id] || []).length}
                      </div>
                      {(staffAlertAssignments[staff.id] || []).slice(0, 3).map((alert) => (
                        <div key={alert.id} style={styles.note}>
                          • Room {alert.room} ({alert.type})
                        </div>
                      ))}
                      <button
                        style={{ ...styles.button("danger"), marginTop: "8px" }}
                        onClick={() => deleteStaffProfile(staff.id, staff.name)}
                      >
                        Delete Staff
                      </button>
                      <Link style={styles.profileLink} to={`/staffs/${staff.id}`}>Open Staff Profile</Link>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      <div style={styles.section}>
        <div style={styles.sectionTitle}>🗂️ Alert History</div>
        <div style={styles.formRow}>
          <button onClick={clearAllAlertsToHistory} style={styles.button("danger")}>
            Clear All Alerts (Move to History)
          </button>
        </div>
        <div style={styles.note}>Active: {alerts.length} • History: {historyAlerts.length}</div>
        <div style={{ ...styles.formRow, marginTop: "10px" }}>
          <div style={styles.field}>
            <label style={styles.fieldLabel}>History Clear Password</label>
            <input
              type="password"
              value={historyPassword}
              onChange={(e) => setHistoryPassword(e.target.value)}
              style={styles.input}
              placeholder="Enter password"
            />
          </div>
          <button onClick={clearHistoryWithPassword} style={styles.button("danger")}>
            Clear History Permanently
          </button>
        </div>
        
        {historyAlerts.slice(0, 5).map((item) => (
          <div key={item.id} style={styles.historyItem}>
            {item.room} • {item.type} • {item.status} • {item.archivedAt ? new Date(item.archivedAt).toLocaleString() : "archived"}
          </div>
        ))}
      </div>
    </div>
  );
}
