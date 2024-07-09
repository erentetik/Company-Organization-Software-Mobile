import 'react-native-gesture-handler';
import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SignIn from './screens/SignIn';
import ResetPassword from './screens/ResetPassword';
import SetNewPassword from './screens/SetNewPassword';
import ActivateUser from './screens/ActivateUser';
import Home from './screens/HomePages/Home';
import Users from './screens/HomePages/Users';
import Companies from './screens/HomePages/Companies';
import Towns from './screens/HomePages/Towns';
import Regions from './screens/HomePages/Regions';
import Cities from './screens/HomePages/Cities';


const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="SignIn"
        screenOptions={{
          headerShown: false, // Hide header for all screens
        }}
      >
        
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="SignIn" component={SignIn} />
        <Stack.Screen name="ResetPassword" component={ResetPassword} />
        <Stack.Screen name="SetNewPassword" component={SetNewPassword} />
        <Stack.Screen name="ActivateUser" component={ActivateUser} /> 
        
        <Stack.Screen name="Users" component={Users} />
        <Stack.Screen name="Companies" component={Companies} />
        <Stack.Screen name="Towns" component={Towns} />
        <Stack.Screen name="Regions" component={Regions} />
        <Stack.Screen name="Cities" component={Cities} />
        

      </Stack.Navigator>
    </NavigationContainer>
  );
}

