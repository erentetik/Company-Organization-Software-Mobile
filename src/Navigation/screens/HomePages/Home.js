import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';
import userData from '../../../data/userData';
import Navbar from '../../../components/navbar';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import clearStorage from '../../../components/clearStorage';


export default function Home() {
  const [userData, setUserData] = useState({
    name: '',
    surname: '',
    role: '',
    email: '',
    department: '',
    company: '',

  });
  
  const navigation = useNavigation();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const name = await AsyncStorage.getItem('name');
        const surname = await AsyncStorage.getItem('surname');
        const role = await AsyncStorage.getItem('role');
        const email = await AsyncStorage.getItem('email');
        const department = await AsyncStorage.getItem('department');
        const company = await AsyncStorage.getItem('company');
        setUserData({
          name,
          surname,
          role,
          email,
          department,
          company,
        });
      } catch (error) {
        console.error('Error fetching user data from AsyncStorage:', error);
      }
    };

    fetchUserData();
  }, []);
  console.log(userData.role);
  
  return (
    <View style={styles.container}>
      <Navbar />
      {/* <Image source={require('../../../images/delta_logo.png')} style={styles.appIcon} />  */}
      <Text style={styles.title}>User Information</Text>
      <Image source={require('../../../images/pp.jpg')} style={styles.image} />
      <Text style={styles.text}>Name: {userData.name}</Text>
      <Text style={styles.text}>Surname: {userData.surname}</Text>
      <Text style={styles.text}>Role: {userData.role}</Text>
      <Text style={styles.text}>Email: {userData.email}</Text>
      <Text style={styles.text}>Department: {userData.department}</Text>
      <Text style={styles.text}>Company: {userData.company}</Text>
      
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
  appIcon: {
    width: 100,
    height: 100,
    position: 'absolute',
    alignSelf: 'center',
    top: 120,
    },
  image: {
    width: 150,
    height: 150,
    borderRadius: 75,
    alignSelf: 'center',
    marginBottom: 32,
  },
  text: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 8,
  },
  logoutButton: {
    backgroundColor: '#ff4757',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 32,
  },
  logoutButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 18,
  },
});