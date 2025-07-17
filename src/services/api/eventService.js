const { ApperClient } = window.ApperSDK;
const apperClient = new ApperClient({
  apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
  apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
});

export const eventService = {
  async getAll() {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "date" } },
          { field: { Name: "venue" } },
          { field: { Name: "description" } },
          { field: { Name: "image_url" } },
          { field: { Name: "map_svg" } },
          { field: { Name: "is_public" } },
          { field: { Name: "capacity" } },
          { field: { Name: "created_at" } }
        ]
      };
      
      const response = await apperClient.fetchRecords('event', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      return response.data || [];
    } catch (error) {
      console.error("Error fetching events:", error);
      throw error;
    }
  },

  async getById(id) {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "date" } },
          { field: { Name: "venue" } },
          { field: { Name: "description" } },
          { field: { Name: "image_url" } },
          { field: { Name: "map_svg" } },
          { field: { Name: "is_public" } },
          { field: { Name: "capacity" } },
          { field: { Name: "created_at" } }
        ]
      };
      
      const response = await apperClient.getRecordById('event', parseInt(id), params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching event with ID ${id}:`, error);
      throw error;
    }
  },

  async getEventWithDetails(eventId) {
    try {
      // Get event details
      const event = await this.getById(eventId);
      
      // Get zones for this event
      const zonesParams = {
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
      
      const zonesResponse = await apperClient.fetchRecords('zone', zonesParams);
      const zones = zonesResponse.success ? zonesResponse.data : [];
      
      // Get seats for these zones
      const zoneIds = zones.map(z => z.Id);
      let seats = [];
      
      if (zoneIds.length > 0) {
        const seatsParams = {
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
              Operator: "ExactMatch",
              Values: zoneIds
            }
          ]
        };
        
        const seatsResponse = await apperClient.fetchRecords('seat', seatsParams);
        seats = seatsResponse.success ? seatsResponse.data : [];
      }
      
      return {
        ...event,
        zones,
        seats
      };
    } catch (error) {
      console.error(`Error fetching event details for ID ${eventId}:`, error);
      throw error;
    }
  },

  async create(eventData) {
    try {
      const params = {
        records: [
          {
            Name: eventData.Name,
            date: eventData.date,
            venue: eventData.venue,
            description: eventData.description,
            image_url: eventData.image_url,
            map_svg: eventData.map_svg,
            is_public: eventData.is_public,
            capacity: eventData.capacity
          }
        ]
      };
      
      const response = await apperClient.createRecord('event', params);
      
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
      console.error("Error creating event:", error);
      throw error;
    }
  },

  async update(id, eventData) {
    try {
      const params = {
        records: [
          {
            Id: parseInt(id),
            ...eventData
          }
        ]
      };
      
      const response = await apperClient.updateRecord('event', params);
      
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
      console.error("Error updating event:", error);
      throw error;
    }
  },

  async delete(id) {
    try {
      const params = {
        RecordIds: [parseInt(id)]
      };
      
      const response = await apperClient.deleteRecord('event', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      return { success: true };
    } catch (error) {
      console.error("Error deleting event:", error);
      throw error;
    }
  },

  async getPublicEvents() {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "date" } },
          { field: { Name: "venue" } },
          { field: { Name: "description" } },
          { field: { Name: "image_url" } },
          { field: { Name: "map_svg" } },
          { field: { Name: "is_public" } },
          { field: { Name: "capacity" } },
          { field: { Name: "created_at" } }
        ],
        where: [
          {
            FieldName: "is_public",
            Operator: "EqualTo",
            Values: ["true"]
          }
        ]
      };
      
      const response = await apperClient.fetchRecords('event', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      return response.data || [];
    } catch (error) {
      console.error("Error fetching public events:", error);
      throw error;
    }
  },

  async searchEvents(query) {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "date" } },
          { field: { Name: "venue" } },
          { field: { Name: "description" } },
          { field: { Name: "image_url" } },
          { field: { Name: "map_svg" } },
          { field: { Name: "is_public" } },
          { field: { Name: "capacity" } },
          { field: { Name: "created_at" } }
        ],
        whereGroups: [
          {
            operator: "OR",
            subGroups: [
              {
                conditions: [
                  {
                    fieldName: "Name",
                    operator: "Contains",
                    values: [query]
                  }
                ]
              },
              {
                conditions: [
                  {
                    fieldName: "venue",
                    operator: "Contains",
                    values: [query]
                  }
                ]
              },
              {
                conditions: [
                  {
                    fieldName: "description",
                    operator: "Contains",
                    values: [query]
                  }
                ]
              }
            ]
          }
        ]
      };
      
      const response = await apperClient.fetchRecords('event', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      return response.data || [];
    } catch (error) {
      console.error("Error searching events:", error);
      throw error;
    }
  }
};