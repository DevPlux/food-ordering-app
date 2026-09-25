// src/navigation/MainTabs.tsx
import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import MenuListScreen from "../screens/menu/MenuListScreen";
import MenuDetailScreen from "../screens/menu/MenuDetailScreen";
import MyOrdersScreen from "../screens/orders/MyOrdersScreen";
import OrderDetailScreen from "../screens/orders/OrderDetailScreen";
import ProfileScreen from "../screens/profile/ProfileScreen";
import AdminMenuListScreen from "../screens/admin/AdminMenuListScreen";
import MenuItemFormScreen from "../screens/admin/MenuItemFormScreen";
import AdminOrdersScreen from "../screens/admin/AdminOrdersScreen";
import AdminOrderDetailScreen from "../screens/admin/AdminOrderDetailScreen";
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
    <MenuStack.Navigator screenOptions={{ headerShown: false }}>
      <MenuStack.Screen name="MenuList" component={MenuListScreen} />
      <MenuStack.Screen name="MenuDetail" component={MenuDetailScreen} />
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

function AdminStackScreen() {
  return (
    <AdminStack.Navigator screenOptions={{ headerShown: false }}>
      <AdminStack.Screen name="AdminMenuList" component={AdminMenuListScreen} />
      <AdminStack.Screen name="MenuItemForm" component={MenuItemFormScreen} />
      <AdminStack.Screen name="AdminOrders" component={AdminOrdersScreen} />
      <AdminStack.Screen
        name="AdminOrderDetail"
        component={AdminOrderDetailScreen}
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
        tabBarStyle: {
          paddingBottom: 6,
          paddingTop: 6,
          height: 62,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
        },
      }}
    >
      <Tab.Screen
        name="MenuTab"
        component={MenuStackScreen}
        options={{
          title: "Menu",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "fast-food" : "fast-food-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="OrdersTab"
        component={OrdersStackScreen}
        options={{
          title: "Orders",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "receipt" : "receipt-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
      {user?.isAdmin && (
        <Tab.Screen
          name="AdminTab"
          component={AdminStackScreen}
          options={{
            title: "Admin",
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons
                name={focused ? "settings" : "settings-outline"}
                size={size}
                color={color}
              />
            ),
          }}
        />
      )}
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "person" : "person-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
