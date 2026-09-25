// src/screens/admin/AdminOrderDetailScreen.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { colors } from "../../theme/colors";
import {
  getOrderById,
  updateOrderStatus,
  deleteOrder,
} from "../../api/orderService";
import { Order, OrderStatus } from "../../types/order";
import Loading from "../../components/Loading";
import ErrorText from "../../components/ErrorText";
import StatusBadge from "../../components/StatusBadge";
import PrimaryButton from "../../components/PrimaryButton";
import { AdminStackParamList } from "../../navigation/types";

type Props = NativeStackScreenProps<AdminStackParamList, "AdminOrderDetail">;

const NEXT_ACTIONS: Record<
  OrderStatus,
  { label: string; status: OrderStatus }[]
> = {
  Pending: [
    { label: "Confirm Order", status: "Confirmed" },
    { label: "Cancel Order", status: "Cancelled" },
  ],
  Confirmed: [
    { label: "Start Preparing", status: "Preparing" },
    { label: "Cancel Order", status: "Cancelled" },
  ],
  Preparing: [{ label: "Mark as Ready", status: "Ready" }],
  Ready: [{ label: "Mark as Completed", status: "Completed" }],
  Completed: [],
  Cancelled: [],
};

export default function AdminOrderDetailScreen({ route, navigation }: Props) {
  const { orderId } = route.params;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(false);

  const load = async () => {
    try {
      const data = await getOrderById(orderId);
      setOrder(data);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [orderId]);

  const changeStatus = async (newStatus: OrderStatus) => {
    if (!order) return;
    setUpdating(true);
    try {
      const updated = await updateOrderStatus(order._id, newStatus);
      setOrder(updated);
      Alert.alert("Updated", `Order is now ${updated.status}`);
    } catch (e) {
      Alert.alert("Update Failed", (e as Error).message);
    } finally {
      setUpdating(false);
    }
  };

  const confirmDelete = () => {
    Alert.alert("Delete Order", "This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteOrder(order!._id);
            navigation.goBack();
          } catch (e) {
            Alert.alert("Delete Failed", (e as Error).message);
          }
        },
      },
    ]);
  };

  if (loading) return <Loading />;
  if (error) return <ErrorText>{error}</ErrorText>;
  if (!order) return null;

  const actions = NEXT_ACTIONS[order.status] || [];
  const item = order.menuItem;
  const itemName = item?.name ?? "Unknown item";
  const itemImage = item?.imageUrl || "https://via.placeholder.com/150";
  const itemTotal =
    typeof order.totalAmount === "number"
      ? order.totalAmount.toFixed(2)
      : "0.00";

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.statusRow}>
        <Text style={styles.orderId}>#{order._id.slice(-6).toUpperCase()}</Text>
        <StatusBadge status={order.status} />
      </View>

      <View style={styles.card}>
        <Image source={{ uri: itemImage }} style={styles.image} />
        <View style={{ flex: 1, marginLeft: 12, justifyContent: "center" }}>
          <Text style={styles.itemName}>{itemName}</Text>
          <Text style={styles.itemMeta}>Qty: {order.quantity}</Text>
          <Text style={styles.itemTotal}>Rs. {itemTotal}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Order Info</Text>
        <Row label="User ID" value={order.user || "—"} />
        <Row
          label="Ordered On"
          value={
            order.orderDate ? new Date(order.orderDate).toLocaleString() : "—"
          }
        />
      </View>

      {actions.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actions</Text>
          {actions.map((a) => (
            <View key={a.status} style={{ marginTop: 8 }}>
              <PrimaryButton
                title={a.label}
                onPress={() => changeStatus(a.status)}
                loading={updating}
                disabled={updating}
              />
            </View>
          ))}
        </View>
      )}

      <TouchableOpacity style={styles.deleteBtn} onPress={confirmDelete}>
        <Text style={styles.deleteText}>Delete Order</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, paddingBottom: 40 },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  orderId: { fontSize: 16, fontWeight: "700", color: colors.text },
  card: {
    flexDirection: "row",
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: colors.surface,
  },
  itemName: { fontSize: 16, fontWeight: "700", color: colors.text },
  itemMeta: { fontSize: 13, color: colors.textMuted, marginTop: 4 },
  itemTotal: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.primary,
    marginTop: 6,
  },
  section: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  rowLabel: { fontSize: 13, color: colors.textMuted },
  rowValue: {
    fontSize: 13,
    color: colors.text,
    flexShrink: 1,
    textAlign: "right",
    marginLeft: 12,
  },
  deleteBtn: {
    marginTop: 8,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.danger,
    alignItems: "center",
  },
  deleteText: { color: colors.danger, fontWeight: "700" },
});
