import { render, screen, fireEvent } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AdminPage from '@/app/(tabs)/adminpage';
import { Alert } from 'react-native';

// Mock Alert
jest.spyOn(Alert, 'alert');


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

  it('should alert if name is empty', async () => {
    const { getByPlaceholderText, getByText } = render(
      <NavigationContainer>
      <AdminPage />
      </NavigationContainer>);

    fireEvent.press(getByText('Manage Menu'));

    fireEvent.press(getByText('Add New Menu'));

    fireEvent.changeText(getByPlaceholderText('Price'), '10');
    fireEvent.changeText(getByPlaceholderText('Allergen'), 'Peanuts');
    fireEvent.changeText(getByPlaceholderText('Category'), 'Main');
    fireEvent.changeText(getByPlaceholderText('Description'), 'Yummy food');

    fireEvent.press(getByText('Save'));

    expect(Alert.alert).toHaveBeenCalledWith(
      'Validation Error',
      'Please enter a name.'
    );
  });

  it('should alert if price is empty or less than 0', async () => {
    const { getByPlaceholderText, getByText } = render(
      <NavigationContainer>
      <AdminPage />
      </NavigationContainer>);

    fireEvent.press(getByText('Manage Menu'));

    fireEvent.press(getByText('Add New Menu'));

    fireEvent.changeText(getByPlaceholderText('Name'), 'Bob');
    fireEvent.changeText(getByPlaceholderText('Allergen'), 'Peanuts');
    fireEvent.changeText(getByPlaceholderText('Category'), 'Main');
    fireEvent.changeText(getByPlaceholderText('Description'), 'Yummy food');

    fireEvent.press(getByText('Save'));

    expect(Alert.alert).toHaveBeenCalledWith(
      'Validation Error',
      'Please enter a valid price greater than 0.'
    );

    //check for price of 0
    fireEvent.changeText(getByPlaceholderText('Price'), '0');

    fireEvent.press(getByText('Save'));

    expect(Alert.alert).toHaveBeenCalledWith(
      'Validation Error',
      'Please enter a valid price greater than 0.'
    );

    //check for price of a negtive number
    fireEvent.changeText(getByPlaceholderText('Price'), '-10');

    fireEvent.press(getByText('Save'));
    
    expect(Alert.alert).toHaveBeenCalledWith(
      'Validation Error',
      'Please enter a valid price greater than 0.'
    );

    //check for price of not a number
    fireEvent.changeText(getByPlaceholderText('Price'), 'testing');

    fireEvent.press(getByText('Save'));
        
    expect(Alert.alert).toHaveBeenCalledWith(
      'Validation Error',
      'Please enter a valid price greater than 0.'
    );

  });

  it('should alert if allergen is empty', async () => {
    const { getByPlaceholderText, getByText } = render(
      <NavigationContainer>
      <AdminPage />
      </NavigationContainer>);

    fireEvent.press(getByText('Manage Menu'));

    fireEvent.press(getByText('Add New Menu'));

    fireEvent.changeText(getByPlaceholderText('Name'), 'Bob');
    fireEvent.changeText(getByPlaceholderText('Price'), '10');
    fireEvent.changeText(getByPlaceholderText('Category'), 'Main');
    fireEvent.changeText(getByPlaceholderText('Description'), 'Yummy food');

    fireEvent.press(getByText('Save'));

    expect(Alert.alert).toHaveBeenCalledWith(
      'Validation Error',
      'Please enter an allergen.'
    );
  });


  it('should alert if description is empty', async () => {
    const { getByPlaceholderText, getByText } = render(
      <NavigationContainer>
      <AdminPage />
      </NavigationContainer>);

    fireEvent.press(getByText('Manage Menu'));

    fireEvent.press(getByText('Add New Menu'));

    fireEvent.changeText(getByPlaceholderText('Name'), 'Bob');
    fireEvent.changeText(getByPlaceholderText('Price'), '10');
    fireEvent.changeText(getByPlaceholderText('Allergen'), 'Peanuts');
    fireEvent.changeText(getByPlaceholderText('Category'), 'Main');

    fireEvent.press(getByText('Save'));

    expect(Alert.alert).toHaveBeenCalledWith(
      'Validation Error',
      'Please enter a description.'
    );
  });

});
