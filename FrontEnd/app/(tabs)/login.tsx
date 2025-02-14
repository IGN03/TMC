import React, { useState } from 'react';
import { StyleSheet, TextInput, View, Button, Text, TouchableOpacity, Image, useColorScheme,} from 'react-native';
import Modal from 'react-native-modal';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import axios from 'axios';
//file stuff
import account from '../accounts.json';
import * as fs from 'fs';


///Global stuff
  const Stack = createStackNavigator();
  const BASE_URL = 'https://tmc-85hb.onrender.com';
  const ACC_URL = '../accounts.json';
  //loggedIn checker
  const [loggedIn, setLoggedIn] = useState(false);


//Read acc_id from account.json and set LoggedIn to be true

async function AccStatusOnLoad( setLoggedIn){
  if (account.id != null){// add token later
    setLoggedIn = true;
  }
}

AccStatusOnLoad(setLoggedIn);

//READJSONFILE
async function readJSON(file_url){
  try{
    const data = await fs.readFile(file_url, 'utf-8');
    //read data
    return JSON.parse(data);
    } catch (error) {
      console.error(`Error reading ${file_url}: ${error}`);
      return {};
    }
}


//update JSON with /app/(tabs)/login.tsx
async function loginAccountsJSON(accountId) {
  const acc_data = await readJSON(ACC_URL);
  acc_data.id = 'accountId';
  //update token when available.
  
  
  //update original file.
  try{
  await fs.writeFileSync( ACC_URL, JSON.stringify(acc_data, null, 2));
  } catch (error) {
    console.error("accounts.json was not updated: ", error);
  }
}
//LOGIN VVVVVVVVVVV
  const LoginScreen = ({ navigation, setLoggedIn }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    
    // Modal state
    const [isModalVisible, setModalVisible] = useState(false);
    const [modalContent, setModalContent] = useState('');

    // Function to show the modal popup
    const showPopup = (content) => {
      setModalContent(content);
      setModalVisible(true);
    };

    const colorScheme = useColorScheme();
    const colors = {
      background: colorScheme === 'dark' ? '#FF7043' : '#FFA726',
      placeholderText: colorScheme === 'dark' ? '#BDBDBD' : '#000000',
      buttonColor: colorScheme === 'dark' ? '#FF7043' : '#FFA726',
      inputBackground: colorScheme === 'dark' ? '#333' : '#FFF',
      inputTextColor: colorScheme === 'dark' ? '#FFF' : '#000',
    };


    const handleLogin = async () => {
      if (!email && !password) {
        showPopup('Please fill out both fields');
      } else if (!email) {
        showPopup('Please fill out your email');
      } else if (!password) {
        showPopup('Please fill out your password');
      } else if (email.indexOf('@') < 0 || email.indexOf('.') < 0) {
        showPopup('Please fill out a valid email');
      } else {
        // run backend run node mongo_functions.js
        // Server implementation here
        const find_email =  await axios.get(`${BASE_URL}/accounts?email=${email}`)
        const find_account =  await axios.get(`${BASE_URL}/accounts?email=${email}&password=${password}`)
        if(!!find_account.data){
          showPopup(`Logging into:  ${email}`);
          //user_id = "6733ca61a2deb84e51d74db6"// hardcoded for testing purposes(merge issues caused some  functions to work inccoreectly)
          user_id = find_account.data._id;
          //let output = user_id;          
          //Update the JSON file with the user's account ID
          loginAccountsJSON(user_id);
          //SUCCESSFULL LOGIN!
          setLoggedIn(true);
          navigation.replace('Profile');
          

        }
        else if(!!find_email.data){//good Email bad password
          showPopup(`Email found, Password is invalid`)
        }
        else{//bad Email
          showPopup(`Email not found`)
        }
         
      }
    };

    const toggleModal = () => {
      setModalVisible(!isModalVisible);
    };

    return (
      <ParallaxScrollView
        headerBackgroundColor={{ light: '#FFA726', dark: '#FF7043' }}
        headerImage={
          <Image
            source={require('@/assets/images/Trans_TMC_Logo.png')}
            style={styles.restaurantLogo}
          />
    }
      >
        <ThemedText type="title">Login</ThemedText>

        <TextInput
          style={[styles.input, { backgroundColor: colors.inputBackground, color: colors.inputTextColor }]}
          placeholder="Email"
          placeholderTextColor={colors.placeholderText}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <View style={styles.passwordContainer}>
          <TextInput
            style={[styles.input, { flex: 1, backgroundColor: colors.inputBackground, color: colors.inputTextColor }]}
            placeholder="Password"
            placeholderTextColor={colors.placeholderText}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Text style={styles.showHideText}>{showPassword ? 'Hide' : 'Show'}</Text>
          </TouchableOpacity>
        </View>

        <Button title="Login" onPress={handleLogin} color={colors.buttonColor} />

        {/* Sign Up Text */}
        <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
          <Text style={styles.signUpText}>Don't have an account? Sign up</Text>
        </TouchableOpacity>

        {/* Modal for Errors */}
        <Modal
          isVisible={isModalVisible}
          onBackdropPress={toggleModal} // Close modal on backdrop press
          style={styles.modal}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>{modalContent}</Text>
            <Button title="Close" onPress={toggleModal} />
          </View>
        </Modal>
      </ParallaxScrollView>
    );
  };

//SIGN UP VVVVVVVV
  const SignUpScreen = ({ navigation, setLoggedIn }) => {

    // Account;

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [name, setName] = useState('');
    const [phoneNumber, setNumber] = useState('');

    


    // Modal state
    const [isModalVisible, setModalVisible] = useState(false);
    const [modalContent, setModalContent] = useState('');

    // Function to show the modal popup
    const showPopup = (content) => {
      setModalContent(content);
      setModalVisible(true);
    };

    const colorScheme = useColorScheme();
    
    const colors = {
      background: colorScheme === 'dark' ? '#FF7043' : '#FFA726',
      placeholderText: colorScheme === 'dark' ? '#BDBDBD' : '#000000',
      buttonColor: colorScheme === 'dark' ? '#FF7043' : '#FFA726',
      inputBackground: colorScheme === 'dark' ? '#333' : '#FFF',
      inputTextColor: colorScheme === 'dark' ? '#FFF' : '#000',
    };

    function isAllPresent(str) {
      // Regex to check if a string
      // contains uppercase, lowercase special character & numeric value
      var pattern = new RegExp(
        "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[#$%&*]).+$"
      );

      if (!str || str.length === 0) {
        return false;
      }
      if (pattern.test(str)) {
        return true
      } 
      return false
      }
      
      
    const handleSignUp = async () => {

      //BACKEND find if these objects are available
        const find_email = await axios.get(`${BASE_URL}/accounts?email=${email}`)
        const find_phone_number = await axios.get(`${BASE_URL}/accounts?email=${email}`)


      if (!email && !password) {
        showPopup('Please fill out all fields');
      } else if (!email) {
        showPopup('Please fill out your email');
      } else if (!password) {
        showPopup('Please fill out your password');
      } else if (email.indexOf('@') < 0 || email.indexOf('.') < 0) {
        showPopup('Please fill out a valid email');
      } else if (password.length < 8){
        showPopup('Please fill out a Password that is at least 8 characters long');
      } else if ( !(isAllPresent(password)) ){
        showPopup('A Password should contain at least: both a lowercase and  an uppercase letters, a number and a special character(#$%&*) ');
      }else if (password !== confirmPassword) {
        showPopup('Passwords do not match');
      }
      //---Query for Email + Phone Number + Passwords---
      else if( !!find_email.data ){
        showPopup("Email is already taken ")
      }
      else if( !!find_phone_number.data ){
        showPopup("Phone number is already taken ")
      }
      else if( (!!!find_phone_number.data) ){
        showPopup("Phone Number is already taken ")
      }
      else {
        
        
        const payload = {
          name: name,
          email: email,
          phone: phoneNumber,
          password: password,
          accessLevel: 0
        };
        
        axios.post(`${BASE_URL}/accounts`, payload);
        const find_account =  await axios.get(`${BASE_URL}/accounts?email=${email}&password=${password}`)
        let user_id = find_account.data.items[0]._id;
        
        //set accounts Json
        
        loginAccountsJSON(user_id);

        showPopup(`Account created for: email: ${email} password: ${password},  name: ${name}, phoneNumber: ${phoneNumber}`);
        }
        //send verification  email 
        setLoggedIn = true;
        
    };

    const toggleModal = () => {
      setModalVisible(!isModalVisible);
    };

    return (
      
      <ParallaxScrollView
        headerBackgroundColor={{ light: '#FFA726', dark: '#FF7043' }}
        headerImage={
          <Image
            source={require('@/assets/images/Trans_TMC_Logo.png')}
            style={styles.restaurantLogo}
          />
        }
      >
      <View style={styles.container}>
      <ThemedText type="title">Sign Up</ThemedText>

        <TextInput
          style={[styles.input, { backgroundColor: colors.inputBackground, color: colors.inputTextColor }]}
          placeholder="Name"
          placeholderTextColor={colors.placeholderText}
          value={name}
          onChangeText={setName}
          secureTextEntry
        />
        <TextInput
          style={[styles.input, { backgroundColor: colors.inputBackground, color: colors.inputTextColor }]}
          placeholder="Phone Number"
          placeholderTextColor={colors.placeholderText}
          value={phoneNumber}
          onChangeText={setNumber}
          secureTextEntry
        />
        <TextInput
          style={[styles.input, { backgroundColor: colors.inputBackground, color: colors.inputTextColor }]}
          placeholder="Email"
          placeholderTextColor={colors.placeholderText}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={[styles.input, { backgroundColor: colors.inputBackground, color: colors.inputTextColor }]}
          placeholder="Password"
          placeholderTextColor={colors.placeholderText}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <TextInput
          style={[styles.input, { backgroundColor: colors.inputBackground, color: colors.inputTextColor }]}
          placeholder="Confirm Password"
          placeholderTextColor={colors.placeholderText}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />
        

        <Button title="Sign Up" onPress={handleSignUp} color={colors.buttonColor} />

        {/* Back to Login Text */}
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.backToLoginText}>Already have an account? Login</Text>
        </TouchableOpacity>

        {/* Modal for Errors */}
        <Modal
          isVisible={isModalVisible}
          onBackdropPress={toggleModal} // Close modal on backdrop press
          style={styles.modal}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>{modalContent}</Text>
            <Button title="Close" onPress={toggleModal} />
          </View>
        </Modal>
      </View>
      </ParallaxScrollView>
    );
  };

// Profile VVVVVVVVVVVV
  const ProfileScreen = () => {
    const [name, setName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const colorScheme = useColorScheme();


    const colors = {
      background: colorScheme === 'dark' ? '#FF7043' : '#FFA726',
      placeholderText: colorScheme === 'dark' ? '#BDBDBD' : '#000000',
      inputBackground: colorScheme === 'dark' ? '#333' : '#FFF',
      inputTextColor: colorScheme === 'dark' ? '#FFF' : '#000',
    };

    async function getAccountData( name, phoneNumber){
      const json_data = await readJSON(ACC_URL);
      var id = json_data.id; 
      const find_account =  await axios.get(`${BASE_URL}/accounts?_id=${id}`);
      name = find_account.name;
      phoneNumber = find_account.phoneNumber;
    }

    const handleSave = async () => {
      const payload = {
        name: name,
        phone: phoneNumber,
      };
      axios.post(`${BASE_URL}/accounts?_id=${user_id}`, payload)
      return;
    }
    const handleLogout = async () => {
      //empty Logout File
      const acc_data = await readJSON(ACC_URL); 
      acc_data.id = "test";
      acc_data.token = "test";
      //write changes
      try{
        await fs.writeFileSync( ACC_URL, JSON.stringify(acc_data, null, 2));
        } catch (error) {
          console.error("accounts.json was not updated: ", error);
      }
      return;
    };
  

    return (
      <ParallaxScrollView
        headerBackgroundColor={{ light: '#FFA726', dark: '#FF7043' }}
        headerImage={<Image source={require('@/assets/images/Trans_TMC_Logo.png')} style={styles.restaurantLogo} />}
      >
        <View style={styles.container}>
          <ThemedText type="title">Profile</ThemedText>
          <TextInput
            style={[styles.input, { backgroundColor: colors.inputBackground, color: colors.inputTextColor }]}
            placeholder="Name"
            placeholderTextColor={colors.placeholderText}
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={[styles.input, { backgroundColor: colors.inputBackground, color: colors.inputTextColor }]}
            placeholder="Phone Number"
            placeholderTextColor={colors.placeholderText}
            value={phoneNumber}
            onChangeText={setPhoneNumber}
          />
          <Button title="Save Changes" onPress={handleSave} color={colors.background} />
        </View>
        <Button title="Logout" onPress={handleLogout} color={colors.background} />
      </ParallaxScrollView>
    );
  };

// navigation for all pages made
const AuthScreen = () => {
  return (

      <Stack.Navigator initialRouteName="Login">
        {!loggedIn ? (
          <>
            <Stack.Screen name="Login">
              {(props) => <LoginScreen {...props} setLoggedIn={setLoggedIn} />}
            </Stack.Screen>
            <Stack.Screen name="SignUp">
              {(props) => <SignUpScreen {...props} setLoggedIn={setLoggedIn} />}
            </Stack.Screen>
          </>
        ) : (
          <Stack.Screen name="Profile" component={ProfileScreen} />
        )}
      </Stack.Navigator>
  );
};



const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  showHideText: {
    marginLeft: 10,
    color: '#007AFF',
    fontWeight: 'bold',
  },
  signUpText: {
    marginTop: 20,
    textAlign: 'center',
    color: '#007AFF',
    fontWeight: 'bold',
  },
  backToLoginText: {
    marginTop: 20,
    textAlign: 'center',
    color: '#007AFF',
    fontWeight: 'bold',
  },
  restaurantLogo: {
    height: 200,
    width: '100%',
    resizeMode: 'contain',
    marginTop: 20,
    marginBottom: 20,
  },
  modal: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    width: '80%',
  },
  modalText: {
    marginBottom: 10,
    textAlign: 'center',
  },
});

export default AuthScreen;
