/**
 * BuildTape Pro — RevenueCat In-App Purchase Service
 * Safe for iOS, Android, and Web platforms.
 */

import { Platform } from "react-native";
import Constants, { ExecutionEnvironment } from "expo-constants";
import { getRevenueCatApiKey, REVENUECAT_CONFIG } from "../constants/purchases";

export const IS_EXPO_GO =
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient ||
  (Constants as any).appOwnership === "expo";

export interface ProPackageInfo {
  identifier: string;
  priceString: string;
  title: string;
  description: string;
}

let PurchasesModule: any = null;

// Dynamically import or reference react-native-purchases on native (standalone only, not Expo Go)
async function getPurchases() {
  if (Platform.OS === "web" || IS_EXPO_GO) return null;
  if (!PurchasesModule) {
    try {
      const pkg = await import("react-native-purchases");
      PurchasesModule = pkg.default || pkg;
    } catch (e) {
      console.warn("RevenueCat module import failed:", e);
      return null;
    }
  }
  return PurchasesModule;
}

/**
 * Initialize RevenueCat SDK
 */
export async function initPurchases(onCustomerInfoUpdate?: (isPro: boolean) => void): Promise<boolean> {
  if (Platform.OS === "web") {
    return false;
  }

  const apiKey = getRevenueCatApiKey();
  if (!apiKey || apiKey.includes("YOUR_REVENUECAT")) {
    console.info("RevenueCat: Running with placeholder API key.");
    return false;
  }

  try {
    const Purchases = await getPurchases();
    if (!Purchases) return false;

    await Purchases.configure({ apiKey });

    if (onCustomerInfoUpdate) {
      Purchases.addCustomerInfoUpdateListener((customerInfo: any) => {
        const isPro = Boolean(
          customerInfo?.entitlements?.active?.[REVENUECAT_CONFIG.entitlementId],
        );
        onCustomerInfoUpdate(isPro);
      });
    }

    const customerInfo = await Purchases.getCustomerInfo();
    return Boolean(
      customerInfo?.entitlements?.active?.[REVENUECAT_CONFIG.entitlementId],
    );
  } catch (e) {
    console.warn("RevenueCat initialization failed:", e);
    return false;
  }
}

/**
 * Get the Lifetime Pro package details (price string, title, etc.)
 */
export async function getProPackage(): Promise<ProPackageInfo> {
  if (Platform.OS === "web") {
    return {
      identifier: "pro_lifetime",
      priceString: REVENUECAT_CONFIG.fallbackPriceString,
      title: "BuildTape Pro Lifetime",
      description: "One-time purchase · Lifetime access",
    };
  }

  try {
    const Purchases = await getPurchases();
    if (!Purchases) throw new Error("Purchases unavailable");

    const offerings = await Purchases.getOfferings();
    const current = offerings.current;
    
    // Look for lifetime package, or first available package
    const pkg = current?.lifetime || current?.availablePackages?.[0];
    if (pkg) {
      return {
        identifier: pkg.identifier,
        priceString: pkg.product.priceString,
        title: pkg.product.title || "BuildTape Pro Lifetime",
        description: pkg.product.description || "One-time purchase · Lifetime access",
      };
    }
  } catch (e) {
    console.warn("Failed to fetch RevenueCat offerings:", e);
  }

  return {
    identifier: "pro_lifetime",
    priceString: REVENUECAT_CONFIG.fallbackPriceString,
    title: "BuildTape Pro Lifetime",
    description: "One-time purchase · Lifetime access",
  };
}

/**
 * Purchase Pro Lifetime
 */
export async function purchasePro(): Promise<{ success: boolean; isPro: boolean; error?: string }> {
  if (Platform.OS === "web" || IS_EXPO_GO) {
    // In Expo Go or Web, allow simulated purchase so user can test and screenshot Pro features
    return { success: true, isPro: true };
  }

  try {
    const Purchases = await getPurchases();
    if (!Purchases) {
      return { success: false, isPro: false, error: "RevenueCat is not initialized." };
    }

    const offerings = await Purchases.getOfferings();
    const pkg = offerings.current?.lifetime || offerings.current?.availablePackages?.[0];

    if (!pkg) {
      return { success: false, isPro: false, error: "No purchase package found. Please check RevenueCat configuration." };
    }

    const { customerInfo } = await Purchases.purchasePackage(pkg);
    const isPro = Boolean(
      customerInfo?.entitlements?.active?.[REVENUECAT_CONFIG.entitlementId],
    );

    return { success: isPro, isPro };
  } catch (e: any) {
    if (e?.userCancelled) {
      return { success: false, isPro: false };
    }
    return {
      success: false,
      isPro: false,
      error: e?.message || "Purchase failed. Please try again.",
    };
  }
}

/**
 * Restore previous purchases (Mandatory for App Store review)
 */
export async function restorePurchases(): Promise<{ success: boolean; isPro: boolean; message: string }> {
  if (Platform.OS === "web") {
    return {
      success: false,
      isPro: false,
      message: "Restore is only available on iOS and Android devices.",
    };
  }

  try {
    const Purchases = await getPurchases();
    if (!Purchases) {
      return {
        success: false,
        isPro: false,
        message: "Purchase service is unavailable.",
      };
    }

    const customerInfo = await Purchases.restorePurchases();
    const isPro = Boolean(
      customerInfo?.entitlements?.active?.[REVENUECAT_CONFIG.entitlementId],
    );

    return {
      success: true,
      isPro,
      message: isPro
        ? "Your Pro purchase has been restored successfully!"
        : "No previous Pro purchase was found for this Apple ID / Google account.",
    };
  } catch (e: any) {
    return {
      success: false,
      isPro: false,
      message: e?.message || "Could not restore purchases.",
    };
  }
}
