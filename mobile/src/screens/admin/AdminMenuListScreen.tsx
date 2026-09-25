// src/screens/admin/AdminMenuListScreen.tsx
import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  RefreshControl,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { colors } from "../../theme/colors";
import { MenuItem } from "../../types/menuItem";
import { getMenuItems, deleteMenuItem } from "../../api/menuService";
import Loading from "../../components/Loading";
import EmptyState from "../../components/EmptyState";
import ErrorText from "../../components/ErrorText";
import { AdminStackParamList } from "../../navigation/types";

type Props = NativeStackScreenProps<AdminStackParamList, "AdminMenuList">;

export default function AdminMenuListScreen({ navigation }: Props) {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchItems = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError("");
    try {
      const data = await getMenuItems();
      setItems(data);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchItems();
    }, []),
  );

  const confirmDelete = (item: MenuItem) => {
    Alert.alert(
      "Delete Item",
      `Are you sure you want to delete "${item.name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteMenuItem(item._id);
              fetchItems();
            } catch (e) {
              Alert.alert("Delete Failed", (e as Error).message);
            }
          },
        },
      ],
    );
  };

  if (loading) return <Loading />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Manage Menu</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.navigate("AdminOrders")}
          >
            <Text style={styles.secondaryText}>Orders</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate("MenuItemForm", {})}
          >
            <Text style={styles.addText}>+ Add Item</Text>
          </TouchableOpacity>
        </View>
      </View>

      {error ? (
        <View style={styles.center}>
          <ErrorText>{error}</ErrorText>
        </View>
      ) : items.length === 0 ? (
        <EmptyState message="No menu items yet. Tap '+ Add Item' to create one." />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(i) => i._id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchItems(true)}
            />
          }
          renderItem={({ item }) => (
            <View style={styles.row}>
              <Image
                source={{
                  uri: item.imageUrl || "https://via.placeholder.com/60",
                }}
                style={styles.thumb}
              />
              <View style={styles.rowInfo}>
                <Text style={styles.rowName} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={styles.rowMeta}>
                  {item.category} • Rs. {item.price.toFixed(2)}
                </Text>
                <Text
                  style={[
                    styles.rowStatus,
                    item.availabilityStatus === "Available"
                      ? styles.available
                      : styles.unavailable,
                  ]}
                >
                  {item.availabilityStatus}
                </Text>
              </View>
              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() =>
                    navigation.navigate("MenuItemForm", { itemId: item._id })
                  }
                >
                  <Text style={styles.actionText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.deleteBtn]}
                  onPress={() => confirmDelete(item)}
                >
                  <Text style={styles.deleteText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerActions: {
    flexDirection: "row",
    gap: 8,
  },
  title: { fontSize: 22, fontWeight: "700", color: colors.text },
  addButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addText: { color: colors.white, fontWeight: "600", fontSize: 13 },
  secondaryButton: {
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryText: { color: colors.text, fontWeight: "600", fontSize: 13 },
  list: { padding: 16 },
  row: {
    flexDirection: "row",
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  thumb: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: colors.surface,
  },
  rowInfo: { flex: 1, marginLeft: 12 },
  rowName: { fontSize: 15, fontWeight: "700", color: colors.text },
  rowMeta: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  rowStatus: { fontSize: 11, fontWeight: "700", marginTop: 4 },
  available: { color: colors.success },
  unavailable: { color: colors.danger },
  actions: { flexDirection: "column", gap: 6 },
  actionBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: colors.surface,
  },
  actionText: { fontSize: 12, color: colors.text, fontWeight: "600" },
  deleteBtn: { backgroundColor: "#FFEBEE" },
  deleteText: { fontSize: 12, color: colors.danger, fontWeight: "600" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});
