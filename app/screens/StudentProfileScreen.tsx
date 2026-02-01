import React, { useMemo } from 'react';
import { Pressable, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import AppTopBar from '../components/AppTopBar';
import { getThemeTokens } from '../theme';

type StudentProfileScreenProps = {
  user: {
    firstName?: string;
    lastName?: string;
    school?: string;
    grade?: string | number;
    username?: string;
  };
  language?: 'ru' | 'uz';
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
};

const translations = {
  ru: {
    title: 'Мой Профиль',
    subtitle: 'Личная информация и статистика',
    info: 'Личная информация',
    firstName: 'Имя',
    lastName: 'Фамилия',
    school: 'Школа',
    grade: 'Класс',
    username: 'Логин',
    interests: 'Профиль интересов',
    interestsEmpty: 'Тест интересов не пройден',
  },
  uz: {
    title: 'Mening Profilim',
    subtitle: "Shaxsiy ma'lumotlar va statistika",
    info: "Shaxsiy ma'lumotlar",
    firstName: 'Ism',
    lastName: 'Familiya',
    school: 'Maktab',
    grade: 'Sinf',
    username: 'Login',
    interests: 'Qiziqishlar profili',
    interestsEmpty: "Qiziqishlar testi topshirilmagan",
  },
};

const interestMock = [
  { key: 'math', labelRu: 'Математика', labelUz: 'Matematika', value: 82 },
  { key: 'science', labelRu: 'Наука', labelUz: 'Fan', value: 66 },
  { key: 'tech', labelRu: 'Технологии', labelUz: 'Texnologiya', value: 58 },
  { key: 'art', labelRu: 'Искусство', labelUz: "San'at", value: 44 },
];

export default function StudentProfileScreen({
  user,
  language = 'ru',
  theme = 'dark',
  onToggleTheme,
}: StudentProfileScreenProps) {
  const t = translations[language];
  const interestData = useMemo(() => interestMock, []);
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
          <View>
            <Text style={[styles.pageTitle, textPrimary]}>{t.title}</Text>
            <Text style={[styles.pageSubtitle, textSecondary]}>{t.subtitle}</Text>
          </View>
        </View>

        <View style={[styles.profileCard, surfaceCard]}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>👤</Text>
          </View>
          <View style={styles.profileMeta}>
            <Text style={[styles.profileName, textPrimary]}>{user.firstName || ''} {user.lastName || ''}</Text>
            <Text style={[styles.profileSub, textSecondary]}>
              {user.school || '—'} • {user.grade || '—'} {t.grade}
            </Text>
            {user.username ? <Text style={[styles.profileSub, textMuted]}>@{user.username}</Text> : null}
          </View>
        </View>

        <View style={[styles.sectionCard, surfaceCard]}>
          <Text style={[styles.sectionTitle, textPrimary]}>{t.info}</Text>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, textMuted]}>{t.firstName}</Text>
            <Text style={[styles.infoValue, textPrimary]}>{user.firstName || '—'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, textMuted]}>{t.lastName}</Text>
            <Text style={[styles.infoValue, textPrimary]}>{user.lastName || '—'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, textMuted]}>{t.school}</Text>
            <Text style={[styles.infoValue, textPrimary]}>{user.school || '—'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, textMuted]}>{t.grade}</Text>
            <Text style={[styles.infoValue, textPrimary]}>{user.grade || '—'}</Text>
          </View>
          {user.username ? (
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, textMuted]}>{t.username}</Text>
              <Text style={[styles.infoValue, textPrimary]}>@{user.username}</Text>
            </View>
          ) : null}
        </View>

        <View style={[styles.sectionCard, surfaceCard]}>
          <Text style={[styles.sectionTitle, textPrimary]}>{t.interests}</Text>
          {interestData.length === 0 ? (
            <Text style={[styles.emptyText, textSecondary]}>{t.interestsEmpty}</Text>
          ) : (
            <View style={styles.interestGrid}>
              {interestData.map(item => (
                <View key={item.key} style={[styles.interestCard, surfaceAlt]}>
                  <Text style={[styles.interestValue, textPrimary]}>{item.value}%</Text>
                  <Text style={[styles.interestLabel, textSecondary]}>{language === 'ru' ? item.labelRu : item.labelUz}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        <Pressable style={styles.secondaryButton} onPress={() => {}}>
          <Text style={styles.secondaryButtonText}>{language === 'ru' ? 'Скоро будет доступно' : "Tez orada mavjud bo‘ladi"}</Text>
        </Pressable>
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
  profileCard: {
    backgroundColor: '#151B2D',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#374151',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 28,
  },
  profileMeta: {
    flex: 1,
  },
  profileName: {
    color: '#F9FAFB',
    fontSize: 18,
    fontWeight: '700',
  },
  profileSub: {
    color: '#D1D5DB',
    marginTop: 4,
    fontSize: 12,
  },
  sectionCard: {
    backgroundColor: '#151B2D',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#374151',
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#F9FAFB',
    fontWeight: '700',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  infoLabel: {
    color: '#9CA3AF',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    color: '#F9FAFB',
    fontWeight: '600',
  },
  interestGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  interestCard: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#1F2937',
    minWidth: 120,
    alignItems: 'center',
  },
  interestValue: {
    color: '#F9FAFB',
    fontSize: 18,
    fontWeight: '700',
  },
  interestLabel: {
    color: '#9CA3AF',
    fontSize: 12,
    marginTop: 4,
  },
  emptyText: {
    color: '#9CA3AF',
    textAlign: 'center',
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#374151',
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: '600',
  },
});
