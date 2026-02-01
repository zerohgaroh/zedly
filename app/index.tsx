import * as SystemUI from 'expo-system-ui';
import React, { useEffect, useMemo, useState } from 'react';
import { Platform, StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import BottomNav from './components/BottomNav';
import AdminDashboardScreen from './screens/AdminDashboardScreen';
import ChangePasswordScreen from './screens/ChangePasswordScreen';
import LoginScreen from './screens/LoginScreen';
import PlaceholderScreen from './screens/PlaceHolderScreen';
import StudentDashboardScreen from './screens/StudentDashboardScreen';
import StudentHistoryScreen from './screens/StudentHistoryScreen';
import StudentProfileScreen from './screens/StudentProfileScreen';
import { getThemeTokens } from './theme';

type AuthState = {
  token: string | null;
  requirePasswordChange: boolean;
  language: 'ru' | 'uz';
  user: any | null;
  activeRoute: string | null;
};

export default function Index() {
  const [auth, setAuth] = useState<AuthState>({
    token: null,
    requirePasswordChange: false,
    language: 'ru',
    user: null,
    activeRoute: null,
  });
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  const role = auth.user?.role as 'student' | 'teacher' | 'admin' | undefined;

  useEffect(() => {
    const colors = getThemeTokens(theme);
    const targetColor = auth.token && auth.user && !auth.requirePasswordChange ? colors.bgSecondary : colors.bgPrimary;
    SystemUI.setBackgroundColorAsync(targetColor);
  }, [auth.requirePasswordChange, auth.token, auth.user, theme]);

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    try {
      const storage = (globalThis as { localStorage?: Storage }).localStorage;
      const savedTheme = storage?.getItem('theme');
      if (savedTheme === 'light' || savedTheme === 'dark') {
        setTheme(savedTheme);
      }
    } catch (error) {
      // ignore storage errors
    }
  }, []);

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    try {
      const storage = (globalThis as { localStorage?: Storage }).localStorage;
      storage?.setItem('theme', theme);
    } catch (error) {
      // ignore storage errors
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const defaultRouteForRole = (nextRole?: 'student' | 'teacher' | 'admin') => {
    if (nextRole === 'teacher') return 'teacher.dashboard';
    if (nextRole === 'admin') return 'admin.dashboard';
    return 'student.dashboard';
  };

  const logout = () => {
    setAuth({
      token: null,
      requirePasswordChange: false,
      language: auth.language,
      user: null,
      activeRoute: null,
    });
  };

  const screen = useMemo(() => {
    if (!role || !auth.user) return null;

    const route = auth.activeRoute || defaultRouteForRole(role);

    if (role === 'student') {
      if (route === 'student.profile') {
        return (
          <StudentProfileScreen
            user={auth.user}
            language={auth.language}
            theme={theme}
            onToggleTheme={toggleTheme}
          />
        );
      }
      if (route === 'student.history') {
        return (
          <StudentHistoryScreen
            language={auth.language}
            onViewDetails={() => {}}
            theme={theme}
            onToggleTheme={toggleTheme}
          />
        );
      }
      return (
        <StudentDashboardScreen
          user={auth.user}
          language={auth.language}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
      );
    }

    if (role === 'teacher') {
      if (route === 'teacher.profile') {
        return (
          <PlaceholderScreen
            title={auth.language === 'ru' ? 'Профиль' : 'Profil'}
            subtitle={auth.language === 'ru' ? 'Скоро будет доступно' : "Tez orada mavjud bo‘ladi"}
            theme={theme}
            onToggleTheme={toggleTheme}
          />
        );
      }
      if (route === 'teacher.history') {
        return (
          <PlaceholderScreen
            title={auth.language === 'ru' ? 'История' : 'Tarix'}
            subtitle={auth.language === 'ru' ? 'Скоро будет доступно' : "Tez orada mavjud bo‘ladi"}
            theme={theme}
            onToggleTheme={toggleTheme}
          />
        );
      }
      return (
        <PlaceholderScreen
          title={auth.language === 'ru' ? 'Главная' : 'Bosh sahifa'}
          subtitle={auth.language === 'ru' ? 'Скоро будет доступно' : "Tez orada mavjud bo‘ladi"}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
      );
    }

    if (route === 'admin.profile') {
      return (
        <PlaceholderScreen
          title={auth.language === 'ru' ? 'Профиль' : 'Profil'}
          subtitle={auth.language === 'ru' ? 'Скоро будет доступно' : "Tez orada mavjud bo‘ladi"}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
      );
    }
    if (route === 'admin.history') {
      return (
        <PlaceholderScreen
          title={auth.language === 'ru' ? 'История' : 'Tarix'}
          subtitle={auth.language === 'ru' ? 'Скоро будет доступно' : "Tez orada mavjud bo‘ladi"}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
      );
    }
    if (route === 'admin.analytics') return <AdminDashboardScreen user={auth.user} language={auth.language} token={auth.token} initialSection="analytics" theme={theme} onToggleTheme={toggleTheme} />;
    if (route === 'admin.classes') return <AdminDashboardScreen user={auth.user} language={auth.language} token={auth.token} initialSection="classes" theme={theme} onToggleTheme={toggleTheme} />;
    if (route === 'admin.subjects') return <AdminDashboardScreen user={auth.user} language={auth.language} token={auth.token} initialSection="subjects" theme={theme} onToggleTheme={toggleTheme} />;
    if (route === 'admin.passwords') return <AdminDashboardScreen user={auth.user} language={auth.language} token={auth.token} initialSection="passwords" theme={theme} onToggleTheme={toggleTheme} />;
    if (route === 'admin.teacherTests') return <AdminDashboardScreen user={auth.user} language={auth.language} token={auth.token} initialSection="teacherTests" theme={theme} onToggleTheme={toggleTheme} />;

    return <AdminDashboardScreen user={auth.user} language={auth.language} token={auth.token} initialSection="home" theme={theme} onToggleTheme={toggleTheme} />;
  }, [auth.activeRoute, auth.language, auth.user, auth.token, role, theme]);

  return (
    <SafeAreaProvider>
      <StatusBar hidden />
      {auth.token && auth.requirePasswordChange ? (
        <ChangePasswordScreen
          token={auth.token}
          language={auth.language}
          onPasswordChanged={() => setAuth((prev: AuthState) => ({ ...prev, requirePasswordChange: false }))}
        />
      ) : auth.token && auth.user && !auth.requirePasswordChange ? (
        <>
          {screen}
          <BottomNav
            role={role || 'student'}
            language={auth.language}
            activeRoute={auth.activeRoute || defaultRouteForRole(role)}
            onSelect={route => setAuth((prev: AuthState) => ({ ...prev, activeRoute: route }))}
            onToggleLanguage={() =>
              setAuth((prev: AuthState) => ({
                ...prev,
                language: prev.language === 'ru' ? 'uz' : 'ru',
              }))
            }
            onLogout={logout}
            theme={theme}
          />
        </>
      ) : (
        <LoginScreen
          onLoginSuccess={({ token, requirePasswordChange, user, language }) =>
            setAuth((prev: AuthState) => ({
              ...prev,
              token,
              user,
              language,
              requirePasswordChange: Boolean(requirePasswordChange),
              activeRoute: defaultRouteForRole(user?.role),
            }))
          }
        />
      )}
    </SafeAreaProvider>
  );
}
