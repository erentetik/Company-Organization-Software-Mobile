import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';
import userData from '../../../data/userData';
import Navbar from '../../../components/navbar';
import { useNavigation } from '@react-navigation/native';


export default function Home() {
  const { name, surname, role, email, department, company, image } = userData;
  const navigation = useNavigation();
    const handleSignOut = () => {
        Alert.alert(
            "Sign Out",
            "Are you sure you want to sign out?",
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Sign Out",
                    onPress: () => {
                        navigation.navigate('SignIn');
                    }
                }
            ],
            { cancelable: false }
        );
    };
  return (
    <View style={styles.container}>
      <Navbar />
      {/* <Image source={require('../../../images/delta_logo.png')} style={styles.appIcon} />  */}
      <Text style={styles.title}>User Information</Text>
      <Image source={require('../../../images/pp.jpg')} style={styles.image} />
      <Text style={styles.text}>Name: {name}</Text>
      <Text style={styles.text}>Surname: {surname}</Text>
      <Text style={styles.text}>Role: {role}</Text>
      <Text style={styles.text}>Email: {email}</Text>
      <Text style={styles.text}>Department: {department}</Text>
      <Text style={styles.text}>Company: {company}</Text>
      <TouchableOpacity style={styles.logoutButton} onPress={handleSignOut}>
        <Text style={styles.logoutButtonText}>Log Out</Text>
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