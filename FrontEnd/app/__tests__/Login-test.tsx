import React from 'react';
import { render } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import LoginScreen from '@/app/(tabs)/login';
import { AuthProvider } from '../components/AuthContext';

// Mock react-native-gesture-handler
jest.mock('react-native-gesture-handler', () => {
  const ActualGestureHandler = jest.requireActual('react-native-gesture-handler');
  return {
    ...ActualGestureHandler,
    GestureHandlerRootView: ({ children }) => <>{children}</>,
    PanGestureHandler: ({ children }) => <>{children}</>,
    TouchableOpacity: ({ children }) => <>{children}</>,
  };
});

describe('LoginScreen Component', () => {
  it('renders correctly', () => {
    const { getByPlaceholderText, getByTestId } = render(
      <AuthProvider>
        <GestureHandlerRootView> {/* Wrap test in GestureHandlerRootView */}
          <NavigationContainer>
            <LoginScreen />
          </NavigationContainer>
        </GestureHandlerRootView>
      </AuthProvider>
    );

    expect(getByPlaceholderText('Email')).toBeTruthy();
    expect(getByPlaceholderText('Password')).toBeTruthy();
    expect(getByTestId('LoginButton')).toBeTruthy();
  });
});
