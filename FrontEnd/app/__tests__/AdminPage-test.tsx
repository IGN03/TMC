import { render, screen, fireEvent } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AdminPage from '@/app/(tabs)/adminpage';



describe('AdminPage', () => {

  test('should render AdminPage text', () => {
    // Render the HomeScreen component wrapped in the navigator
    const {getByText} = render(
      <NavigationContainer>
      <AdminPage />
      </NavigationContainer>);

    let button = getByText("Manage Menu")

    fireEvent.press(button)
    
    expect(getByText("Admin Page")).toBeTruthy();
    
    expect(getByText("Menu Changes")).toBeTruthy();

    button = getByText("Add New Menu")

    fireEvent.press(button)
    
    expect(getByText("New/Edit Item")).toBeTruthy();
     
  });

});
