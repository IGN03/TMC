import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { CartProvider } from './components/CartContext';
import { useCart } from './components/CartContext';

import { useColorScheme } from '@/hooks/useColorScheme';
import { AuthProvider } from './components/AuthContext';
import StripeProvider from "./components/StripeContext";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // Replace with your Stripe publishable key
  const STRIPE_PUBLISHABLE_KEY = 'pk_live_51R9BO5LAudv59E8t0dYdSeCU7NSYasJGNMJlFhpmxGdv2RzfJFCkzG7vB1bbeRHYg5q4ysnNHNV7XMHhZcTbSZ7k00dxHrGNkX';

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <StripeProvider>
        <CartProvider>
          <AuthProvider>      
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="+not-found" />
            </Stack>
          </AuthProvider>
        </CartProvider>
      </StripeProvider>
    </ThemeProvider>
  );
}