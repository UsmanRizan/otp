import Constants from "expo-constants";
import { Platform } from "react-native";

const DEFAULT_PORT = 3000;
const LOCALHOST = `http://localhost:${DEFAULT_PORT}`;
const ANDROID_LOCALHOST = `http://10.0.2.2:${DEFAULT_PORT}`;

const getDevServerHost = () => {
  const hostUri =
    Constants.expoConfig?.hostUri ??
    Constants.manifest2?.extra?.expoClient?.hostUri;

  if (!hostUri) {
    return null;
  }

  return hostUri.split(":")[0];
};

const getDefaultBaseUrl = () => {
  if (Platform.OS === "android" && !Constants.isDevice) {
    // 10.0.2.2 maps to the host machine when using the Android emulator.
    return ANDROID_LOCALHOST;
  }

  const host = getDevServerHost();
  if (host) {
    return `http://${host}:${DEFAULT_PORT}`;
  }

  return LOCALHOST;
};

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? getDefaultBaseUrl();

export async function postJson<TResponse>(
  path: string,
  body: Record<string, unknown>,
): Promise<TResponse> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const text = await response.text();
  let payload: Record<string, unknown> = {};

  if (text) {
    try {
      payload = JSON.parse(text) as Record<string, unknown>;
    } catch {
      payload = {};
    }
  }

  if (!response.ok) {
    const message =
      typeof payload.message === "string" ? payload.message : "Request failed";
    throw new Error(message);
  }

  return payload as TResponse;
}
