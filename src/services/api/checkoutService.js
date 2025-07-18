const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const checkoutService = {
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
          { field: { Name: "Tags" } },
          { field: { Name: "Owner" } },
          { field: { Name: "checkout_state" } },
          { field: { Name: "user_id" } },
          { field: { Name: "ticket_limit" } },
          { field: { Name: "CreatedOn" } },
          { field: { Name: "CreatedBy" } },
          { field: { Name: "ModifiedOn" } },
          { field: { Name: "ModifiedBy" } }
        ]
      };

      const response = await apperClient.fetchRecords("checkout", params);
      
      if (!response.success) {
        console.error(response.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      console.error("Error fetching checkouts:", error?.response?.data?.message || error.message);
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
          { field: { Name: "Tags" } },
          { field: { Name: "Owner" } },
          { field: { Name: "checkout_state" } },
          { field: { Name: "user_id" } },
          { field: { Name: "ticket_limit" } },
          { field: { Name: "CreatedOn" } },
          { field: { Name: "CreatedBy" } },
          { field: { Name: "ModifiedOn" } },
          { field: { Name: "ModifiedBy" } }
        ]
      };

      const response = await apperClient.getRecordById("checkout", parseInt(id), params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error("Checkout not found");
      }

      return response.data;
    } catch (error) {
      console.error("Error fetching checkout:", error?.response?.data?.message || error.message);
      throw new Error("Checkout not found");
    }
  },

async create(checkoutData) {
    await delay(400);
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      // Validate and convert user_id to integer
      let userId = null;
      if (checkoutData.user_id !== null && checkoutData.user_id !== undefined) {
        const parsedUserId = parseInt(checkoutData.user_id);
        if (isNaN(parsedUserId)) {
          throw new Error(`Invalid user_id: "${checkoutData.user_id}" cannot be converted to integer`);
        }
        userId = parsedUserId;
      }

      // Validate and convert ticket_limit to integer
      let ticketLimit = 10; // default value
      if (checkoutData.ticket_limit !== null && checkoutData.ticket_limit !== undefined) {
        const parsedTicketLimit = parseInt(checkoutData.ticket_limit);
        if (isNaN(parsedTicketLimit)) {
          throw new Error(`Invalid ticket_limit: "${checkoutData.ticket_limit}" cannot be converted to integer`);
        }
        ticketLimit = parsedTicketLimit;
      }

      const params = {
        records: [{
          Name: checkoutData.Name || `Checkout ${Date.now()}`,
          Tags: checkoutData.Tags || "",
          Owner: checkoutData.Owner || null,
          checkout_state: checkoutData.checkout_state || "active",
          user_id: userId,
          ticket_limit: ticketLimit
        }]
      };

      const response = await apperClient.createRecord("checkout", params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error("Failed to create checkout");
      }

      if (response.results) {
        const successfulRecords = response.results.filter(result => result.success);
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to create checkout ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          
          failedRecords.forEach(record => {
            record.errors?.forEach(error => {
              console.error(`Field validation error - ${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) {
              console.error(`Record error: ${record.message}`);
            }
          });
          
          // Throw specific error for user_id validation
          const userIdError = failedRecords.find(record => 
            record.errors?.some(error => error.fieldName === 'user_id')
          );
          if (userIdError) {
            throw new Error("User ID must be a valid integer value");
          }
          
          throw new Error("Failed to create checkout due to field validation errors");
        }
        
        if (successfulRecords.length > 0) {
          return successfulRecords[0].data;
        }
      }

      throw new Error("Failed to create checkout");
    } catch (error) {
      console.error("Error creating checkout:", error?.response?.data?.message || error.message);
      throw error; // Re-throw the original error to preserve error details
    }
  },

  async update(id, updateData) {
    await delay(300);
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        records: [{
          Id: parseInt(id),
          Name: updateData.Name,
          Tags: updateData.Tags,
          Owner: updateData.Owner,
          checkout_state: updateData.checkout_state,
          user_id: updateData.user_id,
          ticket_limit: updateData.ticket_limit
        }]
      };

      const response = await apperClient.updateRecord("checkout", params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error("Failed to update checkout");
      }

      if (response.results) {
        const successfulUpdates = response.results.filter(result => result.success);
        const failedUpdates = response.results.filter(result => !result.success);
        
        if (failedUpdates.length > 0) {
          console.error(`Failed to update checkout ${failedUpdates.length} records:${JSON.stringify(failedUpdates)}`);
        }
        
        if (successfulUpdates.length > 0) {
          return successfulUpdates[0].data;
        }
      }

      throw new Error("Failed to update checkout");
    } catch (error) {
      console.error("Error updating checkout:", error?.response?.data?.message || error.message);
      throw new Error("Failed to update checkout");
    }
  },

  async delete(id) {
    await delay(250);
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        RecordIds: [parseInt(id)]
      };

      const response = await apperClient.deleteRecord("checkout", params);
      
      if (!response.success) {
        console.error(response.message);
        return { success: false };
      }

      return { success: true };
    } catch (error) {
      console.error("Error deleting checkout:", error?.response?.data?.message || error.message);
      return { success: false };
    }
  },

  async updateState(id, newState) {
    await delay(200);
    return this.update(id, { checkout_state: newState });
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
          { field: { Name: "checkout_state" } },
          { field: { Name: "user_id" } },
          { field: { Name: "ticket_limit" } },
          { field: { Name: "CreatedOn" } }
        ],
        where: [
          {
            FieldName: "user_id",
            Operator: "EqualTo",
            Values: [userId]
          }
        ]
      };

      const response = await apperClient.fetchRecords("checkout", params);
      
      if (!response.success) {
        console.error(response.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      console.error("Error fetching user checkouts:", error?.response?.data?.message || error.message);
      return [];
    }
  }
};