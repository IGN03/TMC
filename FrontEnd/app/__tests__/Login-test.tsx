import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
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
    const { getByPlaceholderText, getByTestId, getByText } = render(
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
    expect(getByText("Don't have an account? Sign up")).toBeTruthy();
  });


  it('alerts user if fields are not filled in', () => {
    const { getByText, getByTestId, getByPlaceholderText } = render(
      <AuthProvider>
        <GestureHandlerRootView> {/* Wrap test in GestureHandlerRootView */}
          <NavigationContainer>
            <LoginScreen />
          </NavigationContainer>
        </GestureHandlerRootView>
      </AuthProvider>
    );

    let loginButton = getByTestId('LoginButton')

    // both the email and password are blank
    fireEvent.press(loginButton)
    expect(getByText("Please fill out both fields")).toBeTruthy();
    let closeButton = getByText("Close")
    fireEvent.press(closeButton)

    // no password but an email is entered
    fireEvent.changeText(getByPlaceholderText('Email'), 'Bob@bob.com');
    fireEvent.press(loginButton)
    expect(getByText('Please fill out your password')).toBeTruthy();
    fireEvent.press(closeButton)

    // no email but a password is entered
    fireEvent.changeText(getByPlaceholderText('Email'), '');
    fireEvent.changeText(getByPlaceholderText('Password'), 'password');
    fireEvent.press(loginButton)
    expect(getByText('Please fill out your email')).toBeTruthy();
    fireEvent.press(closeButton)


    // email is missing @
    fireEvent.changeText(getByPlaceholderText('Email'), 'bob.com');
    fireEvent.changeText(getByPlaceholderText('Password'), 'password');
    fireEvent.press(loginButton)
    expect(getByText('Please fill out a valid email')).toBeTruthy();
    fireEvent.press(closeButton)

    // email is missing .
    fireEvent.changeText(getByPlaceholderText('Email'), 'bob@bob');
    fireEvent.changeText(getByPlaceholderText('Password'), 'password');
    fireEvent.press(loginButton)
    expect(getByText('Please fill out a valid email')).toBeTruthy();
    fireEvent.press(closeButton)
  });


  it('renders signup page correctly', () => {
    const { getByPlaceholderText, getByTestId, getByText } = render(
      <AuthProvider>
        <GestureHandlerRootView> {/* Wrap test in GestureHandlerRootView */}
          <NavigationContainer>
            <LoginScreen />
          </NavigationContainer>
        </GestureHandlerRootView>
      </AuthProvider>
    );

    expect(getByText("Don't have an account? Sign up")).toBeTruthy();
    fireEvent.press(getByText("Don't have an account? Sign up"))

    expect(getByPlaceholderText('Name')).toBeTruthy();
    expect(getByPlaceholderText('Phone Number')).toBeTruthy();
    expect(getByPlaceholderText('Email')).toBeTruthy();
    expect(getByPlaceholderText('Password')).toBeTruthy();
    expect(getByPlaceholderText('Confirm Password')).toBeTruthy();
    expect(getByTestId('SignUpButton')).toBeTruthy();

    let link = getByText("Already have an account? Login")
    fireEvent.press(link)
    expect(getByText("Don't have an account? Sign up")).toBeTruthy();
  });

});
