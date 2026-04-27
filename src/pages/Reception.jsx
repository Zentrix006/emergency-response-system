import { useEffect, useMemo, useState } from "react";
import { db } from "../firebase";
import { collection, doc, getDoc, onSnapshot, setDoc } from "firebase/firestore";

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0a0a0a 0%, #1a0a0a 100%)",
    color: "white",
    padding: "24px",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
  },
  card: {
    maxWidth: "980px",
    margin: "0 auto",
    background: "rgba(20, 20, 20, 0.85)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    borderRadius: "14px",
    padding: "22px"
  },
  title: { fontSize: "28px", fontWeight: "800", marginBottom: "6px" },
  sub: { color: "#9ca3af", marginBottom: "18px", fontSize: "13px" },
  row: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "10px",
    marginBottom: "12px"
  },
  field: { display: "flex", flexDirection: "column", gap: "6px", minWidth: "0" },
  label: { fontSize: "12px", color: "#9ca3af", fontWeight: "600" },
  input: {
    background: "rgba(255, 255, 255, 0.06)",
    border: "1px solid rgba(255, 255, 255, 0.16)",
    borderRadius: "8px",
    color: "white",
    padding: "10px 12px",
    fontSize: "14px",
    width: "100%",
    boxSizing: "border-box"
  },
  status: {
    padding: "10px 12px",
    borderRadius: "8px",
    fontSize: "13px",
    marginBottom: "12px",
    background: "rgba(255, 255, 255, 0.04)",
    border: "1px solid rgba(255, 255, 255, 0.1)"
  },
  buttonRow: { display: "flex", gap: "10px", flexWrap: "wrap" },
  button: (kind) => ({
    border: "none",
    borderRadius: "8px",
    padding: "10px 14px",
    cursor: "pointer",
    fontWeight: "700",
    color: "white",
    fontSize: "12px",
    background:
      kind === "primary"
        ? "linear-gradient(135deg, #16a34a 0%, #22c55e 100%)"
        : "linear-gradient(135deg, #ef4444 0%, #f87171 100%)"
  }),
  list: {
    marginTop: "18px",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))",
    gap: "10px"
  },
  roomItem: (occupied) => ({
    border: `1px solid ${occupied ? "rgba(34, 197, 94, 0.45)" : "rgba(255, 255, 255, 0.12)"}`,
    background: occupied ? "rgba(34, 197, 94, 0.15)" : "rgba(255, 255, 255, 0.04)",
    borderRadius: "10px",
    padding: "10px"
  })
};

const isRoomOccupied = (roomProfile) => {
  if (!roomProfile?.occupied || !roomProfile?.stayUntil) return false;
  return new Date(roomProfile.stayUntil).getTime() > Date.now();
};

export default function Reception() {
  const [facility, setFacility] = useState({ floors: 3, roomsPerFloor: 10 });
  const [roomsMap, setRoomsMap] = useState({});
  const [selectedRoom, setSelectedRoom] = useState("");
  const [guestName, setGuestName] = useState("");
  const [stayHours, setStayHours] = useState(12);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const unsubFacility = onSnapshot(doc(db, "config", "facility"), (snap) => {
      const data = snap.data();
      if (data?.floors && data?.roomsPerFloor) {
        setFacility({ floors: Number(data.floors), roomsPerFloor: Number(data.roomsPerFloor) });
      }
    });

    const unsubRooms = onSnapshot(collection(db, "rooms"), (snapshot) => {
      const roomData = {};
      snapshot.docs.forEach((roomDoc) => {
        roomData[roomDoc.id] = roomDoc.data();
      });
      setRoomsMap(roomData);
    });

    return () => {
      unsubFacility();
      unsubRooms();
    };
  }, []);

  const enabledRooms = useMemo(
    () =>
      Object.entries(roomsMap)
        .filter(([, room]) => room.enabled)
        .map(([roomId]) => roomId)
        .sort(),
    [roomsMap]
  );

  const selectedRoomProfile = selectedRoom ? roomsMap[selectedRoom] : null;
  const occupied = isRoomOccupied(selectedRoomProfile);

  const assignRoom = async () => {
    if (!selectedRoom) {
      setMessage("Select a room first.");
      return;
    }
    if (!guestName.trim()) {
      setMessage("Enter visitor name.");
      return;
    }
    if (occupied) {
      setMessage("Room already occupied. Choose another room or checkout first.");
      return;
    }

    const now = new Date();
    const stayUntil = new Date(now.getTime() + Number(stayHours) * 60 * 60 * 1000);

    try {
      const roomRef = doc(db, "rooms", selectedRoom);
      const existing = await getDoc(roomRef);
      const base = existing.data() || {};
      await setDoc(roomRef, {
        ...base,
        enabled: base.enabled ?? true,
        visitorName: guestName.trim(),
        occupied: true,
        checkInAt: now.toISOString(),
        stayHours: Number(stayHours),
        stayUntil: stayUntil.toISOString(),
        updatedAt: new Date().toISOString()
      });
      setMessage(`Booked room ${selectedRoom} for ${guestName}.`);
      setGuestName("");
    } catch (error) {
      console.error("Error assigning room:", error);
      setMessage("Failed to assign room.");
    }
  };

  const checkoutRoom = async () => {
    if (!selectedRoom) return;
    try {
      const roomRef = doc(db, "rooms", selectedRoom);
      const existing = await getDoc(roomRef);
      const base = existing.data() || {};
      await setDoc(roomRef, {
        ...base,
        occupied: false,
        stayUntil: null,
        stayHours: null,
        checkInAt: null,
        visitorName: "",
        updatedAt: new Date().toISOString()
      });
      setMessage(`Checked out room ${selectedRoom}.`);
    } catch (error) {
      console.error("Error checking out room:", error);
      setMessage("Failed to checkout room.");
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.title}>🏨 Reception Desk</div>
        <div style={styles.sub}>
          Check room availability, register visitors, and set stay duration.
        </div>
        <div style={styles.row}>
          <div style={styles.field}>
            <label style={styles.label}>Configured Building</label>
            <input
              style={styles.input}
              value={`${facility.floors} floor(s), ${facility.roomsPerFloor} room(s)/floor`}
              disabled
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Room Number</label>
            <select
              style={styles.input}
              value={selectedRoom}
              onChange={(e) => setSelectedRoom(e.target.value)}
            >
              <option value="">Select room</option>
              {enabledRooms.map((room) => (
                <option key={room} value={room}>
                  {room}
                </option>
              ))}
            </select>
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Visitor Name</label>
            <input
              style={styles.input}
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="Enter visitor name"
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Stay (hours)</label>
            <input
              type="number"
              min={1}
              max={720}
              style={styles.input}
              value={stayHours}
              onChange={(e) => setStayHours(e.target.value)}
            />
          </div>
        </div>

        {selectedRoom && (
          <div style={styles.status}>
            {occupied
              ? `Room ${selectedRoom} unavailable (occupied by ${
                  selectedRoomProfile?.visitorName || "guest"
                } until ${new Date(selectedRoomProfile?.stayUntil).toLocaleString()})`
              : `Room ${selectedRoom} is available for booking.`}
          </div>
        )}

        <div style={styles.buttonRow}>
          <button style={styles.button("primary")} onClick={assignRoom}>
            Check-in Visitor
          </button>
          <button style={styles.button("danger")} onClick={checkoutRoom}>
            Checkout Room
          </button>
        </div>
        {message && <div style={{ ...styles.status, marginTop: "12px" }}>{message}</div>}

        <div style={styles.list}>
          {enabledRooms.map((room) => {
            const roomData = roomsMap[room];
            const active = isRoomOccupied(roomData);
            return (
              <div key={room} style={styles.roomItem(active)}>
                <div style={{ fontWeight: "700", marginBottom: "4px" }}>Room {room}</div>
                <div style={{ fontSize: "12px", color: "#cbd5e1" }}>
                  {active
                    ? `Occupied by ${roomData?.visitorName || "guest"}`
                    : "Available"}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
