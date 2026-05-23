import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import { Fonts } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { clearAuthSession, getAuthSession } from "@/lib/auth";

export default function HomeScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const phone = Array.isArray(params.phone) ? params.phone[0] : params.phone;
  const colorScheme = useColorScheme();
  const [sessionPhone, setSessionPhone] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  const palette =
    colorScheme === "dark"
      ? {
          background: "#0E1312",
          card: "#141C19",
          text: "#E6F0EB",
          subtext: "#A4B5AE",
          accent: "#6AE1B9",
          border: "#1F2B26",
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
          border: "#E6DDD0",
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

  useEffect(() => {
    let isMounted = true;

    const loadSession = async () => {
      try {
        const session = await getAuthSession();

        if (!session?.token) {
          if (isMounted) {
            router.replace("/phone");
          }
          return;
        }

        if (isMounted) {
          setSessionPhone(session.phone ?? null);
        }
      } finally {
        if (isMounted) {
          setIsChecking(false);
        }
      }
    };

    loadSession();

    return () => {
      isMounted = false;
    };
  }, [router]);

  const handleLogout = async () => {
    await clearAuthSession();
    router.replace("/phone");
  };

  if (isChecking) {
    return (
      <SafeAreaView
        style={[styles.safe, { backgroundColor: palette.background }]}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={palette.accent} />
        </View>
      </SafeAreaView>
    );
  }

  const displayPhone =
    typeof phone === "string" && phone.length > 0 ? phone : sessionPhone;

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

      <View style={styles.content}>
        <Animated.View style={[styles.header, titleStyle]}>
          <Text
            style={[
              styles.kicker,
              { color: palette.kicker, fontFamily: Fonts.mono },
            ]}
          >
            Verified session
          </Text>
          <Text
            style={[
              styles.title,
              { color: palette.text, fontFamily: Fonts.serif },
            ]}
          >
            Welcome home
          </Text>
          <Text style={[styles.subtitle, { color: palette.subtext }]}>
            {displayPhone
              ? `Signed in as ${displayPhone}.`
              : "You are signed in."}
          </Text>
        </Animated.View>

        <Animated.View
          style={[
            styles.card,
            { backgroundColor: palette.card, borderColor: palette.border },
            cardStyle,
          ]}
        >
          <View style={styles.statusRow}>
            <View
              style={[styles.statusDot, { backgroundColor: palette.accent }]}
            />
            <Text style={[styles.statusText, { color: palette.text }]}>
              OTP verified
            </Text>
          </View>
          <Text style={[styles.cardBody, { color: palette.subtext }]}>
            You can now access protected screens. Use the button below to end
            this session.
          </Text>
          <Pressable
            onPress={handleLogout}
            style={({ pressed }) => [
              styles.logoutButton,
              { backgroundColor: palette.accent, opacity: pressed ? 0.9 : 1 },
            ]}
          >
            <Text
              style={[
                styles.logoutText,
                { color: palette.buttonText, fontFamily: Fonts.rounded },
              ]}
            >
              Log out
            </Text>
          </Pressable>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
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
    fontSize: 34,
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
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    marginRight: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: "600",
  },
  cardBody: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 18,
  },
  logoutButton: {
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
