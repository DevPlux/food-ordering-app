// src/screens/auth/LoginScreen.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { colors } from "../../theme/colors";
import InputField from "../../components/InputField";
import PrimaryButton from "../../components/PrimaryButton";
import ErrorText from "../../components/ErrorText";
import { validateLogin } from "../../utils/validators";
import { useAuth } from "../../context/AuthContext";
import { AuthStackParamList } from "../../navigation/types";

type Props = NativeStackScreenProps<AuthStackParamList, "Login">;

export default function LoginScreen({ navigation }: Props) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    setServerError("");
    const v = validateLogin({ email, password });
    setErrors(v);
    if (Object.keys(v).length) return;

    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch (e) {
      setServerError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Hero */}
        <SafeAreaView edges={["top"]} style={styles.hero}>
          <View style={styles.blob1} />
          <View style={styles.blob2} />
          <View style={styles.blob3} />

          <View style={styles.logoCircle}>
            <Ionicons name="fast-food" size={44} color={colors.primary} />
          </View>

          <Text style={styles.brand}>Foodie</Text>
          <Text style={styles.tagline}>Delicious food, delivered fast</Text>
        </SafeAreaView>

        {/* Form */}
        <View style={styles.cardWrapper}>
          <View style={styles.card}>
            <Text style={styles.title}>Welcome back</Text>
            <Text style={styles.subtitle}>Sign in to continue</Text>

            <InputField
              label="Email"
              placeholder="you@example.com"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              error={errors.email}
            />
            <InputField
              label="Password"
              placeholder="Your password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              error={errors.password}
            />

            <ErrorText>{serverError}</ErrorText>

            <PrimaryButton
              title="Sign In"
              onPress={onSubmit}
              loading={loading}
            />

            <TouchableOpacity
              onPress={() => navigation.navigate("Register")}
              style={styles.linkWrapper}
              activeOpacity={0.7}
            >
              <Text style={styles.linkText}>Don't have an account? </Text>
              <Text style={styles.linkBold}>Register</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: colors.primary,
    paddingTop: 30,
    paddingBottom: 70,
    alignItems: "center",
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: "hidden",
    position: "relative",
  },
  blob1: {
    position: "absolute",
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: "rgba(255,255,255,0.09)",
    top: -100,
    right: -80,
  },
  blob2: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(255,255,255,0.07)",
    bottom: -60,
    left: -50,
  },
  blob3: {
    position: "absolute",
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "rgba(255,255,255,0.08)",
    top: 40,
    left: 40,
  },
  logoCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.white,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
    marginBottom: 14,
  },
  brand: {
    color: colors.white,
    fontSize: 32,
    fontWeight: "900",
    letterSpacing: 1.2,
  },
  tagline: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 13,
    marginTop: 6,
    fontWeight: "500",
  },
  cardWrapper: {
    flex: 1,
    paddingHorizontal: 20,
    marginTop: -50,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 6,
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 24,
    marginTop: 4,
  },
  linkWrapper: {
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  linkText: { color: colors.textMuted, fontSize: 14 },
  linkBold: { color: colors.primary, fontSize: 14, fontWeight: "700" },
});
