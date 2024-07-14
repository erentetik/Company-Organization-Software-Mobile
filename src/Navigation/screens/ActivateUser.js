import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { api } from '../../constants/api';
import Toast from 'react-native-toast-message'; // Import Toast

export default function ActivateUser({ navigation }) {
  const [email, setEmail] = useState('');

  const handleSubmit = async () => {
    if (!email) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please enter an email',
        position: 'bottom'
      });
      return;
    }

    const requestUrl = `${api}/api/auth/activate`;
    console.log(requestUrl);
    console.log(email);

    await axios.post(requestUrl, {
      email: email,
    }).then(response => {
      console.log("Fetch operation was successful");
      console.log(response);
      
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Activation email sent successfully',
        position: 'bottom'
      });

      navigation.navigate('SignIn');
    }).catch(error => {
      console.error('There was a problem with the fetch operation:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to send activation email',
        position: 'bottom'
      });
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Activate Account</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          placeholderTextColor="#ccc"
        />
      </View>
      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Send Activation Email</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.linkText} onPress={() => navigation.navigate('SignIn')}>
        <Text style={styles.buttonText}>I already have an account.</Text>
      </TouchableOpacity>
      {/* Toast Config */}
      <Toast ref={(ref) => Toast.setRef(ref)} />
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
    borderColor: '#ff4757',
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
  button: {
    backgroundColor: '#ff4757',
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 18,
  },
  linkText: {
    color: '#ff4757',
    textAlign: 'center',
    fontSize: 18,
    marginTop: 16,
  },
});
