import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthContextType {
  loggedIn: boolean;
  setLoggedIn: (value: boolean) => void;
  user: any;
  setUser: (user: any) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  // Load authentication data from AsyncStorage when app starts
  useEffect(() => {
    const loadAuthData = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user');
        const storedLoggedIn = await AsyncStorage.getItem('loggedIn');

        if (storedUser && storedLoggedIn === 'true') {
          setUser(JSON.parse(storedUser));
          setLoggedIn(true);
        }
      } catch (error) {
        console.error('Failed to load auth data', error);
      }
    };

    loadAuthData();
  }, []);

  // Function to log in and save data persistently
  const login = async (userData: any) => {
    setUser(userData);
    setLoggedIn(true);
    await AsyncStorage.setItem('user', JSON.stringify(userData));
    await AsyncStorage.setItem('loggedIn', 'true');
  };

  // Function to log out and clear data
  const logout = async () => {
    setUser(null);
    setLoggedIn(false);
    await AsyncStorage.removeItem('user');
    await AsyncStorage.removeItem('loggedIn');
  };

  return (
    <AuthContext.Provider value={{ loggedIn, setLoggedIn: (value) => setLoggedIn(!!value), user, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
