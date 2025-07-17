const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Mock data storage
let purchaseTimers = [];
let nextId = 1;

export const purchaseTimerService = {
  async getAll() {
    await delay(300);
    return [...purchaseTimers];
  },

  async getById(id) {
    await delay(200);
    const timer = purchaseTimers.find(t => t.Id === parseInt(id));
    if (!timer) {
      throw new Error("Purchase timer not found");
    }
    return { ...timer };
  },

  async create(timerData) {
    await delay(400);
    
    // Only include updateable fields
    const newTimer = {
      Id: nextId++,
      Name: timerData.Name || `Timer ${nextId}`,
      Tags: timerData.Tags || "",
      Owner: timerData.Owner || null,
      checkout_id: timerData.checkout_id,
      start_time: timerData.start_time || new Date().toISOString(),
      expiry_time: timerData.expiry_time,
      is_active: timerData.is_active !== undefined ? timerData.is_active : true,
      seat_hold_until: timerData.seat_hold_until,
      CreatedOn: new Date().toISOString(),
      CreatedBy: timerData.checkout_id,
      ModifiedOn: new Date().toISOString(),
      ModifiedBy: timerData.checkout_id,
    };
    
    purchaseTimers.push(newTimer);
    return { ...newTimer };
  },

  async update(id, updateData) {
    await delay(300);
    const index = purchaseTimers.findIndex(t => t.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Purchase timer not found");
    }
    
    // Only update updateable fields
    const updatedTimer = {
      ...purchaseTimers[index],
      Name: updateData.Name !== undefined ? updateData.Name : purchaseTimers[index].Name,
      Tags: updateData.Tags !== undefined ? updateData.Tags : purchaseTimers[index].Tags,
      Owner: updateData.Owner !== undefined ? updateData.Owner : purchaseTimers[index].Owner,
      checkout_id: updateData.checkout_id !== undefined ? updateData.checkout_id : purchaseTimers[index].checkout_id,
      start_time: updateData.start_time !== undefined ? updateData.start_time : purchaseTimers[index].start_time,
      expiry_time: updateData.expiry_time !== undefined ? updateData.expiry_time : purchaseTimers[index].expiry_time,
      is_active: updateData.is_active !== undefined ? updateData.is_active : purchaseTimers[index].is_active,
      seat_hold_until: updateData.seat_hold_until !== undefined ? updateData.seat_hold_until : purchaseTimers[index].seat_hold_until,
      ModifiedOn: new Date().toISOString(),
      ModifiedBy: updateData.checkout_id || purchaseTimers[index].ModifiedBy,
    };
    
    purchaseTimers[index] = updatedTimer;
    return { ...updatedTimer };
  },

  async delete(id) {
    await delay(250);
    const index = purchaseTimers.findIndex(t => t.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Purchase timer not found");
    }
    
    purchaseTimers.splice(index, 1);
    return { success: true };
  },

  async getByCheckout(checkoutId) {
    await delay(250);
    return purchaseTimers.filter(t => t.checkout_id === parseInt(checkoutId));
  },

  async getActiveTimers() {
    await delay(250);
    return purchaseTimers.filter(t => t.is_active === true);
  },

  async getExpiredTimers() {
    await delay(250);
    const now = new Date().toISOString();
    return purchaseTimers.filter(t => 
      t.is_active === true && 
      t.expiry_time && 
      t.expiry_time < now
    );
  },

  async deactivateTimer(id) {
    await delay(200);
    return this.update(id, { is_active: false });
  },

  async createForCheckout(checkoutId, holdMinutes = 15) {
    await delay(400);
    
    const startTime = new Date();
    const expiryTime = new Date(startTime.getTime() + holdMinutes * 60000);
    const seatHoldUntil = new Date(startTime.getTime() + holdMinutes * 60000);
    
    const timerData = {
      Name: `Timer for Checkout ${checkoutId}`,
      checkout_id: checkoutId,
      start_time: startTime.toISOString(),
      expiry_time: expiryTime.toISOString(),
      is_active: true,
      seat_hold_until: seatHoldUntil.toISOString(),
    };
    
    return this.create(timerData);
  },

  async getRemainingTime(checkoutId) {
    await delay(200);
    const timer = purchaseTimers.find(t => 
      t.checkout_id === parseInt(checkoutId) && 
      t.is_active === true
    );
    
    if (!timer) {
      throw new Error("Active timer not found for checkout");
    }
    
    const now = new Date();
    const expiryTime = new Date(timer.expiry_time);
    const remainingMs = expiryTime.getTime() - now.getTime();
    
    return {
      remainingMs: Math.max(0, remainingMs),
      remainingMinutes: Math.max(0, Math.ceil(remainingMs / 60000)),
      isExpired: remainingMs <= 0,
      timer: { ...timer }
    };
  },

  async extendTimer(checkoutId, additionalMinutes = 10) {
    await delay(300);
    const timer = purchaseTimers.find(t => 
      t.checkout_id === parseInt(checkoutId) && 
      t.is_active === true
    );
    
    if (!timer) {
      throw new Error("Active timer not found for checkout");
    }
    
    const currentExpiry = new Date(timer.expiry_time);
    const newExpiry = new Date(currentExpiry.getTime() + additionalMinutes * 60000);
    const newSeatHold = new Date(currentExpiry.getTime() + additionalMinutes * 60000);
    
    return this.update(timer.Id, {
      expiry_time: newExpiry.toISOString(),
      seat_hold_until: newSeatHold.toISOString(),
    });
  },
};