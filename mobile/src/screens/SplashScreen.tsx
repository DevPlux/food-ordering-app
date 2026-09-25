// src/screens/SplashScreen.tsx
import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated, Easing } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../theme/colors";

export default function SplashScreen() {
  const scaleAnim = useRef(new Animated.Value(0.6)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 80,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      {/* Decorative background blobs */}
      <View style={[styles.blob, styles.blobTop]} />
      <View style={[styles.blob, styles.blobBottom]} />

      <Animated.View
        style={[
          styles.logoWrapper,
          { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
        ]}
      >
        <View style={styles.logoCircle}>
          <Ionicons name="fast-food" size={56} color={colors.primary} />
        </View>
      </Animated.View>

      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
          alignItems: "center",
        }}
      >
        <Text style={styles.brand}>Foodie</Text>
        <Text style={styles.tagline}>Delicious food, delivered fast</Text>
      </Animated.View>

      <Animated.View style={[styles.footer, { opacity: fadeAnim }]}>
        <Text style={styles.footerText}>
          SE2020 · Web & Mobile Technologies
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  blob: {
    position: "absolute",
    borderRadius: 9999,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  blobTop: {
    width: 320,
    height: 320,
    top: -110,
    right: -120,
  },
  blobBottom: {
    width: 260,
    height: 260,
    bottom: -90,
    left: -100,
  },
  logoWrapper: { marginBottom: 26 },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.white,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.22,
    shadowRadius: 20,
    elevation: 10,
  },
  brand: {
    color: colors.white,
    fontSize: 40,
    fontWeight: "900",
    letterSpacing: 1.5,
  },
  tagline: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 14,
    marginTop: 8,
    fontWeight: "500",
  },
  footer: {
    position: "absolute",
    bottom: 40,
  },
  footerText: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 11,
    letterSpacing: 1,
    fontWeight: "600",
  },
});
