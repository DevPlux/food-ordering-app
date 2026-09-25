// src/screens/admin/AdminOrdersScreen.tsx
import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { colors } from "../../theme/colors";
import { Order, OrderStatus } from "../../types/order";
import { getAllOrders } from "../../api/orderService";
import Loading from "../../components/Loading";
import ErrorText from "../../components/ErrorText";
import StatusBadge from "../../components/StatusBadge";
import { AdminStackParamList } from "../../navigation/types";

type Props = NativeStackScreenProps<AdminStackParamList, "AdminOrders">;

type FilterKey = "All" | "Active" | OrderStatus;

const FILTERS: FilterKey[] = [
  "All",
  "Active",
  "Pending",
  "Preparing",
  "Completed",
  "Cancelled",
];

const ADMIN_DARK = "#1F2937";

// ===== Helper: safely extract a display string from order.user =====
const getUserLabel = (user: any): string => {
  if (!user) return "—";
  if (typeof user === "string") return user;
  if (typeof user === "object") {
    if (user.name) return user.name;
    if (user._id) return user._id;
  }
  return "—";
};

export default function AdminOrdersScreen({ navigation }: Props) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterKey>("All");

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

  const stats = useMemo(() => {
    const active = orders.filter(
      (o) =>
        o.status === "Pending" ||
        o.status === "Confirmed" ||
        o.status === "Preparing" ||
        o.status === "Ready",
    ).length;
    const completed = orders.filter((o) => o.status === "Completed").length;
    return { total: orders.length, active, completed };
  }, [orders]);

  const filtered = useMemo(() => {
    if (activeFilter === "All") return orders;
    if (activeFilter === "Active") {
      return orders.filter(
        (o) =>
          o.status === "Pending" ||
          o.status === "Confirmed" ||
          o.status === "Preparing" ||
          o.status === "Ready",
      );
    }
    return orders.filter((o) => o.status === activeFilter);
  }, [orders, activeFilter]);

  if (loading) return <Loading />;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      {/* ===== Header ===== */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={20} color={colors.white} />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <View style={styles.adminBadge}>
            <Ionicons name="shield-checkmark" size={11} color={colors.white} />
            <Text style={styles.adminBadgeText}>ADMIN</Text>
          </View>
          <Text style={styles.topBarTitle}>All Orders</Text>
          <Text style={styles.topBarSubtitle}>
            {stats.total} total order{stats.total !== 1 ? "s" : ""}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.topBarIcon}
          onPress={() => fetchOrders(true)}
          activeOpacity={0.7}
        >
          <Ionicons name="refresh" size={18} color={colors.white} />
        </TouchableOpacity>
      </View>

      {/* ===== Stats ===== */}
      <View style={styles.statsRow}>
        <View style={[styles.statCard, { borderLeftColor: colors.primary }]}>
          <View style={[styles.statIconBox, { backgroundColor: "#FFEBEE" }]}>
            <Ionicons name="receipt-outline" size={16} color={colors.primary} />
          </View>
          <Text style={styles.statValue}>{stats.total}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={[styles.statCard, { borderLeftColor: "#F57F17" }]}>
          <View style={[styles.statIconBox, { backgroundColor: "#FFF8E1" }]}>
            <Ionicons name="time-outline" size={16} color="#F57F17" />
          </View>
          <Text style={styles.statValue}>{stats.active}</Text>
          <Text style={styles.statLabel}>Active</Text>
        </View>
        <View style={[styles.statCard, { borderLeftColor: colors.success }]}>
          <View style={[styles.statIconBox, { backgroundColor: "#E8F5E9" }]}>
            <Ionicons
              name="checkmark-done-outline"
              size={16}
              color={colors.success}
            />
          </View>
          <Text style={styles.statValue}>{stats.completed}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
      </View>

      {/* ===== Chips ===== */}
      <View style={styles.chipsWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}
        >
          {FILTERS.map((f) => {
            const isActive = f === activeFilter;
            return (
              <TouchableOpacity
                key={f}
                style={[styles.chip, isActive && styles.chipActive]}
                onPress={() => setActiveFilter(f)}
                activeOpacity={0.7}
              >
                <Text
                  numberOfLines={1}
                  style={[styles.chipText, isActive && styles.chipTextActive]}
                >
                  {f}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* ===== List ===== */}
      <FlatList
        data={filtered}
        keyExtractor={(o) => o._id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchOrders(true)}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          error ? (
            <View style={styles.emptyBox}>
              <ErrorText>{error}</ErrorText>
              <TouchableOpacity
                style={styles.retryBtn}
                onPress={() => fetchOrders()}
              >
                <Text style={styles.retryText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.emptyBox}>
              <View style={styles.emptyIconCircle}>
                <Ionicons
                  name="receipt-outline"
                  size={36}
                  color={colors.primary}
                />
              </View>
              <Text style={styles.emptyTitle}>
                {activeFilter === "All"
                  ? "No orders yet"
                  : `No ${activeFilter.toLowerCase()} orders`}
              </Text>
              <Text style={styles.emptySubtitle}>
                Orders placed by customers will appear here.
              </Text>
            </View>
          )
        }
        renderItem={({ item }) => {
          const itemName = item.menuItem?.name ?? "Unknown item";
          const itemImage =
            item.menuItem?.imageUrl || "https://via.placeholder.com/150";
          const total =
            typeof item.totalAmount === "number"
              ? item.totalAmount.toFixed(2)
              : "0.00";
          const date = new Date(item.orderDate);
          const customerLabel = getUserLabel(item.user);

          return (
            <TouchableOpacity
              style={styles.orderCard}
              onPress={() =>
                navigation.navigate("AdminOrderDetail", { orderId: item._id })
              }
              activeOpacity={0.9}
            >
              <Image source={{ uri: itemImage }} style={styles.orderThumb} />
              <View style={styles.orderBody}>
                <View style={styles.orderTopRow}>
                  <Text style={styles.orderId}>
                    #{item._id.slice(-6).toUpperCase()}
                  </Text>
                  <StatusBadge status={item.status} />
                </View>
                <Text style={styles.orderName} numberOfLines={1}>
                  {itemName}
                </Text>
                <View style={styles.orderMeta}>
                  <Ionicons
                    name="person-outline"
                    size={11}
                    color={colors.textMuted}
                  />
                  <Text style={styles.orderMetaText}>{customerLabel}</Text>
                  <Text style={styles.dot}>•</Text>
                  <Text style={styles.orderMetaText}>Qty {item.quantity}</Text>
                </View>
                <View style={styles.orderBottomRow}>
                  <Text style={styles.orderDate}>
                    {date.toLocaleDateString()}{" "}
                    {date.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                  <Text style={styles.orderTotal}>Rs. {total}</Text>
                </View>
              </View>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={colors.textMuted}
                style={{ marginLeft: 6 }}
              />
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },

  topBar: {
    backgroundColor: ADMIN_DARK,
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 22,
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
    marginTop: 4,
  },
  adminBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary,
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginBottom: 6,
  },
  adminBadgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
    marginLeft: 4,
  },
  topBarTitle: {
    color: colors.white,
    fontSize: 22,
    fontWeight: "800",
  },
  topBarSubtitle: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
    marginTop: 2,
    fontWeight: "500",
  },
  topBarIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.14)",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 4,
  },

  statsRow: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginTop: -14,
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderLeftWidth: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
  },
  statIconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
  statValue: { fontSize: 18, fontWeight: "800", color: colors.text },
  statLabel: {
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: "600",
    marginTop: 2,
  },

  chipsWrapper: { height: 54, marginTop: 10 },
  chipsRow: {
    paddingHorizontal: 16,
    alignItems: "center",
    paddingVertical: 10,
  },
  chip: {
    height: 32,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: colors.white,
    marginRight: 8,
    borderWidth: 1.5,
    borderColor: colors.border,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  chipActive: { backgroundColor: ADMIN_DARK, borderColor: ADMIN_DARK },
  chipText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textMuted,
    lineHeight: 15,
    includeFontPadding: false,
  },
  chipTextActive: { color: colors.white, fontWeight: "700" },

  listContent: { padding: 16, paddingBottom: 40 },

  orderCard: {
    flexDirection: "row",
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 10,
    marginBottom: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  orderThumb: {
    width: 76,
    height: 76,
    borderRadius: 10,
    backgroundColor: colors.surface,
  },
  orderBody: { flex: 1, marginLeft: 12 },
  orderTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  orderId: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.textMuted,
    letterSpacing: 0.5,
  },
  orderName: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text,
    marginTop: 3,
  },
  orderMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  orderMetaText: {
    fontSize: 11,
    color: colors.textMuted,
    marginLeft: 3,
    fontWeight: "500",
  },
  dot: { color: colors.textMuted, marginHorizontal: 5, fontSize: 11 },
  orderBottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 6,
  },
  orderDate: { fontSize: 10, color: colors.textMuted, fontWeight: "500" },
  orderTotal: { fontSize: 13, fontWeight: "800", color: colors.primary },

  emptyBox: {
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  emptyIconCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: "#FFEBEE",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  emptyTitle: { fontSize: 17, fontWeight: "700", color: colors.text },
  emptySubtitle: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 6,
    textAlign: "center",
    lineHeight: 18,
  },
  retryBtn: {
    marginTop: 14,
    paddingHorizontal: 22,
    paddingVertical: 10,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  retryText: { color: colors.white, fontWeight: "700", fontSize: 13 },
});
