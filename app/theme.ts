export type ThemeMode = 'dark' | 'light';

type ThemeTokens = {
  bgPrimary: string;
  bgSecondary: string;
  bgTertiary: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  primary: string;
  accent: string;
};

export const getThemeTokens = (theme: ThemeMode): ThemeTokens => {
  if (theme === 'light') {
    return {
      bgPrimary: '#F5F7FA',
      bgSecondary: '#FFFFFF',
      bgTertiary: '#F0F3F8',
      textPrimary: '#0F172A',
      textSecondary: '#334155',
      textMuted: '#64748B',
      border: '#D4DAEA',
      primary: '#1b3b6f',
      accent: '#2b59c3',
    };
  }

  return {
    bgPrimary: '#0A0E1A',
    bgSecondary: '#151B2D',
    bgTertiary: '#1F2937',
    textPrimary: '#F9FAFB',
    textSecondary: '#D1D5DB',
    textMuted: '#9CA3AF',
    border: '#374151',
    primary: '#1b3b6f',
    accent: '#2b59c3',
  };
};
