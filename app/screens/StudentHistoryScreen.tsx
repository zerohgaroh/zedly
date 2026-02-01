import React, { useMemo } from 'react';
import { Pressable, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import AppTopBar from '../components/AppTopBar';
import { getThemeTokens } from '../theme';

type HistoryItem = {
  id: string;
  testName: string;
  completedAt: string;
  timeTaken: number;
  correctCount: number;
  totalCount: number;
};

type StudentHistoryScreenProps = {
  language?: 'ru' | 'uz';
  onViewDetails?: (id: string) => void;
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
};

const translations = {
  ru: {
    title: 'История тестов',
    subtitle: 'Список всех пройденных тестов',
    time: 'Время',
    details: 'Подробно',
    empty: 'Тесты еще не найдены',
    start: 'Пройти тест',
  },
  uz: {
    title: 'Testlar tarixi',
    subtitle: "Barcha tugatilgan testlarning ro'yxati",
    time: 'Vaqt',
    details: 'Batafsil',
    empty: 'Hali testlar topilmadi',
    start: 'Testni boshlash',
  },
};

const mockHistory: HistoryItem[] = [
  {
    id: 'r1',
    testName: 'Алгебра • Модуль 1',
    completedAt: new Date().toISOString(),
    timeTaken: 900,
    correctCount: 16,
    totalCount: 20,
  },
  {
    id: 'r2',
    testName: 'Физика • Введение',
    completedAt: new Date(Date.now() - 86400000).toISOString(),
    timeTaken: 720,
    correctCount: 10,
    totalCount: 20,
  },
];

export default function StudentHistoryScreen({
  language = 'ru',
  onViewDetails,
  theme = 'dark',
  onToggleTheme,
}: StudentHistoryScreenProps) {
  const t = translations[language];
  const data = useMemo(() => mockHistory, []);
  const colors = getThemeTokens(theme);
  const textPrimary = { color: colors.textPrimary };
  const textSecondary = { color: colors.textSecondary };
  const textMuted = { color: colors.textMuted };
  const surfaceCard = { backgroundColor: colors.bgSecondary, borderColor: colors.border };
  const surfaceAlt = { backgroundColor: colors.bgTertiary, borderColor: colors.border };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.bgPrimary }]}>
      <StatusBar barStyle={theme === 'light' ? 'dark-content' : 'light-content'} />
      <ScrollView contentContainerStyle={styles.container}>
        <AppTopBar theme={theme} onToggleTheme={onToggleTheme} />
        <View style={styles.pageHeader}>
          <Text style={[styles.pageTitle, textPrimary]}>{t.title}</Text>
          <Text style={[styles.pageSubtitle, textSecondary]}>{t.subtitle}</Text>
        </View>

        {data.length === 0 ? (
          <View style={[styles.emptyCard, surfaceCard]}>
            <Text style={[styles.emptyText, textSecondary]}>{t.empty}</Text>
            <Pressable style={styles.primaryButton} onPress={() => {}}>
              <Text style={styles.primaryButtonText}>{t.start}</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.list}>
            {data.map(item => {
              const percentage = Math.round((item.correctCount / item.totalCount) * 100);
              const statusColor = percentage >= 70 ? '#10b981' : percentage >= 50 ? '#f59e0b' : '#ef4444';
              const date = new Date(item.completedAt);
              const dateStr = date.toLocaleDateString(language === 'uz' ? 'uz' : 'ru');
              const timeStr = date.toLocaleTimeString(language === 'uz' ? 'uz' : 'ru');

              return (
                <View key={item.id} style={[styles.historyCard, surfaceCard]}>
                  <View style={styles.historyInfo}>
                    <Text style={[styles.historyTitle, textPrimary]}>{item.testName}</Text>
                    <Text style={[styles.historyMeta, textSecondary]}>📅 {dateStr} {timeStr}</Text>
                    <Text style={[styles.historyMeta, textMuted]}>⏱️ {t.time}: {Math.floor(item.timeTaken / 60)} {language === 'uz' ? 'daqiqa' : 'мин'}</Text>
                  </View>
                  <View style={styles.historyRight}>
                    <View style={[styles.scoreBox, surfaceAlt]}>
                      <Text style={[styles.scoreValue, { color: statusColor }]}>{item.correctCount}/{item.totalCount}</Text>
                      <Text style={[styles.scorePercent, { color: statusColor }]}>{percentage}%</Text>
                    </View>
                    <Pressable
                      style={styles.secondaryButton}
                      onPress={() => onViewDetails?.(item.id)}
                    >
                      <Text style={styles.secondaryButtonText}>{t.details}</Text>
                    </Pressable>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
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
  pageHeader: {
    marginBottom: 16,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#F9FAFB',
  },
  pageSubtitle: {
    marginTop: 6,
    color: '#9CA3AF',
  },
  list: {
    gap: 12,
  },
  historyCard: {
    backgroundColor: '#151B2D',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#374151',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  historyInfo: {
    flex: 1,
  },
  historyTitle: {
    color: '#F9FAFB',
    fontWeight: '700',
    marginBottom: 6,
  },
  historyMeta: {
    color: '#9CA3AF',
    fontSize: 12,
    marginBottom: 4,
  },
  historyRight: {
    alignItems: 'flex-end',
    gap: 10,
  },
  scoreBox: {
    alignItems: 'flex-end',
  },
  scoreValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  scorePercent: {
    fontSize: 12,
    fontWeight: '600',
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#374151',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  secondaryButtonText: {
    color: '#D1D5DB',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyCard: {
    backgroundColor: '#151B2D',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#374151',
    alignItems: 'center',
    gap: 12,
  },
  emptyText: {
    color: '#9CA3AF',
  },
  primaryButton: {
    backgroundColor: '#1b3b6f',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
