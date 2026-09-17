import { Tabs } from "expo-router";
import { View, Text, StyleSheet, Platform } from "react-native";
import { Colors, Typography } from "../../src/lib/theme";

function TabIcon({
  icon,
  label,
  focused,
}: {
  icon: string;
  label: string;
  focused: boolean;
}) {
  return (
    <View style={[styles.tabItem, focused && styles.tabItemActive]}>
      <Text style={styles.tabIcon}>{icon}</Text>
      <Text
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.75}
        style={[styles.tabLabel, focused && styles.tabLabelActive]}
      >
        {label}
      </Text>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="📐" label="Calc" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="tape"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="📋" label="Tape" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="stairs"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="🪜" label="Stairs" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="rafters"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="📐" label="Rafters" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="materials"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="🧱" label="Materials" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="jobs"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="💼" label="Jobs" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="⚙️" label="Settings" focused={focused} />
          ),
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
    height: Platform.OS === "ios" ? 82 : 64,
    paddingBottom: Platform.OS === "ios" ? 20 : 8,
    paddingTop: 8,
  },
  tabItem: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 3,
    paddingHorizontal: 2,
    borderRadius: 8,
    flex: 1,
    gap: 1,
  },
  tabItemActive: {
    backgroundColor: Colors.orangeMuted,
  },
  tabIcon: {
    fontSize: 18,
  },
  tabIconActive: {},
  tabLabel: {
    fontSize: 10,
    color: Colors.tabInactive,
    fontWeight: "500",
    textAlign: "center",
    includeFontPadding: false,
  },
  tabLabelActive: {
    color: Colors.orange,
    fontWeight: "700",
  },
});
