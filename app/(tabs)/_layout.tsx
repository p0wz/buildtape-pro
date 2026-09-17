import { Tabs } from "expo-router";
import { StyleSheet, Platform } from "react-native";
import { Colors, Typography } from "../../src/lib/theme";
import {
  CalcIcon,
  ToolsIcon,
  TapeIcon,
  JobsIcon,
  SettingsIcon,
} from "../../src/components/icons/TabIcons";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.orange,
        tabBarInactiveTintColor: Colors.tabInactive,
        tabBarAllowFontScaling: false,
        tabBarStyle: styles.tabBar,
        tabBarItemStyle: styles.tabBarItem,
        tabBarLabelStyle: styles.tabBarLabel,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarLabel: "Calc",
          tabBarIcon: ({ color }) => <CalcIcon color={color} size={22} />,
        }}
      />
      <Tabs.Screen
        name="tools"
        options={{
          tabBarLabel: "Tools",
          tabBarIcon: ({ color }) => <ToolsIcon color={color} size={22} />,
        }}
      />
      <Tabs.Screen
        name="tape"
        options={{
          tabBarLabel: "Tape",
          tabBarIcon: ({ color }) => <TapeIcon color={color} size={22} />,
        }}
      />
      <Tabs.Screen
        name="jobs"
        options={{
          tabBarLabel: "Jobs",
          tabBarIcon: ({ color }) => <JobsIcon color={color} size={22} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          tabBarLabel: "Settings",
          tabBarIcon: ({ color }) => <SettingsIcon color={color} size={22} />,
        }}
      />

      {/* Sub-calculators accessible from the Tools Hub */}
      <Tabs.Screen
        name="stairs"
        options={{
          href: null,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="rafters"
        options={{
          href: null,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="materials"
        options={{
          href: null,
          headerShown: false,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.tabBg,
    borderTopColor: Colors.tabBorder,
    borderTopWidth: 1,
    height: Platform.OS === "ios" ? 82 : 60,
    paddingBottom: Platform.OS === "ios" ? 22 : 6,
    paddingTop: 6,
  },
  tabBarItem: {
    paddingVertical: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  tabBarLabel: {
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: -0.2,
    marginTop: 1,
  },
});


