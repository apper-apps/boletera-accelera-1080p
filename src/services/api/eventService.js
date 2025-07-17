import mockEvents from "@/services/mockData/events.json";
import mockZones from "@/services/mockData/zones.json";
import mockSeats from "@/services/mockData/seats.json";

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const eventService = {
  async getAll() {
    await delay(300);
    return [...mockEvents];
  },

  async getById(Id) {
    await delay(200);
    const event = mockEvents.find(event => event.Id === parseInt(Id));
    if (!event) throw new Error("Event not found");
    return { ...event };
  },

  async getEventWithDetails(eventId) {
    await delay(400);
    const event = mockEvents.find(e => e.Id === parseInt(eventId));
    if (!event) throw new Error("Event not found");
    
    const zones = mockZones.filter(z => z.eventId === parseInt(eventId));
    const seats = mockSeats.filter(s => 
      zones.some(z => z.Id === s.zoneId)
    );
    
    return {
      ...event,
      zones,
      seats,
    };
  },

  async create(eventData) {
    await delay(300);
    const newEvent = {
      ...eventData,
      Id: Math.max(...mockEvents.map(e => e.Id)) + 1,
      createdAt: new Date().toISOString(),
    };
    mockEvents.push(newEvent);
    return { ...newEvent };
  },

  async update(Id, eventData) {
    await delay(250);
    const index = mockEvents.findIndex(event => event.Id === parseInt(Id));
    if (index === -1) throw new Error("Event not found");
    
    mockEvents[index] = { ...mockEvents[index], ...eventData };
    return { ...mockEvents[index] };
  },

  async delete(Id) {
    await delay(200);
    const index = mockEvents.findIndex(event => event.Id === parseInt(Id));
    if (index === -1) throw new Error("Event not found");
    
    mockEvents.splice(index, 1);
    return { success: true };
  },

  async getPublicEvents() {
    await delay(300);
    return mockEvents.filter(event => event.isPublic);
  },

  async searchEvents(query) {
    await delay(200);
    const searchTerm = query.toLowerCase();
    return mockEvents.filter(event =>
      event.name.toLowerCase().includes(searchTerm) ||
      event.venue.toLowerCase().includes(searchTerm) ||
      event.description.toLowerCase().includes(searchTerm)
    );
  },
};