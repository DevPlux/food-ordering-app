// src/api/menuService.ts
import axiosClient from "./axiosClient";
import { MenuItem } from "../types/menuItem";
import {
  mockMenuItems,
  addMockMenuItem,
  updateMockMenuItem,
  deleteMockMenuItem,
  generateMockMenuItemId,
} from "../mocks/mockData";

export const getMenuItems = async (): Promise<MenuItem[]> => {
  // ⚠️ TEMPORARY mock
  return new Promise((resolve) => {
    setTimeout(() => resolve([...mockMenuItems]), 600);
  });

  // const response = await axiosClient.get('/menu-items');
  // return response.data;
};

export const getMenuItemById = async (id: string): Promise<MenuItem> => {
  // ⚠️ TEMPORARY mock
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const item = mockMenuItems.find((i) => i._id === id);
      if (item) resolve(item);
      else reject(new Error("Item not found"));
    }, 400);
  });
};

export type MenuItemInput = {
  name: string;
  description: string;
  price: number;
  category: string;
  availabilityStatus: "Available" | "Unavailable";
  imageUri?: string; // local URI from image picker
};

export const createMenuItem = async (
  input: MenuItemInput,
): Promise<MenuItem> => {
  // ⚠️ TEMPORARY mock
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (!input.name || !input.price) {
        reject(new Error("Name and price are required"));
        return;
      }
      const newItem: MenuItem = {
        _id: generateMockMenuItemId(),
        name: input.name,
        description: input.description,
        price: input.price,
        category: input.category,
        availabilityStatus: input.availabilityStatus,
        imageUrl: input.imageUri,
      };
      addMockMenuItem(newItem);
      resolve(newItem);
    }, 600);
  });

  // Real API (when backend is ready):
  // const formData = new FormData();
  // formData.append('name', input.name);
  // formData.append('description', input.description);
  // formData.append('price', String(input.price));
  // formData.append('category', input.category);
  // formData.append('availabilityStatus', input.availabilityStatus);
  // if (input.imageUri) {
  //   formData.append('image', {
  //     uri: input.imageUri,
  //     name: 'photo.jpg',
  //     type: 'image/jpeg',
  //   } as any);
  // }
  // const response = await axiosClient.post('/menu-items', formData, {
  //   headers: { 'Content-Type': 'multipart/form-data' },
  // });
  // return response.data;
};

export const updateMenuItem = async (
  id: string,
  input: MenuItemInput,
): Promise<MenuItem> => {
  // ⚠️ TEMPORARY mock
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      updateMockMenuItem(id, {
        name: input.name,
        description: input.description,
        price: input.price,
        category: input.category,
        availabilityStatus: input.availabilityStatus,
        ...(input.imageUri ? { imageUrl: input.imageUri } : {}),
      });
      const updated = mockMenuItems.find((i) => i._id === id);
      if (updated) resolve(updated);
      else reject(new Error("Item not found"));
    }, 600);
  });
};

export const deleteMenuItem = async (id: string): Promise<void> => {
  // ⚠️ TEMPORARY mock
  return new Promise((resolve) => {
    setTimeout(() => {
      deleteMockMenuItem(id);
      resolve();
    }, 400);
  });
};
