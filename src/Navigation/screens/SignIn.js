import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {api} from '../../constants/api';

export default function SignIn({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const url = api;

  const handleSubmit = async () => {
    console.log("email: ", email);
    console.log("password ", password);
    const requestUrl = `${url}/api/auth/login`;
    console.log("requestUrl: ", requestUrl);
  
    await axios.post(requestUrl, {
      email: email,
      password: password
    }).then(async response => {
      console.log("Fetch operation was successful");
  
      // Storing data in AsyncStorage
      await AsyncStorage.setItem('token', response.data.token|| '');
      await AsyncStorage.setItem('name', response.data.user.name)|| '';
      await AsyncStorage.setItem('surname', response.data.user.surname|| '');
      await AsyncStorage.setItem('email', response.data.user.email|| '');
      await AsyncStorage.setItem('role', response.data.user.roles[0].name || '');
      await AsyncStorage.setItem('department', response.data.user.department.departmentType.name|| '');
      await AsyncStorage.setItem('company', response.data.user.department.company.name|| '');
  
      navigation.navigate('Home');
    }).catch(error => {
      console.error('There was a problem with the fetch operation:', error);
    });
  };
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Log In</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Username"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          placeholderTextColor="#ccc"
        />
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          placeholderTextColor="#ccc"
        />
        <TouchableOpacity
          style={styles.showButton}
          onPress={() => setShowPassword(!showPassword)}
        >
          <Text style={styles.showButtonText}>{showPassword ? 'Hide' : 'Show'}</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.linkContainer}>
        <TouchableOpacity onPress={() => navigation.navigate('ResetPassword')}>
          <Text style={styles.linkText}>Forgot Password</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('ActivateUser')}>
          <Text style={styles.linkText}>Activate Account</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.loginButton} onPress={handleSubmit}>
        <Text style={styles.loginButtonText}>Log In</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#1c1c1c',
  },
  title: {
    fontSize: 32,
    marginBottom: 32,
    textAlign: 'center',
    color: '#fff',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'white',
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 8,
    backgroundColor: '#333',
  },
  input: {
    flex: 1,
    height: 40,
    color: '#fff',
  },
  showButton: {
    padding: 8,
  },
  showButtonText: {
    color: 'white',
  },
  linkContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  linkText: {
    color: 'white',
  },
  loginButton: {
    backgroundColor: '#ff4757',
    paddingVertical: 12,
    borderRadius: 8,
  },
  loginButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 18,
  },
});