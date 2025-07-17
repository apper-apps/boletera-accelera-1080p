import mockZones from "@/services/mockData/zones.json";

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const zoneService = {
  async getAll() {
    await delay(250);
    return [...mockZones];
  },

  async getById(Id) {
    await delay(200);
    const zone = mockZones.find(zone => zone.Id === parseInt(Id));
    if (!zone) throw new Error("Zone not found");
    return { ...zone };
  },

  async getByEvent(eventId) {
    await delay(200);
    return mockZones.filter(zone => zone.eventId === parseInt(eventId));
  },

  async create(zoneData) {
    await delay(300);
    const newZone = {
      ...zoneData,
      Id: Math.max(...mockZones.map(z => z.Id)) + 1,
      createdAt: new Date().toISOString(),
    };
    mockZones.push(newZone);
    return { ...newZone };
  },

  async update(Id, zoneData) {
    await delay(250);
    const index = mockZones.findIndex(zone => zone.Id === parseInt(Id));
    if (index === -1) throw new Error("Zone not found");
    
    mockZones[index] = { ...mockZones[index], ...zoneData };
    return { ...mockZones[index] };
  },

  async delete(Id) {
    await delay(200);
    const index = mockZones.findIndex(zone => zone.Id === parseInt(Id));
    if (index === -1) throw new Error("Zone not found");
    
    mockZones.splice(index, 1);
    return { success: true };
  },

  async getZoneStats(zoneId) {
    await delay(200);
    const zone = mockZones.find(z => z.Id === parseInt(zoneId));
    if (!zone) throw new Error("Zone not found");
    
    // Mock statistics
    return {
      totalSeats: zone.seatCount,
      availableSeats: Math.floor(zone.seatCount * 0.7),
      reservedSeats: Math.floor(zone.seatCount * 0.1),
      soldSeats: Math.floor(zone.seatCount * 0.2),
      revenue: zone.price * Math.floor(zone.seatCount * 0.2),
    };
  },
};