import * as Linking from "expo-linking";
import React from 'react';
import { Platform } from 'react-native';

import { StripeProvider } from "@stripe/stripe-react-native";
import Constants from "expo-constants";

const STRIPE_PUBLISHABLE_KEY = 'pk_test_51R9BO5LAudv59E8tmCxkgf6J12J6KzlC9eoZj25eLVLKQphZ3eKeavHdtfMQNc0uF9OqQiOi1DGnk1uqwkQWcgqb00jyrA5FNz';

export default function ExpoStripeProvider(
  props: Omit<
    React.ComponentProps<typeof StripeProvider>,
    "publishableKey"
  >
) {
  return (
    <StripeProvider
      publishableKey={STRIPE_PUBLISHABLE_KEY}
      urlScheme={Linking.createURL("/")?.split(":")[0]}
      {...props}
    />
  );
}