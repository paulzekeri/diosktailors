import { Tabs } from 'expo-router';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CustomersIcon, DueIcon, HomeIcon, ProjectsIcon, SettingsIcon } from '@/components/ui/icons';
import { fontFamily, layout, radius, shadows, tabBarTheme } from '@/theme';

/** Active-tab pill — the lighter wine capsule from the reference bar. */
function TabChip({ focused, children }: { focused: boolean; children: ReactNode }) {
  return <View style={[styles.chip, focused && styles.chipActive]}>{children}</View>;
}

export default function TabsLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: tabBarTheme.activeTint,
        tabBarInactiveTintColor: tabBarTheme.inactiveTint,
        /**
         * Docked deep-wine bar (client direction, 17 Nov): flush to the sides and
         * bottom of the phone frame, with the frame's 28px radius rounding the
         * bottom corners. Screens reserve exactly this height at the bottom.
         *
         * Height budget inside the 64px bar: 64 − 4 − 4 = 56 row, minus
         * react-navigation's own 2×5 item padding = 46 content for a 28px icon
         * slot + ~13px label. Every extra pixel of padding here shrinks the label
         * (it is a flex child with `numberOfLines={1}` → overflow hidden).
         */
        tabBarStyle: {
          height: layout.tabBarHeight + insets.bottom,
          paddingTop: 4,
          paddingBottom: Math.max(insets.bottom, 6),
          backgroundColor: tabBarTheme.background,
          borderTopWidth: 0,
          ...shadows.top,
        },
        tabBarLabelStyle: { fontFamily: fontFamily.semiBold, fontSize: 10, letterSpacing: 0 },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size, focused }) => (
            <TabChip focused={focused}>
              <HomeIcon color={color} size={size - 2} />
            </TabChip>
          ),
        }}
      />
      <Tabs.Screen
        name="customers"
        options={{
          title: 'Customers',
          tabBarIcon: ({ color, size, focused }) => (
            <TabChip focused={focused}>
              <CustomersIcon color={color} size={size - 2} />
            </TabChip>
          ),
        }}
      />
      <Tabs.Screen
        name="projects"
        options={{
          title: 'Projects',
          tabBarIcon: ({ color, size, focused }) => (
            <TabChip focused={focused}>
              <ProjectsIcon color={color} size={size - 2} />
            </TabChip>
          ),
        }}
      />
      <Tabs.Screen
        name="due"
        options={{
          title: 'Due',
          tabBarIcon: ({ color, size, focused }) => (
            <TabChip focused={focused}>
              <DueIcon color={color} size={size - 2} />
            </TabChip>
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size, focused }) => (
            <TabChip focused={focused}>
              <SettingsIcon color={color} size={size - 2} />
            </TabChip>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  chip: {
    minWidth: 46,
    height: 28,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipActive: { backgroundColor: tabBarTheme.activePill },
});
