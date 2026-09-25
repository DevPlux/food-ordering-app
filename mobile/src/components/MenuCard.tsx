import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { colors } from "../theme/colors";
import { MenuItem } from "../types/menuItem";

type Props = {
  item: MenuItem;
  onPress: () => void;
};

export default function MenuCard({ item, onPress }: Props) {
  const isAvailable = item.availabilityStatus === "Available";

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
        <Text style={styles.category}>{item.category}</Text>
        <View style={styles.row}>
          <Text style={styles.price}>Rs. {item.price.toFixed(2)}</Text>
          <Text
            style={[
              styles.status,
              isAvailable ? styles.available : styles.unavailable,
            ]}
          >
            {item.availabilityStatus}
          </Text>
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
    elevation: 3, // For Android
  },
  image: {
    width: 90,
    height: 90,
    borderRadius: 8,
    backgroundColor: colors.surface,
  },
  info: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "space-between",
  },
  name: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
  },
  category: {
    fontSize: 13,
    color: colors.textMuted,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  price: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.primary,
  },
  status: {
    fontSize: 12,
    fontWeight: "600",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: "hidden",
  },
  available: {
    backgroundColor: "#E8F5E9",
    color: colors.success,
  },
  unavailable: {
    backgroundColor: "#FFEBEE",
    color: colors.danger,
  },
});
