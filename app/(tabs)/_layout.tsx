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
      <Text style={[styles.tabIcon, focused && styles.tabIconActive]}>{icon}</Text>
      <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>
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
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderRadius: 10,
    minWidth: 50,
    gap: 2,
  },
  tabItemActive: {
    backgroundColor: Colors.orangeMuted,
  },
  tabIcon: {
    fontSize: 20,
  },
  tabIconActive: {},
  tabLabel: {
    fontSize: Typography.xs,
    color: Colors.tabInactive,
    fontWeight: Typography.medium,
  },
  tabLabelActive: {
    color: Colors.orange,
    fontWeight: Typography.bold,
  },
});
