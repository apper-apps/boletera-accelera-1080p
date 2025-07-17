const { ApperClient } = window.ApperSDK;
const apperClient = new ApperClient({
  apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
  apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
});

export const seatService = {
  async getAll() {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "identifier" } },
          { field: { Name: "coordinates" } },
          { field: { Name: "status" } },
          { field: { Name: "reserved_until" } },
          { field: { Name: "zone_id" } }
        ]
      };
      
      const response = await apperClient.fetchRecords('seat', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      return response.data || [];
    } catch (error) {
      console.error("Error fetching seats:", error);
      throw error;
    }
  },

  async getById(id) {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "identifier" } },
          { field: { Name: "coordinates" } },
          { field: { Name: "status" } },
          { field: { Name: "reserved_until" } },
          { field: { Name: "zone_id" } }
        ]
      };
      
      const response = await apperClient.getRecordById('seat', parseInt(id), params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching seat with ID ${id}:`, error);
      throw error;
    }
  },

  async getByZone(zoneId) {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "identifier" } },
          { field: { Name: "coordinates" } },
          { field: { Name: "status" } },
          { field: { Name: "reserved_until" } },
          { field: { Name: "zone_id" } }
        ],
        where: [
          {
            FieldName: "zone_id",
            Operator: "EqualTo",
            Values: [parseInt(zoneId)]
          }
        ]
      };
      
      const response = await apperClient.fetchRecords('seat', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      return response.data || [];
    } catch (error) {
      console.error(`Error fetching seats for zone ${zoneId}:`, error);
      throw error;
    }
  },

  async updateSeatStatus(seatId, status) {
    try {
      const params = {
        records: [
          {
            Id: parseInt(seatId),
            status: status
          }
        ]
      };
      
      const response = await apperClient.updateRecord('seat', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      if (response.results) {
        const successfulUpdates = response.results.filter(result => result.success);
        const failedUpdates = response.results.filter(result => !result.success);
        
        if (failedUpdates.length > 0) {
          console.error(`Failed to update ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`);
        }
        
        return successfulUpdates.length > 0 ? successfulUpdates[0].data : null;
      }
    } catch (error) {
      console.error("Error updating seat status:", error);
      throw error;
    }
  },

  async reserveSeat(seatId, reservedUntil) {
    try {
      const seat = await this.getById(seatId);
      if (!seat) throw new Error("Seat not found");
      
      if (seat.status !== "available") {
        throw new Error("Seat is not available");
      }
      
      const params = {
        records: [
          {
            Id: parseInt(seatId),
            status: "reserved",
            reserved_until: reservedUntil || new Date(Date.now() + 15 * 60 * 1000).toISOString()
          }
        ]
      };
      
      const response = await apperClient.updateRecord('seat', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      if (response.results) {
        const successfulUpdates = response.results.filter(result => result.success);
        return successfulUpdates.length > 0 ? successfulUpdates[0].data : null;
      }
    } catch (error) {
      console.error("Error reserving seat:", error);
      throw error;
    }
  },

  async releaseSeat(seatId) {
    try {
      const params = {
        records: [
          {
            Id: parseInt(seatId),
            status: "available",
            reserved_until: null
          }
        ]
      };
      
      const response = await apperClient.updateRecord('seat', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      if (response.results) {
        const successfulUpdates = response.results.filter(result => result.success);
        return successfulUpdates.length > 0 ? successfulUpdates[0].data : null;
      }
    } catch (error) {
      console.error("Error releasing seat:", error);
      throw error;
    }
  },

  async getAvailableSeats(eventId) {
    try {
      // First get zones for this event
      const zonesParams = {
        fields: [{ field: { Name: "Name" } }],
        where: [
          {
            FieldName: "event_id",
            Operator: "EqualTo",
            Values: [parseInt(eventId)]
          }
        ]
      };
      
      const zonesResponse = await apperClient.fetchRecords('zone', zonesParams);
      const zones = zonesResponse.success ? zonesResponse.data : [];
      const zoneIds = zones.map(z => z.Id);
      
      if (zoneIds.length === 0) return [];
      
      // Get available seats for these zones
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "identifier" } },
          { field: { Name: "coordinates" } },
          { field: { Name: "status" } },
          { field: { Name: "reserved_until" } },
          { field: { Name: "zone_id" } }
        ],
        whereGroups: [
          {
            operator: "AND",
            subGroups: [
              {
                conditions: [
                  {
                    fieldName: "zone_id",
                    operator: "ExactMatch",
                    values: zoneIds
                  }
                ]
              },
              {
                conditions: [
                  {
                    fieldName: "status",
                    operator: "EqualTo",
                    values: ["available"]
                  }
                ]
              }
            ]
          }
        ]
      };
      
      const response = await apperClient.fetchRecords('seat', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      // Filter out seats with expired reservations
      const seats = response.data || [];
      return seats.filter(seat => 
        !seat.reserved_until || new Date(seat.reserved_until) < new Date()
      );
    } catch (error) {
      console.error(`Error fetching available seats for event ${eventId}:`, error);
      throw error;
    }
  }
};