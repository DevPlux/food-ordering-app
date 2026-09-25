// src/components/OrderCard.tsx
import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { colors } from "../theme/colors";
import { Order } from "../types/order";
import StatusBadge from "./StatusBadge";

type Props = {
  order: Order;
  onPress: () => void;
};

export default function OrderCard({ order, onPress }: Props) {
  const item = order.menuItem;
  const date = new Date(order.orderDate);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <Image
        source={{ uri: item.imageUrl || "https://via.placeholder.com/150" }}
        style={styles.image}
      />
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.meta}>
          Qty: {order.quantity} • Rs. {order.totalAmount.toFixed(2)}
        </Text>
        <Text style={styles.date}>
          {date.toLocaleDateString()}{" "}
          {date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </Text>
        <View style={styles.badgeRow}>
          <StatusBadge status={order.status} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: colors.white,
    borderRadius: 12,
    marginBottom: 16,
    padding: 12,
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
  info: { flex: 1, marginLeft: 12, justifyContent: "space-between" },
  name: { fontSize: 15, fontWeight: "700", color: colors.text },
  meta: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  date: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  badgeRow: { marginTop: 6 },
});
