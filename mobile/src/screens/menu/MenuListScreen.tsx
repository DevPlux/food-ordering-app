// src/screens/menu/MenuListScreen.tsx
import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { colors } from "../../theme/colors";
import { MenuStackParamList } from "../../navigation/types";
import { MenuItem } from "../../types/menuItem";
import { getMenuItems } from "../../api/menuService";
import MenuCard from "../../components/MenuCard";
import Loading from "../../components/Loading";
import ErrorText from "../../components/ErrorText";
import { useAuth } from "../../context/AuthContext";

type Props = NativeStackScreenProps<MenuStackParamList, "MenuList">;

export default function MenuListScreen({ navigation }: Props) {
  const { user } = useAuth();
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const fetchMenu = async (isRefresh = false) => {
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
      fetchMenu();
    }, []),
  );

  const categories = useMemo(() => {
    const unique = Array.from(new Set(items.map((i) => i.category)));
    return ["All", ...unique];
  }, [items]);

  const filtered = useMemo(() => {
    return items.filter((i) => {
      const matchesSearch =
        search.trim() === "" ||
        i.name.toLowerCase().includes(search.toLowerCase());
      const matchesCategory =
        activeCategory === "All" || i.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [items, search, activeCategory]);

  const firstName = user?.name?.split(" ")[0] || "there";
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "?";

  if (loading) return <Loading />;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      {/* ===== Branded Top Bar ===== */}
      <View style={styles.topBar}>
        <View style={styles.brandRow}>
          <View style={styles.logoCircle}>
            <Ionicons name="fast-food" size={20} color={colors.primary} />
          </View>
          <View style={{ marginLeft: 10 }}>
            <Text style={styles.brandName}>Foodie</Text>
            <View style={styles.locationRow}>
              <Ionicons
                name="location-sharp"
                size={11}
                color="rgba(255,255,255,0.85)"
              />
              <Text style={styles.locationText}>Deliver to • Colombo 07</Text>
            </View>
          </View>
        </View>

        <View style={styles.topBarActions}>
          <TouchableOpacity style={styles.topBarIcon} activeOpacity={0.7}>
            <Ionicons
              name="notifications-outline"
              size={20}
              color={colors.white}
            />
            <View style={styles.dot} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.topBarIcon} activeOpacity={0.7}>
            <Ionicons name="cart-outline" size={20} color={colors.white} />
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>2</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(i) => i._id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchMenu(true)}
            tintColor={colors.primary}
          />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            {/* Greeting row */}
            <View style={styles.greetingRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.greetingSmall}>Welcome back,</Text>
                <Text style={styles.greetingBig}>Hi {firstName} 👋</Text>
              </View>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initials}</Text>
              </View>
            </View>

            {/* Headline */}
            <Text style={styles.headline}>
              What would you like to eat today?
            </Text>

            {/* Search bar */}
            <View style={styles.searchWrapper}>
              <Ionicons
                name="search"
                size={18}
                color={colors.textMuted}
                style={styles.searchIcon}
              />
              <TextInput
                style={styles.searchInput}
                placeholder="Search for dishes..."
                placeholderTextColor={colors.textMuted}
                value={search}
                onChangeText={setSearch}
              />
              {search.length > 0 && (
                <TouchableOpacity onPress={() => setSearch("")}>
                  <Ionicons
                    name="close-circle"
                    size={18}
                    color={colors.textMuted}
                  />
                </TouchableOpacity>
              )}
            </View>

            {/* Category chips */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipsRow}
            >
              {categories.map((cat) => {
                const isActive = cat === activeCategory;
                return (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.chip, isActive && styles.chipActive]}
                    onPress={() => setActiveCategory(cat)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        isActive && styles.chipTextActive,
                      ]}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Section title */}
            {!error && (
              <View style={styles.sectionRow}>
                <Text style={styles.sectionTitle}>
                  {activeCategory === "All" ? "All Dishes" : activeCategory}
                </Text>
                <Text style={styles.sectionCount}>
                  {filtered.length} item{filtered.length !== 1 ? "s" : ""}
                </Text>
              </View>
            )}
          </View>
        }
        renderItem={({ item }) => (
          <MenuCard
            item={item}
            onPress={() =>
              navigation.navigate("MenuDetail", { itemId: item._id })
            }
          />
        )}
        ListEmptyComponent={
          error ? (
            <View style={styles.emptyBox}>
              <ErrorText>{error}</ErrorText>
            </View>
          ) : (
            <View style={styles.emptyBox}>
              <Ionicons
                name="restaurant-outline"
                size={48}
                color={colors.textMuted}
              />
              <Text style={styles.emptyTitle}>No dishes found</Text>
              <Text style={styles.emptySubtitle}>
                Try a different search or category.
              </Text>
            </View>
          )
        }
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
    paddingVertical: 14,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.white,
    justifyContent: "center",
    alignItems: "center",
  },
  brandName: {
    color: colors.white,
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  locationText: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 11,
    fontWeight: "500",
    marginLeft: 3,
  },
  topBarActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  topBarIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.18)",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
    position: "relative",
  },
  dot: {
    position: "absolute",
    top: 9,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FFD54F",
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  cartBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    backgroundColor: colors.white,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  cartBadgeText: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: "800",
  },

  // ===== List content =====
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },

  // ===== Header block =====
  header: { marginBottom: 8 },
  greetingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  greetingSmall: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: "500",
  },
  greetingBig: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.text,
    marginTop: 2,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: colors.white,
    fontWeight: "700",
    fontSize: 16,
  },

  headline: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 14,
    lineHeight: 24,
  },

  // ===== Search =====
  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 46,
    marginBottom: 14,
  },
  searchIcon: { marginRight: 8 },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    paddingVertical: 0,
  },

  // ===== Chips =====
  chipsRow: { paddingBottom: 6 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.surface,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text,
  },
  chipTextActive: { color: colors.white },

  // ===== Section header =====
  sectionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 18,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.text,
  },
  sectionCount: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: "600",
  },

  // ===== Empty state =====
  emptyBox: {
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 4,
    textAlign: "center",
  },
});
