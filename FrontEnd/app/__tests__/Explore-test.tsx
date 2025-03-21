import { render, screen } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MenuScreen from '@/app/(tabs)/explore';


jest.mock('expo-font', () => ({
  loadAsync: jest.fn(() => Promise.resolve()),
  isLoaded: jest.fn(() => true),
}));


describe('MenuScreen', () => {

  test('should render MenuScreen text', () => {
    // Render the HomeScreen component wrapped in the navigator
    const {getByText} = render(
      <NavigationContainer>
      <MenuScreen />
      </NavigationContainer>);
    
    expect(getByText("Today's Menu")).toBeTruthy();
    
    expect(getByText("Appetizers")).toBeTruthy();
    
    expect(getByText("Main Dishes")).toBeTruthy();
    
    expect(getByText("Desserts")).toBeTruthy();
     
  });


});
