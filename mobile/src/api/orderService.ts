// src/api/orderService.ts
import axiosClient from "./axiosClient";
import { Order, OrderStatus } from "../types/order";
import { MenuItem } from "../types/menuItem";
import {
  mockOrders,
  addMockOrder,
  updateMockOrder,
  deleteMockOrder,
  generateMockOrderId,
} from "../mocks/mockData";

// ---------------- Status transition rules (business logic) ----------------
const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  Pending: ["Confirmed", "Cancelled"],
  Confirmed: ["Preparing", "Cancelled"],
  Preparing: ["Ready"],
  Ready: ["Completed"],
  Completed: [],
  Cancelled: [],
};

export const canTransition = (from: OrderStatus, to: OrderStatus): boolean =>
  VALID_TRANSITIONS[from]?.includes(to) ?? false;

// ---------------- Read ----------------

export const getMyOrders = async (): Promise<Order[]> => {
  // ⚠️ MOCK
  return new Promise((resolve) => {
    setTimeout(() => resolve([...mockOrders]), 600);
  });

  // const response = await axiosClient.get("/orders/my");
  // return response.data;
};

export const getAllOrders = async (): Promise<Order[]> => {
  // ⚠️ MOCK
  return new Promise((resolve) => {
    setTimeout(() => resolve([...mockOrders]), 600);
  });

  // const response = await axiosClient.get("/orders");
  // return response.data;
};

export const getOrderById = async (id: string): Promise<Order> => {
  // ⚠️ MOCK
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const order = mockOrders.find((o) => o._id === id);
      if (order) resolve(order);
      else reject(new Error("Order not found"));
    }, 400);
  });

  // const response = await axiosClient.get(`/orders/${id}`);
  // return response.data;
};

// ---------------- Create ----------------

type CreateOrderInput = {
  menuItem: MenuItem;
  quantity: number;
};

export const createOrder = async ({
  menuItem,
  quantity,
}: CreateOrderInput): Promise<Order> => {
  // ⚠️ MOCK
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (menuItem.availabilityStatus !== "Available") {
        reject(new Error("This item is currently unavailable"));
        return;
      }
      if (quantity < 1) {
        reject(new Error("Quantity must be at least 1"));
        return;
      }

      const newOrder: Order = {
        _id: generateMockOrderId(),
        user: "u1",
        menuItem,
        quantity,
        totalAmount: menuItem.price * quantity,
        status: "Pending",
        orderDate: new Date().toISOString(),
      };

      addMockOrder(newOrder);
      resolve(newOrder);
    }, 600);
  });

  // const response = await axiosClient.post("/orders", {
  //   menuItemId: menuItem._id,
  //   quantity,
  // });
  // return response.data;
};

// ---------------- Update / status ----------------

export const updateOrderStatus = async (
  id: string,
  newStatus: OrderStatus,
): Promise<Order> => {
  // ⚠️ MOCK
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const order = mockOrders.find((o) => o._id === id);
      if (!order) {
        reject(new Error("Order not found"));
        return;
      }

      if (!canTransition(order.status, newStatus)) {
        reject(
          new Error(
            `Cannot change status from ${order.status} to ${newStatus}`,
          ),
        );
        return;
      }

      updateMockOrder(id, { status: newStatus });
      resolve({ ...order, status: newStatus });
    }, 500);
  });

  // const response = await axiosClient.patch(`/orders/${id}/status`, {
  //   status: newStatus,
  // });
  // return response.data;
};

export const cancelOrder = async (id: string): Promise<Order> => {
  return updateOrderStatus(id, "Cancelled");
};

// ---------------- Delete ----------------

export const deleteOrder = async (id: string): Promise<void> => {
  // ⚠️ MOCK
  return new Promise((resolve) => {
    setTimeout(() => {
      deleteMockOrder(id);
      resolve();
    }, 400);
  });

  // await axiosClient.delete(`/orders/${id}`);
};
