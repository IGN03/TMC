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
  const STRIPE_PUBLISHABLE_KEY = 'pk_test_51R9BO5LAudv59E8tmCxkgf6J12J6KzlC9eoZj25eLVLKQphZ3eKeavHdtfMQNc0uF9OqQiOi1DGnk1uqwkQWcgqb00jyrA5FNz';

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
      <StripeProvider
        STRIPE_PUBLISHABLE_KEY
      >
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