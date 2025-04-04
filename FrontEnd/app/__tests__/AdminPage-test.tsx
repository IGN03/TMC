import { render, screen, fireEvent } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AdminPage from '@/app/(tabs)/adminpage';



describe('AdminPage', () => {

  test('should render AdminPage text', () => {
    // Render the HomeScreen component wrapped in the navigator
    const {getByText, queryByText} = render(
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

    // reset to the main page by pressing the back buttons
    button = getByText("Cancel")

    fireEvent.press(button)

    expect(queryByText("New/Edit Item")).toBeNull();

    button = getByText("Close")

    fireEvent.press(button)

    expect(queryByText("Menu Changes")).toBeNull();
     
  });

  
  test('should render AdminPage placeholder text', () => {
    // Render the HomeScreen component wrapped in the navigator
    const { getByPlaceholderText, getByText } = render(
      <NavigationContainer>
      <AdminPage />
      </NavigationContainer>);

    let button = getByText("Manage Menu")

    fireEvent.press(button)

    button = getByText("Add New Menu")

    fireEvent.press(button)
    
    expect(getByPlaceholderText("Name")).toBeTruthy();
    
    expect(getByPlaceholderText("Price")).toBeTruthy();
    
    expect(getByPlaceholderText("Allergen")).toBeTruthy();
    
    expect(getByPlaceholderText("Category")).toBeTruthy();
    
    expect(getByPlaceholderText("Description")).toBeTruthy();
    
  });

});
