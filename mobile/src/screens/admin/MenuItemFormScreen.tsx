// src/screens/admin/MenuItemFormScreen.tsx
import React, { useState, useEffect, useLayoutEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { colors } from "../../theme/colors";
import InputField from "../../components/InputField";
import ErrorText from "../../components/ErrorText";
import {
  createMenuItem,
  updateMenuItem,
  getMenuItemById,
} from "../../api/menuService";
import { AdminStackParamList } from "../../navigation/types";

type Props = NativeStackScreenProps<AdminStackParamList, "MenuItemForm">;

const ADMIN_DARK = "#1F2937";

export default function MenuItemFormScreen({ route, navigation }: Props) {
  const editingId = route.params?.itemId;
  const isEditing = Boolean(editingId);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [availability, setAvailability] = useState<"Available" | "Unavailable">(
    "Available",
  );
  const [imageUri, setImageUri] = useState<string | undefined>(undefined);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState("");
  const [saving, setSaving] = useState(false);
  const [loadingItem, setLoadingItem] = useState(isEditing);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  useEffect(() => {
    if (!isEditing || !editingId) return;
    const load = async () => {
      try {
        const item = await getMenuItemById(editingId);
        setName(item.name);
        setDescription(item.description);
        setPrice(String(item.price));
        setCategory(item.category);
        setAvailability(item.availabilityStatus);
        setImageUri(item.imageUrl);
      } catch (e) {
        setServerError((e as Error).message);
      } finally {
        setLoadingItem(false);
      }
    };
    load();
  }, [editingId, isEditing]);

  const pickFromLibrary = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Required", "Allow photo access to pick an image");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  const pickFromCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Required", "Allow camera access to take a photo");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  const showImageOptions = () => {
    Alert.alert("Add Photo", "Choose a source", [
      { text: "Camera", onPress: pickFromCamera },
      { text: "Photo Library", onPress: pickFromLibrary },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const validate = () => {
    const v: Record<string, string> = {};
    if (!name.trim()) v.name = "Name is required";
    if (!category.trim()) v.category = "Category is required";
    if (!price.trim()) v.price = "Price is required";
    else if (isNaN(Number(price)) || Number(price) <= 0)
      v.price = "Enter a valid price";
    return v;
  };

  const onSubmit = async () => {
    setServerError("");
    const v = validate();
    setErrors(v);
    if (Object.keys(v).length) return;

    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        description: description.trim(),
        price: Number(price),
        category: category.trim(),
        availabilityStatus: availability,
        imageUri,
      };
      if (isEditing && editingId) {
        await updateMenuItem(editingId, payload);
      } else {
        await createMenuItem(payload);
      }
      navigation.goBack();
    } catch (e) {
      setServerError((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

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
        <View style={{ flex: 1, marginLeft: 12 }}>
          <View style={styles.adminBadge}>
            <Ionicons name="shield-checkmark" size={11} color={colors.white} />
            <Text style={styles.adminBadgeText}>ADMIN</Text>
          </View>
          <Text style={styles.headerTitle}>
            {isEditing ? "Edit Menu Item" : "New Menu Item"}
          </Text>
        </View>
        <View style={{ width: 38 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* ===== Image Picker ===== */}
          <TouchableOpacity
            style={styles.imagePicker}
            onPress={showImageOptions}
            activeOpacity={0.85}
          >
            {imageUri ? (
              <>
                <Image source={{ uri: imageUri }} style={styles.image} />
                <View style={styles.imageOverlay}>
                  <View style={styles.imageEditBtn}>
                    <Ionicons name="camera" size={16} color={colors.white} />
                    <Text style={styles.imageEditText}>Change</Text>
                  </View>
                </View>
              </>
            ) : (
              <View style={styles.imagePlaceholderBox}>
                <View style={styles.imagePlaceholderIcon}>
                  <Ionicons
                    name="camera-outline"
                    size={28}
                    color={colors.primary}
                  />
                </View>
                <Text style={styles.imagePlaceholderTitle}>Add a photo</Text>
                <Text style={styles.imagePlaceholderSubtitle}>
                  Tap to pick from camera or gallery
                </Text>
              </View>
            )}
          </TouchableOpacity>

          {/* ===== Basic Info ===== */}
          <Text style={styles.sectionHeading}>Basic Info</Text>
          <View style={styles.formCard}>
            <InputField
              label="Name"
              value={name}
              onChangeText={setName}
              placeholder="e.g. Chicken Kottu"
              error={errors.name}
            />
            <InputField
              label="Description"
              value={description}
              onChangeText={setDescription}
              placeholder="Short description"
              multiline
              numberOfLines={3}
            />
            <InputField
              label="Category"
              value={category}
              onChangeText={setCategory}
              placeholder="e.g. Main Course"
              error={errors.category}
            />
          </View>

          {/* ===== Pricing ===== */}
          <Text style={styles.sectionHeading}>Pricing</Text>
          <View style={styles.formCard}>
            <InputField
              label="Price (Rs.)"
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
              placeholder="e.g. 950"
              error={errors.price}
            />
          </View>

          {/* ===== Availability ===== */}
          <Text style={styles.sectionHeading}>Availability</Text>
          <View style={styles.toggleRow}>
            {(["Available", "Unavailable"] as const).map((opt) => {
              const isActive = availability === opt;
              const isAvail = opt === "Available";
              return (
                <TouchableOpacity
                  key={opt}
                  style={[
                    styles.toggleOption,
                    isActive && styles.toggleOptionActive,
                    isActive &&
                      (isAvail
                        ? styles.toggleActiveAvail
                        : styles.toggleActiveUnavail),
                  ]}
                  onPress={() => setAvailability(opt)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={isAvail ? "checkmark-circle" : "close-circle"}
                    size={18}
                    color={
                      isActive
                        ? colors.white
                        : isAvail
                          ? colors.success
                          : colors.danger
                    }
                  />
                  <Text
                    style={[
                      styles.toggleText,
                      isActive && styles.toggleTextActive,
                    ]}
                  >
                    {opt}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* ===== Errors ===== */}
          <ErrorText>{serverError}</ErrorText>

          {/* ===== Submit ===== */}
          <TouchableOpacity
            style={[styles.submitBtn, saving && { opacity: 0.6 }]}
            onPress={onSubmit}
            disabled={saving}
            activeOpacity={0.85}
          >
            <Ionicons
              name={saving ? "hourglass-outline" : "checkmark-circle"}
              size={20}
              color={colors.white}
            />
            <Text style={styles.submitText}>
              {saving
                ? "Saving..."
                : isEditing
                  ? "Save Changes"
                  : "Create Item"}
            </Text>
          </TouchableOpacity>

          <View style={{ height: 30 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },

  // ===== Header =====
  headerBar: {
    backgroundColor: ADMIN_DARK,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
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
  adminBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary,
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginBottom: 4,
  },
  adminBadgeText: {
    color: colors.white,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1,
    marginLeft: 4,
  },
  headerTitle: {
    color: colors.white,
    fontSize: 18,
    fontWeight: "800",
  },

  content: { padding: 16, paddingBottom: 40 },

  // ===== Image picker =====
  imagePicker: {
    height: 200,
    borderRadius: 16,
    backgroundColor: colors.surface,
    overflow: "hidden",
    marginBottom: 20,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: colors.border,
    justifyContent: "center",
    alignItems: "center",
  },
  image: { width: "100%", height: "100%" },
  imageOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.25)",
    justifyContent: "flex-end",
    alignItems: "flex-end",
  },
  imageEditBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.65)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    margin: 12,
  },
  imageEditText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
  },
  imagePlaceholderBox: { alignItems: "center" },
  imagePlaceholderIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#FFEBEE",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  imagePlaceholderTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text,
  },
  imagePlaceholderSubtitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 3,
  },

  // ===== Section heading =====
  sectionHeading: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textMuted,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    marginBottom: 8,
    marginTop: 6,
  },

  // ===== Form card =====
  formCard: {
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },

  // ===== Toggle =====
  toggleRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  toggleOption: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  toggleOptionActive: {
    borderWidth: 0,
  },
  toggleActiveAvail: { backgroundColor: colors.success },
  toggleActiveUnavail: { backgroundColor: colors.danger },
  toggleText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.text,
    marginLeft: 6,
  },
  toggleTextActive: { color: colors.white },

  // ===== Submit =====
  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitText: {
    color: colors.white,
    fontWeight: "800",
    fontSize: 15,
    marginLeft: 8,
  },
});
