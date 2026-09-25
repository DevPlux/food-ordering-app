// src/screens/orders/MyOrdersScreen.tsx
import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { colors } from "../../theme/colors";
import { Order, OrderStatus } from "../../types/order";
import { getMyOrders } from "../../api/orderService";
import OrderCard from "../../components/OrderCard";
import Loading from "../../components/Loading";
import ErrorText from "../../components/ErrorText";
import { OrdersStackParamList } from "../../navigation/types";
import { useAuth } from "../../context/AuthContext";

type Props = NativeStackScreenProps<OrdersStackParamList, "MyOrders">;

type FilterKey = "All" | "Active" | OrderStatus;

const FILTERS: FilterKey[] = [
  "All",
  "Active",
  "Pending",
  "Preparing",
  "Completed",
  "Cancelled",
];

export default function MyOrdersScreen({ navigation }: Props) {
  const { user } = useAuth();
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
      const data = await getMyOrders();
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

  // Stats
  const stats = useMemo(() => {
    const active = orders.filter(
      (o) =>
        o.status === "Pending" ||
        o.status === "Confirmed" ||
        o.status === "Preparing" ||
        o.status === "Ready",
    ).length;
    const spent = orders
      .filter((o) => o.status !== "Cancelled")
      .reduce(
        (sum, o) =>
          sum + (typeof o.totalAmount === "number" ? o.totalAmount : 0),
        0,
      );
    return { total: orders.length, active, spent };
  }, [orders]);

  // Filter
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

  const firstName = user?.name?.split(" ")[0] || "there";

  if (loading) return <Loading />;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      {/* ===== Branded Top Bar ===== */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.topBarTitle}>My Orders</Text>
          <Text style={styles.topBarSubtitle}>
            Hi {firstName}, here's your order history
          </Text>
        </View>
        <TouchableOpacity
          style={styles.topBarIcon}
          onPress={() => fetchOrders(true)}
          activeOpacity={0.7}
        >
          <Ionicons name="refresh" size={20} color={colors.white} />
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
            <Ionicons name="cash-outline" size={16} color={colors.success} />
          </View>
          <Text style={styles.statValue} numberOfLines={1}>
            {stats.spent >= 1000
              ? `${(stats.spent / 1000).toFixed(1)}k`
              : stats.spent.toFixed(0)}
          </Text>
          <Text style={styles.statLabel}>Spent (Rs.)</Text>
        </View>
      </View>

      {/* ===== Filter chips (WRAPPED — this is the fix) ===== */}
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
                  name="fast-food-outline"
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
                {activeFilter === "All"
                  ? "Browse the menu and place your first order."
                  : "Try a different filter to see your orders."}
              </Text>
            </View>
          )
        }
        renderItem={({ item }) => (
          <OrderCard
            order={item}
            onPress={() =>
              navigation.navigate("OrderDetail", { orderId: item._id })
            }
          />
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },

  // ===== Branded Top Bar =====
  topBar: {
    backgroundColor: colors.primary,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 22,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  topBarTitle: {
    color: colors.white,
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
  topBarSubtitle: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 12,
    marginTop: 3,
    fontWeight: "500",
  },
  topBarIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.18)",
    justifyContent: "center",
    alignItems: "center",
  },

  // ===== Stats =====
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
  statValue: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.text,
  },
  statLabel: {
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: "600",
    marginTop: 2,
  },

  // ===== Filter chips =====
  // KEY FIX: fixed height on the wrapper so it doesn't stretch
  chipsWrapper: {
    height: 58,
    marginTop: 4,
  },
  chipsRow: {
    paddingHorizontal: 16,
    alignItems: "center", // vertically center chips inside the scroll
    paddingVertical: 12,
  },
  chip: {
    height: 34,
    paddingHorizontal: 16,
    borderRadius: 17,
    backgroundColor: colors.white,
    marginRight: 8,
    borderWidth: 1.5,
    borderColor: colors.border,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
  },
  chipText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textMuted,
    lineHeight: 16,
    includeFontPadding: false, // Android: prevents extra vertical padding
  },
  chipTextActive: {
    color: colors.white,
    fontWeight: "700",
  },

  // ===== List =====
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },

  // ===== Empty state =====
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
  emptyTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.text,
  },
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
  retryText: {
    color: colors.white,
    fontWeight: "700",
    fontSize: 13,
  },
});
