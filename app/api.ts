import Constants from 'expo-constants';
import { Platform } from 'react-native';

let apiOfflineUntil = 0;

const getWebOrigin = () => {
  if (Platform.OS !== 'web') return null;
  if (typeof window === 'undefined') return null;
  return window.location?.origin || null;
};

const getDevHost = () => {
  const hostUri = Constants.expoConfig?.hostUri || (Constants as any)?.manifest?.debuggerHost;
  if (!hostUri) return null;
  return hostUri.split(':')[0];
};

const unique = (values: Array<string | null | undefined>) => {
  const set = new Set<string>();
  values.filter(Boolean).forEach(value => set.add(String(value)));
  return Array.from(set);
};

export const getApiBaseUrl = () => {
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envUrl) {
    return envUrl.replace(/\/$/, '');
  }

  const webOrigin = getWebOrigin();
  if (webOrigin) {
    return webOrigin;
  }

  const devHost = getDevHost();

  if (Platform.OS === 'android') {
    if (Constants.isDevice && devHost) {
      return `http://${devHost}:8083`;
    }
    return 'http://10.0.2.2:8083';
  }

  if (devHost) {
    return `http://${devHost}:8083`;
  }

  return 'http://localhost:8083';
};

const getCandidateBaseUrls = () => {
  const envUrl = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '');
  const webOrigin = getWebOrigin();
  const devHost = getDevHost();

  const devHost8083 = devHost ? `http://${devHost}:8083` : null;
  const devHost5001 = devHost ? `http://${devHost}:5001` : null;
  const androidEmulator8083 = 'http://10.0.2.2:8083';
  const androidEmulator5001 = 'http://10.0.2.2:5001';
  const localhost8083 = 'http://localhost:8083';
  const localhost5001 = 'http://localhost:5001';
  const loopback8083 = 'http://127.0.0.1:8083';
  const loopback5001 = 'http://127.0.0.1:5001';

  if (envUrl) return unique([envUrl]);

  if (Platform.OS === 'web') {
    return unique([webOrigin, localhost8083, localhost5001, loopback8083, loopback5001, devHost8083, devHost5001]);
  }

  if (Platform.OS === 'android') {
    return unique([devHost8083, devHost5001, androidEmulator8083, androidEmulator5001, localhost8083, localhost5001]);
  }

  return unique([devHost8083, devHost5001, localhost8083, localhost5001]);
};

export const apiRequest = async (path: string, options: RequestInit = {}) => {
  if (apiOfflineUntil && Date.now() < apiOfflineUntil) {
    return { success: false, error: 'Backend unavailable' } as const;
  }

  const isAbsolute = /^https?:\/\//i.test(path);
  const baseUrls = isAbsolute ? [null] : getCandidateBaseUrls();

  for (const baseUrl of baseUrls) {
    const url = isAbsolute ? path : `${baseUrl}${path}`;
    try {
      const response = await fetch(url, options);
      const text = await response.text();
      let data: any = null;
      try {
        data = text ? JSON.parse(text) : null;
      } catch (parseError) {
        data = null;
      }

      if (!response.ok) {
        return { success: false, error: data?.error || data?.message || text || 'Request failed' } as const;
      }

      return { success: true, data: data ?? text } as const;
    } catch (error) {
      continue;
    }
  }

  apiOfflineUntil = Date.now() + 5000;
  return { success: false, error: 'Network error' } as const;
};
