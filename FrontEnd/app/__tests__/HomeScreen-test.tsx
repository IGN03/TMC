import { render, screen } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '@/app/(tabs)/index';

const Tab = createBottomTabNavigator();

describe('HomeScreen', () => {

  test('should render HomeScreen text', () => {
    // Render the HomeScreen component wrapped in the navigator
    const {getByText} = render(<HomeScreen />);
    
    expect(getByText("Welcome to Thunder Mountain Curry!")).toBeTruthy();
    
    expect(getByText("Our Story")).toBeTruthy();
    
    expect(getByText("From our beginnings out of a hot dog cart to the RPI Student Union, the Troy Waterfront Farmer's Market, and our Pandemic Pop-Ups, TMC has never wavered from our mission - to bring the Troy, NY community a mouth-watering culinary adventure straight from the streets. Our new journey takes us back to our roots as a true street food experience. Follow us on Instagram and FaceBook to see where we're serving today!")).toBeTruthy();
    
    expect(getByText("Our Food")).toBeTruthy();
    
    expect(getByText("Thunder Mountain Curry focuses on quality ingredients and authentic Pan-Asian recipes with our own twist.\nTMC is a unique street food experience for those seeking a delicious and satisfying culinary adventure.")).toBeTruthy();
    
    expect(getByText("Visit Us")).toBeTruthy();
    
    expect(getByText("Now at the Troy Waterfront Farmers Market and in front of the RPI Student Union - follow us to find out when!")).toBeTruthy();
     
  });


  test('should render HomeScreen images', () => {
    // Render the HomeScreen component wrapped in the navigator
    const {getByTestId } = render(
      <NavigationContainer>
      <HomeScreen />
      </NavigationContainer>);
    
    expect(getByTestId("tmc-image")).toBeTruthy();
    
    expect(getByTestId("insta-image")).toBeTruthy();
    
    expect(getByTestId("facebook-image")).toBeTruthy();
    
  });


});
