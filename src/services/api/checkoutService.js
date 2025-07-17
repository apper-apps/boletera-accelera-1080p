const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Mock data storage
let checkouts = [];
let nextId = 1;

export const checkoutService = {
  async getAll() {
    await delay(300);
    return [...checkouts];
  },

  async getById(id) {
    await delay(200);
    const checkout = checkouts.find(c => c.Id === parseInt(id));
    if (!checkout) {
      throw new Error("Checkout not found");
    }
    return { ...checkout };
  },

  async create(checkoutData) {
    await delay(400);
    
    // Only include updateable fields
    const newCheckout = {
      Id: nextId++,
      Name: checkoutData.Name || `Checkout ${nextId}`,
      Tags: checkoutData.Tags || "",
      Owner: checkoutData.Owner || null,
      user_id: checkoutData.user_id,
      checkout_state: checkoutData.checkout_state || "active",
      CreatedOn: new Date().toISOString(),
      CreatedBy: checkoutData.user_id,
      ModifiedOn: new Date().toISOString(),
      ModifiedBy: checkoutData.user_id,
    };
    
    checkouts.push(newCheckout);
    return { ...newCheckout };
  },

  async update(id, updateData) {
    await delay(300);
    const index = checkouts.findIndex(c => c.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Checkout not found");
    }
    
    // Only update updateable fields
    const updatedCheckout = {
      ...checkouts[index],
      Name: updateData.Name !== undefined ? updateData.Name : checkouts[index].Name,
      Tags: updateData.Tags !== undefined ? updateData.Tags : checkouts[index].Tags,
      Owner: updateData.Owner !== undefined ? updateData.Owner : checkouts[index].Owner,
      user_id: updateData.user_id !== undefined ? updateData.user_id : checkouts[index].user_id,
      checkout_state: updateData.checkout_state !== undefined ? updateData.checkout_state : checkouts[index].checkout_state,
      ModifiedOn: new Date().toISOString(),
      ModifiedBy: updateData.user_id || checkouts[index].ModifiedBy,
    };
    
    checkouts[index] = updatedCheckout;
    return { ...updatedCheckout };
  },

  async delete(id) {
    await delay(250);
    const index = checkouts.findIndex(c => c.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Checkout not found");
    }
    
    checkouts.splice(index, 1);
    return { success: true };
  },

  async getByUser(userId) {
    await delay(250);
    return checkouts.filter(c => c.user_id === userId);
  },

  async getByState(state) {
    await delay(250);
    return checkouts.filter(c => c.checkout_state === state);
  },

  async updateState(id, newState) {
    await delay(200);
    return this.update(id, { checkout_state: newState });
  },

  async createFromCart(cartData, userId) {
    await delay(400);
    
    const checkoutData = {
      Name: `Checkout for Event ${cartData.eventId}`,
      user_id: userId,
      checkout_state: "active",
    };
    
    return this.create(checkoutData);
  },
};