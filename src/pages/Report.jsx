import { useSearchParams } from "react-router-dom";
import { db } from "../firebase";
import { collection, addDoc, doc, getDoc } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";

const ALERT_TYPES = {
  Fire: {
    icon: "🔥",
    label: "Fire Emergency",
    gradient: "linear-gradient(135deg, #ff3b3b 0%, #8b0000 100%)",
    color: "#ff3b3b",
    description: "Report a fire or smoke"
  },
  Medical: {
    icon: "🏥",
    label: "Medical Emergency",
    gradient: "linear-gradient(135deg, #ffa500 0%, #cc7000 100%)",
    color: "#ffa500",
    description: "Report a medical issue"
  },
  Security: {
    icon: "🔒",
    label: "Security Issue",
    gradient: "linear-gradient(135deg, #00bfff 0%, #005f87 100%)",
    color: "#00bfff",
    description: "Report a security concern"
  }
};

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #0a0a0a 0%, #1a0a0a 100%)",
    color: "white",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    padding: "20px"
  },
  card: {
    background: "rgba(20, 20, 20, 0.8)",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(255, 255, 255, 0.05)",
    borderRadius: "16px",
    padding: "48px 40px",
    maxWidth: "420px",
    width: "100%",
    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)"
  },
  header: {
    marginBottom: "40px",
    textAlign: "center"
  },
  roomNumber: {
    fontSize: "48px",
    fontWeight: "700",
    marginBottom: "12px",
    background: "linear-gradient(135deg, #ff3b3b 0%, #ff6b6b 100%)",
    backgroundClip: "text",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent"
  },
  subtitle: {
    fontSize: "14px",
    color: "#888",
    fontWeight: "500",
    letterSpacing: "0.5px"
  },
  buttonsContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    marginBottom: "24px"
  },
  button: (type, isLoading) => {
    const config = ALERT_TYPES[type];
    return {
      padding: "16px 20px",
      border: "1px solid rgba(255, 255, 255, 0.1)",
      borderRadius: "10px",
      fontSize: "15px",
      fontWeight: "600",
      color: "white",
      cursor: isLoading ? "not-allowed" : "pointer",
      background: config.gradient,
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      boxShadow: `0 8px 24px ${config.color}33, inset 0 1px 0 rgba(255, 255, 255, 0.1)`,
      opacity: isLoading ? 0.6 : 1,
      transform: isLoading ? "scale(0.95)" : "scale(1)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "12px",
      position: "relative",
      overflow: "hidden"
    };
  },
  buttonIcon: {
    fontSize: "20px",
    lineHeight: "1"
  },
  buttonText: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    textAlign: "left"
  },
  buttonLabel: {
    fontSize: "15px",
    fontWeight: "700",
    lineHeight: "1.2"
  },
  buttonDesc: {
    fontSize: "12px",
    opacity: 0.8,
    fontWeight: "500"
  },
  statusContainer: {
    marginTop: "24px",
    minHeight: "60px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  loadingState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "12px"
  },
  spinner: {
    width: "40px",
    height: "40px",
    border: "3px solid rgba(255, 255, 255, 0.1)",
    borderTop: "3px solid #ff3b3b",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite"
  },
  loadingText: {
    fontSize: "14px",
    color: "#aaa",
    fontWeight: "500"
  },
  successState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "16px",
    padding: "20px",
    background: "rgba(74, 222, 128, 0.05)",
    borderRadius: "10px",
    border: "1px solid rgba(74, 222, 128, 0.2)",
    animation: "slideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
  },
  successIcon: {
    fontSize: "40px",
    lineHeight: "1",
    animation: "bounce 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)"
  },
  successText: {
    color: "#4ade80",
    fontWeight: "600",
    fontSize: "14px"
  },
  successSubtext: {
    color: "#888",
    fontSize: "13px",
    fontWeight: "500"
  },
  progressBar: {
    width: "100%",
    height: "2px",
    background: "rgba(255, 255, 255, 0.1)",
    borderRadius: "1px",
    overflow: "hidden",
    marginTop: "12px"
  },
  progressFill: (progress) => ({
    height: "100%",
    background: "linear-gradient(90deg, #ff3b3b, #4ade80)",
    width: `${progress}%`,
    transition: "width 0.3s ease"
  })
};

const keyframes = `
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
  
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes bounce {
    0%, 100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.2);
    }
  }
`;

export default function Report() {
  const [params] = useSearchParams();
  const room = params.get("room") || "Unknown";
  const [facilityConfig, setFacilityConfig] = useState({ floors: 3, roomsPerFloor: 10 });
  const [configLoading, setConfigLoading] = useState(true);
  const [roomProfile, setRoomProfile] = useState(null);

  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const snapshot = await getDoc(doc(db, "config", "facility"));
        const config = snapshot.data();
        if (config?.floors && config?.roomsPerFloor) {
          setFacilityConfig({
            floors: Number(config.floors),
            roomsPerFloor: Number(config.roomsPerFloor)
          });
        }

        const roomSnapshot = await getDoc(doc(db, "rooms", room));
        if (roomSnapshot.exists()) {
          setRoomProfile(roomSnapshot.data());
        } else {
          setRoomProfile(null);
        }
      } catch (err) {
        console.error("Error loading facility config:", err);
        setRoomProfile(null);
      } finally {
        setConfigLoading(false);
      }
    };

    loadConfig();
  }, [room]);

  const roomValidation = useMemo(() => {
    if (!/^\d+$/.test(room)) {
      return { valid: false, floor: null, message: "Invalid room format." };
    }

    const floor = Number(room[0]);
    const roomNumber = Number(room.slice(1));
    const { floors, roomsPerFloor } = facilityConfig;

    if (!roomNumber) {
      return { valid: false, floor: null, message: "Room number is incomplete." };
    }

    if (floor < 1 || floor > floors) {
      return { valid: false, floor: null, message: `Floor must be between 1 and ${floors}.` };
    }

    if (roomNumber < 1 || roomNumber > roomsPerFloor) {
      return {
        valid: false,
        floor: null,
        message: `Room on each floor must be between 1 and ${roomsPerFloor}.`
      };
    }

    if (!roomProfile?.enabled) {
      return {
        valid: false,
        floor: null,
        message: "This room is not configured by admin."
      };
    }

    return { valid: true, floor, message: "" };
  }, [facilityConfig, room, roomProfile]);

  const sendAlert = async (type) => {
  if (!roomValidation.valid || configLoading) {
    setError(roomValidation.message || "Room is not configured by admin.");
    return;
  }

  setLoading(true);
  setError(null);
  setProgress(0);

  let progressInterval = null; // ✅ Initialize as null

  try {
    // Start progress simulation
    progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 20;
      });
    }, 100);

    const newAlert = {
      room,
      floor: roomValidation.floor,
      type,
      status: "Pending",
      assignedDept:
        type === "Fire"
          ? "Security"
          : type === "Medical"
          ? "Medical"
          : "Security",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      priority: type === "Fire" ? 1 : type === "Medical" ? 2 : 3
    };

    // Send alert to Firestore
    const docRef = await addDoc(collection(db, "alerts"), newAlert);
    console.log("✅ Alert created with ID:", docRef.id);

    // Success flow
    if (progressInterval) clearInterval(progressInterval);
    setProgress(100);
    setSent(true);

    // Reset after 3 seconds
    setTimeout(() => {
      setSent(false);
      setProgress(0);
      setLoading(false);
    }, 3000);

  } catch (err) {
    console.error("❌ Error sending alert:", err);

    // Cleanup interval safely
    if (progressInterval) clearInterval(progressInterval);

    setError(err.message || "Failed to send alert. Please try again.");
    setLoading(false);
    setProgress(0);
  }
};

  return (
    <div style={styles.container}>
      <style>{keyframes}</style>

      <div style={styles.card}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.roomNumber}>Room {room}</div>
          <div style={styles.subtitle}>
            {sent ? "Alert sent successfully" : "Report an emergency"}
          </div>
          {roomProfile?.visitorName && (
            <div style={{ marginTop: "10px", fontSize: "12px", color: "#9ca3af" }}>
              Current Visitor: {roomProfile.visitorName}
            </div>
          )}
        </div>

        {/* Buttons */}
        {!sent && (
          <div style={styles.buttonsContainer}>
            {Object.entries(ALERT_TYPES).map(([type, config]) => (
              <button
                key={type}
                onClick={() => sendAlert(type)}
                disabled={loading || configLoading || !roomValidation.valid}
                style={styles.button(type, loading)}
                title={config.description}
              >
                <span style={styles.buttonIcon}>{config.icon}</span>
                <span style={styles.buttonText}>
                  <span style={styles.buttonLabel}>{config.label}</span>
                  <span style={styles.buttonDesc}>{config.description}</span>
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Status */}
        <div style={styles.statusContainer}>
          {!configLoading && !roomValidation.valid && !loading && (
            <div style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "8px",
              padding: "14px",
              background: "rgba(255, 59, 59, 0.06)",
              borderRadius: "8px",
              border: "1px solid rgba(255, 59, 59, 0.25)"
            }}>
              <div style={{ fontSize: "24px" }}>🚫</div>
              <div style={{ color: "#ff6b6b", fontWeight: "700", fontSize: "13px" }}>
                This room is not allowed
              </div>
              <div style={{ color: "#aaa", fontSize: "12px" }}>
                {roomValidation.message}
              </div>
            </div>
          )}

          {loading && (
            <div style={styles.loadingState}>
              <div style={styles.spinner} />
              <div style={styles.loadingText}>Sending alert...</div>
              <div style={styles.progressBar}>
                <div style={styles.progressFill(progress)} />
              </div>
            </div>
          )}

          {sent && !loading && (
            <div style={styles.successState}>
              <div style={styles.successIcon}>✅</div>
              <div>
                <div style={styles.successText}>Alert sent successfully!</div>
                <div style={styles.successSubtext}>
                  Help is on the way to Room {room}
                </div>
              </div>
            </div>
          )}

          {error && !loading && (
            <div style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "12px",
              padding: "16px",
              background: "rgba(255, 59, 59, 0.05)",
              borderRadius: "8px",
              border: "1px solid rgba(255, 59, 59, 0.2)"
            }}>
              <div style={{ fontSize: "32px" }}>⚠️</div>
              <div style={{ color: "#ff3b3b", fontWeight: "600", fontSize: "13px" }}>
                {error}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}