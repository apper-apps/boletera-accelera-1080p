const { ApperClient } = window.ApperSDK;
const apperClient = new ApperClient({
  apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
  apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
});

export const zoneService = {
  async getAll() {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "color" } },
          { field: { Name: "price" } },
          { field: { Name: "seat_count" } },
          { field: { Name: "description" } },
          { field: { Name: "event_id" } }
        ]
      };
      
      const response = await apperClient.fetchRecords('zone', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      return response.data || [];
    } catch (error) {
      console.error("Error fetching zones:", error);
      throw error;
    }
  },

  async getById(id) {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "color" } },
          { field: { Name: "price" } },
          { field: { Name: "seat_count" } },
          { field: { Name: "description" } },
          { field: { Name: "event_id" } }
        ]
      };
      
      const response = await apperClient.getRecordById('zone', parseInt(id), params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching zone with ID ${id}:`, error);
      throw error;
    }
  },

  async getByEvent(eventId) {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "color" } },
          { field: { Name: "price" } },
          { field: { Name: "seat_count" } },
          { field: { Name: "description" } },
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
      
      const response = await apperClient.fetchRecords('zone', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      return response.data || [];
    } catch (error) {
      console.error(`Error fetching zones for event ${eventId}:`, error);
      throw error;
    }
  },

  async create(zoneData) {
    try {
      const params = {
        records: [
          {
            Name: zoneData.Name,
            color: zoneData.color,
            price: zoneData.price,
            seat_count: zoneData.seat_count,
            description: zoneData.description,
            event_id: zoneData.event_id
          }
        ]
      };
      
      const response = await apperClient.createRecord('zone', params);
      
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
      console.error("Error creating zone:", error);
      throw error;
    }
  },

  async update(id, zoneData) {
    try {
      const params = {
        records: [
          {
            Id: parseInt(id),
            ...zoneData
          }
        ]
      };
      
      const response = await apperClient.updateRecord('zone', params);
      
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
      console.error("Error updating zone:", error);
      throw error;
    }
  },

  async delete(id) {
    try {
      const params = {
        RecordIds: [parseInt(id)]
      };
      
      const response = await apperClient.deleteRecord('zone', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      return { success: true };
    } catch (error) {
      console.error("Error deleting zone:", error);
      throw error;
    }
  },

  async getZoneStats(zoneId) {
    try {
      const zone = await this.getById(zoneId);
      if (!zone) throw new Error("Zone not found");
      
      // Get seats for this zone to calculate actual statistics
      const seatsParams = {
        fields: [
          { field: { Name: "status" } }
        ],
        where: [
          {
            FieldName: "zone_id",
            Operator: "EqualTo",
            Values: [parseInt(zoneId)]
          }
        ]
      };
      
      const seatsResponse = await apperClient.fetchRecords('seat', seatsParams);
      const seats = seatsResponse.success ? seatsResponse.data : [];
      
      const totalSeats = seats.length;
      const availableSeats = seats.filter(s => s.status === 'available').length;
      const reservedSeats = seats.filter(s => s.status === 'reserved').length;
      const soldSeats = seats.filter(s => s.status === 'sold').length;
      
      return {
        totalSeats,
        availableSeats,
        reservedSeats,
        soldSeats,
        revenue: zone.price * soldSeats
      };
    } catch (error) {
      console.error(`Error fetching zone stats for ${zoneId}:`, error);
      throw error;
    }
  }
};