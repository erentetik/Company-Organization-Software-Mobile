import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal, TextInput, Button, Alert } from 'react-native';
import Navbar from '../../../components/navbar';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../../../constants/api';
import { Ionicons } from '@expo/vector-icons'; // Import Ionicons for the menu icon
import SortPicker from '../../../components/sortPicker';
import Toast from 'react-native-toast-message'; // Import Toast

const ROWS_PER_PAGE = 5;

export default function Regions() {
  const [regions, setRegions] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [newData, setNewData] = useState({
    name: '',
  });
  const [currentPage, setCurrentPage] = useState(0);

  const [userRole, setUserRole] = useState('');

  const [sortField, setSortField] = useState('id');
  const [sortOrder, setSortOrder] = useState('asc');
  const sortFields = [
    { label: 'ID', value: 'id' },
    { label: 'Name', value: 'name' },
  ];

  useEffect(() => {
    const fetchRole = async () => {
      const role = await AsyncStorage.getItem('role');
      setUserRole(role);
    };

    fetchRole();
  }, []);

  useEffect(() => {
    fetchRegions();
  }, [currentPage, sortField, sortOrder]);

  const fetchRegions = async () => {
    const token = await AsyncStorage.getItem('token');

    axios.get(`${api}/api/regions`, {
      params: {
        page: currentPage,
        size: ROWS_PER_PAGE,
        sort: `${sortField},${sortOrder}`
      },
      headers: {
        "Content-Type": 'application/json',
        Authorization: `Bearer ${token}`
      }
    }).then(response => {
      setRegions(response.data.content);
      setTotalPages(response.data.totalPages);
    }).catch(error => {
      console.error('Error fetching data: ', error);
    });
  };

  const handleCancel = () => {
    setEditData({});
    setNewData({});
  };

  const handleRowPress = (region) => {
    setSelectedRegion(region);
    setEditData(region);
    setIsEditing(true);
    setModalVisible(true);
  };

  const handleSave = async () => {
    const token = await AsyncStorage.getItem('token');

    axios.put(`${api}/api/regions/update/${editData.id}`, editData, {
      headers: {
        "Content-Type": 'application/json',
        Authorization: `Bearer ${token}`
      }
    }).then(response => {
      setRegions((prevRegions) => prevRegions.map((region) => (region.id === editData.id ? editData : region)));
      setModalVisible(false);
      setIsEditing(false);
      Toast.show({
        type: 'success',
        text1: 'Region updated successfully',
        position: 'bottom'
      });
    }).catch(error => {
      console.error('Error saving data: ', error);
      Toast.show({
        type: 'error',
        text1: `Error saving data: ${error.message}`,
        position: 'bottom'
      });
    });
  };

  const handleDelete = async (regionId) => {
    Alert.alert(
      "Delete",
      "Are you sure you want to delete this region?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          onPress: async () => {
            const token = await AsyncStorage.getItem('token');

            axios.delete(`${api}/api/regions/${regionId}`, {
              headers: {
                "Content-Type": 'application/json',
                Authorization: `Bearer ${token}`
              }
            }).then(response => {
              setRegions((prevRegions) => prevRegions.filter((region) => region.id !== regionId));
              Toast.show({
                type: 'success',
                text1: 'Region deleted successfully',
                position: 'bottom'
              });
            }).catch(error => {
              console.error('Error deleting data: ', error);
              Toast.show({
                type: 'error',
                text1: `Error deleting region: ${error.message}`,
                position: 'bottom'
              });
            });
          }
        }
      ],
      { cancelable: false }
    );
  };

  const handleAddNew = () => {
    setIsEditing(false);
    setModalVisible(true);
  };

  const handleAdd = async () => {
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      console.error('No token found');
      return;
    }
    console.log(newData);
    
    axios.post(`${api}/api/regions/create`, {
      name: newData.name
    }, {
      headers: {
        "Content-Type": 'application/json',
        Authorization: `Bearer ${token}`
      }
    }).then(response => {
      setRegions([...regions, response.data]);
      setModalVisible(false);
      Toast.show({
        type: 'success',
        text1: 'Region added successfully',
        position: 'bottom'
      });
    }).catch(error => {
      console.error('Error adding data: ', error);
      Toast.show({
        type: 'error',
        text1: `Error adding region: ${error.message}`,
        position: 'bottom'
      });
    });
  };

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.box}>
      <Text style={styles.boxText}>Name: {item.name}</Text>
      {userRole !== 'ROLE_USER' && (
        <View style={styles.actionsContainer}>
          <Text style={styles.boxText}>Actions: </Text>
          <TouchableOpacity style={styles.editButton} onPress={() => handleRowPress(item)}>
            <Ionicons name="pencil-outline" size={20} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item.id)}>
            <Ionicons name="trash-outline" size={20} color={'red'} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Navbar />
      <View style={styles.content}>
        <Text style={styles.userText}>REGIONS</Text>
        {userRole !== 'ROLE_USER' && (
          <TouchableOpacity style={styles.addButton} onPress={handleAddNew}>
            <Ionicons name="add" size={20} color={'white'} />
          </TouchableOpacity>
        )}
        <SortPicker
          sortField={sortField}
          setSortField={setSortField}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
          sortFields={sortFields}
        />
        <FlatList
          data={regions}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          numColumns={1} // Ensure one box per row
        />
        <View style={styles.pagination}>
          <TouchableOpacity onPress={handlePrevPage} disabled={currentPage === 0}>
            <Ionicons name="arrow-back-outline" size={40} color={currentPage === 0 ? 'gray' : 'white'} />
          </TouchableOpacity>
          <Text style={styles.pageNumber}>{currentPage + 1}</Text>
          <TouchableOpacity onPress={handleNextPage} disabled={currentPage >= totalPages - 1}>
            <Ionicons name="arrow-forward-outline" size={40} color={currentPage >= totalPages - 1 ? 'gray' : 'white'} />
          </TouchableOpacity>
        </View>
      </View>

      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>{isEditing ? 'Edit Region' : 'Add Region'}</Text>
          <TextInput
            style={styles.input}
            value={isEditing ? editData.name : newData.name}
            onChangeText={(text) => isEditing ? setEditData({ ...editData, name: text }) : setNewData({ ...newData, name: text })}
            placeholder="Name"
          />
          <View style={styles.buttonContainer}>
            <Button title="Cancel" onPress={() => (
                setModalVisible(false),
                handleCancel()
              )}
            />
            <Button title={isEditing ? "Save" : "Add"} onPress={isEditing ? handleSave : handleAdd} />
          </View>
        </View>
      </Modal>

      {/* Toast Config */}
      <Toast ref={(ref) => Toast.setRef(ref)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1c1c1c',
  },
  content: {
    flex: 1,
    padding: 10,
    marginTop: 100, // Changed from top to marginTop
  },
  header: {
    flexDirection: 'row',
    backgroundColor: '#ccc',
    padding: 10,
  },
  headerCell: {
    flex: 1,
    fontWeight: 'bold',
    marginRight: 15,
  },
  row: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  cell: {
    flex: 1,
    padding: 5,
  },
  box: {
    flex: 1,
    backgroundColor: '#fff',
    margin: 10,
    padding: 20,
    borderRadius: 10,
    elevation: 3,
  },
  boxText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  editButton: {
    marginLeft: 10,
  },
  deleteButton: {
    marginLeft: 10,
  },
  addButton: {
    backgroundColor: 'green',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-end',
  },
  buttonText: {
    color: '#fff',
  },
  modalContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    marginTop: 100, // Changed from top to marginTop
  },
  modalTitle: {
    fontSize: 20,
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
    height: 40,
    justifyContent: 'center',
  },
  userText: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
    fontWeight: 'bold'
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#1c1c1c',
    marginTop: 10, // Changed from bottom to marginTop
  },
  pageNumber: {
    color: 'white',
    fontSize: 20,
  },
});
