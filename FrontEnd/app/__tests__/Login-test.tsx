import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import LoginScreen from '@/app/(tabs)/login';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { AuthProvider, useAuth } from '../components/AuthContext';

jest.mock('expo-font', () => ({
  loadAsync: jest.fn(() => Promise.resolve()),
  isLoaded: jest.fn(() => true),
}));

describe('LoginScreen', () => {

  test('should render LoginScreen text', () => {
    // Render the HomeScreen component wrapped in the navigator
    const {getByText} = render(
      <NavigationContainer>
      <LoginScreen />
      </NavigationContainer>);
    
    expect(getByText("Login")).toBeTruthy();
     
  });

});