/**
 * BuildTape Pro — RevenueCat Configuration Constants
 * Replace the API keys below with your keys from the RevenueCat dashboard:
 * https://app.revenuecat.com/
 */

import { Platform } from "react-native";

export const REVENUECAT_CONFIG = {
  // Apple App Store Public API Key
  appleApiKey: "appl_pNxDvEgumBfbqsIWjYIULxjkgvJ",

  // Google Play Public API Key (starts with goog_...)
  googleApiKey: "goog_YOUR_REVENUECAT_GOOGLE_KEY",

  // Entitlement ID defined in RevenueCat dashboard (e.g. "pro")
  entitlementId: "pro",

  // Default fallback price if offline or not loaded yet
  fallbackPriceString: "$9.99",
};

export function getRevenueCatApiKey(): string {
  if (Platform.OS === "ios") {
    return REVENUECAT_CONFIG.appleApiKey;
  }
  if (Platform.OS === "android") {
    return REVENUECAT_CONFIG.googleApiKey;
  }
  return "";
}
