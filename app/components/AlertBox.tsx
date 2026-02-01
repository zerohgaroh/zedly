import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ThemeMode } from '../theme';
import HoverablePressable from './HoverablePressable';

export type AlertVariant = 'success' | 'error' | 'warning' | 'info';

type AlertBoxProps = {
  variant: AlertVariant;
  message: string;
  title?: string;
  theme?: ThemeMode;
  onClose?: () => void;
};

const darkVariantConfig: Record<AlertVariant, { icon: string; border: string; text: string; gradient: [string, string] }> = {
  success: {
    icon: '✅',
    border: '#10B981',
    text: '#059669',
    gradient: ['rgba(16, 185, 129, 0.1)', 'rgba(5, 150, 105, 0.05)'],
  },
  error: {
    icon: '❌',
    border: '#EF4444',
    text: '#DC2626',
    gradient: ['rgba(239, 68, 68, 0.1)', 'rgba(220, 38, 38, 0.05)'],
  },
  warning: {
    icon: '⚠️',
    border: '#F59E0B',
    text: '#D97706',
    gradient: ['rgba(245, 158, 11, 0.1)', 'rgba(217, 119, 6, 0.05)'],
  },
  info: {
    icon: 'ℹ️',
    border: '#3B82F6',
    text: '#2563EB',
    gradient: ['rgba(59, 130, 246, 0.1)', 'rgba(37, 99, 235, 0.05)'],
  },
};

const lightVariantConfig: Record<AlertVariant, { icon: string; border: string; text: string; gradient: [string, string] }> = {
  success: {
    icon: '✅',
    border: '#86EFAC',
    text: '#15803D',
    gradient: ['#DCFCE7', '#BBFBEE'],
  },
  error: {
    icon: '❌',
    border: '#FCA5A5',
    text: '#7F1D1D',
    gradient: ['#FEE2E2', '#FEC2C2'],
  },
  warning: {
    icon: '⚠️',
    border: '#FDB022',
    text: '#92400E',
    gradient: ['#FEF3C7', '#FED7AA'],
  },
  info: {
    icon: 'ℹ️',
    border: '#0EA5E9',
    text: '#0C4A6E',
    gradient: ['#DBEAFE', '#BAE6FD'],
  },
};

export default function AlertBox({ variant, message, title, theme = 'dark', onClose }: AlertBoxProps) {
  const config = (theme === 'light' ? lightVariantConfig : darkVariantConfig)[variant];

  return (
    <View style={[styles.container, { borderColor: config.border }]}>
      <LinearGradient colors={config.gradient} style={StyleSheet.absoluteFillObject} />
      <Text style={styles.icon}>{config.icon}</Text>
      <View style={styles.content}>
        {title ? <Text style={[styles.title, { color: config.text }]}>{title}</Text> : null}
        <Text style={[styles.message, { color: config.text }]}>{message}</Text>
      </View>
      {onClose ? (
        <HoverablePressable
          style={styles.closeButton}
          hoverStyle={styles.closeButtonHover}
          pressedStyle={styles.closeButtonPressed}
          hoverScale={1}
          hoverTranslateY={0}
          onPress={onClose}
        >
          {() => <Text style={[styles.closeButtonText, { color: config.text }]}>✕</Text>}
        </HoverablePressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 2,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 16,
    overflow: 'hidden',
  },
  icon: {
    fontSize: 18,
    marginTop: 2,
  },
  content: {
    flex: 1,
  },
  closeButton: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    marginLeft: 8,
  },
  closeButtonHover: {
    opacity: 0.9,
  },
  closeButtonPressed: {
    opacity: 0.8,
  },
  closeButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
  title: {
    fontWeight: '700',
    fontSize: 16,
    marginBottom: 4,
  },
  message: {
    fontWeight: '500',
    fontSize: 14,
  },
});
