import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { db } from "../firebase";
import { collection, doc, onSnapshot, updateDoc } from "firebase/firestore";

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0a0a0a 0%, #1a0a0a 100%)",
    color: "white",
    padding: "24px",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
  },
  card: {
    maxWidth: "820px",
    margin: "0 auto",
    background: "rgba(20, 20, 20, 0.85)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    borderRadius: "12px",
    padding: "18px"
  },
  title: { fontSize: "28px", fontWeight: "700", marginBottom: "6px" },
  subtitle: { color: "#9ca3af", fontSize: "13px", marginBottom: "14px" },
  issue: {
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(255,255,255,0.03)",
    marginBottom: "8px"
  },
  row: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "10px",
    marginBottom: "8px"
  },
  input: {
    border: "1px solid rgba(255,255,255,0.2)",
    borderRadius: "6px",
    background: "rgba(255,255,255,0.06)",
    color: "white",
    padding: "8px 10px",
    width: "100%",
    boxSizing: "border-box"
  },
  button: {
    border: "1px solid rgba(255,255,255,0.2)",
    borderRadius: "6px",
    background: "rgba(255,255,255,0.06)",
    color: "white",
    padding: "8px 10px",
    cursor: "pointer"
  },
  primaryButton: {
    border: "1px solid rgba(0,191,255,0.5)",
    borderRadius: "6px",
    background: "linear-gradient(135deg, #00bfff 0%, #005f87 100%)",
    color: "white",
    padding: "8px 10px",
    cursor: "pointer"
  },
  comments: {
    fontSize: "12px",
    color: "#cbd5e1",
    marginTop: "6px"
  }
};

export default function StaffProfile() {
  const { staffId } = useParams();
  const [staff, setStaff] = useState(null);
  const [assignedAlerts, setAssignedAlerts] = useState([]);
  const [commentDrafts, setCommentDrafts] = useState({});

  useEffect(() => {
    if (!staffId) return;
    return onSnapshot(doc(db, "staffs", staffId), (snap) => {
      if (snap.exists()) setStaff({ id: snap.id, ...snap.data() });
    });
  }, [staffId]);

  useEffect(() => {
    if (!staffId) return;
    return onSnapshot(collection(db, "alerts"), (snapshot) => {
      const list = snapshot.docs
        .map((alertDoc) => ({ id: alertDoc.id, ...alertDoc.data() }))
        .filter((alert) => alert.assignedStaffId === staffId && alert.status !== "Resolved");
      list.sort((a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0));
      setAssignedAlerts(list);
    });
  }, [staffId]);

  const addComment = async (alertItem) => {
    const text = (commentDrafts[alertItem.id] || "").trim();
    if (!text) return;
    const comments = [
      ...(alertItem.staffComments || []),
      {
        text,
        by: staff?.name || "Staff",
        byStaffId: staff?.id || "",
        createdAt: new Date().toISOString()
      }
    ];
    await updateDoc(doc(db, "alerts", alertItem.id), {
      staffComments: comments,
      updatedAt: new Date().toISOString()
    });
    setCommentDrafts((prev) => ({ ...prev, [alertItem.id]: "" }));
  };

  const markCompleted = async (alertItem) => {
    await updateDoc(doc(db, "alerts", alertItem.id), {
      status: "Completed",
      completedByStaffId: staff?.id || "",
      completedByStaffName: staff?.name || "",
      completedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  };

  if (!staff) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>Loading staff profile...</div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.title}>{staff.name}</div>
        <div style={styles.subtitle}>
          Department: {staff.department} • Role: {staff.role || "Staff"}
        </div>
        <Link to="/admin" style={{ color: "#7ddcff", textDecoration: "none", fontSize: "12px" }}>
          ← Back to Admin
        </Link>

        <div style={{ marginTop: "16px", fontWeight: "700", marginBottom: "8px" }}>
          Assigned Issues ({assignedAlerts.length})
        </div>
        {assignedAlerts.length === 0 && <div style={styles.subtitle}>No active assigned issues.</div>}
        {assignedAlerts.map((alertItem) => (
          <div key={alertItem.id} style={styles.issue}>
            <div style={styles.row}>
              <div style={{ fontWeight: "700" }}>
                {alertItem.type} • Room {alertItem.room}
              </div>
              <div style={{ fontSize: "12px", color: "#9ca3af" }}>{alertItem.status}</div>
            </div>
            <div style={{ fontSize: "12px", color: "#9ca3af", marginBottom: "8px" }}>
              Department: {alertItem.assignedDept} • Created:{" "}
              {alertItem.createdAt ? new Date(alertItem.createdAt).toLocaleString() : "-"}
            </div>
            {(alertItem.staffComments || []).map((comment, index) => (
              <div key={`${alertItem.id}-comment-${index}`} style={styles.comments}>
                • {comment.text} — {comment.by}
              </div>
            ))}
            <div style={{ ...styles.row, marginTop: "8px" }}>
              <input
                value={commentDrafts[alertItem.id] || ""}
                onChange={(e) =>
                  setCommentDrafts((prev) => ({ ...prev, [alertItem.id]: e.target.value }))
                }
                style={styles.input}
                placeholder="Add progress comment"
              />
              <button style={styles.button} onClick={() => addComment(alertItem)}>
                Comment
              </button>
              {alertItem.status !== "Completed" && (
                <button style={styles.primaryButton} onClick={() => markCompleted(alertItem)}>
                  Mark Completed
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
