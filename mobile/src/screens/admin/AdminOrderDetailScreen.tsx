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
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
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

const ADMIN_DARK = "#1F2937";

const STEPS: OrderStatus[] = [
  "Pending",
  "Confirmed",
  "Preparing",
  "Ready",
  "Completed",
];

const NEXT_ACTIONS: Record<
  OrderStatus,
  {
    label: string;
    status: OrderStatus;
    icon: string;
    variant: "primary" | "danger";
  }[]
> = {
  Pending: [
    {
      label: "Confirm Order",
      status: "Confirmed",
      icon: "checkmark-circle",
      variant: "primary",
    },
    {
      label: "Cancel Order",
      status: "Cancelled",
      icon: "close-circle",
      variant: "danger",
    },
  ],
  Confirmed: [
    {
      label: "Start Preparing",
      status: "Preparing",
      icon: "restaurant",
      variant: "primary",
    },
    {
      label: "Cancel Order",
      status: "Cancelled",
      icon: "close-circle",
      variant: "danger",
    },
  ],
  Preparing: [
    {
      label: "Mark as Ready",
      status: "Ready",
      icon: "bag-check",
      variant: "primary",
    },
  ],
  Ready: [
    {
      label: "Mark as Completed",
      status: "Completed",
      icon: "checkmark-done-circle",
      variant: "primary",
    },
  ],
  Completed: [],
  Cancelled: [],
};

// ===== Helper: safely extract a display string from order.user =====
// Handles both populated object { _id, name, email } and raw ObjectId string
const getCustomerLabel = (user: any): string => {
  if (!user) return "—";
  if (typeof user === "string") return user;
  if (typeof user === "object") {
    if (user.name) return user.name;
    if (user._id) return user._id;
  }
  return "—";
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

  if (error || !order) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={styles.headerBar}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={20} color={colors.white} />
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

  const item = order.menuItem;
  const itemName = item?.name ?? "Unknown item";
  const itemImage = item?.imageUrl || "https://via.placeholder.com/150";
  const itemPrice =
    typeof item?.price === "number" ? item.price.toFixed(2) : "0.00";
  const total =
    typeof order.totalAmount === "number"
      ? order.totalAmount.toFixed(2)
      : "0.00";
  const date = new Date(order.orderDate);
  const actions = NEXT_ACTIONS[order.status] || [];
  const currentStepIndex = STEPS.indexOf(order.status);
  const isCancelled = order.status === "Cancelled";
  const customerLabel = getCustomerLabel(order.user);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      {/* ===== Header ===== */}
      <View style={styles.headerBar}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={20} color={colors.white} />
        </TouchableOpacity>
        <View style={{ alignItems: "center", flex: 1 }}>
          <Text style={styles.headerTitle}>Order Details</Text>
          <Text style={styles.headerSubtitle}>
            #{order._id.slice(-6).toUpperCase()}
          </Text>
        </View>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ===== Status Card with Tracker ===== */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeaderRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.statusLabelSmall}>Current Status</Text>
              <Text style={styles.statusLabelBig}>{order.status}</Text>
            </View>
            <StatusBadge status={order.status} />
          </View>

          {!isCancelled ? (
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
          ) : (
            <View style={styles.cancelledBanner}>
              <Ionicons name="close-circle" size={16} color={colors.danger} />
              <Text style={styles.cancelledText}>
                This order has been cancelled.
              </Text>
            </View>
          )}
        </View>

        {/* ===== Item ===== */}
        <Text style={styles.sectionHeading}>Item</Text>
        <View style={styles.itemCard}>
          <Image source={{ uri: itemImage }} style={styles.itemImage} />
          <View style={styles.itemBody}>
            <Text style={styles.itemName} numberOfLines={2}>
              {itemName}
            </Text>
            <Text style={styles.itemMeta}>
              Qty {order.quantity} • Rs. {itemPrice} each
            </Text>
            <Text style={styles.itemTotal}>Rs. {total}</Text>
          </View>
        </View>

        {/* ===== Order Info ===== */}
        <Text style={styles.sectionHeading}>Order Info</Text>
        <View style={styles.infoCard}>
          <InfoRow
            icon="person-outline"
            label="Customer"
            value={customerLabel}
          />
          <View style={styles.divider} />
          <InfoRow
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
          <InfoRow
            icon="receipt-outline"
            label="Order ID"
            value={`#${order._id.slice(-8).toUpperCase()}`}
          />
        </View>

        {/* ===== Actions ===== */}
        {actions.length > 0 && (
          <>
            <Text style={styles.sectionHeading}>Actions</Text>
            <View style={styles.actionsBlock}>
              {actions.map((a) => {
                const isDanger = a.variant === "danger";
                return (
                  <TouchableOpacity
                    key={a.status}
                    style={[
                      styles.actionBtn,
                      isDanger && styles.actionBtnDanger,
                      updating && { opacity: 0.6 },
                    ]}
                    onPress={() => changeStatus(a.status)}
                    disabled={updating}
                    activeOpacity={0.85}
                  >
                    <Ionicons
                      name={a.icon as any}
                      size={18}
                      color={isDanger ? colors.danger : colors.white}
                    />
                    <Text
                      style={[
                        styles.actionText,
                        isDanger && styles.actionTextDanger,
                      ]}
                    >
                      {a.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        )}

        {/* ===== Delete ===== */}
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={confirmDelete}
          activeOpacity={0.7}
        >
          <Ionicons name="trash-outline" size={16} color={colors.danger} />
          <Text style={styles.deleteText}>Delete Order</Text>
        </TouchableOpacity>

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoLeft}>
        <Ionicons name={icon as any} size={16} color={colors.textMuted} />
        <Text style={styles.infoLabel}>{label}</Text>
      </View>
      <Text style={styles.infoValue} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },

  // ===== Header =====
  headerBar: {
    backgroundColor: ADMIN_DARK,
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
    backgroundColor: "rgba(255,255,255,0.14)",
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

  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },

  // ===== Status card =====
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
  statusHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
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
    color: colors.text,
    marginTop: 2,
  },

  // ===== Tracker =====
  trackerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  trackerStep: { alignItems: "center", flex: 0, width: 54 },
  trackerDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
  },
  trackerDotDone: { backgroundColor: colors.success },
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
  trackerLabelDone: { color: colors.text, fontWeight: "700" },
  trackerLine: {
    flex: 1,
    height: 2,
    backgroundColor: "#E5E7EB",
    marginTop: 10,
    marginHorizontal: -12,
  },
  trackerLineDone: { backgroundColor: colors.success },

  cancelledBanner: {
    flexDirection: "row",
    alignItems: "center",
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
    fontSize: 12,
    fontWeight: "700",
    color: colors.textMuted,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    marginBottom: 8,
    marginTop: 4,
  },

  // ===== Item card =====
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
    width: 100,
    height: 100,
    backgroundColor: colors.surface,
  },
  itemBody: { flex: 1, padding: 12, justifyContent: "center" },
  itemName: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text,
  },
  itemMeta: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 6,
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.primary,
    marginTop: 8,
  },

  // ===== Info card =====
  infoCard: {
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
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
  },
  infoLeft: { flexDirection: "row", alignItems: "center" },
  infoLabel: {
    fontSize: 13,
    color: colors.textMuted,
    marginLeft: 8,
    fontWeight: "500",
  },
  infoValue: {
    fontSize: 13,
    color: colors.text,
    fontWeight: "600",
    flexShrink: 1,
    textAlign: "right",
    marginLeft: 12,
  },
  divider: { height: 1, backgroundColor: colors.surface },

  // ===== Actions =====
  actionsBlock: { marginBottom: 16 },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  actionBtnDanger: {
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.danger,
    shadowOpacity: 0,
    elevation: 0,
  },
  actionText: {
    color: colors.white,
    fontWeight: "700",
    fontSize: 14,
    marginLeft: 8,
  },
  actionTextDanger: { color: colors.danger },

  // ===== Delete =====
  deleteBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    marginTop: 4,
  },
  deleteText: {
    color: colors.danger,
    fontWeight: "700",
    fontSize: 13,
    marginLeft: 6,
  },

  // ===== Error =====
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
