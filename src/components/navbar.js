import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons'; // Import Ionicons for the menu icon
import clearStorage from './clearStorage';
import { Alert } from 'react-native';


export default function Navbar() {
  const navigation = useNavigation();
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const navigateTo = (page) => {
    setDrawerOpen(false);
    navigation.navigate(page);
  };

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
                onPress: async () => {
                  await clearStorage();
                  navigation.navigate('SignIn');
                }
            }
        ],  
        { cancelable: false }
    );
};

  return (
    <View style={styles.navbar}>
      <TouchableOpacity style={styles.menuIcon} onPress={toggleDrawer}>
        <Ionicons name="menu" size={30} color="#ff4757" />
      </TouchableOpacity>
      {drawerOpen && (
        <View style={styles.drawer}>
          <TouchableOpacity onPress={() => navigateTo('Home')}>
            <Text style={styles.drawerItem}>Home</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigateTo('Users')}>
            <Text style={styles.drawerItem}>Users</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigateTo('Companies')}>
            <Text style={styles.drawerItem}>Companies</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigateTo('Towns')}>
            <Text style={styles.drawerItem}>Towns</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigateTo('Regions')}>
            <Text style={styles.drawerItem}>Regions</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigateTo('Cities')}>
            <Text style={styles.drawerItem}>Cities</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.logoutButton} onPress={handleSignOut}>
            <Text style={styles.logoutButtonText}>Log Out</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  navbar: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    backgroundColor: '#1c1c1c',
    zIndex: 10,
    padding: 10,
  },
  menuIcon: {
    alignSelf: 'flex-start',
  },
  drawer: {
    backgroundColor: '#333',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#444',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
  },
  drawerItem: {
    color: '#fff',
    padding: 15,
    fontSize: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#444',
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

