import { createTicketQRData } from "@/utils/qrGenerator";

const { ApperClient } = window.ApperSDK;
const apperClient = new ApperClient({
  apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
  apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
});

export const ticketService = {
  async getAll() {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "seat_id" } },
          { field: { Name: "qr_code" } },
          { field: { Name: "status" } },
          { field: { Name: "stripe_payment_id" } },
          { field: { Name: "purchased_at" } },
          { field: { Name: "used_at" } },
          { field: { Name: "used_by" } },
          { field: { Name: "zone_id" } },
          { field: { Name: "price" } },
          { field: { Name: "user_id" } },
          { field: { Name: "event_id" } }
        ]
      };
      
      const response = await apperClient.fetchRecords('ticket', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      return response.data || [];
    } catch (error) {
      console.error("Error fetching tickets:", error);
      throw error;
    }
  },

  async getById(id) {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "seat_id" } },
          { field: { Name: "qr_code" } },
          { field: { Name: "status" } },
          { field: { Name: "stripe_payment_id" } },
          { field: { Name: "purchased_at" } },
          { field: { Name: "used_at" } },
          { field: { Name: "used_by" } },
          { field: { Name: "zone_id" } },
          { field: { Name: "price" } },
          { field: { Name: "user_id" } },
          { field: { Name: "event_id" } }
        ]
      };
      
      const response = await apperClient.getRecordById('ticket', parseInt(id), params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching ticket with ID ${id}:`, error);
      throw error;
    }
  },

  async getByUser(userId) {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "seat_id" } },
          { field: { Name: "qr_code" } },
          { field: { Name: "status" } },
          { field: { Name: "stripe_payment_id" } },
          { field: { Name: "purchased_at" } },
          { field: { Name: "used_at" } },
          { field: { Name: "used_by" } },
          { field: { Name: "zone_id" } },
          { field: { Name: "price" } },
          { field: { Name: "user_id" } },
          { field: { Name: "event_id" } }
        ],
        where: [
          {
            FieldName: "user_id",
            Operator: "EqualTo",
            Values: [userId]
          }
        ]
      };
      
      const response = await apperClient.fetchRecords('ticket', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      return response.data || [];
    } catch (error) {
      console.error(`Error fetching tickets for user ${userId}:`, error);
      throw error;
    }
  },

  async getByEvent(eventId) {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "seat_id" } },
          { field: { Name: "qr_code" } },
          { field: { Name: "status" } },
          { field: { Name: "stripe_payment_id" } },
          { field: { Name: "purchased_at" } },
          { field: { Name: "used_at" } },
          { field: { Name: "used_by" } },
          { field: { Name: "zone_id" } },
          { field: { Name: "price" } },
          { field: { Name: "user_id" } },
          { field: { Name: "event_id" } }
        ],
        where: [
          {
            FieldName: "event_id",
            Operator: "EqualTo",
            Values: [parseInt(eventId)]
          }
        ]
      };
      
      const response = await apperClient.fetchRecords('ticket', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      return response.data || [];
    } catch (error) {
      console.error(`Error fetching tickets for event ${eventId}:`, error);
      throw error;
    }
  },

  async create(ticketData) {
    try {
      const params = {
        records: [
          {
            Name: ticketData.Name || `Ticket for ${ticketData.user_id}`,
            seat_id: ticketData.seat_id,
            qr_code: createTicketQRData(ticketData),
            status: "valid",
            stripe_payment_id: ticketData.stripe_payment_id,
            purchased_at: new Date().toISOString(),
            zone_id: ticketData.zone_id,
            price: ticketData.price,
            user_id: ticketData.user_id,
            event_id: ticketData.event_id
          }
        ]
      };
      
      const response = await apperClient.createRecord('ticket', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      if (response.results) {
        const successfulRecords = response.results.filter(result => result.success);
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to create ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
        }
        
        return successfulRecords.length > 0 ? successfulRecords[0].data : null;
      }
    } catch (error) {
      console.error("Error creating ticket:", error);
      throw error;
    }
  },

  async validateTicket(ticketId) {
    try {
      const ticket = await this.getById(ticketId);
      if (!ticket) throw new Error("Ticket not found");
      
      if (ticket.status === "used") {
        throw new Error("Ticket already used");
      }
      
      if (ticket.status === "cancelled") {
        throw new Error("Ticket cancelled");
      }
      
      return { ...ticket, valid: true };
    } catch (error) {
      console.error("Error validating ticket:", error);
      throw error;
    }
  },

  async useTicket(ticketId, staffId) {
    try {
      const ticket = await this.getById(ticketId);
      if (!ticket) throw new Error("Ticket not found");
      
      if (ticket.status !== "valid") {
        throw new Error("Ticket is not valid");
      }
      
      const params = {
        records: [
          {
            Id: parseInt(ticketId),
            status: "used",
            used_at: new Date().toISOString(),
            used_by: staffId
          }
        ]
      };
      
      const response = await apperClient.updateRecord('ticket', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      if (response.results) {
        const successfulUpdates = response.results.filter(result => result.success);
        return successfulUpdates.length > 0 ? successfulUpdates[0].data : null;
      }
    } catch (error) {
      console.error("Error using ticket:", error);
      throw error;
    }
  },

  async processPayment(paymentData) {
    // Simulate Stripe processing with delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
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
    try {
      const tickets = [];
      
      for (const item of cartItems) {
        const ticketData = {
          user_id: userEmail,
          event_id: item.eventId,
          seat_id: item.seat.Id,
          stripe_payment_id: paymentId,
          zone_id: item.zone.Id,
          price: item.price,
        };
        
        const ticket = await this.create(ticketData);
        if (ticket) {
          tickets.push(ticket);
        }
      }
      
      return tickets;
    } catch (error) {
      console.error("Error creating tickets from cart:", error);
      throw error;
    }
  }
};