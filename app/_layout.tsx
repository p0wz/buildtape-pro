import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { initDatabase, getSetting, setSetting, getTapeEntries, getJobs } from "../src/lib/sqlite";
import { initPurchases } from "../src/lib/purchases";
import { useStore } from "../src/store";
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold, Inter_800ExtraBold } from "@expo-google-fonts/inter";
import * as SplashScreen from "expo-splash-screen";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { setDbReady, setIsPro, setTapeEntries, setJobs } = useStore();
  const [dbLoaded, setDbLoaded] = useState(false);

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
  });

  useEffect(() => {
    (async () => {
      try {
        await initDatabase();
        const proVal = getSetting("isPro", "false");
        setIsPro(proVal === "true");

        // Initialize RevenueCat SDK & sync entitlements
        initPurchases((isProActive) => {
          setIsPro(isProActive);
          try { setSetting("isPro", isProActive ? "true" : "false"); } catch (_) {}
        }).then((isProActive) => {
          if (isProActive) {
            setIsPro(true);
            try { setSetting("isPro", "true"); } catch (_) {}
          }
        }).catch(() => {});


        const entries = getTapeEntries();
        setTapeEntries(
          entries.map((e) => ({
            id: e.id,
            expression: e.expression,
            result: e.result,
            resultLength: null,
            resultTs: e.resultTs,
            createdAt: e.createdAt,
            type: e.type as any,
            jobId: e.jobId,
          })),
        );

        const jobs = getJobs();
        setJobs(
          jobs.map((j) => {
            let parsedPhotos: string[] = [];
            try {
              parsedPhotos = JSON.parse(j.photos || "[]");
            } catch (e) {}
            return {
              id: j.id,
              name: j.name,
              notes: j.notes,
              photos: parsedPhotos,
              createdAt: j.createdAt,
              updatedAt: j.updatedAt,
            };
          }),
        );

        setDbReady(true);
      } catch (e) {
        console.error("DB init failed:", e);
        setDbReady(true);
      } finally {
        setDbLoaded(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (dbLoaded && fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [dbLoaded, fontsLoaded]);

  if (!dbLoaded || !fontsLoaded) {
    return null;
  }

  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
      </Stack>
    </>
  );
}
