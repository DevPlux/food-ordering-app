// src/screens/profile/ProfileScreen.tsx
import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { colors } from "../../theme/colors";
import { useAuth } from "../../context/AuthContext";
import { getMyOrders } from "../../api/orderService";
import { Order } from "../../types/order";

export default function ProfileScreen({ navigation }: any) {
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const data = await getMyOrders();
      setOrders(data);
    } catch {
      // silent — profile stats are non-critical
    } finally {
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
    const spent = orders
      .filter((o) => o.status !== "Cancelled")
      .reduce(
        (sum, o) =>
          sum + (typeof o.totalAmount === "number" ? o.totalAmount : 0),
        0,
      );
    return { total: orders.length, active, spent };
  }, [orders]);

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "?";

  const formatSpent = (v: number) =>
    v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v.toFixed(0);

  const handleLogout = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", style: "destructive", onPress: logout },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      {/* ===== Branded Top Bar ===== */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.topBarTitle}>Profile</Text>
          <Text style={styles.topBarSubtitle}>
            Manage your account and preferences
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchOrders(true)}
            tintColor={colors.primary}
          />
        }
      >
        {/* ===== Identity Card ===== */}
        <View style={styles.identityCard}>
          <View style={styles.avatarWrapper}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            {user?.isAdmin && (
              <View style={styles.adminCrown}>
                <Ionicons
                  name="shield-checkmark"
                  size={12}
                  color={colors.white}
                />
              </View>
            )}
          </View>

          <Text style={styles.name}>{user?.name || "Guest User"}</Text>
          <Text style={styles.email}>{user?.email || "Not signed in"}</Text>

          {user?.isAdmin && (
            <View style={styles.adminBadge}>
              <Ionicons
                name="shield-checkmark"
                size={12}
                color={colors.white}
              />
              <Text style={styles.adminBadgeText}>ADMINISTRATOR</Text>
            </View>
          )}
        </View>

        {/* ===== Stats ===== */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View style={[styles.statIconBox, { backgroundColor: "#FFEBEE" }]}>
              <Ionicons
                name="receipt-outline"
                size={16}
                color={colors.primary}
              />
            </View>
            <Text style={styles.statValue}>{stats.total}</Text>
            <Text style={styles.statLabel}>Orders</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIconBox, { backgroundColor: "#FFF8E1" }]}>
              <Ionicons name="time-outline" size={16} color="#F57F17" />
            </View>
            <Text style={styles.statValue}>{stats.active}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIconBox, { backgroundColor: "#E8F5E9" }]}>
              <Ionicons name="cash-outline" size={16} color={colors.success} />
            </View>
            <Text style={styles.statValue} numberOfLines={1}>
              {formatSpent(stats.spent)}
            </Text>
            <Text style={styles.statLabel}>Spent (Rs.)</Text>
          </View>
        </View>

        {/* ===== Account ===== */}
        <Text style={styles.sectionHeading}>Account</Text>
        <View style={styles.group}>
          <SettingRow
            icon="person-outline"
            label="Full Name"
            value={user?.name || "—"}
          />
          <Divider />
          <SettingRow
            icon="mail-outline"
            label="Email"
            value={user?.email || "—"}
          />
          <Divider />
          <SettingRow
            icon="finger-print-outline"
            label="User ID"
            value={`#${user?._id?.slice(-8).toUpperCase() || "—"}`}
          />
        </View>

        {/* ===== Quick Actions ===== */}
        <Text style={styles.sectionHeading}>Quick Actions</Text>
        <View style={styles.group}>
          <ActionRow
            icon="fast-food-outline"
            label="Browse Menu"
            onPress={() => navigation.getParent()?.navigate("MenuTab" as never)}
          />
          <Divider />
          <ActionRow
            icon="receipt-outline"
            label="My Orders"
            onPress={() =>
              navigation.getParent()?.navigate("OrdersTab" as never)
            }
          />
          {user?.isAdmin && (
            <>
              <Divider />
              <ActionRow
                icon="settings-outline"
                label="Admin Panel"
                onPress={() =>
                  navigation.getParent()?.navigate("AdminTab" as never)
                }
              />
            </>
          )}
        </View>

        {/* ===== About ===== */}
        <Text style={styles.sectionHeading}>About</Text>
        <View style={styles.group}>
          <SettingRow
            icon="information-circle-outline"
            label="App Version"
            value="1.0.0"
          />
          <Divider />
          <SettingRow
            icon="shield-outline"
            label="Account Type"
            value={user?.isAdmin ? "Administrator" : "Customer"}
          />
        </View>

        {/* ===== Logout ===== */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={handleLogout}
          activeOpacity={0.85}
        >
          <Ionicons name="log-out-outline" size={20} color={colors.danger} />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={styles.footer}>
          Made with ♥ for SE2020 · {new Date().getFullYear()}
        </Text>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ===== Sub-components =====

function SettingRow({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.settingRow}>
      <View style={styles.settingLeft}>
        <View style={styles.settingIconBox}>
          <Ionicons name={icon as any} size={16} color={colors.textMuted} />
        </View>
        <Text style={styles.settingLabel}>{label}</Text>
      </View>
      <Text style={styles.settingValue} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

function ActionRow({
  icon,
  label,
  onPress,
}: {
  icon: string;
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={styles.settingRow}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.settingLeft}>
        <View style={styles.settingIconBox}>
          <Ionicons name={icon as any} size={16} color={colors.textMuted} />
        </View>
        <Text style={styles.settingLabel}>{label}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
    </TouchableOpacity>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },

  // ===== Branded Top Bar =====
  topBar: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 22, // ← change this
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

  content: { padding: 16, paddingBottom: 40 },

  // ===== Identity Card =====
  identityCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    paddingTop: 64, // more headroom above the avatar
    paddingBottom: 24,
    paddingHorizontal: 20,
    alignItems: "center",
    marginTop: -62, // pull the card up so the avatar overlaps into the header
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  avatarWrapper: { position: "relative" },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: colors.white,
  },
  avatarText: {
    color: colors.white,
    fontSize: 30,
    fontWeight: "800",
    letterSpacing: 1,
  },
  adminCrown: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: colors.white,
  },
  name: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.text,
    marginTop: 14,
  },
  email: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 4,
  },
  adminBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 12,
  },
  adminBadgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
    marginLeft: 4,
  },

  // ===== Stats =====
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 10,
    alignItems: "flex-start",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
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

  // ===== Section heading =====
  sectionHeading: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textMuted,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    marginTop: 24,
    marginBottom: 8,
  },

  // ===== Group card =====
  group: {
    backgroundColor: colors.white,
    borderRadius: 14,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  settingLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  settingIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 14,
    color: colors.text,
    fontWeight: "500",
  },
  settingValue: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: "600",
    maxWidth: "55%",
    textAlign: "right",
  },
  divider: {
    height: 1,
    backgroundColor: colors.surface,
    marginLeft: 58,
  },

  // ===== Logout =====
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
    paddingVertical: 16,
    borderRadius: 14,
    marginTop: 28,
    borderWidth: 1.5,
    borderColor: colors.danger,
  },
  logoutText: {
    color: colors.danger,
    fontWeight: "800",
    fontSize: 14,
    marginLeft: 8,
  },

  // ===== Footer =====
  footer: {
    textAlign: "center",
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 24,
    fontWeight: "500",
  },
});
