import mockTickets from "@/services/mockData/tickets.json";
import { createTicketQRData } from "@/utils/qrGenerator";

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const ticketService = {
  async getAll() {
    await delay(300);
    return [...mockTickets];
  },

  async getById(Id) {
    await delay(200);
    const ticket = mockTickets.find(ticket => ticket.Id === parseInt(Id));
    if (!ticket) throw new Error("Ticket not found");
    return { ...ticket };
  },

  async getByUser(userId) {
    await delay(250);
    return mockTickets.filter(ticket => ticket.userId === userId);
  },

  async getByEvent(eventId) {
    await delay(250);
    return mockTickets.filter(ticket => ticket.eventId === parseInt(eventId));
  },

  async create(ticketData) {
    await delay(400);
    const newTicket = {
      ...ticketData,
      Id: Math.max(...mockTickets.map(t => t.Id)) + 1,
      qrCode: createTicketQRData(ticketData),
      status: "valid",
      purchasedAt: new Date().toISOString(),
    };
    
    mockTickets.push(newTicket);
    return { ...newTicket };
  },

  async validateTicket(ticketId) {
    await delay(300);
    const index = mockTickets.findIndex(ticket => ticket.Id === parseInt(ticketId));
    if (index === -1) throw new Error("Ticket not found");
    
    const ticket = mockTickets[index];
    
    if (ticket.status === "used") {
      throw new Error("Ticket already used");
    }
    
    if (ticket.status === "cancelled") {
      throw new Error("Ticket cancelled");
    }
    
    return { ...ticket, valid: true };
  },

  async useTicket(ticketId, staffId) {
    await delay(250);
    const index = mockTickets.findIndex(ticket => ticket.Id === parseInt(ticketId));
    if (index === -1) throw new Error("Ticket not found");
    
    const ticket = mockTickets[index];
    
    if (ticket.status !== "valid") {
      throw new Error("Ticket is not valid");
    }
    
    mockTickets[index] = {
      ...mockTickets[index],
      status: "used",
      usedAt: new Date().toISOString(),
      usedBy: staffId,
    };
    
    return { ...mockTickets[index] };
  },

  async processPayment(paymentData) {
    await delay(1000); // Simulate Stripe processing
    
    // Simulate payment processing
    const paymentId = `pi_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      id: paymentId,
      status: "succeeded",
      amount: paymentData.amount,
      currency: "eur",
      created: Math.floor(Date.now() / 1000),
    };
  },

  async createTicketsFromCart(cartItems, paymentId, userEmail) {
    await delay(500);
    
    const tickets = [];
    
    for (const item of cartItems) {
      const ticketData = {
        userId: userEmail,
        eventId: item.eventId,
        seatId: item.seat.Id,
        stripePaymentId: paymentId,
        zoneId: item.zone.Id,
        price: item.price,
      };
      
      const ticket = await this.create(ticketData);
      tickets.push(ticket);
    }
    
    return tickets;
  },
};