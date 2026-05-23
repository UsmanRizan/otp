import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import { Fonts } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { postJson } from "@/lib/api";
import { setAuthSession } from "@/lib/auth";

type VerifyOtpResponse = {
  success: boolean;
  token?: string;
  message?: string;
};

export default function OtpScreen() {
  const params = useLocalSearchParams();
  const phoneParam = Array.isArray(params.phone)
    ? params.phone[0]
    : params.phone;
  const phone = typeof phoneParam === "string" ? phoneParam : "";

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const colorScheme = useColorScheme();

  const palette =
    colorScheme === "dark"
      ? {
          background: "#0E1312",
          card: "#141C19",
          text: "#E6F0EB",
          subtext: "#A4B5AE",
          accent: "#6AE1B9",
          accentMuted: "#3A7C6A",
          border: "#1F2B26",
          inputBackground: "#0F1714",
          inputBorder: "#24322C",
          error: "#F97066",
          blobA: "#1D3A33",
          blobB: "#27354B",
          kicker: "#7CDCC0",
          buttonText: "#0E1312",
        }
      : {
          background: "#F8F2EA",
          card: "#FFFFFF",
          text: "#1C1B19",
          subtext: "#5B5A52",
          accent: "#1B6E5A",
          accentMuted: "#9AC9BC",
          border: "#E6DDD0",
          inputBackground: "#FCF9F3",
          inputBorder: "#E2D6C6",
          error: "#B42318",
          blobA: "#F2C47D",
          blobB: "#9ED7CC",
          kicker: "#2D6A4F",
          buttonText: "#FDFBF7",
        };

  const titleAnim = useRef(new Animated.Value(0)).current;
  const cardAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(120, [
      Animated.timing(titleAnim, {
        toValue: 1,
        duration: 320,
        useNativeDriver: true,
      }),
      Animated.timing(cardAnim, {
        toValue: 1,
        duration: 360,
        useNativeDriver: true,
      }),
    ]).start();
  }, [cardAnim, titleAnim]);

  const titleStyle = {
    opacity: titleAnim,
    transform: [
      {
        translateY: titleAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [10, 0],
        }),
      },
    ],
  };

  const cardStyle = {
    opacity: cardAnim,
    transform: [
      {
        translateY: cardAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [12, 0],
        }),
      },
    ],
  };

  const handleVerify = async () => {
    const trimmedOtp = otp.trim();

    if (!phone) {
      setError("Missing phone number.");
      return;
    }

    if (!trimmedOtp) {
      setError("Enter the 6-digit code.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const response = await postJson<VerifyOtpResponse>(
        "/api/auth/verify-otp",
        {
          phone,
          otp: trimmedOtp,
        },
      );

      if (!response.token) {
        throw new Error("Verification succeeded, but no token was returned.");
      }

      await setAuthSession({ token: response.token, phone });
      router.replace({ pathname: "/", params: { phone } });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to verify OTP.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit = otp.trim().length > 0 && !isSubmitting && !!phone;

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: palette.background }]}
    >
      <View style={styles.blobLayer} pointerEvents="none">
        <View
          style={[
            styles.blob,
            styles.blobA,
            { backgroundColor: palette.blobA },
          ]}
        />
        <View
          style={[
            styles.blob,
            styles.blobB,
            { backgroundColor: palette.blobB },
          ]}
        />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.content}>
          <Animated.View style={[styles.header, titleStyle]}>
            <Text
              style={[
                styles.kicker,
                { color: palette.kicker, fontFamily: Fonts.mono },
              ]}
            >
              Step 2 of 2
            </Text>
            <Text
              style={[
                styles.title,
                { color: palette.text, fontFamily: Fonts.serif },
              ]}
            >
              Enter the OTP
            </Text>
            <Text style={[styles.subtitle, { color: palette.subtext }]}>
              {phone
                ? `We sent a code to ${phone}.`
                : "We need your phone number to continue."}
            </Text>
          </Animated.View>

          <Animated.View
            style={[
              styles.card,
              { backgroundColor: palette.card, borderColor: palette.border },
              cardStyle,
            ]}
          >
            <Text
              style={[
                styles.label,
                { color: palette.text, fontFamily: Fonts.rounded },
              ]}
            >
              6-digit code
            </Text>
            <TextInput
              value={otp}
              onChangeText={(value) => {
                setOtp(value);
                if (error) {
                  setError("");
                }
              }}
              placeholder="------"
              placeholderTextColor={palette.subtext}
              keyboardType="number-pad"
              textContentType="oneTimeCode"
              maxLength={6}
              autoCorrect={false}
              returnKeyType="done"
              onSubmitEditing={canSubmit ? handleVerify : undefined}
              style={[
                styles.input,
                {
                  backgroundColor: palette.inputBackground,
                  borderColor: palette.inputBorder,
                  color: palette.text,
                  fontFamily: Fonts.rounded,
                },
              ]}
            />
            {error ? (
              <Text style={[styles.error, { color: palette.error }]}>
                {error}
              </Text>
            ) : null}
            <Pressable
              onPress={handleVerify}
              disabled={!canSubmit}
              style={({ pressed }) => [
                styles.button,
                {
                  backgroundColor: canSubmit
                    ? palette.accent
                    : palette.accentMuted,
                  opacity: pressed && canSubmit ? 0.9 : 1,
                },
              ]}
            >
              {isSubmitting ? (
                <ActivityIndicator color={palette.buttonText} />
              ) : (
                <Text
                  style={[styles.buttonText, { color: palette.buttonText }]}
                >
                  Verify
                </Text>
              )}
            </Pressable>
            <Pressable onPress={() => router.replace("/phone")}>
              <Text style={[styles.link, { color: palette.kicker }]}>
                Change phone number
              </Text>
            </Pressable>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  blobLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  blob: {
    position: "absolute",
    borderRadius: 999,
  },
  blobA: {
    width: 260,
    height: 260,
    top: -110,
    right: -70,
    opacity: 0.45,
  },
  blobB: {
    width: 240,
    height: 240,
    bottom: -120,
    left: -80,
    opacity: 0.4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 28,
  },
  kicker: {
    fontSize: 12,
    letterSpacing: 1.6,
    textTransform: "uppercase",
    marginBottom: 10,
  },
  title: {
    fontSize: 32,
    lineHeight: 38,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    marginTop: 8,
  },
  card: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  label: {
    fontSize: 14,
    marginBottom: 10,
  },
  input: {
    height: 56,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    fontSize: 20,
    letterSpacing: 6,
    textAlign: "center",
  },
  error: {
    marginTop: 10,
    fontSize: 13,
  },
  button: {
    marginTop: 18,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    fontFamily: Fonts.rounded,
  },
  link: {
    marginTop: 16,
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
});
