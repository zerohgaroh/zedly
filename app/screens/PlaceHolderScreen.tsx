import React from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import AppTopBar from '../components/AppTopBar';
import { getThemeTokens } from '../theme';

type PlaceholderScreenProps = {
  title: string;
  subtitle?: string;
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
};

export default function PlaceholderScreen({
  title,
  subtitle,
  theme = 'dark',
  onToggleTheme,
}: PlaceholderScreenProps) {
  const colors = getThemeTokens(theme);
  return (
    <View style={[styles.safeArea, { backgroundColor: colors.bgPrimary }]}
    >
      <StatusBar hidden />
      <ScrollView contentContainerStyle={styles.container}>
        <AppTopBar theme={theme} onToggleTheme={onToggleTheme} />
        <View style={[styles.card, { backgroundColor: colors.bgSecondary, borderColor: colors.border }]}
        >
          <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
          {subtitle ? <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{subtitle}</Text> : null}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0A0E1A',
  },
  container: {
    flexGrow: 1,
    padding: 20,
  },
  card: {
    backgroundColor: '#151B2D',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#374151',
  },
  title: {
    color: '#F9FAFB',
    fontSize: 20,
    fontWeight: '700',
  },
  subtitle: {
    marginTop: 8,
    color: '#9CA3AF',
  },
});
