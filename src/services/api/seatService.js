import mockSeats from "@/services/mockData/seats.json";

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const seatService = {
  async getAll() {
    await delay(250);
    return [...mockSeats];
  },

  async getById(Id) {
    await delay(200);
    const seat = mockSeats.find(seat => seat.Id === parseInt(Id));
    if (!seat) throw new Error("Seat not found");
    return { ...seat };
  },

  async getByZone(zoneId) {
    await delay(200);
    return mockSeats.filter(seat => seat.zoneId === parseInt(zoneId));
  },

  async updateSeatStatus(seatId, status) {
    await delay(300);
    const index = mockSeats.findIndex(seat => seat.Id === parseInt(seatId));
    if (index === -1) throw new Error("Seat not found");
    
    mockSeats[index] = { ...mockSeats[index], status };
    return { ...mockSeats[index] };
  },

  async reserveSeat(seatId, reservedUntil) {
    await delay(250);
    const index = mockSeats.findIndex(seat => seat.Id === parseInt(seatId));
    if (index === -1) throw new Error("Seat not found");
    
    if (mockSeats[index].status !== "available") {
      throw new Error("Seat is not available");
    }
    
    mockSeats[index] = {
      ...mockSeats[index],
      status: "reserved",
      reservedUntil: reservedUntil || new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    };
    
    return { ...mockSeats[index] };
  },

  async releaseSeat(seatId) {
    await delay(200);
    const index = mockSeats.findIndex(seat => seat.Id === parseInt(seatId));
    if (index === -1) throw new Error("Seat not found");
    
    mockSeats[index] = {
      ...mockSeats[index],
      status: "available",
      reservedUntil: null,
    };
    
    return { ...mockSeats[index] };
  },

  async getAvailableSeats(eventId) {
    await delay(200);
    // This would need to be implemented based on zones and event relationship
    return mockSeats.filter(seat => 
      seat.status === "available" && 
      !seat.reservedUntil ||
      (seat.reservedUntil && new Date(seat.reservedUntil) < new Date())
    );
  },
};