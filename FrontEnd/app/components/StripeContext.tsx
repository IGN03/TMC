import * as Linking from "expo-linking";

import { StripeProvider } from "@stripe/stripe-react-native";
import Constants from "expo-constants";

const STRIPE_PUBLISHABLE_KEY = 'pk_live_51R9BO5LAudv59E8t0dYdSeCU7NSYasJGNMJlFhpmxGdv2RzfJFCkzG7vB1bbeRHYg5q4ysnNHNV7XMHhZcTbSZ7k00dxHrGNkX';


if (!merchantId) {
  throw new Error('Missing Expo config for "@stripe/stripe-react-native"');
}

export default function ExpoStripeProvider(
  props: Omit<
    React.ComponentProps<typeof StripeProvider>,
    "publishableKey"
  >
) {
  return (
    <StripeProvider
      publishableKey={STRIPE_PUBLISHABLE_KEY}
      urlScheme={Linking.createURL("/").split(":")[0]}
      {...props}
    />
  );
}