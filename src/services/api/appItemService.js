const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Mock data storage
let appItems = [];
let nextId = 1;

export const appItemService = {
  async getAll() {
    await delay(300);
    return [...appItems];
  },

  async getById(id) {
    await delay(200);
    const item = appItems.find(i => i.Id === parseInt(id));
    if (!item) {
      throw new Error("App item not found");
    }
    return { ...item };
  },

  async create(itemData) {
    await delay(400);
    
    // Only include updateable fields
    const newItem = {
      Id: nextId++,
      Name: itemData.Name || `Item ${nextId}`,
      Tags: itemData.Tags || "",
      Owner: itemData.Owner || null,
      checkout_id: itemData.checkout_id,
      item_id: itemData.item_id,
      item_type: itemData.item_type,
      CreatedOn: new Date().toISOString(),
      CreatedBy: itemData.checkout_id,
      ModifiedOn: new Date().toISOString(),
      ModifiedBy: itemData.checkout_id,
    };
    
    appItems.push(newItem);
    return { ...newItem };
  },

  async update(id, updateData) {
    await delay(300);
    const index = appItems.findIndex(i => i.Id === parseInt(id));
    if (index === -1) {
      throw new Error("App item not found");
    }
    
    // Only update updateable fields
    const updatedItem = {
      ...appItems[index],
      Name: updateData.Name !== undefined ? updateData.Name : appItems[index].Name,
      Tags: updateData.Tags !== undefined ? updateData.Tags : appItems[index].Tags,
      Owner: updateData.Owner !== undefined ? updateData.Owner : appItems[index].Owner,
      checkout_id: updateData.checkout_id !== undefined ? updateData.checkout_id : appItems[index].checkout_id,
      item_id: updateData.item_id !== undefined ? updateData.item_id : appItems[index].item_id,
      item_type: updateData.item_type !== undefined ? updateData.item_type : appItems[index].item_type,
      ModifiedOn: new Date().toISOString(),
      ModifiedBy: updateData.checkout_id || appItems[index].ModifiedBy,
    };
    
    appItems[index] = updatedItem;
    return { ...updatedItem };
  },

  async delete(id) {
    await delay(250);
    const index = appItems.findIndex(i => i.Id === parseInt(id));
    if (index === -1) {
      throw new Error("App item not found");
    }
    
    appItems.splice(index, 1);
    return { success: true };
  },

  async getByCheckout(checkoutId) {
    await delay(250);
    return appItems.filter(i => i.checkout_id === parseInt(checkoutId));
  },

  async getByType(itemType) {
    await delay(250);
    return appItems.filter(i => i.item_type === itemType);
  },

  async createFromCartItems(cartItems, checkoutId) {
    await delay(500);
    
    const createdItems = [];
    
    for (const cartItem of cartItems) {
      const itemData = {
        Name: `${cartItem.item_type} - ${cartItem.seat ? cartItem.seat.identifier : cartItem.item_id}`,
        checkout_id: checkoutId,
        item_id: cartItem.seat ? cartItem.seat.Id.toString() : cartItem.item_id,
        item_type: cartItem.seat ? "Seat" : "Ticket",
      };
      
      const createdItem = await this.create(itemData);
      createdItems.push(createdItem);
    }
    
    return createdItems;
  },

  async deleteByCheckout(checkoutId) {
    await delay(300);
    const itemsToDelete = appItems.filter(i => i.checkout_id === parseInt(checkoutId));
    
    for (const item of itemsToDelete) {
      await this.delete(item.Id);
    }
    
    return { success: true, deletedCount: itemsToDelete.length };
  },
};