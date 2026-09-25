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
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import * as ImagePicker from "expo-image-picker";
import { colors } from "../../theme/colors";
import InputField from "../../components/InputField";
import PrimaryButton from "../../components/PrimaryButton";
import ErrorText from "../../components/ErrorText";
import { MenuItem } from "../../types/menuItem";
import {
  createMenuItem,
  updateMenuItem,
  getMenuItemById,
} from "../../api/menuService";
import { AdminStackParamList } from "../../navigation/types";

type Props = NativeStackScreenProps<AdminStackParamList, "MenuItemForm">;

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
      title: isEditing ? "Edit Menu Item" : "New Menu Item",
    });
  }, [navigation, isEditing]);

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

  const pickImage = async () => {
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
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.image} />
          ) : (
            <Text style={styles.imagePlaceholder}>Tap to pick an image</Text>
          )}
        </TouchableOpacity>

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
          label="Price (Rs.)"
          value={price}
          onChangeText={setPrice}
          keyboardType="numeric"
          placeholder="e.g. 950"
          error={errors.price}
        />
        <InputField
          label="Category"
          value={category}
          onChangeText={setCategory}
          placeholder="e.g. Main Course"
          error={errors.category}
        />

        <Text style={styles.label}>Availability</Text>
        <View style={styles.toggleRow}>
          {(["Available", "Unavailable"] as const).map((opt) => (
            <TouchableOpacity
              key={opt}
              style={[
                styles.toggleOption,
                availability === opt && styles.toggleOptionActive,
              ]}
              onPress={() => setAvailability(opt)}
            >
              <Text
                style={[
                  styles.toggleText,
                  availability === opt && styles.toggleTextActive,
                ]}
              >
                {opt}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <ErrorText>{serverError}</ErrorText>

        <View style={{ marginTop: 16 }}>
          <PrimaryButton
            title={isEditing ? "Save Changes" : "Create Item"}
            onPress={onSubmit}
            loading={saving}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 40 },
  imagePicker: {
    height: 180,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: colors.border,
    backgroundColor: colors.surface,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    marginBottom: 20,
  },
  image: { width: "100%", height: "100%" },
  imagePlaceholder: { color: colors.textMuted, fontSize: 14 },
  label: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 6,
    fontWeight: "500",
  },
  toggleRow: { flexDirection: "row", gap: 8, marginBottom: 12 },
  toggleOption: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    backgroundColor: colors.white,
  },
  toggleOptionActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  toggleText: { fontSize: 14, color: colors.text, fontWeight: "500" },
  toggleTextActive: { color: colors.white, fontWeight: "700" },
});
