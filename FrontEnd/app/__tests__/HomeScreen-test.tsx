import { render, screen } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '@/app/(tabs)/index';

const Tab = createBottomTabNavigator();

const MockNavigator = () => (
  <NavigationContainer>
    <Tab.Navigator>
      <Tab.Screen name="homescreen" component={HomeScreen} />
    </Tab.Navigator>
  </NavigationContainer>
);

describe('HomeScreen', () => {
  it('should render HomeScreen', () => {
    // Render the HomeScreen component wrapped in the navigator
    render(<MockNavigator />);
    
    let linkElement = screen.getByText("Welcome to Thunder Mountain Curry!");
    expect(linkElement).toBeOnTheScreen();
    
    linkElement = screen.getByText("Our Story");
    expect(linkElement).toBeOnTheScreen();
    
    linkElement = screen.getByText("From our beginnings out of a hot dog cart to the RPI Student Union, the Troy Waterfront Farmer's Market, and our Pandemic Pop-Ups, TMC has never wavered from our mission - to bring the Troy, NY community a mouth-watering culinary adventure straight from the streets. Our new journey takes us back to our roots as a true street food experience. Follow us on Instagram and FaceBook to see where we're serving today!");
    expect(linkElement).toBeOnTheScreen();
    
    linkElement = screen.getByText("Our Food");
    expect(linkElement).toBeOnTheScreen();
    
    linkElement = screen.getByText("Thunder Mountain Curry focuses on quality ingredients and authentic Pan-Asian recipes with our own twist.\nTMC is a unique street food experience for those seeking a delicious and satisfying culinary adventure.");
    expect(linkElement).toBeOnTheScreen();
    
    linkElement = screen.getByText("Visit Us");
    expect(linkElement).toBeOnTheScreen();
    
    linkElement = screen.getByText("Now at the Troy Waterfront Farmers Market and in front of the RPI Student Union - follow us to find out when!");
    expect(linkElement).toBeOnTheScreen();
     
    let image = screen.getByTestId("tmc-image");
    expect(image).toBeOnTheScreen();
    
    image = screen.getByTestId("insta-image");
    expect(image).toBeOnTheScreen();
    
    image = screen.getByTestId("facebook-image");
    expect(image).toBeOnTheScreen();
    
  });
});
