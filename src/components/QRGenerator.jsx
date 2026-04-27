import QRCode from "react-qr-code";
import { useState } from "react";

export default function Admin() {
  const [room, setRoom] = useState("");

  const url = `https://yourapp.web.app/emergency-response-system/report?room=${room}`;

  return (
    <div>
      <h2>Generate QR</h2>
      <input value={room} onChange={(e) => setRoom(e.target.value)} />
      {room && <QRCode value={url} />}
      <p>{url}</p>
    </div>
  );
}
