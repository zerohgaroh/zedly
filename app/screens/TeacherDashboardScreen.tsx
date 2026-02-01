import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import AppTopBar from '../components/AppTopBar';
import HoverablePressable from '../components/HoverablePressable';
import { getThemeTokens } from '../theme';

type TeacherDashboardScreenProps = {
  user: { firstName?: string; lastName?: string };
  language?: 'ru' | 'uz';
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
};

const translations = {
  ru: {
    dashboard: 'Мои предметы',
    welcome: 'Добро пожаловать',
    role: 'Учитель',
    profileStats: 'Профиль и Статистика',
    profileStatsDesc: 'Аналитика и результаты',
    moduleAnalytics: 'Аналитика по темам',
    moduleAnalyticsDesc: 'По классам и предметам',
    myTests: 'Мои тесты',
    myTestsDesc: 'Тесты на оценку компетенций',
    controlTests: 'Контрольные работы',
    controlTestsDesc: 'Создание и оценка',
    myClasses: 'Мои классы',
    myClassesDesc: 'Ученики и аналитика',
    selectedSubjects: 'Выбранные предметы',
    selectedSubjectsDesc:
      'Вы преподаете следующие предметы. Вы можете создавать модули и тесты для каждого предмета.',
    loading: 'Загрузка...',
  },
  uz: {
    dashboard: 'Mening fanlarim',
    welcome: 'Xush kelibsiz',
    role: "O'qituvchi",
    profileStats: 'Profil va Statistika',
    profileStatsDesc: 'Analitika va natijalar',
    moduleAnalytics: 'Mavzu analitikasi',
    moduleAnalyticsDesc: 'Sinf va fan kesimida',
    myTests: 'Mening testlarim',
    myTestsDesc: 'Malaka baholash testlari',
    controlTests: 'Nazorat isbotlari',
    controlTestsDesc: 'Sinov va tahlil',
    myClasses: 'Mening sinflarim',
    myClassesDesc: 'Oqituvchi va analitika',
    selectedSubjects: 'Tanlangan fanlar',
    selectedSubjectsDesc:
      "Quyidagi fanlarni o'qitasiz. Har bir fan uchun modullar va testlar yaratishingiz mumkin.",
    loading: 'Yuklanmoqda...',
  },
};

export default function TeacherDashboardScreen({
  user,
  language = 'ru',
  theme = 'dark',
  onToggleTheme,
}: TeacherDashboardScreenProps) {
  const t = translations[language];
  const colors = getThemeTokens(theme);
  const textPrimary = { color: colors.textPrimary };
  const textSecondary = { color: colors.textSecondary };
  const surfaceCard = {
    backgroundColor: colors.bgSecondary,
    borderColor: colors.border,
    shadowOpacity: theme === 'light' ? 0.12 : 0.3,
  };

  return (
    <View style={[styles.safeArea, { backgroundColor: colors.bgPrimary }]}>
      <StatusBar hidden />
      <ScrollView contentContainerStyle={styles.container}>
        <AppTopBar theme={theme} onToggleTheme={onToggleTheme} />
        <View style={styles.header}>
          <Text style={[styles.title, textPrimary]}>{t.dashboard}</Text>
          <Text style={[styles.subtitle, textSecondary]}>
            {user.firstName || ''} {user.lastName || ''} • {t.role}
          </Text>
          <LinearGradient colors={['#1b3b6f', '#2b59c3']} style={styles.headerUnderline} />
        </View>

        <View style={styles.dashboardCards}>
          {[
            {
              key: 'profile',
              icon: '📊',
              title: t.profileStats,
              description: t.profileStatsDesc,
              gradient: ['#667eea', '#764ba2'] as const,
            },
            {
              key: 'analytics',
              icon: '📈',
              title: t.moduleAnalytics,
              description: t.moduleAnalyticsDesc,
              gradient: ['#0ea5e9', '#38bdf8'] as const,
            },
            {
              key: 'tests',
              icon: '📋',
              title: t.myTests,
              description: t.myTestsDesc,
              gradient: ['#6366f1', '#a855f7'] as const,
            },
            {
              key: 'control',
              icon: '✏️',
              title: t.controlTests,
              description: t.controlTestsDesc,
              gradient: ['#ec4899', '#f97316'] as const,
            },
            {
              key: 'classes',
              icon: '👥',
              title: t.myClasses,
              description: t.myClassesDesc,
              gradient: ['#14b8a6', '#06b6d4'] as const,
            },
          ].map(card => {
            const cardGradient = (theme === 'light'
              ? [colors.bgSecondary, colors.bgTertiary]
              : card.gradient) as [string, string];
            return (
            <HoverablePressable
              key={card.key}
              style={[styles.dashboardCard, { borderColor: colors.border }]}
              hoverStyle={styles.dashboardCardHover}
              pressedStyle={styles.dashboardCardPressed}
              hoverScale={1.02}
              hoverTranslateY={-6}
            >
              {({ hovered, pressed }) => (
                <>
                  <LinearGradient colors={cardGradient} style={styles.dashboardCardBackground} />
                  <View style={styles.dashboardCardContent}>
                    <Text style={styles.cardIcon}>{card.icon}</Text>
                    <View style={styles.cardContent}>
                      <Text style={[styles.cardHeading, textPrimary]}>{card.title}</Text>
                      <Text style={[styles.cardText, textSecondary]}>{card.description}</Text>
                    </View>
                    <Text
                      style={[
                        styles.cardArrow,
                        { color: colors.textMuted },
                        (hovered || pressed) && { color: colors.accent },
                      ]}
                    >
                      →
                    </Text>
                  </View>
                </>
              )}
            </HoverablePressable>
            );
          })}
        </View>

        <HoverablePressable
          style={[styles.card, surfaceCard]}
          hoverStyle={styles.cardHover}
          pressedStyle={styles.cardPressed}
          hoverScale={1}
          hoverTranslateY={-4}
        >
          {() => (
            <>
              <Text style={[styles.sectionTitle, textPrimary]}>{t.selectedSubjects}</Text>
              <Text style={[styles.sectionDesc, textSecondary]}>{t.selectedSubjectsDesc}</Text>
              <View style={[styles.loadingBlock, { backgroundColor: colors.bgTertiary, borderColor: colors.border }]}>
                <Text style={[styles.loadingText, textSecondary]}>{t.loading}</Text>
              </View>
            </>
          )}
        </HoverablePressable>
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
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 32,
    position: 'relative',
    paddingBottom: 24,
  },
  card: {
    backgroundColor: '#151B2D',
    borderRadius: 12,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  cardHover: {
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
  },
  cardPressed: {
    opacity: 0.95,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: '#F9FAFB',
  },
  subtitle: {
    marginTop: 8,
    color: '#D1D5DB',
    fontSize: 15,
    fontWeight: '500',
  },
  headerUnderline: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 100,
    height: 4,
    borderRadius: 2,
  },
  dashboardCards: {
    gap: 20,
    marginBottom: 32,
  },
  dashboardCard: {
    borderRadius: 16,
    padding: 28,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    overflow: 'hidden',
  },
  dashboardCardBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  dashboardCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  dashboardCardHover: {
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 40,
  },
  dashboardCardPressed: {
    opacity: 0.95,
  },
  cardIcon: {
    fontSize: 52,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 8,
  },
  cardContent: {
    flex: 1,
  },
  cardHeading: {
    marginBottom: 8,
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  cardText: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 21,
  },
  cardArrow: {
    fontSize: 28,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  cardArrowActive: {
    color: '#FFFFFF',
  },
  sectionTitle: {
    color: '#F9FAFB',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  sectionDesc: {
    color: '#9CA3AF',
    marginBottom: 16,
  },
  loadingBlock: {
    backgroundColor: '#1F2937',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  loadingText: {
    color: '#9CA3AF',
  },
});
