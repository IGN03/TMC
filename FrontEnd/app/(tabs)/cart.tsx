import React, { useState, useEffect, useContext } from 'react';
import { 
  Image, 
  StyleSheet, 
  Modal, 
  View, 
  Text, 
  TouchableOpacity, 
  Button,
  Linking,
  Alert,
  Platform,
  ScrollView
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import Icon from 'react-native-vector-icons/FontAwesome';
import axios from 'axios';
import { CartProvider } from '../components/CartContext';
import { useCart } from '../components/CartContext';
import { useStripe } from '@stripe/stripe-react-native';

const BACKEND_URL = 'https://tmc-85hb.onrender.com';

// Custom PaymentButton component
const PaymentButton = ({ 
  onPress, 
  logo, 
  style, 
  label,
  testID 
}) => {
  return (
    <TouchableOpacity 
      onPress={onPress}
      style={[styles.paymentButton, style]}
      activeOpacity={0.7}
      testID={testID}
    >
      <Image 
        source={logo} 
        style={styles.paymentLogo}
        resizeMode="contain"
      />
      {label && <Text style={styles.paymentButtonText}>{label}</Text>}
    </TouchableOpacity>
  );
};

// Cart Screen Component
function CartScreen() {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [stripeLoading, setStripeLoading] = useState(false);
  const [menuItems, setMenuItems] = useState([]);
      // Calculate cart total
      const { cartItems, removeFromCart } = useCart();
      const subtotal = cartItems.reduce((total, item) => {
      const menuItem = menuItems.find(menu => menu._id === item.id);
      return total + (menuItem?.price * item.quantity);
    }, 0);
    const tax = subtotal * 0.08875; // NYS 8.875% tax rate
    const total = subtotal + tax;

  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [isCartModalVisible, setCartModalVisible] = useState(false);
  const [isNewModalVisible, setIsNewModalVisible] = useState(false);
  const [isPaymentMethodModalVisible, setIsPaymentMethodModalVisible] = useState(false);
  const [isPaymentConfirmationModalVisible, setIsPaymentConfirmationModalVisible] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const isFocused = useIsFocused();
  const navigation = useNavigation();
  const url = 'http://localhost:3000';

  useEffect(() => {
    const loadMenuItems = async () => {
      try 
      {
        console.log('Fetching from:', `${BACKEND_URL}/menuItems`);
        const response = await axios.get(`${BACKEND_URL}/menuItems`);
        console.log('Response data:', response.data);
        const items = Array.isArray(response.data.foundItems) ? response.data.foundItems : [];
        setMenuItems(items);
      } 

      catch (error) 
      {
        console.error('Error fetching menu items:', 
        {
          message: error.message,
          responseData: error.response?.data,
          fullError: error
        });
      }
    };

    loadMenuItems();
  }, []);

  useEffect(() => {
    if (isFocused) {
      setCartModalVisible(true);
    } else {
      setCartModalVisible(false);
    }
  }, [isFocused]);

  const closeModal = () => {
    setCartModalVisible(false);
  };

  const closeModalAndNavigate = () => {
    setCartModalVisible(false);
    navigation.navigate('explore');
  };

  const openNewModal = () => {
    setCartModalVisible(false);
    setIsNewModalVisible(true);
  };

  const closeNewModal = () => {
    setIsNewModalVisible(false);
  };

  const backToCheckoutOptions = () => {
    setIsNewModalVisible(false);
    setCartModalVisible(true);
  };

  const backtoOrderTotal = () => {  
    setIsPaymentMethodModalVisible(false);
    setIsSidebarVisible(true);
  };

  // New functions for payment modal
  const openPaymentModal = () => {
    setIsNewModalVisible(false);
    setIsPaymentMethodModalVisible(true);
  };

  const handleDone = () => {  
    setIsPaymentConfirmationModalVisible(false);
    navigation.navigate('explore');
  };

  const handleCompletePayment = () => { 
    console.log(`Processing payment with ${selectedPaymentMethod}`);
    setIsPaymentMethodModalVisible(false);
    setIsPaymentConfirmationModalVisible(true);
  };

  const openSidebar = () => setIsSidebarVisible(true);
  const closeSidebar = () => setIsSidebarVisible(false);

  const fetchPaymentSheetParams = async (amount: number) => {
  try {
    const amount = Math.round(total * 100); // Convert to cents
    console.log(`Fetching payment sheet for amount: ${amount} cents`);
    
    const response = await fetch(`${BACKEND_URL}/payment-sheet`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: amount
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Server response error:', errorText);
      throw new Error('Network response was not ok');
    }
    
    const data = await response.json();
    console.log('Payment sheet params received:', Object.keys(data).join(', '));
    
    if (!data.paymentIntent) {
      throw new Error('No payment intent received from server');
    }
    
    return {
      paymentIntent: data.paymentIntent,
      ephemeralKey: data.ephemeralKey,
      customer: data.customer,
    };
  } catch (error) {
    console.error('Error fetching payment sheet params:', error);
    throw error;
  }
};

  const initializePaymentSheet = async () => {
    try {
      setStripeLoading(true);
      
      const {
        paymentIntent,
        ephemeralKey,
        customer,
      } = await fetchPaymentSheetParams(total);

      const { error } = await initPaymentSheet({
        merchantDisplayName: "Thunder Mountain Curry",
        customerId: customer,
        customerEphemeralKeySecret: ephemeralKey,
        paymentIntentClientSecret: paymentIntent,
        allowsDelayedPaymentMethods: true,
        defaultBillingDetails: {
          name: 'Customer',
        }
      });

      if (error) {
        console.log('Error initializing payment sheet:', error);
        Alert.alert('Error', error.message || 'Unable to initialize payment');
      } else {
        setStripeLoading(false);
      }
    } catch (error) {
      console.error('Error in initializePaymentSheet:', error);
    } finally {
      setStripeLoading(false);
    }
  };

  // Replace your handlePayment function with this one
  const handlePayment = async () => {
  try {
    // Show loading indicator
    setStripeLoading(true);
    
    // Step 1: Fetch payment sheet params from your server
    const {
      paymentIntent,
      ephemeralKey,
      customer,
    } = await fetchPaymentSheetParams();
    
    console.log("Got payment intent:", paymentIntent ? "Yes" : "No");
    
    // Step 2: Initialize the payment sheet
    const { error: initError } = await initPaymentSheet({
      merchantDisplayName: "Thunder Mountain Curry",
      customerId: customer,
      customerEphemeralKeySecret: ephemeralKey,
      paymentIntentClientSecret: paymentIntent,
      allowsDelayedPaymentMethods: true,
      defaultBillingDetails: {
        name: 'Customer',
      }
    });
    
    if (initError) {
      console.log('Payment sheet initialization error:', initError);
      Alert.alert('Error', initError.message || 'Unable to initialize payment');
      setStripeLoading(false);
      return;
    }
    
    console.log("Payment sheet initialized successfully");
    
    // Step 3: Present the payment sheet only after successful initialization
    const { error: presentError } = await presentPaymentSheet();
    
    if (presentError) {
      console.log(`Payment sheet presentation error: ${presentError.code}`, presentError.message);
      
      if (presentError.code === 'Canceled') {
        Alert.alert('Payment Canceled', 'You canceled the payment process');
      } else {
        Alert.alert('Payment Error', presentError.message || 'Something went wrong');
      }
    } else {
      console.log('Payment successful!');
      setSelectedPaymentMethod('Credit Card');
      setIsPaymentMethodModalVisible(false);
      setIsPaymentConfirmationModalVisible(true);
      
      // You might want to clear the cart here
      // clearCart();
    }
  } catch (error) {
    console.error('Payment process error:', error);
    Alert.alert('Payment Error', error.message || 'Unable to complete payment. Please try again.');
  } finally {
    setStripeLoading(false);
  }
};

  // Sidebar component in MenuScreen
  const Sidebar = ({ isVisible, onClose }) => 
  { 
    const navigation = useNavigation();

    const handlePayNow = () => {
      setCurrentView('payment');
    };

    const handleBackToOrder = () => {
      setCurrentView('cart');
    };

    return (
      <Modal transparent={true} animationType="slide" visible={isVisible}>
        <View style={styles.overlay}>
          <View style={styles.sidebarContainer}>

          {/* Sidebar text */}
            <ThemedText style={styles.sidebarTitle}>Your Cart</ThemedText>
            <ScrollView showsVerticalScrollIndicator={false}>
              {cartItems.length > 0 ? (
                cartItems.map((item) => {
                  const menuItem = menuItems.find(menu => menu._id === item.id);
                  return(
                  <View key={item.id} style={styles.cartItemContainer}>
                    <View style={styles.cartItemDetails}>
                      <ThemedText style={styles.item}>
                        {item.quantity}x {item.name}
                      </ThemedText>
                      <ThemedText style={styles.cartItemPrice}>
                        ${((menuItem?.price || 0) * item.quantity).toFixed(2)}
                      </ThemedText>
                    </View>
                    <TouchableOpacity
                          style={styles.removeButton}
                          onPress={() => removeFromCart(item.id)}
                    >
                      <Icon name="trash" size={20} color="#FF0000" />
                    </TouchableOpacity>
                  </View>
                );
              })
              ) : (
                <ThemedText>No items in the cart.</ThemedText>
              )}

              <View style={styles.divider} />
              
              {/* Sidebar calculations for the total */}
              <View style={styles.totalsContainer}>
                <ThemedText>Subtotal: ${subtotal.toFixed(2)}</ThemedText>
                <ThemedText>Tax: ${tax.toFixed(2)}</ThemedText>
                <ThemedText style={styles.totalText}>
                  Total: ${total.toFixed(2)}
                </ThemedText>
              </View>
              
              <View style={styles.bottomPadding} />
            </ScrollView>

            {/* Sidebar buttons */}
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <ThemedText style={styles.closeButtonText}>X</ThemedText>
            </TouchableOpacity>

            <View style={styles.buttonWrapper}>
              <TouchableOpacity 
                  style={styles.backButton}
                  onPress={() => {
                    closeSidebar();
                    backToCheckoutOptions();
                  }}
                >
                  <Text style={styles.buttonText}>Back to Checkout Options</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                  style={styles.payButton}
                  onPress={() => {
                    closeSidebar();
                    openPaymentModal();
                  }}
                >
                  <Text style={styles.buttonText}>Pay Now</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

// Divider component (just a bold horizontal line)
  const Divider = () => (
  <View style={styles.divider} />
  );

  const closePaymentMethodModal = () => {
    setIsPaymentMethodModalVisible(false);
    setSelectedPaymentMethod('');
  };

  return (
    <ThemedView style={{ flex: 1 }}>
      <Sidebar 
      isVisible={isSidebarVisible} 
      onClose={closeSidebar} 
      />
      <ParallaxScrollView
        headerBackgroundColor={{ light: '#FFA726', dark: '#FF7043' }}
        headerImage={
          <Image
            source={require('@/assets/images/Trans_TMC_Logo.png')}
            style={styles.restaurantLogo}
          />
        }>
        <ThemedView style={styles.titleContainer}>
          <ThemedText type="title">Payment Option(s)</ThemedText>
        </ThemedView>
        <ThemedView style={styles.stepContainer}>
          <ThemedText type="subtitle">1. Credit Card/Debit Card</ThemedText>
          <Image
            source={require('@/assets/images/6963703.png')}
            style={styles.creditCardLogo} 
          />
        </ThemedView>
      </ParallaxScrollView>

      {/* Modal for options when checking out */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isCartModalVisible}
        onRequestClose={closeModalAndNavigate}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>Checkout Options</Text>
            
            <TouchableOpacity 
              onPress={closeModalAndNavigate}
              style={[styles.touchableButton, { backgroundColor: 'red' }]}
            >
              <Text style={styles.buttonText}>Add Items to Cart</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => {
                closeModal();
                openSidebar();
              }}
              style={[styles.touchableButton, { backgroundColor: 'blue' }]}
            >
              <Text style={styles.buttonText}>Complete Order</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={closeModal}
              style={[styles.touchableButton, { backgroundColor: 'gray' }]}
            >
              <Text style={styles.buttonText}>View Payment Options</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Payment Method Selection Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isPaymentMethodModalVisible}
        onRequestClose={closePaymentMethodModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>Select Payment Method</Text>
            
            <View style={styles.paymentButtonsContainer}>
              <PaymentButton
                onPress={() => {
                  setSelectedPaymentMethod('Credit Card');
                  console.log('Credit Card selected');
                }}
                logo={require('@/assets/images/6963703.png')}
                style={styles.creditCardButton}
                testID="credit-card-button"
              />
            </View>
            
            <Text style={styles.totalTextCheckout}>Total: ${total.toFixed(2)}</Text>
            
            <TouchableOpacity 
              style={[styles.touchableButton, styles.backButton1]} 
              onPress={backtoOrderTotal}
            >
              <Text style={styles.buttonText1}>Back to Order Total</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.touchableButton, 
                styles.payButton1,
                (!selectedPaymentMethod || stripeLoading) && { opacity: 0.5 }
              ]}
              onPress={handlePayment}
              disabled={stripeLoading || !selectedPaymentMethod}
            >
              <Text style={styles.buttonText1}>
                {stripeLoading ? 'Processing...' : 'Complete Payment'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.touchableButton, styles.payButton1, { backgroundColor: '#FF3B30' }]} 
              onPress={closePaymentMethodModal}
            >
              <Text style={styles.buttonText1}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Payment Confirmation Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isPaymentConfirmationModalVisible}
        onRequestClose={handleDone}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>Payment Confirmation</Text>
            <Text style={styles.modalSubtitle}>Order #12345</Text>
            <Text style={styles.modalSubtitle}>Total Paid: {total.toFixed(2)}</Text>
            <Text style={styles.modalSubtitle}>Payment Method: {selectedPaymentMethod}</Text>
            <Text style={styles.modalSubtitle}>Date: {new Date().toLocaleDateString()}</Text>
            <Text style={styles.modalSubtitle}> </Text>
            
            <Image source={require('@/assets/images/TMC_Logo.png')} style={styles.tmcLogo} />
            <Text style={[styles.modalSubtitle, styles.successMessage]}>
              Payment Successful! Thank you for your order.
            </Text>
            <Text style={styles.modalSubtitle}>
              Your order will be ready for pickup in approximately 15-20 minutes.
            </Text>
            
            <TouchableOpacity 
              onPress={handleDone}
              style={styles.doneButton}
              activeOpacity={0.7}
            >
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
}

// Create a stack navigator
const Stack = createNativeStackNavigator();


// Remove the NavigationContainer wrapper
export default function CartNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="Cart" 
        component={CartScreen}
        options={{
          headerShown: false
        }}
      />
      {/* Add other screens here if needed */}
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 20,
    marginBottom: 20,
  },
  stepContainer: {
    gap: 10,
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  restaurantLogo: {
    height: 200,
    width: '100%',
    resizeMode: 'contain',
    marginTop: 20,
    marginBottom: 20,
  },
  creditCardLogo: {
    height: 75,
    width: 75,
    resizeMode: 'contain',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#D88A3C',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    width: '80%',
  },
  emptyCartImage: {
    height: 100,
    width: 100,
    marginBottom: 20,
  },
  modalText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#fff',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 5,
  },
  tmcLogo: {
    height: 75,
    width: 75,
    marginBottom: 20,
    marginTop: 0,
    borderRadius: 50,
  },
  successMessage: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#90EE90',
    marginTop: 10,
    marginBottom: 10,
  },
  paymentButtonsContainer: {
    width: '100%',
    gap: 10,
    marginVertical: 15,
  },
  
  paymentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    marginVertical: 5,
  },

  paymentLogo: {
    height: 30,
    width: 100,
  },

  paymentButtonText: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: '600',
  },

  creditCardButton: {
    backgroundColor: '#fff',
  },

  touchableButton: {
  width: '70%',
  minWidth: 120,
  maxWidth: 250,
  padding: 15,
  borderRadius: 8,
  marginVertical: 5,
  alignItems: 'center',
  justifyContent: 'center',
  },

  backButton: {
    position: 'center',
    backgroundColor: '#007AFF',
    width: '70%',
    minWidth: 200,
    maxWidth: 250, 
    padding: 15,
    borderRadius: 8,
    marginVertical: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },

  payButton: {
    position: 'center',
    backgroundColor: '#34C759',
    width: '70%',
    minWidth: 200,
    maxWidth: 250,
    padding: 15,
    borderRadius: 8,
    marginVertical: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },

  buttonWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },

  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginTop: 15,
  },
  
  condensedButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },

  backButton1: {
    width: '35%',
    backgroundColor: '#007AFF',
  },

  payButton1: {
    width: '35%',
    backgroundColor: '#34C759',
  },

  buttonText1: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },

  totalText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  
  doneButton: {
    backgroundColor: 'green',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },

  doneButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },

    // For Sidebar
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Container for the sidebar component
  sidebarContainer: {
    width: '70%',
    height: '70%',
    backgroundColor: '#D88A3C',
    borderRadius: 10,
    padding: 40,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    display: 'flex',
    justifyContent: 'flex-start',
  },
  // Formatting for the title of the sidebar
  sidebarTitle: {
    padding: 10,
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 32,
  },
  // Formatting for each item's counter and name in sidebar
  item: {
    top: 20,
    left: 20,
  },
  // Button that closes the sidebar
  closeButton: {
    position: 'absolute',
    marginTop: 5,
    top: 0,
    right: 10,
    padding: 5,
    borderRadius: 10,
    backgroundColor: '#000000',
    alignItems: 'center',
  },
  // The 'X' in the close button
  closeButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#e5dccf',
  },
  // Formatting of the total text in the sidebar
  totalTextCheckout: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    padding: 5,
  },
  // Container for all the items in sidebar
  cartItemContainer: {
    marginBottom: 15,
  },
  // Formatting of each item's text in sidebar
  cartItemDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  // Formatting of each item's price in sidebar
  cartItemPrice: {
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'right',
    width: 100,
    top: 20,
  },
  // A bold horizontal line
  divider: {
    top: 5,
    height: 3, 
    backgroundColor: '#ccc', 
    marginVertical: 10, 
  },
});