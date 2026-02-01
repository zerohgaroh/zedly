import { LinearGradient } from 'expo-linear-gradient';
import React, { useMemo } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { getThemeTokens } from '../theme';
import HoverablePressable from './HoverablePressable';

type AppTopBarProps = {
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
};

export default function AppTopBar({ theme = 'dark', onToggleTheme }: AppTopBarProps) {
  const logoAsset = useMemo(() => require('../../assets/images/zedly_logo_bg.png'), []);
  const isLight = theme === 'light';
  const colors = getThemeTokens(theme);

  return (
    <View
      style={[
        styles.container,
        styles.containerShadow,
        {
          backgroundColor: colors.bgSecondary,
          borderColor: colors.border,
          shadowOpacity: isLight ? 0.08 : 0.35,
          elevation: isLight ? 3 : 6,
        },
      ]}
    >
      <View style={styles.side} />
      <View style={styles.center}>
        <Image
          source={logoAsset}
          style={styles.logo}
          resizeMode="contain"
          fadeDuration={0}
          defaultSource={logoAsset}
        />
        <Text style={[styles.name, { color: colors.textPrimary }]}>ZEDLY</Text>
      </View>
      <View style={[styles.side, styles.right]}>
        <HoverablePressable
          style={[
            styles.themeButton,
            {
              borderColor: colors.primary,
            },
          ]}
          hoverStyle={styles.themeButtonHover}
          pressedStyle={styles.themeButtonPressed}
          hoverScale={1}
          hoverTranslateY={-1}
          accessibilityLabel={isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          accessibilityHint={isLight ? 'Enable dark appearance' : 'Enable light appearance'}
          onPress={onToggleTheme}
        >
          {() => (
            <>
              <LinearGradient
                colors={['rgba(59, 130, 246, 0.12)', 'rgba(139, 92, 246, 0.12)']}
                style={StyleSheet.absoluteFillObject}
              />
              <Text style={[styles.themeButtonText, { color: colors.textPrimary }]}>
                {isLight ? '☀️' : '🌙'}
              </Text>
            </>
          )}
        </HoverablePressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 20,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    borderWidth: 1,
  },
  containerShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
  },
  side: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
    minHeight: 34,
  },
  right: {
    alignItems: 'flex-end',
  },
  center: {
    flex: 0,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  logo: {
    width: 34,
    height: 34,
    borderRadius: 10,
    shadowColor: '#0D1B32',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
  },
  name: {
    fontSize: 16.8,
    fontWeight: '800',
    letterSpacing: 3.2,
  },
  themeButton: {
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 14,
    minWidth: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    position: 'relative',
    overflow: 'hidden',
  },
  themeButtonHover: {
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
  },
  themeButtonPressed: {
    opacity: 0.9,
  },
  themeButtonText: {
    fontSize: 15,
    fontWeight: '700',
  },
});
