import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.organizer1st.app',
  appName: 'Organizer1st',
  webDir: 'capacitor-public',
  // Load the deployed web app in the native shell
  server: {
    url: process.env.CAPACITOR_SERVER_URL || 'https://organizer1st.fly.dev',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      androidScaleType: 'CENTER_CROP',
      splashFullScreen: true,
      splashImmersive: true,
    },
    Keyboard: {
      resize: 'body',
      resizeOnFullScreen: true,
    },
    StatusBar: {
      style: 'dark',
    },
  },
};

export default config;
