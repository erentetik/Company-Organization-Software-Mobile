import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons'; // Import Ionicons for the menu icon

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
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#444',
  },
  drawerItem: {
    color: '#fff',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#444',
  },
});