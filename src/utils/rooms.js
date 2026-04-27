export function formatRoomCode(floor, roomNumber) {
  return `${floor}${String(roomNumber).padStart(2, "0")}`;
}

export function generateRoomsForFloor(floor, count) {
  return Array.from({ length: count }, (_, index) =>
    formatRoomCode(floor, index + 1)
  );
}
