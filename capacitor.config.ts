import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'de.deutschlandrechner.app',
  appName: 'Deutschlandrechner',
  webDir: 'dist',
  server: {
    // Für Development: lädt von der Live-Website statt lokalen Assets
    // url: 'https://www.deutschland-rechner.de',
    // cleartext: true
  },
  ios: {
    contentInset: 'automatic',
    scheme: 'Deutschlandrechner'
  },
  android: {
    backgroundColor: '#ffffff'
  }
};

export default config;
