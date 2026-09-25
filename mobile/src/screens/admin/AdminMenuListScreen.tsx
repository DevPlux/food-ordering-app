// src/screens/admin/AdminMenuListScreen.tsx
import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  RefreshControl,
  ScrollView,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { colors } from "../../theme/colors";
import { MenuItem } from "../../types/menuItem";
import { getMenuItems, deleteMenuItem } from "../../api/menuService";
import Loading from "../../components/Loading";
import ErrorText from "../../components/ErrorText";
import { AdminStackParamList } from "../../navigation/types";

type Props = NativeStackScreenProps<AdminStackParamList, "AdminMenuList">;

type FilterKey = "All" | "Available" | "Unavailable";

const FILTERS: FilterKey[] = ["All", "Available", "Unavailable"];

export default function AdminMenuListScreen({ navigation }: Props) {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterKey>("All");

  const fetchItems = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError("");
    try {
      const data = await getMenuItems();
      setItems(data);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchItems();
    }, []),
  );

  const stats = useMemo(() => {
    const available = items.filter(
      (i) => i.availabilityStatus === "Available",
    ).length;
    const unavailable = items.length - available;
    return { total: items.length, available, unavailable };
  }, [items]);

  const filtered = useMemo(() => {
    return items.filter((i) => {
      const matchesSearch =
        search.trim() === "" ||
        i.name.toLowerCase().includes(search.toLowerCase());
      const matchesFilter =
        activeFilter === "All" || i.availabilityStatus === activeFilter;
      return matchesSearch && matchesFilter;
    });
  }, [items, search, activeFilter]);

  const confirmDelete = (item: MenuItem) => {
    Alert.alert(
      "Delete Item",
      `Are you sure you want to delete "${item.name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteMenuItem(item._id);
              fetchItems();
            } catch (e) {
              Alert.alert("Delete Failed", (e as Error).message);
            }
          },
        },
      ],
    );
  };

  if (loading) return <Loading />;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      {/* ===== Admin Header ===== */}
      <View style={styles.topBar}>
        <View style={{ flex: 1 }}>
          <View style={styles.adminBadge}>
            <Ionicons name="shield-checkmark" size={12} color={colors.white} />
            <Text style={styles.adminBadgeText}>ADMIN</Text>
          </View>
          <Text style={styles.topBarTitle}>Manage Menu</Text>
          <Text style={styles.topBarSubtitle}>
            {stats.total} item{stats.total !== 1 ? "s" : ""} in your catalog
          </Text>
        </View>
        <TouchableOpacity
          style={styles.ordersBtn}
          onPress={() => navigation.navigate("AdminOrders")}
          activeOpacity={0.8}
        >
          <View style={styles.ordersBtnIconBox}>
            <Ionicons name="receipt-outline" size={16} color={colors.white} />
          </View>
          <Text style={styles.ordersBtnText}>Orders</Text>
          <Ionicons
            name="chevron-forward"
            size={14}
            color="rgba(255,255,255,0.7)"
          />
        </TouchableOpacity>
      </View>

      {/* ===== Stats ===== */}
      <View style={styles.statsRow}>
        <View style={[styles.statCard, { borderLeftColor: colors.primary }]}>
          <View style={[styles.statIconBox, { backgroundColor: "#FFEBEE" }]}>
            <Ionicons
              name="fast-food-outline"
              size={16}
              color={colors.primary}
            />
          </View>
          <Text style={styles.statValue}>{stats.total}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={[styles.statCard, { borderLeftColor: colors.success }]}>
          <View style={[styles.statIconBox, { backgroundColor: "#E8F5E9" }]}>
            <Ionicons
              name="checkmark-circle-outline"
              size={16}
              color={colors.success}
            />
          </View>
          <Text style={styles.statValue}>{stats.available}</Text>
          <Text style={styles.statLabel}>Available</Text>
        </View>
        <View style={[styles.statCard, { borderLeftColor: colors.danger }]}>
          <View style={[styles.statIconBox, { backgroundColor: "#FFEBEE" }]}>
            <Ionicons
              name="close-circle-outline"
              size={16}
              color={colors.danger}
            />
          </View>
          <Text style={styles.statValue}>{stats.unavailable}</Text>
          <Text style={styles.statLabel}>Unavailable</Text>
        </View>
      </View>

      {/* ===== Search ===== */}
      <View style={styles.searchWrapper}>
        <Ionicons name="search" size={18} color={colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search menu items..."
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch("")}>
            <Ionicons name="close-circle" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* ===== Filter Chips ===== */}
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

      {/* ===== Add Button ===== */}
      <TouchableOpacity
        style={styles.addFab}
        onPress={() => navigation.navigate("MenuItemForm", {})}
        activeOpacity={0.85}
      >
        <Ionicons name="add-circle" size={22} color={colors.white} />
        <Text style={styles.addFabText}>Add New Item</Text>
      </TouchableOpacity>

      {/* ===== List ===== */}
      <FlatList
        data={filtered}
        keyExtractor={(i) => i._id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchItems(true)}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          error ? (
            <View style={styles.emptyBox}>
              <ErrorText>{error}</ErrorText>
              <TouchableOpacity
                style={styles.retryBtn}
                onPress={() => fetchItems()}
              >
                <Text style={styles.retryText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.emptyBox}>
              <View style={styles.emptyIconCircle}>
                <Ionicons
                  name="restaurant-outline"
                  size={36}
                  color={colors.primary}
                />
              </View>
              <Text style={styles.emptyTitle}>
                {search || activeFilter !== "All"
                  ? "No items match"
                  : "No menu items yet"}
              </Text>
              <Text style={styles.emptySubtitle}>
                {search || activeFilter !== "All"
                  ? "Try changing your search or filter."
                  : "Tap 'Add New Item' to create your first dish."}
              </Text>
            </View>
          )
        }
        renderItem={({ item }) => {
          const isAvail = item.availabilityStatus === "Available";
          return (
            <View style={styles.itemCard}>
              <Image
                source={{
                  uri: item.imageUrl || "https://via.placeholder.com/80",
                }}
                style={styles.itemThumb}
              />
              <View style={styles.itemBody}>
                <Text style={styles.itemName} numberOfLines={1}>
                  {item.name}
                </Text>
                <View style={styles.itemMetaRow}>
                  <View style={styles.categoryPill}>
                    <Text style={styles.categoryPillText}>{item.category}</Text>
                  </View>
                  <View
                    style={[
                      styles.statusPill,
                      isAvail
                        ? styles.statusPillAvail
                        : styles.statusPillUnavail,
                    ]}
                  >
                    <View
                      style={[
                        styles.statusDot,
                        isAvail ? styles.dotAvail : styles.dotUnavail,
                      ]}
                    />
                    <Text
                      style={[
                        styles.statusPillText,
                        isAvail ? styles.textAvail : styles.textUnavail,
                      ]}
                    >
                      {item.availabilityStatus}
                    </Text>
                  </View>
                </View>
                <Text style={styles.itemPrice}>
                  Rs. {item.price.toFixed(2)}
                </Text>
              </View>

              <View style={styles.itemActions}>
                <TouchableOpacity
                  style={styles.iconBtn}
                  onPress={() =>
                    navigation.navigate("MenuItemForm", { itemId: item._id })
                  }
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="create-outline"
                    size={18}
                    color={colors.primary}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.iconBtn, styles.iconBtnDanger]}
                  onPress={() => confirmDelete(item)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="trash-outline"
                    size={18}
                    color={colors.danger}
                  />
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}

const ADMIN_DARK = "#1F2937";

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },

  // ===== Top bar =====
  topBar: {
    backgroundColor: ADMIN_DARK,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 22,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  adminBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary,
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginBottom: 8,
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

  ordersBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.14)",
    paddingLeft: 6,
    paddingRight: 10,
    paddingVertical: 6,
    borderRadius: 22,
    marginTop: 4,
  },
  ordersBtnIconBox: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  ordersBtnText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.3,
    marginRight: 6,
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
  statValue: { fontSize: 18, fontWeight: "800", color: colors.text },
  statLabel: {
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: "600",
    marginTop: 2,
  },

  // ===== Search =====
  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    marginHorizontal: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    paddingVertical: 0,
    marginLeft: 8,
  },

  // ===== Chips =====
  chipsWrapper: { height: 54, marginTop: 8 },
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
  chipActive: {
    backgroundColor: ADMIN_DARK,
    borderColor: ADMIN_DARK,
  },
  chipText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textMuted,
    lineHeight: 15,
    includeFontPadding: false,
  },
  chipTextActive: { color: colors.white, fontWeight: "700" },

  // ===== Add FAB =====
  addFab: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    height: 46,
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 4,
    marginBottom: 4,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  addFabText: {
    color: colors.white,
    fontWeight: "700",
    fontSize: 14,
    marginLeft: 6,
  },

  // ===== List =====
  listContent: { padding: 16, paddingBottom: 40 },

  itemCard: {
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
  itemThumb: {
    width: 72,
    height: 72,
    borderRadius: 10,
    backgroundColor: colors.surface,
  },
  itemBody: { flex: 1, marginLeft: 12 },
  itemName: { fontSize: 15, fontWeight: "700", color: colors.text },
  itemMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  categoryPill: {
    backgroundColor: colors.surface,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginRight: 6,
  },
  categoryPillText: {
    fontSize: 10,
    fontWeight: "600",
    color: colors.textMuted,
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statusPillAvail: { backgroundColor: "#E8F5E9" },
  statusPillUnavail: { backgroundColor: "#FFEBEE" },
  statusDot: { width: 5, height: 5, borderRadius: 3, marginRight: 4 },
  dotAvail: { backgroundColor: colors.success },
  dotUnavail: { backgroundColor: colors.danger },
  statusPillText: { fontSize: 10, fontWeight: "700" },
  textAvail: { color: colors.success },
  textUnavail: { color: colors.danger },
  itemPrice: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.primary,
    marginTop: 6,
  },
  itemActions: { flexDirection: "column", gap: 6, marginLeft: 8 },
  iconBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
  },
  iconBtnDanger: { backgroundColor: "#FFEBEE" },

  // ===== Empty =====
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
