import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import AppTopBar from '../components/AppTopBar';
import HoverablePressable from '../components/HoverablePressable';
import { getThemeTokens } from '../theme';

type StudentDashboardScreenProps = {
  user: {
    firstName?: string;
    lastName?: string;
    school?: string;
    grade?: string | number;
  };
  language?: 'ru' | 'uz';
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
};

const translations = {
  ru: {
    dashboard: 'Главная',
    myProfile: 'Мой профиль',
    firstName: 'Имя',
    lastName: 'Фамилия',
    school: 'Школа',
    grade: 'Класс',
    availableTests: '📝 Доступные тесты',
    profileStats: 'Профиль и Статистика',
    profileStatsDesc: 'Посмотрите свои результаты',
    subjectTests: 'Тесты по предметам',
    subjectTestsDesc: 'Проверьте свои знания по предметам',
    interestTest: 'Тест на определение интересов',
    interestTestDesc: 'Определите свои способности',
    controlTests: 'Контрольные работы',
    controlTestsDesc: 'Выполните контрольные работы',
  },
  uz: {
    dashboard: 'Bosh sahifa',
    myProfile: 'Mening profilim',
    firstName: 'Ism',
    lastName: 'Familiya',
    school: 'Maktab',
    grade: 'Sinf',
    availableTests: '📝 Mavjud testlar',
    profileStats: 'Profil va Statistika',
    profileStatsDesc: "Natijalaringizni ko'ring",
    subjectTests: 'Fan testlari',
    subjectTestsDesc: "Fanlar bo'yicha bilimingizni tekshiring",
    interestTest: 'Qiziqishlarni aniqlash testi',
    interestTestDesc: "O'z qobiliyatingizni aniqlang",
    controlTests: 'Nazorat isbotlari',
    controlTestsDesc: "O'qituvchining nazorat isbotlarini bajaring",
  },
};

export default function StudentDashboardScreen({
  user,
  language = 'ru',
  theme = 'dark',
  onToggleTheme,
}: StudentDashboardScreenProps) {
  const t = translations[language];
  const colors = getThemeTokens(theme);
  const textPrimary = { color: colors.textPrimary };
  const textSecondary = { color: colors.textSecondary };
  const textMuted = { color: colors.textMuted };
  const surfaceCard = {
    backgroundColor: colors.bgSecondary,
    borderColor: colors.border,
    shadowOpacity: theme === 'light' ? 0.12 : 0.3,
  };
  const surfaceItem = {
    backgroundColor: colors.bgTertiary,
  };

  return (
    <View style={[styles.safeArea, { backgroundColor: colors.bgPrimary }]}>
      <StatusBar hidden />
      <ScrollView contentContainerStyle={styles.container}>
        <AppTopBar theme={theme} onToggleTheme={onToggleTheme} />
        <View style={styles.header}>
          <Text style={[styles.title, textPrimary]}>{t.dashboard}</Text>
          <Text style={[styles.subtitle, textSecondary]}>
            {user.firstName || ''} {user.lastName || ''}
            {user.school ? ` • ${user.school}` : ''}
            {user.grade ? ` • ${user.grade} ${t.grade}` : ''}
          </Text>
          <LinearGradient colors={['#1b3b6f', '#2b59c3']} style={styles.headerUnderline} />
        </View>

        <View style={styles.infoSection}>
          <HoverablePressable
            style={[styles.card, surfaceCard]}
            hoverStyle={styles.cardHover}
            pressedStyle={styles.cardPressed}
            hoverScale={1}
            hoverTranslateY={-4}
          >
            {() => (
              <>
                <Text style={[styles.cardTitle, textPrimary]}>👤 {t.myProfile}</Text>
                <View style={styles.infoGrid}>
                  <View style={[styles.infoItem, surfaceItem]}>
                    <Text style={[styles.infoLabel, textMuted]}>{t.firstName}</Text>
                    <Text style={[styles.infoValue, textPrimary]}>{user.firstName || '-'}</Text>
                  </View>
                  <View style={[styles.infoItem, surfaceItem]}>
                    <Text style={[styles.infoLabel, textMuted]}>{t.lastName}</Text>
                    <Text style={[styles.infoValue, textPrimary]}>{user.lastName || '-'}</Text>
                  </View>
                  <View style={[styles.infoItem, surfaceItem]}>
                    <Text style={[styles.infoLabel, textMuted]}>{t.school}</Text>
                    <Text style={[styles.infoValue, textPrimary]}>{user.school || '-'}</Text>
                  </View>
                  <View style={[styles.infoItem, surfaceItem]}>
                    <Text style={[styles.infoLabel, textMuted]}>{t.grade}</Text>
                    <Text style={[styles.infoValue, styles.gradeValue, textPrimary]}>{user.grade ?? '-'}</Text>
                  </View>
                </View>
              </>
            )}
          </HoverablePressable>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, textPrimary]}>{t.availableTests}</Text>
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
              key: 'subjects',
              icon: '📚',
              title: t.subjectTests,
              description: t.subjectTestsDesc,
              gradient: ['#151B2D', '#1F2937'] as const,
            },
            {
              key: 'interest',
              icon: '🎯',
              title: t.interestTest,
              description: t.interestTestDesc,
              gradient: ['#151B2D', '#1F2937'] as const,
            },
            {
              key: 'control',
              icon: '✏️',
              title: t.controlTests,
              description: t.controlTestsDesc,
              gradient: ['#151B2D', '#1F2937'] as const,
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
                  <LinearGradient colors={[colors.primary, colors.accent]} style={styles.dashboardCardTopLine} />
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
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: '#F9FAFB',
    letterSpacing: -0.5,
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
  infoSection: {
    marginBottom: 48,
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
  cardTitle: {
    color: '#F9FAFB',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  infoItem: {
    backgroundColor: '#1F2937',
    borderRadius: 8,
    padding: 16,
    minWidth: 160,
    flexGrow: 1,
  },
  infoLabel: {
    color: '#9CA3AF',
    textTransform: 'uppercase',
    fontSize: 12,
    letterSpacing: 0.5,
    fontWeight: '600',
  },
  infoValue: {
    color: '#F9FAFB',
    fontWeight: '600',
    fontSize: 16,
  },
  gradeValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  sectionHeader: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#F9FAFB',
    fontSize: 24,
    fontWeight: '600',
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
  dashboardCardTopLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
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
    color: '#F9FAFB',
    fontSize: 19,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  cardText: {
    color: '#D1D5DB',
    fontSize: 14,
    lineHeight: 21,
  },
  cardArrow: {
    fontSize: 28,
    color: '#9CA3AF',
  },
  cardArrowActive: {
    color: '#1B3B6F',
  },
});
