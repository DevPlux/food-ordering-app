// src/navigation/MainTabs.tsx
import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MenuListScreen from "../screens/menu/MenuListScreen";
import MenuDetailScreen from "../screens/menu/MenuDetailScreen";
import MyOrdersScreen from "../screens/orders/MyOrdersScreen";
import OrderDetailScreen from "../screens/orders/OrderDetailScreen";
import ProfileScreen from "../screens/profile/ProfileScreen";
import AdminMenuListScreen from "../screens/admin/AdminMenuListScreen";
import MenuItemFormScreen from "../screens/admin/MenuItemFormScreen";
import { colors } from "../theme/colors";
import { useAuth } from "../context/AuthContext";
import {
  MainTabParamList,
  MenuStackParamList,
  OrdersStackParamList,
  AdminStackParamList,
} from "./types";

const Tab = createBottomTabNavigator<MainTabParamList>();
const MenuStack = createNativeStackNavigator<MenuStackParamList>();
const OrdersStack = createNativeStackNavigator<OrdersStackParamList>();
const AdminStack = createNativeStackNavigator<AdminStackParamList>();

function MenuStackScreen() {
  return (
    <MenuStack.Navigator>
      <MenuStack.Screen
        name="MenuList"
        component={MenuListScreen}
        options={{ title: "Menu" }}
      />
      <MenuStack.Screen
        name="MenuDetail"
        component={MenuDetailScreen}
        options={{ title: "Item" }}
      />
    </MenuStack.Navigator>
  );
}

function OrdersStackScreen() {
  return (
    <OrdersStack.Navigator screenOptions={{ headerShown: false }}>
      <OrdersStack.Screen name="MyOrders" component={MyOrdersScreen} />
      <OrdersStack.Screen name="OrderDetail" component={OrderDetailScreen} />
    </OrdersStack.Navigator>
  );
}

import AdminOrdersScreen from "../screens/admin/AdminOrdersScreen";
import AdminOrderDetailScreen from "../screens/admin/AdminOrderDetailScreen";

function AdminStackScreen() {
  return (
    <AdminStack.Navigator>
      <AdminStack.Screen
        name="AdminMenuList"
        component={AdminMenuListScreen}
        options={{ title: "Admin" }}
      />
      <AdminStack.Screen
        name="MenuItemForm"
        component={MenuItemFormScreen}
        options={{ title: "Menu Item" }}
      />
      <AdminStack.Screen
        name="AdminOrders"
        component={AdminOrdersScreen}
        options={{ title: "All Orders" }}
      />
      <AdminStack.Screen
        name="AdminOrderDetail"
        component={AdminOrderDetailScreen}
        options={{ title: "Order Details" }}
      />
    </AdminStack.Navigator>
  );
}

export default function MainTabs() {
  const { user } = useAuth();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="MenuTab"
        component={MenuStackScreen}
        options={{ title: "Menu" }}
      />
      <Tab.Screen
        name="OrdersTab"
        component={OrdersStackScreen}
        options={{ title: "Orders" }}
      />
      {user?.isAdmin && (
        <Tab.Screen
          name="AdminTab"
          component={AdminStackScreen}
          options={{ title: "Admin" }}
        />
      )}
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{ title: "Profile" }}
      />
    </Tab.Navigator>
  );
}
