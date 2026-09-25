// src/screens/admin/AdminOrdersScreen.tsx
import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { colors } from "../../theme/colors";
import { Order } from "../../types/order";
import { getAllOrders } from "../../api/orderService";
import Loading from "../../components/Loading";
import EmptyState from "../../components/EmptyState";
import ErrorText from "../../components/ErrorText";
import StatusBadge from "../../components/StatusBadge";
import { AdminStackParamList } from "../../navigation/types";

type Props = NativeStackScreenProps<AdminStackParamList, "AdminOrders">;

export default function AdminOrdersScreen({ navigation }: Props) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchOrders = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError("");
    try {
      const data = await getAllOrders();
      setOrders(data);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchOrders();
    }, []),
  );

  if (loading) return <Loading />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>All Orders</Text>
        <Text style={styles.subtitle}>{orders.length} total</Text>
      </View>

      {error ? (
        <View style={styles.center}>
          <ErrorText>{error}</ErrorText>
        </View>
      ) : orders.length === 0 ? (
        <EmptyState message="No orders yet." />
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(o) => o._id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchOrders(true)}
            />
          }
          renderItem={({ item }) => {
            // ✅ Defensive: handle missing menuItem gracefully
            const itemName = item.menuItem?.name ?? "Unknown item";
            const total =
              typeof item.totalAmount === "number"
                ? item.totalAmount.toFixed(2)
                : "0.00";

            return (
              <TouchableOpacity
                style={styles.row}
                onPress={() =>
                  navigation.navigate("AdminOrderDetail", { orderId: item._id })
                }
              >
                <View style={styles.rowTop}>
                  <Text style={styles.rowId}>
                    #{item._id.slice(-6).toUpperCase()}
                  </Text>
                  <StatusBadge status={item.status} />
                </View>
                <Text style={styles.rowItem}>{itemName}</Text>
                <Text style={styles.rowMeta}>
                  Qty {item.quantity} • Rs. {total}
                </Text>
                <Text style={styles.rowUser}>User: {item.user || "—"}</Text>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  title: { fontSize: 22, fontWeight: "700", color: colors.text },
  subtitle: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  list: { padding: 16 },
  row: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  rowTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  rowId: { fontSize: 13, fontWeight: "700", color: colors.textMuted },
  rowItem: { fontSize: 16, fontWeight: "700", color: colors.text },
  rowMeta: { fontSize: 13, color: colors.textMuted, marginTop: 4 },
  rowUser: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 6,
    fontStyle: "italic",
  },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});
