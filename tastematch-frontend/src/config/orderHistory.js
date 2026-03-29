const ORDER_HISTORY_PREFIX = 'tastematch.orderHistory';

const getStorage = () => {
  if (typeof window === 'undefined') {
    return null;
  }
  return window.localStorage;
};

const sortOrders = (orders) =>
  [...orders].sort((left, right) => {
    const leftTime = new Date(left.orderTime || left.time || 0).getTime();
    const rightTime = new Date(right.orderTime || right.time || 0).getTime();
    return rightTime - leftTime;
  });

const getKey = (userId) => `${ORDER_HISTORY_PREFIX}:${userId}`;

export const getStoredOrderHistory = (userId) => {
  const storage = getStorage();
  if (!storage || !userId) {
    return [];
  }

  try {
    const rawValue = storage.getItem(getKey(userId));
    if (!rawValue) {
      return [];
    }

    const parsedOrders = JSON.parse(rawValue);
    if (!Array.isArray(parsedOrders)) {
      return [];
    }

    return sortOrders(parsedOrders);
  } catch (error) {
    return [];
  }
};

export const saveOrdersToHistory = (userId, orders) => {
  const storage = getStorage();
  if (!storage || !userId || !Array.isArray(orders)) {
    return [];
  }

  const sortedOrders = sortOrders(orders);
  storage.setItem(getKey(userId), JSON.stringify(sortedOrders));
  return sortedOrders;
};

export const saveOrderToHistory = (userId, order) => {
  if (!userId || !order?.id) {
    return [];
  }

  const existingOrders = getStoredOrderHistory(userId);
  const nextOrders = existingOrders.filter((entry) => String(entry.id) !== String(order.id));
  nextOrders.push(order);
  return saveOrdersToHistory(userId, nextOrders);
};
