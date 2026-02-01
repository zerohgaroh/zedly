import { FontAwesome } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getThemeTokens } from '../theme';
import HoverablePressable from './HoverablePressable';

type Role = 'student' | 'teacher' | 'admin';

type BottomNavProps = {
  role: Role;
  language: 'ru' | 'uz';
  activeRoute: string;
  onSelect: (route: string) => void;
  onToggleLanguage: () => void;
  onLogout: () => void;
  theme?: 'dark' | 'light';
};

const translations = {
  ru: {
    home: 'Главная',
    profile: 'Профиль',
    history: 'История',
    logout: 'Выход',
  },
  uz: {
    home: 'Bosh sahifa',
    profile: 'Profil',
    history: 'Tarix',
    logout: 'Chiqish',
  },
};

export default function BottomNav({
  role,
  language,
  activeRoute,
  onSelect,
  onToggleLanguage,
  onLogout,
  theme = 'dark',
}: BottomNavProps) {
  const t = translations[language];
  const languageLabel = language === 'ru' ? 'RU' : 'UZ';
  const insets = useSafeAreaInsets();
  const colors = getThemeTokens(theme);

  const items = (() => {
    if (role === 'admin') {
      return [
        { key: 'admin.dashboard', label: t.home, icon: 'home' as const, type: 'route' as const },
        { key: 'language', label: languageLabel, icon: 'globe' as const, type: 'language' as const },
        { key: 'logout', label: t.logout, icon: 'sign-out' as const, type: 'logout' as const },
      ];
    }

    if (role === 'teacher') {
      return [
        { key: 'teacher.dashboard', label: t.home, icon: 'home' as const, type: 'route' as const },
        { key: 'teacher.profile', label: t.profile, icon: 'user' as const, type: 'route' as const },
        { key: 'teacher.history', label: t.history, icon: 'history' as const, type: 'route' as const },
        { key: 'language', label: languageLabel, icon: 'globe' as const, type: 'language' as const },
        { key: 'logout', label: t.logout, icon: 'sign-out' as const, type: 'logout' as const },
      ];
    }

    return [
      { key: 'student.dashboard', label: t.home, icon: 'home' as const, type: 'route' as const },
      { key: 'student.profile', label: t.profile, icon: 'user' as const, type: 'route' as const },
      { key: 'student.history', label: t.history, icon: 'history' as const, type: 'route' as const },
      { key: 'language', label: languageLabel, icon: 'globe' as const, type: 'language' as const },
      { key: 'logout', label: t.logout, icon: 'sign-out' as const, type: 'logout' as const },
    ];
  })();

  return (
    <View
      style={[
        styles.container,
        {
          paddingBottom: Math.max(insets.bottom, 8),
          height: 70 + insets.bottom,
          backgroundColor: colors.bgSecondary,
          borderTopColor: colors.bgSecondary,
          shadowOpacity: theme === 'light' ? 0.08 : 0.2,
          elevation: theme === 'light' ? 3 : 6,
        },
      ]}
    >
      <View style={styles.navRow}>
        {items.map(item => {
          const active = item.type === 'route' && activeRoute === item.key;
          const activeColor = colors.accent;
          const hoverColor = colors.accent;
          const handlePress = () => {
            if (item.type === 'language') {
              onToggleLanguage();
              return;
            }
            if (item.type === 'logout') {
              onLogout();
              return;
            }
            onSelect(item.key);
          };

          return (
            <HoverablePressable
              key={item.key}
              style={styles.navItem}
              pressedStyle={styles.navItemPressed}
              hoverScale={1}
              hoverTranslateY={0}
              onPress={handlePress}
            >
              {({ hovered, pressed }) => {
                const highlight = active || hovered || pressed;
                const iconColor = highlight ? hoverColor : colors.textMuted;
                return (
                  <>
                    <FontAwesome
                      name={item.icon}
                      size={28}
                      color={iconColor}
                      style={styles.icon}
                    />
                    <Text
                      style={[styles.label, { color: colors.textMuted }, highlight && { color: activeColor }]}
                      numberOfLines={1}
                    >
                      {item.label}
                    </Text>
                  </>
                );
              }}
            </HoverablePressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 70,
    borderTopWidth: 1,
    borderTopColor: 'transparent',
    backgroundColor: 'transparent',
    paddingBottom: 8,
    paddingTop: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    height: 70,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    paddingVertical: 10,
    minWidth: 72,
  },
  navItemPressed: {
    opacity: 0.85,
  },
  icon: {
    marginBottom: 6,
  },
  label: {
    color: '#9CA3AF',
    fontSize: 11,
    textAlign: 'center',
    fontWeight: '600',
  },
  labelActive: {
    fontWeight: '600',
  },
});
