import { createTicketQRData } from '@/utils/qrGenerator';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const ticketService = {
  async getAll() {
    await delay(300);
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "ticket_format" } },
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

      const response = await apperClient.fetchRecords("ticket", params);
      
      if (!response.success) {
        console.error(response.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      console.error("Error fetching tickets:", error?.response?.data?.message || error.message);
      return [];
    }
  },

  async getById(id) {
    await delay(200);
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "ticket_format" } },
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

      const response = await apperClient.getRecordById("ticket", parseInt(id), params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error("Ticket not found");
      }

      return response.data;
    } catch (error) {
      console.error("Error fetching ticket:", error?.response?.data?.message || error.message);
      throw new Error("Ticket not found");
    }
  },

  async getByUser(userId) {
    await delay(250);
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "ticket_format" } },
          { field: { Name: "seat_id" } },
          { field: { Name: "qr_code" } },
          { field: { Name: "status" } },
          { field: { Name: "stripe_payment_id" } },
          { field: { Name: "purchased_at" } },
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

      const response = await apperClient.fetchRecords("ticket", params);
      
      if (!response.success) {
        console.error(response.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      console.error("Error fetching user tickets:", error?.response?.data?.message || error.message);
      return [];
    }
  },

  async create(ticketData) {
    await delay(400);
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const qrData = createTicketQRData({
        id: Date.now(),
        ...ticketData,
      });

      const params = {
        records: [{
          Name: ticketData.Name || `Ticket ${Date.now()}`,
          ticket_format: ticketData.ticket_format || "pdf",
          seat_id: parseInt(ticketData.seatId),
          qr_code: qrData,
          status: "valid",
          stripe_payment_id: ticketData.stripePaymentId,
          purchased_at: new Date().toISOString(),
          zone_id: parseInt(ticketData.zoneId),
          price: ticketData.price,
          user_id: ticketData.userId,
          event_id: parseInt(ticketData.eventId)
        }]
      };

      const response = await apperClient.createRecord("ticket", params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error("Failed to create ticket");
      }

      if (response.results) {
        const successfulRecords = response.results.filter(result => result.success);
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to create ticket ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
        }
        
        if (successfulRecords.length > 0) {
          return successfulRecords[0].data;
        }
      }

      throw new Error("Failed to create ticket");
    } catch (error) {
      console.error("Error creating ticket:", error?.response?.data?.message || error.message);
      throw new Error("Failed to create ticket");
    }
  },

  async createTicketsFromCart(cartItems, paymentId, userId) {
    await delay(500);
    const tickets = [];
    
    for (const item of cartItems) {
      const ticketData = {
        Name: `Ticket for ${item.seat?.identifier || 'Seat'}`,
        userId: userId,
        eventId: item.eventId,
        seatId: item.seat.Id,
        zoneId: item.zone.Id,
        price: item.price,
        stripePaymentId: paymentId,
      };
      
      try {
        const ticket = await this.create(ticketData);
        tickets.push(ticket);
      } catch (error) {
        console.error("Error creating individual ticket:", error);
        // Continue with other tickets even if one fails
      }
    }
    
    return tickets;
  },

  async validateTicket(ticketId) {
    await delay(300);
    try {
      const ticket = await this.getById(ticketId);
      
      if (!ticket) {
        return { valid: false, message: "Ticket not found" };
      }
      
      if (ticket.status === "used") {
        return { valid: false, message: "Ticket already used" };
      }
      
      if (ticket.status === "cancelled") {
        return { valid: false, message: "Ticket cancelled" };
      }
      
      return { valid: true, ticket: { ...ticket } };
    } catch (error) {
      return { valid: false, message: "Ticket not found" };
    }
  },

  async useTicket(ticketId, usedBy) {
    await delay(250);
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        records: [{
          Id: parseInt(ticketId),
          status: "used",
          used_at: new Date().toISOString(),
          used_by: usedBy
        }]
      };

      const response = await apperClient.updateRecord("ticket", params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error("Failed to use ticket");
      }

      if (response.results && response.results[0].success) {
        return response.results[0].data;
      }

      throw new Error("Failed to use ticket");
    } catch (error) {
      console.error("Error using ticket:", error?.response?.data?.message || error.message);
      throw new Error("Failed to use ticket");
    }
  },

  async processPayment(paymentData) {
    await delay(800);
    
    // Simulate Stripe payment processing
    const paymentResult = {
      id: `pi_${Date.now()}${Math.random().toString(36).substr(2, 9)}`,
      amount: paymentData.amount,
      currency: paymentData.currency,
      status: "succeeded",
      created: Math.floor(Date.now() / 1000),
      customer: paymentData.customer,
    };
    
    // 5% chance of payment failure for demo
    if (Math.random() < 0.05) {
      throw new Error("Payment failed: Card declined");
    }
    
    return paymentResult;
  }
};