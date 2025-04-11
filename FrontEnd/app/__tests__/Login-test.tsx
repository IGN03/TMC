import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import LoginScreen from '@/app/(tabs)/login';
import { AuthProvider } from '../components/AuthContext';

// Mock react-native-gesture-handler
jest.mock('react-native-gesture-handler', () => {
  const ActualGestureHandler = jest.requireActual('react-native-gesture-handler');
  const React = require('react');

  return {
    ...ActualGestureHandler,
    GestureHandlerRootView: React.forwardRef((props, ref) => (
      <>{props.children}</>
    )),
    PanGestureHandler: React.forwardRef((props, ref) => (
      <>{props.children}</>
    )),
    TouchableOpacity: React.forwardRef((props, ref) => (
      <>{props.children}</>
    )),
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


  it('test empty signup fields show the correct response', async () => {
    const { getByPlaceholderText, getByTestId, getByText, queryByText } = render(
      <AuthProvider>
        <GestureHandlerRootView>
          <NavigationContainer>
            <LoginScreen />
          </NavigationContainer>
        </GestureHandlerRootView>
      </AuthProvider>
    );
  
    fireEvent.press(getByText("Don't have an account? Sign up"));
  
    const signupButton = getByTestId('SignUpButton');
  
    // test all fields are empty
    fireEvent.press(signupButton);
    await waitFor(() => expect(getByText("Please fill out all fields")).toBeTruthy());
    fireEvent.press(getByText("Close"));
  
    // no email entered but a password is entered
    fireEvent.changeText(getByPlaceholderText('Password'), 'password');
    fireEvent.press(signupButton);
    await waitFor(() => expect(getByText("Please fill out your email")).toBeTruthy());
    fireEvent.press(getByText("Close"));
  
    // email entered but no password
    fireEvent.changeText(getByPlaceholderText('Email'), 'Bob@bob.com');
    fireEvent.changeText(getByPlaceholderText('Password'), '');
    fireEvent.press(signupButton);
    await waitFor(() => expect(getByText("Please fill out your password")).toBeTruthy());
    fireEvent.press(getByText("Close"));
  
    // no @ in email
    fireEvent.changeText(getByPlaceholderText('Email'), 'bob.com');
    fireEvent.changeText(getByPlaceholderText('Password'), 'password');
    fireEvent.press(signupButton);
    await waitFor(() => expect(getByText("Please fill out a valid email")).toBeTruthy());
    fireEvent.press(getByText("Close"));
  
    // no . in email
    fireEvent.changeText(getByPlaceholderText('Email'), 'bob@bob');
    fireEvent.changeText(getByPlaceholderText('Password'), 'password');
    fireEvent.press(signupButton);
    await waitFor(() => expect(getByText("Please fill out a valid email")).toBeTruthy());
    fireEvent.press(getByText("Close"));
  
    // invalid password length
    fireEvent.changeText(getByPlaceholderText('Email'), 'bob@bob.com');
    fireEvent.changeText(getByPlaceholderText('Password'), 'pass');
    fireEvent.press(signupButton);
    await waitFor(() =>
      expect(getByText("Please fill out a Password that is at least 8 characters long")).toBeTruthy()
    );
    fireEvent.press(getByText("Close"));
  
    // all lowercase password
    fireEvent.changeText(getByPlaceholderText('Email'), 'bob@bob.com');
    fireEvent.changeText(getByPlaceholderText('Password'), 'password');
    fireEvent.press(signupButton);
    await waitFor(() =>
      expect(
        getByText(
          "A Password should contain at least: both a lowercase and an uppercase letters, a number and a special character(#$%&*) "
        )
      ).toBeTruthy()
    );
    fireEvent.press(getByText("Close"));
  
    // Navigate back to login
    fireEvent.press(getByText("Already have an account? Login"));
    await waitFor(() => expect(getByText("Don't have an account? Sign up")).toBeTruthy());
  });


  it('brings you to your profile when you log in', async () => {
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
    let email = "theTester@test.com"
    let password = "12345"
    // email is missing @
    fireEvent.changeText(getByPlaceholderText('Email'), email);
    fireEvent.changeText(getByPlaceholderText('Password'), password);
    fireEvent.press(loginButton)
    await waitFor(() =>
      expect(getByText("Profile")).toBeTruthy()
    );
    await waitFor(() =>
      expect(getByPlaceholderText("Name")).toBeTruthy()
    );
    await waitFor(() =>
      expect(getByPlaceholderText("Phone Number")).toBeTruthy()
    );
    //expect(getByText("the tester")).toBeTruthy()
    //expect(getByText("122-333-4444")).toBeTruthy()
    expect(getByText("Save Changes")).toBeTruthy()
    fireEvent.press(getByText("Logout"))
    await waitFor(() =>
      expect(getByPlaceholderText("Email")).toBeTruthy()
    );

  });

});
