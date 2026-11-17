import { Tabs } from 'expo-router';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CustomersIcon, DueIcon, HomeIcon, ProjectsIcon, SettingsIcon } from '@/components/ui/icons';
import { colors, fontFamily, layout, radius, shadows } from '@/theme';

/** Wine-tinted chip behind the active tab icon — depth without a custom tab bar. */
function TabChip({ focused, children }: { focused: boolean; children: ReactNode }) {
  return <View style={[styles.chip, focused && styles.chipActive]}>{children}</View>;
}

export default function TabsLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.inkSubtle,
        /**
         * Height budget for the 64px token on web (insets.bottom = 0):
         *   64 − 1px hairline − 4 top − 4 bottom = 55 row
         *   55 − 2×5 (react-navigation's own item padding) = 45 content
         *   28 (icon slot) + ~15 (11px label line box) = 43 → nothing is squeezed.
         * Every extra pixel of padding here shrinks the label (it is a flex child
         * with `numberOfLines={1}` → overflow: hidden), which clips its baseline.
         */
        tabBarStyle: {
          height: layout.tabBarHeight + insets.bottom,
          paddingTop: 4,
          paddingBottom: Math.max(insets.bottom, 4),
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          borderTopColor: colors.hairline,
          ...shadows.top,
        },
        tabBarLabelStyle: { fontFamily: fontFamily.semiBold, fontSize: 11 },
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
    minWidth: 42,
    height: 26,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipActive: { backgroundColor: colors.primaryTint, ...shadows.brandSoft },
});
