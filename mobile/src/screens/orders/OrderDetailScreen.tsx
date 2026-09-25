// src/screens/orders/OrderDetailScreen.tsx
import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Image, ScrollView, Alert } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { colors } from "../../theme/colors";
import { Order } from "../../types/order";
import Loading from "../../components/Loading";
import ErrorText from "../../components/ErrorText";
import StatusBadge from "../../components/StatusBadge";
import PrimaryButton from "../../components/PrimaryButton";
import { getOrderById, cancelOrder } from "../../api/orderService";
import { OrdersStackParamList } from "../../navigation/types";

type Props = NativeStackScreenProps<OrdersStackParamList, "OrderDetail">;

export default function OrderDetailScreen({ route }: Props) {
  const { orderId } = route.params;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const data = await getOrderById(orderId);
        setOrder(data);
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  const handleCancel = () => {
    Alert.alert("Cancel Order", "Are you sure?", [
      { text: "No", style: "cancel" },
      {
        text: "Yes, Cancel",
        style: "destructive",
        onPress: async () => {
          setCancelling(true);
          try {
            const updated = await cancelOrder(order!._id);
            setOrder(updated);
          } catch (e) {
            Alert.alert("Failed", (e as Error).message);
          } finally {
            setCancelling(false);
          }
        },
      },
    ]);
  };

  if (loading) return <Loading />;
  if (error) return <ErrorText>{error}</ErrorText>;
  if (!order) return null;

  const date = new Date(order.orderDate);
  const item = order.menuItem;
  const canCancel = order.status === "Pending" || order.status === "Confirmed";

  const itemName = item?.name ?? "Unknown item";
  const itemCategory = item?.category ?? "";
  const itemPrice =
    typeof item?.price === "number" ? item.price.toFixed(2) : "0.00";
  const itemImage = item?.imageUrl || "https://via.placeholder.com/150";
  const totalAmount =
    typeof order.totalAmount === "number"
      ? order.totalAmount.toFixed(2)
      : "0.00";

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.statusRow}>
        <Text style={styles.orderId}>
          Order #{order._id.slice(-6).toUpperCase()}
        </Text>
        <StatusBadge status={order.status} />
      </View>

      <View style={styles.card}>
        <Image source={{ uri: itemImage }} style={styles.image} />
        <View style={styles.itemInfo}>
          <Text style={styles.itemName}>{itemName}</Text>
          <Text style={styles.itemCategory}>{itemCategory}</Text>
          <Text style={styles.itemPrice}>Rs. {itemPrice} each</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Order Summary</Text>
        <Row label="Quantity" value={String(order.quantity)} />
        <Row label="Unit Price" value={`Rs. ${itemPrice}`} />
        <View style={styles.divider} />
        <Row label="Total" value={`Rs. ${totalAmount}`} bold />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ordered On</Text>
        <Text style={styles.dateText}>
          {date.toLocaleDateString()} at{" "}
          {date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </Text>
      </View>

      {canCancel && (
        <View style={styles.buttonWrapper}>
          <PrimaryButton
            title="Cancel Order"
            onPress={handleCancel}
            loading={cancelling}
          />
        </View>
      )}
    </ScrollView>
  );
}

function Row({
  label,
  value,
  bold,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <View style={styles.row}>
      <Text style={[styles.rowLabel, bold && styles.bold]}>{label}</Text>
      <Text style={[styles.rowValue, bold && styles.bold]}>{value}</Text>
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
    marginTop: 12,
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
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: colors.surface,
  },
  itemInfo: { flex: 1, marginLeft: 12, justifyContent: "center" },
  itemName: { fontSize: 16, fontWeight: "700", color: colors.text },
  itemCategory: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  itemPrice: {
    fontSize: 14,
    color: colors.primary,
    marginTop: 6,
    fontWeight: "600",
  },
  section: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  rowLabel: { fontSize: 14, color: colors.textMuted },
  rowValue: { fontSize: 14, color: colors.text },
  bold: { fontWeight: "700", color: colors.text, fontSize: 16 },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 8 },
  dateText: { fontSize: 14, color: colors.textMuted },
  buttonWrapper: { marginTop: 8 },
});
