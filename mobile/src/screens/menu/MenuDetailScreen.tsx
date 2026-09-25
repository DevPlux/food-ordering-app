// src/screens/menu/MenuDetailScreen.tsx
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
import { MenuStackParamList } from "../../navigation/types";
import { MenuItem } from "../../types/menuItem";
import { getMenuItemById } from "../../api/menuService";
import { createOrder } from "../../api/orderService";
import Loading from "../../components/Loading";
import ErrorText from "../../components/ErrorText";
import PrimaryButton from "../../components/PrimaryButton";

type Props = NativeStackScreenProps<MenuStackParamList, "MenuDetail">;

export default function MenuDetailScreen({ route, navigation }: Props) {
  const { itemId } = route.params;

  // ✅ ALL hooks go here, at the top, unconditionally
  const [item, setItem] = useState<MenuItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const data = await getMenuItemById(itemId);
        setItem(data);
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    };
    fetchItem();
  }, [itemId]);

  // ✅ Early returns come AFTER all hooks
  if (loading) return <Loading />;
  if (error) return <ErrorText>{error}</ErrorText>;
  if (!item) return null;

  const isAvailable = item.availabilityStatus === "Available";
  const totalAmount = item.price * quantity;

  const handlePlaceOrder = async () => {
    setPlacing(true);
    try {
      const order = await createOrder({ menuItem: item, quantity });
      Alert.alert(
        "Order Placed!",
        `Order #${order._id.slice(-6).toUpperCase()}\nTotal: Rs. ${order.totalAmount.toFixed(2)}\nStatus: ${order.status}`,
        [
          { text: "Stay Here" },
          {
            text: "View My Orders",
            onPress: () =>
              navigation.getParent()?.navigate("OrdersTab" as never),
          },
        ],
      );
    } catch (e) {
      Alert.alert("Order Failed", (e as Error).message);
    } finally {
      setPlacing(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Image
        source={{ uri: item.imageUrl || "https://via.placeholder.com/300" }}
        style={styles.image}
      />
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.category}>{item.category}</Text>

      <Text style={styles.sectionTitle}>Description</Text>
      <Text style={styles.description}>{item.description}</Text>

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

      {isAvailable && (
        <View style={styles.orderSection}>
          <Text style={styles.sectionTitle}>Quantity</Text>
          <View style={styles.quantityContainer}>
            <TouchableOpacity
              style={styles.qtyButton}
              onPress={() => setQuantity((q) => Math.max(1, q - 1))}
            >
              <Text style={styles.qtyButtonText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.qtyText}>{quantity}</Text>
            <TouchableOpacity
              style={styles.qtyButton}
              onPress={() => setQuantity((q) => q + 1)}
            >
              <Text style={styles.qtyButtonText}>+</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalPrice}>Rs. {totalAmount.toFixed(2)}</Text>
          </View>
        </View>
      )}

      <View style={styles.buttonWrapper}>
        <PrimaryButton
          title={isAvailable ? "Place Order" : "Currently Unavailable"}
          onPress={handlePlaceOrder}
          disabled={!isAvailable}
          loading={placing}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingBottom: 40 },
  image: {
    width: "100%",
    height: 220,
    borderRadius: 12,
    backgroundColor: colors.surface,
    marginBottom: 16,
  },
  name: { fontSize: 24, fontWeight: "700", color: colors.text },
  category: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 16,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginTop: 8,
    marginBottom: 8,
  },
  description: { fontSize: 15, color: colors.textMuted, lineHeight: 22 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
  },
  price: { fontSize: 22, fontWeight: "700", color: colors.primary },
  status: {
    fontSize: 13,
    fontWeight: "600",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    overflow: "hidden",
  },
  available: { backgroundColor: "#E8F5E9", color: colors.success },
  unavailable: { backgroundColor: "#FFEBEE", color: colors.danger },
  orderSection: {
    marginTop: 24,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 16,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  qtyButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  qtyButtonText: { fontSize: 20, fontWeight: "600", color: colors.text },
  qtyText: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
    marginHorizontal: 20,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  totalLabel: { fontSize: 16, fontWeight: "500", color: colors.textMuted },
  totalPrice: { fontSize: 20, fontWeight: "700", color: colors.primary },
  buttonWrapper: { marginTop: 16 },
});
