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
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { colors } from "../../theme/colors";
import { MenuStackParamList } from "../../navigation/types";
import { MenuItem } from "../../types/menuItem";
import { getMenuItemById } from "../../api/menuService";
import { createOrder } from "../../api/orderService";
import Loading from "../../components/Loading";
import ErrorText from "../../components/ErrorText";

type Props = NativeStackScreenProps<MenuStackParamList, "MenuDetail">;

export default function MenuDetailScreen({ route, navigation }: Props) {
  const { itemId } = route.params;

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

  const handlePlaceOrder = async () => {
    if (!item) return;
    setPlacing(true);
    try {
      const order = await createOrder({ menuItem: item, quantity });
      Alert.alert(
        "Order Placed! 🎉",
        `Order #${order._id.slice(-6).toUpperCase()}\nTotal: Rs. ${order.totalAmount.toFixed(
          2,
        )}\nStatus: ${order.status}`,
        [
          { text: "Keep Browsing" },
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

  // ===== Loading =====
  if (loading) return <Loading />;

  // ===== Error =====
  if (error || !item) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={styles.floatingBackLight}>
          <TouchableOpacity
            style={styles.backBtnLight}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>
        <View style={styles.centerBox}>
          <Ionicons
            name="alert-circle-outline"
            size={48}
            color={colors.danger}
          />
          <Text style={styles.errorTitle}>Couldn't load dish</Text>
          <ErrorText>{error || "Item not found"}</ErrorText>
        </View>
      </SafeAreaView>
    );
  }

  const isAvailable = item.availabilityStatus === "Available";
  const totalAmount = item.price * quantity;
  const itemImage = item.imageUrl || "https://via.placeholder.com/400";

  return (
    <View style={styles.safe}>
      {/* ===== Hero image (fills top, scrolls with content) ===== */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroWrapper}>
          <Image source={{ uri: itemImage }} style={styles.hero} />

          {/* Floating back button (top-left) */}
          <SafeAreaView
            edges={["top"]}
            style={styles.floatingBackWrapper}
            pointerEvents="box-none"
          >
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => navigation.goBack()}
              activeOpacity={0.8}
            >
              <Ionicons name="arrow-back" size={22} color={colors.white} />
            </TouchableOpacity>
          </SafeAreaView>

          {/* Availability badge (bottom-left of the image) */}
          <View
            style={[
              styles.availPill,
              isAvailable ? styles.availPillOk : styles.availPillNo,
            ]}
          >
            <Ionicons
              name={isAvailable ? "checkmark-circle" : "close-circle"}
              size={14}
              color={isAvailable ? colors.success : colors.danger}
            />
            <Text
              style={[
                styles.availText,
                { color: isAvailable ? colors.success : colors.danger },
              ]}
            >
              {item.availabilityStatus}
            </Text>
          </View>
        </View>

        {/* ===== Body card ===== */}
        <View style={styles.body}>
          <View style={styles.categoryPill}>
            <Text style={styles.categoryText}>{item.category}</Text>
          </View>

          <Text style={styles.name}>{item.name}</Text>

          {/* Fake rating row for authenticity */}
          <View style={styles.ratingRow}>
            <View style={styles.stars}>
              {[1, 2, 3, 4, 5].map((i) => (
                <Ionicons
                  key={i}
                  name={i <= 4 ? "star" : "star-half"}
                  size={13}
                  color="#F5A623"
                />
              ))}
            </View>
            <Text style={styles.ratingText}>4.6</Text>
            <Text style={styles.dot}>•</Text>
            <Text style={styles.ratingText}>120+ reviews</Text>
          </View>

          <Text style={styles.price}>Rs. {item.price.toFixed(2)}</Text>

          {/* ===== Description ===== */}
          <Text style={styles.sectionHeading}>Description</Text>
          <View style={styles.descCard}>
            <Text style={styles.description}>
              {item.description || "No description provided for this dish."}
            </Text>
          </View>

          {/* ===== Quantity ===== */}
          {isAvailable && (
            <>
              <Text style={styles.sectionHeading}>Quantity</Text>
              <View style={styles.qtyCard}>
                <TouchableOpacity
                  style={[
                    styles.qtyBtn,
                    quantity <= 1 && styles.qtyBtnDisabled,
                  ]}
                  onPress={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name="remove"
                    size={20}
                    color={quantity <= 1 ? colors.textMuted : colors.text}
                  />
                </TouchableOpacity>

                <Text style={styles.qtyValue}>{quantity}</Text>

                <TouchableOpacity
                  style={styles.qtyBtn}
                  onPress={() => setQuantity((q) => q + 1)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="add" size={20} color={colors.text} />
                </TouchableOpacity>

                <View style={{ flex: 1 }} />

                <Text style={styles.qtyTotal}>
                  Rs. {totalAmount.toFixed(2)}
                </Text>
              </View>
            </>
          )}

          {/* Unavailable message */}
          {!isAvailable && (
            <View style={styles.unavailableBox}>
              <Ionicons
                name="information-circle-outline"
                size={18}
                color={colors.danger}
              />
              <Text style={styles.unavailableText}>
                This item is currently unavailable. You cannot place an order
                right now.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* ===== Sticky bottom bar ===== */}
      <SafeAreaView edges={["bottom"]} style={styles.bottomBarWrapper}>
        <View style={styles.bottomBar}>
          <View>
            <Text style={styles.bottomLabel}>Total</Text>
            <Text style={styles.bottomTotal}>Rs. {totalAmount.toFixed(2)}</Text>
          </View>

          <TouchableOpacity
            style={[
              styles.orderBtn,
              (!isAvailable || placing) && styles.orderBtnDisabled,
            ]}
            onPress={handlePlaceOrder}
            disabled={!isAvailable || placing}
            activeOpacity={0.85}
          >
            {placing ? (
              <>
                <Ionicons
                  name="hourglass-outline"
                  size={18}
                  color={colors.white}
                />
                <Text style={styles.orderBtnText}>Placing...</Text>
              </>
            ) : (
              <>
                <Ionicons name="bag-add" size={18} color={colors.white} />
                <Text style={styles.orderBtnText}>
                  {isAvailable ? "Place Order" : "Unavailable"}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },

  // ===== Hero =====
  heroWrapper: { position: "relative" },
  hero: {
    width: "100%",
    height: 320,
    backgroundColor: colors.surface,
  },
  floatingBackWrapper: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
  },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 16,
    marginTop: 8,
  },
  floatingBackLight: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  backBtnLight: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
  },
  availPill: {
    position: "absolute",
    bottom: 44, // moved up — clears the 28px body overlap
    left: 16,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    zIndex: 10, // stays above the body card
    elevation: 5, // for Android stacking
  },
  availPillOk: { backgroundColor: "#E8F5E9" },
  availPillNo: { backgroundColor: "#FFEBEE" },
  availText: {
    fontSize: 12,
    fontWeight: "800",
    marginLeft: 5,
    letterSpacing: 0.3,
  },

  // ===== Body =====
  body: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -28,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 24,
  },
  categoryPill: {
    alignSelf: "flex-start",
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 10,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.textMuted,
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  name: {
    fontSize: 26,
    fontWeight: "800",
    color: colors.text,
    lineHeight: 32,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  stars: { flexDirection: "row", marginRight: 6 },
  ratingText: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: "600",
  },
  dot: {
    color: colors.textMuted,
    marginHorizontal: 6,
    fontSize: 12,
  },
  price: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.primary,
    marginTop: 12,
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

  // ===== Description =====
  descCard: {
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  description: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 22,
  },

  // ===== Quantity =====
  qtyCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  qtyBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  qtyBtnDisabled: { opacity: 0.5 },
  qtyValue: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.text,
    marginHorizontal: 20,
    minWidth: 24,
    textAlign: "center",
  },
  qtyTotal: {
    fontSize: 17,
    fontWeight: "800",
    color: colors.primary,
  },

  // ===== Unavailable box =====
  unavailableBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#FFEBEE",
    padding: 14,
    borderRadius: 14,
    marginTop: 20,
  },
  unavailableText: {
    flex: 1,
    fontSize: 13,
    color: colors.danger,
    fontWeight: "600",
    marginLeft: 8,
    lineHeight: 19,
  },

  // ===== Bottom bar =====
  bottomBarWrapper: {
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.surface,
  },
  bottomBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
  },
  bottomLabel: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: "600",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  bottomTotal: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.primary,
    marginTop: 2,
  },
  orderBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary,
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 14,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  orderBtnDisabled: {
    backgroundColor: colors.textMuted,
    shadowOpacity: 0,
    elevation: 0,
  },
  orderBtnText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: "800",
    marginLeft: 8,
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
