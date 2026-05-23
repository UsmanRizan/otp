import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

type AuthSession = {
  token: string;
  phone?: string | null;
};

const TOKEN_KEY = "auth_token";
const PHONE_KEY = "auth_phone";

const isWeb = Platform.OS === "web";
const memoryStore = new Map<string, string>();

const canUseLocalStorage = () => {
  if (!isWeb) {
    return false;
  }

  try {
    return typeof window !== "undefined" && !!window.localStorage;
  } catch {
    return false;
  }
};

const setItem = async (key: string, value: string) => {
  if (isWeb) {
    if (canUseLocalStorage()) {
      window.localStorage.setItem(key, value);
      return;
    }

    memoryStore.set(key, value);
    return;
  }

  await SecureStore.setItemAsync(key, value);
};

const getItem = async (key: string) => {
  if (isWeb) {
    if (canUseLocalStorage()) {
      return window.localStorage.getItem(key);
    }

    return memoryStore.get(key) ?? null;
  }

  return SecureStore.getItemAsync(key);
};

const deleteItem = async (key: string) => {
  if (isWeb) {
    if (canUseLocalStorage()) {
      window.localStorage.removeItem(key);
      return;
    }

    memoryStore.delete(key);
    return;
  }

  await SecureStore.deleteItemAsync(key);
};

export const setAuthSession = async ({ token, phone }: AuthSession) => {
  await setItem(TOKEN_KEY, token);

  if (phone) {
    await setItem(PHONE_KEY, phone);
  } else {
    await deleteItem(PHONE_KEY);
  }
};

export const getAuthSession = async () => {
  const token = await getItem(TOKEN_KEY);

  if (!token) {
    return null;
  }

  const phone = await getItem(PHONE_KEY);

  return { token, phone };
};

export const clearAuthSession = async () => {
  await Promise.all([deleteItem(TOKEN_KEY), deleteItem(PHONE_KEY)]);
};
