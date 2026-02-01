import { LinearGradient } from 'expo-linear-gradient';
import React, { useMemo, useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { apiRequest } from '../api';
import AlertBox from '../components/AlertBox';
import HoverablePressable from '../components/HoverablePressable';

type ChangePasswordScreenProps = {
  token: string;
  language?: 'ru' | 'uz';
  onPasswordChanged?: () => void;
};

const translations = {
  ru: {
    title: 'Сменить пароль',
    subtitle: 'Вы должны сменить временный пароль',
    currentPassword: 'Текущий пароль',
    newPassword: 'Новый пароль',
    confirmPassword: 'Подтвердите пароль',
    save: 'Сохранить',
    loading: 'Загрузка...',
    errorEmpty: 'Заполните все поля',
    errorMismatch: 'Пароли не совпадают',
    success: 'Пароль обновлён',
    back: 'Назад',
  },
  uz: {
    title: 'Parolni o‘zgartirish',
    subtitle: 'Vaqtinchalik parolni o‘zgartirishingiz kerak',
    currentPassword: 'Joriy parol',
    newPassword: 'Yangi parol',
    confirmPassword: 'Parolni tasdiqlang',
    save: 'Saqlash',
    loading: 'Yuklanmoqda...',
    errorEmpty: 'Barcha maydonlarni to‘ldiring',
    errorMismatch: 'Parollar mos emas',
    success: 'Parol yangilandi',
    back: 'Orqaga',
  },
};


export default function ChangePasswordScreen({ token, language = 'ru', onPasswordChanged }: ChangePasswordScreenProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const t = translations[language];
  const messageVariant = useMemo(
    () => (/ошиб|xato|error/i.test(message) ? 'error' : 'success'),
    [message]
  );

  const handleSave = async () => {
    setError('');
    setMessage('');

    if (!currentPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      setError(t.errorEmpty);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(t.errorMismatch);
      return;
    }

    setLoading(true);

    try {
      const result = await apiRequest('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (!result.success) {
        setError(result.error || 'Password change failed');
        setLoading(false);
        return;
      }

      setMessage(t.success);
      onPasswordChanged?.();
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#1e293b', '#334155', '#1e3a8a']} style={styles.screen}>
      <View pointerEvents="none" style={styles.glowTop} />
      <View pointerEvents="none" style={styles.glowBottom} />
      <View style={styles.safeArea}>
        <StatusBar hidden />
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={styles.card}>
            <View style={styles.header}>
              <Text style={styles.title}>{t.title}</Text>
              <Text style={styles.subtitle}>{t.subtitle}</Text>
            </View>
          {error ? (
            <AlertBox
              variant="error"
              message={error}
              theme="dark"
              onClose={() => setError('')}
            />
          ) : null}
          {message ? (
            <AlertBox
              variant={messageVariant}
              message={message}
              theme="dark"
              onClose={() => setMessage('')}
            />
          ) : null}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t.currentPassword}</Text>
            <TextInput
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder={t.currentPassword}
              placeholderTextColor="#9CA3AF"
              secureTextEntry
              style={styles.input}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t.newPassword}</Text>
            <TextInput
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder={t.newPassword}
              placeholderTextColor="#9CA3AF"
              secureTextEntry
              style={styles.input}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t.confirmPassword}</Text>
            <TextInput
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder={t.confirmPassword}
              placeholderTextColor="#9CA3AF"
              secureTextEntry
              style={styles.input}
            />
          </View>

            <HoverablePressable
              style={styles.saveButton}
              hoverStyle={styles.saveButtonHover}
              pressedStyle={styles.saveButtonPressed}
              hoverScale={1}
              hoverTranslateY={-2}
              onPress={handleSave}
              disabled={loading}
            >
              {() => (
                <LinearGradient
                  colors={['#1b3b6f', '#2b59c3']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.saveButtonGradient}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.saveButtonText}>{t.save}</Text>
                  )}
                </LinearGradient>
              )}
            </HoverablePressable>
          </View>
        </ScrollView>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  glowTop: {
    position: 'absolute',
    width: 800,
    height: 800,
    borderRadius: 400,
    backgroundColor: 'rgba(59, 130, 246, 0.08)',
    top: -400,
    right: -400,
  },
  glowBottom: {
    position: 'absolute',
    width: 600,
    height: 600,
    borderRadius: 300,
    backgroundColor: 'rgba(99, 102, 241, 0.06)',
    bottom: -300,
    left: -300,
  },
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  container: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#151B2D',
    borderRadius: 20,
    padding: 40,
    borderWidth: 1,
    borderColor: '#374151',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 60,
    elevation: 12,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: '#F9FAFB',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#D1D5DB',
    marginTop: 6,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    color: '#D1D5DB',
    marginBottom: 8,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontSize: 13,
  },
  input: {
    borderWidth: 2,
    borderColor: '#374151',
    borderRadius: 8,
    paddingHorizontal: 18,
    paddingVertical: 14,
    color: '#F9FAFB',
    backgroundColor: '#1F2937',
  },
  saveButton: {
    marginTop: 8,
    borderRadius: 8,
    alignItems: 'center',
    overflow: 'hidden',
  },
  saveButtonGradient: {
    width: '100%',
    paddingVertical: 18,
    paddingHorizontal: 36,
    alignItems: 'center',
  },
  saveButtonHover: {
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
  },
  saveButtonPressed: {
    opacity: 0.9,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 17,
  },
  errorText: {
    color: '#F87171',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: '#EF4444',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
  },
  successText: {
    color: '#34D399',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 1,
    borderColor: '#10B981',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
  },
});
