// src/screens/orders/OrderDetailScreen.tsx
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
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { colors } from "../../theme/colors";
import { Order, OrderStatus } from "../../types/order";
import { getOrderById, cancelOrder } from "../../api/orderService";
import Loading from "../../components/Loading";
import ErrorText from "../../components/ErrorText";
import PrimaryButton from "../../components/PrimaryButton";
import { OrdersStackParamList } from "../../navigation/types";

type Props = NativeStackScreenProps<OrdersStackParamList, "OrderDetail">;

const STEPS: OrderStatus[] = [
  "Pending",
  "Confirmed",
  "Preparing",
  "Ready",
  "Completed",
];

const STATUS_COLORS: Record<
  OrderStatus,
  { bg: string; text: string; icon: string }
> = {
  Pending: { bg: "#FFF8E1", text: "#F57F17", icon: "time-outline" },
  Confirmed: {
    bg: "#E3F2FD",
    text: "#1565C0",
    icon: "checkmark-circle-outline",
  },
  Preparing: { bg: "#FFF3E0", text: "#E65100", icon: "restaurant-outline" },
  Ready: { bg: "#EDE7F6", text: "#4527A0", icon: "bag-check-outline" },
  Completed: {
    bg: "#E8F5E9",
    text: "#2E7D32",
    icon: "checkmark-done-circle-outline",
  },
  Cancelled: { bg: "#FFEBEE", text: "#D32F2F", icon: "close-circle-outline" },
};

export default function OrderDetailScreen({ route, navigation }: Props) {
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
    Alert.alert("Cancel Order", "Are you sure you want to cancel this order?", [
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

  if (error || !order) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={styles.headerBar}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={22} color={colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Order Details</Text>
          <View style={{ width: 38 }} />
        </View>
        <View style={styles.centerBox}>
          <Ionicons
            name="alert-circle-outline"
            size={48}
            color={colors.danger}
          />
          <Text style={styles.errorTitle}>Couldn't load order</Text>
          <ErrorText>{error || "Order not found"}</ErrorText>
        </View>
      </SafeAreaView>
    );
  }

  // Safe values
  const item = order.menuItem;
  const itemName = item?.name ?? "Unknown item";
  const itemCategory = item?.category ?? "—";
  const itemImage = item?.imageUrl || "https://via.placeholder.com/400";
  const itemPrice =
    typeof item?.price === "number" ? item.price.toFixed(2) : "0.00";
  const total =
    typeof order.totalAmount === "number"
      ? order.totalAmount.toFixed(2)
      : "0.00";
  const date = new Date(order.orderDate);
  const canCancel = order.status === "Pending" || order.status === "Confirmed";
  const statusStyle = STATUS_COLORS[order.status] || STATUS_COLORS.Pending;
  const currentStepIndex = STEPS.indexOf(order.status);
  const isCancelled = order.status === "Cancelled";

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      {/* ===== Custom Header ===== */}
      <View style={styles.headerBar}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={22} color={colors.white} />
        </TouchableOpacity>

        <View style={{ alignItems: "center" }}>
          <Text style={styles.headerTitle}>Order Details</Text>
          <Text style={styles.headerSubtitle}>
            #{order._id.slice(-6).toUpperCase()}
          </Text>
        </View>

        <View style={styles.headerStatusChip}>
          <Ionicons
            name={statusStyle.icon as any}
            size={14}
            color={colors.white}
          />
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ===== Status Card with Tracker ===== */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <View
              style={[
                styles.statusIconBox,
                { backgroundColor: statusStyle.bg },
              ]}
            >
              <Ionicons
                name={statusStyle.icon as any}
                size={22}
                color={statusStyle.text}
              />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.statusLabelSmall}>Current Status</Text>
              <Text
                style={[styles.statusLabelBig, { color: statusStyle.text }]}
              >
                {order.status}
              </Text>
            </View>
          </View>

          {/* Progress tracker (hidden if cancelled) */}
          {!isCancelled && (
            <View style={styles.trackerRow}>
              {STEPS.map((step, index) => {
                const isDone = index <= currentStepIndex;
                const isCurrent = index === currentStepIndex;
                return (
                  <React.Fragment key={step}>
                    <View style={styles.trackerStep}>
                      <View
                        style={[
                          styles.trackerDot,
                          isDone && styles.trackerDotDone,
                          isCurrent && styles.trackerDotCurrent,
                        ]}
                      >
                        {isDone && (
                          <Ionicons
                            name="checkmark"
                            size={12}
                            color={colors.white}
                          />
                        )}
                      </View>
                      <Text
                        style={[
                          styles.trackerLabel,
                          isDone && styles.trackerLabelDone,
                        ]}
                      >
                        {step}
                      </Text>
                    </View>
                    {index < STEPS.length - 1 && (
                      <View
                        style={[
                          styles.trackerLine,
                          index < currentStepIndex && styles.trackerLineDone,
                        ]}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </View>
          )}

          {isCancelled && (
            <View style={styles.cancelledBanner}>
              <Ionicons
                name="information-circle-outline"
                size={16}
                color={colors.danger}
              />
              <Text style={styles.cancelledText}>
                This order has been cancelled.
              </Text>
            </View>
          )}
        </View>

        {/* ===== Item Card ===== */}
        <Text style={styles.sectionHeading}>Item</Text>
        <View style={styles.itemCard}>
          <Image source={{ uri: itemImage }} style={styles.itemImage} />
          <View style={styles.itemBody}>
            <Text style={styles.itemName} numberOfLines={2}>
              {itemName}
            </Text>
            <View style={styles.itemCategoryPill}>
              <Text style={styles.itemCategoryText}>{itemCategory}</Text>
            </View>
            <Text style={styles.itemPrice}>Rs. {itemPrice}</Text>
          </View>
        </View>

        {/* ===== Order Summary ===== */}
        <Text style={styles.sectionHeading}>Order Summary</Text>
        <View style={styles.summaryCard}>
          <SummaryRow
            icon="cube-outline"
            label="Quantity"
            value={String(order.quantity)}
          />
          <View style={styles.divider} />
          <SummaryRow
            icon="pricetag-outline"
            label="Unit Price"
            value={`Rs. ${itemPrice}`}
          />
          <View style={styles.divider} />
          <SummaryRow
            icon="cash-outline"
            label="Total"
            value={`Rs. ${total}`}
            bold
          />
        </View>

        {/* ===== Order Info ===== */}
        <Text style={styles.sectionHeading}>Order Info</Text>
        <View style={styles.summaryCard}>
          <SummaryRow
            icon="calendar-outline"
            label="Ordered On"
            value={`${date.toLocaleDateString()} • ${date.toLocaleTimeString(
              [],
              {
                hour: "2-digit",
                minute: "2-digit",
              },
            )}`}
          />
          <View style={styles.divider} />
          <SummaryRow
            icon="receipt-outline"
            label="Order ID"
            value={`#${order._id.slice(-8).toUpperCase()}`}
          />
        </View>

        {/* ===== Cancel Button ===== */}
        {canCancel && (
          <View style={styles.cancelWrapper}>
            <PrimaryButton
              title="Cancel Order"
              onPress={handleCancel}
              loading={cancelling}
            />
            <Text style={styles.cancelHint}>
              You can only cancel while the order is Pending or Confirmed.
            </Text>
          </View>
        )}

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function SummaryRow({
  icon,
  label,
  value,
  bold,
}: {
  icon: string;
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <View style={styles.summaryRow}>
      <View style={styles.summaryLeft}>
        <Ionicons name={icon as any} size={16} color={colors.textMuted} />
        <Text style={styles.summaryLabel}>{label}</Text>
      </View>
      <Text style={[styles.summaryValue, bold && styles.summaryValueBold]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },

  // ===== Header =====
  headerBar: {
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.18)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    color: colors.white,
    fontSize: 17,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
  headerSubtitle: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 11,
    fontWeight: "500",
    marginTop: 1,
  },
  headerStatusChip: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.18)",
    justifyContent: "center",
    alignItems: "center",
  },

  // ===== Scroll =====
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },

  // ===== Status Card =====
  statusCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  statusHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },
  statusIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  statusLabelSmall: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: "600",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  statusLabelBig: {
    fontSize: 20,
    fontWeight: "800",
    marginTop: 2,
  },

  // ===== Tracker =====
  trackerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  trackerStep: {
    alignItems: "center",
    flex: 0,
    width: 54,
  },
  trackerDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
  },
  trackerDotDone: {
    backgroundColor: colors.success,
  },
  trackerDotCurrent: {
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 4,
  },
  trackerLabel: {
    fontSize: 9,
    color: colors.textMuted,
    marginTop: 6,
    textAlign: "center",
    fontWeight: "500",
  },
  trackerLabelDone: {
    color: colors.text,
    fontWeight: "700",
  },
  trackerLine: {
    flex: 1,
    height: 2,
    backgroundColor: "#E5E7EB",
    marginTop: 10,
    marginHorizontal: -12,
  },
  trackerLineDone: {
    backgroundColor: colors.success,
  },

  // ===== Cancelled Banner =====
  cancelledBanner: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    padding: 10,
    borderRadius: 10,
    backgroundColor: "#FFEBEE",
  },
  cancelledText: {
    color: colors.danger,
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 6,
  },

  // ===== Section heading =====
  sectionHeading: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textMuted,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    marginBottom: 8,
    marginTop: 4,
  },

  // ===== Item Card =====
  itemCard: {
    flexDirection: "row",
    backgroundColor: colors.white,
    borderRadius: 14,
    marginBottom: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  itemImage: {
    width: 110,
    height: 110,
    backgroundColor: colors.surface,
  },
  itemBody: {
    flex: 1,
    padding: 12,
    justifyContent: "center",
  },
  itemName: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 6,
  },
  itemCategoryPill: {
    alignSelf: "flex-start",
    backgroundColor: colors.surface,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginBottom: 8,
  },
  itemCategoryText: {
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: "600",
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.primary,
  },

  // ===== Summary Card =====
  summaryCard: {
    backgroundColor: colors.white,
    borderRadius: 14,
    paddingHorizontal: 14,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
  },
  summaryLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: 13,
    color: colors.textMuted,
    marginLeft: 8,
    fontWeight: "500",
  },
  summaryValue: {
    fontSize: 13,
    color: colors.text,
    fontWeight: "600",
    flexShrink: 1,
    textAlign: "right",
    marginLeft: 12,
  },
  summaryValueBold: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.primary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.surface,
  },

  // ===== Cancel =====
  cancelWrapper: {
    marginTop: 4,
  },
  cancelHint: {
    fontSize: 11,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: 8,
    fontStyle: "italic",
  },

  // ===== Error state =====
  centerBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
    marginTop: 12,
  },
});
