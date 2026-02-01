import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Image,
    Platform,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    useWindowDimensions,
    View,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { apiRequest } from '../api';
import AlertBox from '../components/AlertBox';
import HoverablePressable from '../components/HoverablePressable';

type Role = 'student' | 'teacher' | 'admin';

type LoginScreenProps = {
  onLoginSuccess?: (payload: {
    user: any;
    token: string;
    requirePasswordChange?: boolean;
    language: 'ru' | 'uz'; 
  }) => void;
};


const translations = {
  ru: {
    appName: 'ZEDLY',
    selectRole: 'Выберите роль',
    selectRoleHint: 'Выберите свою роль',
    loginAsStudent: 'Войти как Ученик',
    loginAsTeacher: 'Войти как Учитель',
    loginAsAdmin: 'Войти как Администратор',
    back: 'Назад',
    username: 'Логин',
    password: 'Пароль',
    login: 'Вход',
    loading: 'Загрузка...',
    enterCredentials: 'Введите данные для входа',
    errorEmptyFields: 'Заполните логин и пароль',
    success: 'Успешно',
    needChangePassword: 'Нужно сменить временный пароль',
    changeLanguage: 'RU | UZ',
  },
  uz: {
    appName: 'ZEDLY',
    selectRole: 'Rolni tanlang',
    selectRoleHint: 'Rolingizni tanlang',
    loginAsStudent: "O'quvchi sifatida kirish",
    loginAsTeacher: "O'qituvchi sifatida kirish",
    loginAsAdmin: 'Administrator sifatida kirish',
    back: 'Orqaga',
    username: 'Login',
    password: 'Parol',
    login: 'Kirish',
    loading: 'Yuklanmoqda...',
    enterCredentials: "Kirish ma'lumotlaringizni kiriting",
    errorEmptyFields: "Login va parolni kiriting",
    success: 'Muvaffaqiyatli',
    needChangePassword: 'Vaqtinchalik parolni o‘zgartirish kerak',
    changeLanguage: 'RU | UZ',
  },
};

const roleConfig: Record<Role, { icon: string; titleKey: keyof typeof translations.ru }> = {
  student: { icon: '👨‍🎓', titleKey: 'loginAsStudent' },
  teacher: { icon: '👨‍🏫', titleKey: 'loginAsTeacher' },
  admin: { icon: '👨‍💼', titleKey: 'loginAsAdmin' },
};


export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 360;
  const logoAsset = useMemo(() => require('../../assets/images/zedly_logo_bg.png'), []);
  const [language, setLanguage] = useState<'ru' | 'uz'>('ru');
  const [role, setRole] = useState<Role | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const t = translations[language];
  const messageVariant = useMemo(
    () => (/ошиб|xato|error/i.test(message) ? 'error' : 'success'),
    [message]
  );

  useEffect(() => {
    if (Platform.OS === 'web') {
      return;
    }
    const source = Image.resolveAssetSource(logoAsset);
    if (source?.uri) {
      Image.prefetch(source.uri);
    }
  }, [logoAsset]);


  const toggleLanguage = () => {
    setLanguage(prev => (prev === 'ru' ? 'uz' : 'ru'));
  };

  const handleLogin = async () => {
    if (!role) return;
    setError('');
    setMessage('');

    if (!username.trim() || !password.trim()) {
      setError(t.errorEmptyFields);
      return;
    }

    setLoading(true);

    try {
      const result = await apiRequest('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password, role }),
      });

      if (!result.success) {
        setError(result.error || 'Login failed');
        setLoading(false);
        return;
      }

      const data = result.data;
      const requirePasswordChange = data.requirePasswordChange || data?.user?.isTemporaryPassword;
      if (requirePasswordChange) {
        setMessage(t.needChangePassword);
      } else {
        setMessage(t.success);
      }

      onLoginSuccess?.({ user: data.user, token: data.token, requirePasswordChange, language });
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.screen}>
      <LinearGradient
        colors={['#0A0E1A', '#1e293b', '#1e3a8a', '#0A0E1A']}
        style={StyleSheet.absoluteFillObject}
      />
      <View pointerEvents="none" style={styles.glowTop} />
      <View pointerEvents="none" style={styles.glowBottom} />
      <StatusBar hidden />
      <KeyboardAwareScrollView
        contentInsetAdjustmentBehavior="never"
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        showsVerticalScrollIndicator={false}
        enableOnAndroid
        enableAutomaticScroll
        extraScrollHeight={24}
        extraHeight={24}
        keyboardOpeningTime={0}
        style={styles.safeArea}
      >
          <Image
            source={logoAsset}
            style={styles.logoPreload}
            resizeMode="contain"
            fadeDuration={0}
            defaultSource={logoAsset}
          />
          <HoverablePressable
            style={[styles.langButton, isSmallScreen && styles.langButtonSmall]}
            hoverStyle={styles.langButtonHover}
            pressedStyle={styles.langButtonPressed}
            hoverScale={1}
            hoverTranslateY={-2}
            onPress={toggleLanguage}
          >
            {({ hovered, pressed }) => (
              <Text
                style={[
                  styles.langButtonText,
                  isSmallScreen && styles.langButtonTextSmall,
                  (hovered || pressed) && styles.langButtonTextPressed,
                ]}
              >
                {t.changeLanguage}
              </Text>
            )}
          </HoverablePressable>

          <View style={[styles.card, isSmallScreen && styles.cardSmall]}>
          {!role && (
            <>
              <View style={[styles.header, isSmallScreen && styles.headerSmall]}>
                <Image
                  source={logoAsset}
                  style={[styles.logo, isSmallScreen && styles.logoSmall]}
                  resizeMode="contain"
                  fadeDuration={0}
                  defaultSource={logoAsset}
                />
                <Text style={[styles.brand, isSmallScreen && styles.brandSmall]}>{t.appName}</Text>
                <Text style={[styles.title, isSmallScreen && styles.titleSmall]}>{t.selectRole}</Text>
                <Text style={[styles.subtitle, isSmallScreen && styles.subtitleSmall]}>{t.selectRoleHint}</Text>
              </View>

              <View style={[styles.roleList, isSmallScreen && styles.roleListSmall]}>
                {(Object.keys(roleConfig) as Role[]).map(item => (
                  <HoverablePressable
                    key={item}
                    style={[styles.roleCard, isSmallScreen && styles.roleCardSmall]}
                    hoverStyle={styles.roleCardHover}
                    pressedStyle={styles.roleCardPressed}
                    hoverScale={1}
                    hoverTranslateY={-4}
                    onPress={() => setRole(item)}
                  >
                    {() => (
                      <>
                        <Text style={[styles.roleIcon, isSmallScreen && styles.roleIconSmall]}>
                          {roleConfig[item].icon}
                        </Text>
                        <Text style={[styles.roleTitle, isSmallScreen && styles.roleTitleSmall]}>
                          {t[roleConfig[item].titleKey]}
                        </Text>
                      </>
                    )}
                  </HoverablePressable>
                ))}
              </View>

            </>
          )}

          {role && (
            <>
              <HoverablePressable
                style={styles.backButton}
                hoverStyle={styles.backButtonHover}
                pressedStyle={styles.backButtonPressed}
                hoverScale={1}
                hoverTranslateY={0}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                onPress={() => setRole(null)}
              >
                {({ hovered, pressed }) => (
                  <Text style={[styles.backButtonText, (hovered || pressed) && styles.backButtonTextHover]}>
                    ← {t.back}
                  </Text>
                )}
              </HoverablePressable>

              <View style={[styles.header, isSmallScreen && styles.headerSmall]}>
                <Text style={[styles.roleBadge, isSmallScreen && styles.roleBadgeSmall]}>
                  {roleConfig[role].icon}
                </Text>
                <Text style={[styles.title, isSmallScreen && styles.titleSmall]}>
                  {t[roleConfig[role].titleKey]}
                </Text>
                <Text style={[styles.subtitle, isSmallScreen && styles.subtitleSmall]}>
                  {t.enterCredentials}
                </Text>
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
                <Text style={[styles.label, isSmallScreen && styles.labelSmall]}>{t.username}</Text>
                <TextInput
                  value={username}
                  onChangeText={setUsername}
                  placeholder={t.username}
                  placeholderTextColor="#9CA3AF"
                  autoCapitalize="none"
                  style={[styles.input, isSmallScreen && styles.inputSmall]}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, isSmallScreen && styles.labelSmall]}>{t.password}</Text>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder={t.password}
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry
                  style={[styles.input, isSmallScreen && styles.inputSmall]}
                />
              </View>

              <HoverablePressable
                style={[styles.loginButton, isSmallScreen && styles.loginButtonSmall]}
                hoverStyle={styles.loginButtonHover}
                pressedStyle={styles.loginButtonPressed}
                hoverScale={1}
                hoverTranslateY={-2}
                onPress={handleLogin}
                disabled={loading}
              >
                {() => (
                  <LinearGradient
                    colors={['#1b3b6f', '#2b59c3']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[styles.loginButtonGradient, isSmallScreen && styles.loginButtonGradientSmall]}
                  >
                    {loading ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <Text style={[styles.loginButtonText, isSmallScreen && styles.loginButtonTextSmall]}>
                        {t.login}
                      </Text>
                    )}
                  </LinearGradient>
                )}
              </HoverablePressable>
            </>
          )}
          </View>
      </KeyboardAwareScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#0A0E1A',
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
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 24,
    justifyContent: 'center',
  },
  langButton: {
    alignSelf: 'flex-end',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#4b6ea8',
    marginBottom: 16,
    backgroundColor: 'transparent',
  },
  langButtonHover: {
    backgroundColor: '#1b3b6f',
    borderColor: '#4b6ea8',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
  },
  langButtonPressed: {
    backgroundColor: '#1b3b6f',
    borderColor: '#4b6ea8',
    opacity: 0.9,
  },
  langButtonText: {
    color: '#2b59c3',
    fontWeight: '700',
    letterSpacing: 1,
    fontSize: 13,
  },
  langButtonTextPressed: {
    color: '#FFFFFF',
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
  cardSmall: {
    padding: 28,
    borderRadius: 18,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  headerSmall: {
    marginBottom: 20,
  },
  brand: {
    fontSize: 26,
    fontWeight: '800',
    color: '#F9FAFB',
    letterSpacing: 3,
    marginBottom: 8,
  },
  logo: {
    width: 84,
    height: 84,
    marginBottom: 12,
  },
  logoPreload: {
    width: 1,
    height: 1,
    opacity: 0,
  },
  logoSmall: {
    width: 64,
    height: 64,
    marginBottom: 10,
  },
  brandSmall: {
    fontSize: 22,
    letterSpacing: 2,
    marginBottom: 6,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: '#F9FAFB',
    textAlign: 'center',
  },
  titleSmall: {
    fontSize: 24,
  },
  subtitle: {
    fontSize: 14,
    color: '#D1D5DB',
    marginTop: 6,
    textAlign: 'center',
  },
  subtitleSmall: {
    fontSize: 13,
  },
  roleList: {
    gap: 16,
    marginBottom: 24,
  },
  roleListSmall: {
    gap: 12,
    marginBottom: 18,
  },
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#374151',
    backgroundColor: '#1F2937',
  },
  roleCardSmall: {
    padding: 18,
    gap: 12,
  },
  roleCardHover: {
    borderColor: '#1b3b6f',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
  },
  roleCardPressed: {
    borderColor: '#1b3b6f',
    opacity: 0.9,
  },
  roleIcon: {
    fontSize: 40,
  },
  roleIconSmall: {
    fontSize: 32,
  },
  roleTitle: {
    color: '#F9FAFB',
    fontWeight: '600',
    fontSize: 18,
    flexShrink: 1,
  },
  roleTitleSmall: {
    fontSize: 16,
    flexShrink: 1,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    minHeight: 44,
    borderRadius: 10,
    backgroundColor: 'rgba(27, 59, 111, 0.08)',
  },
  backButtonHover: {
    transform: [{ translateX: -4 }],
  },
  backButtonPressed: {
    opacity: 0.85,
  },
  backButtonText: {
    color: '#1b3b6f',
    fontWeight: '600',
    fontSize: 16,
  },
  backButtonTextHover: {
    color: '#4b6ea8',
  },
  roleBadge: {
    fontSize: 64,
    marginBottom: 15,
  },
  roleBadgeSmall: {
    fontSize: 52,
    marginBottom: 10,
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
  labelSmall: {
    fontSize: 12,
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
  inputSmall: {
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  loginButton: {
    marginTop: 8,
    borderRadius: 8,
    alignItems: 'center',
    overflow: 'hidden',
  },
  loginButtonHover: {
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
  },
  loginButtonPressed: {
    opacity: 0.9,
  },
  loginButtonGradient: {
    width: '100%',
    paddingVertical: 18,
    paddingHorizontal: 36,
    alignItems: 'center',
  },
  loginButtonGradientSmall: {
    paddingVertical: 16,
    paddingHorizontal: 28,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  loginButtonTextSmall: {
    fontSize: 15,
  },
  langButtonSmall: {
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  langButtonTextSmall: {
    fontSize: 12,
  },
  loginButtonSmall: {
    marginTop: 6,
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
