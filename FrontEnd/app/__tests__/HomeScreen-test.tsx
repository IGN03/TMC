import { render, screen } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '@/app/(tabs)/index';

const Tab = createBottomTabNavigator();

const MockNavigator = () => (
  <NavigationContainer>
    <Tab.Navigator>
      <Tab.Screen name="Home" component={HomeScreen} />
    </Tab.Navigator>
  </NavigationContainer>
);

describe('HomeScreen', () => {
  it('should render the header', () => {
    // Render the HomeScreen component wrapped in the navigator
    render(<MockNavigator />);
    const linkElement = screen.getByText("Welcome to Thunder Mountain Curry!");
    expect(linkElement).toBeOnTheScreen();
  });
});