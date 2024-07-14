import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal, TextInput, Button, Alert } from 'react-native';
import Navbar from '../../../components/navbar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { api } from '../../../constants/api';
import { Ionicons } from '@expo/vector-icons'; // Import Ionicons for the menu icon
import SortPicker from '../../../components/sortPicker';
import Toast from 'react-native-toast-message'; // Import Toast

const ROWS_PER_PAGE = 5;

export default function Cities() {
  const [rows, setRows] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [newData, setNewData] = useState({
    name: '',
  });

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
    const fetchData = async () => {
      const token = await AsyncStorage.getItem('token');

      const response = await axios.get(`${api}/api/cities`, {
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
        setRows(response.data.content);
        setTotalPages(response.data.totalPages);
        console.log('response.data: ', response.data);
      }).catch(error => {
        console.error('Error fetching data: ', error);
      });
    };

    fetchData();
  }, [currentPage, sortField, sortOrder]);

  const handleRowPress = (row) => {
    setSelectedRow(row);
    setEditData(row);
    setIsEditing(true);
    setModalVisible(true);
  };

  const handleSave = async () => {
    const token = await AsyncStorage.getItem('token');
    const response = await axios.put(`${api}/api/cities/update/${editData.id}`, {
      name: editData.name
    }, {
      headers: {
        "Content-Type": 'application/json',
        Authorization: `Bearer ${token}`
      }
    }).then(response => {
      setRows((prevRows) => prevRows.map((row) => (row.id === editData.id ? editData : row)));
      setModalVisible(false);
      setIsEditing(false);
      Toast.show({
        type: 'success',
        text1: 'City updated successfully',
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

  const handleDelete = async (rowId) => {
    Alert.alert(
      "Delete",
      "Are you sure you want to delete this city?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          onPress: async () => {
            const token = await AsyncStorage.getItem('token');
            const response = await axios.delete(`${api}/api/cities/${rowId}`, {
              headers: {
                "Content-Type": 'application/json',
                Authorization: `Bearer ${token}`
              }
            }).then(response => {
              setRows((prevRows) => prevRows.filter((row) => row.id !== rowId));
              Toast.show({
                type: 'success',
                text1: 'City deleted successfully',
                position: 'bottom'
              });
            }).catch(error => {
              console.error('Error deleting data: ', error);
              Toast.show({
                type: 'error',
                text1: `Error deleting city: ${error.message}`,
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
    setModalVisible(true);
    setIsEditing(false);
  };

  const handleAdd = async () => {
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      console.error('No token found');
      return;
    }
    console.log(newData);

    axios.post(`${api}/api/cities/create`, {
      name: newData.name
    }, {
      headers: {
        "Content-Type": 'application/json',
        Authorization: `Bearer ${token}`
      }
    }).then(response => {
      setRows([...rows, response.data]);
      setModalVisible(false);
      Toast.show({
        type: 'success',
        text1: 'City added successfully',
        position: 'bottom'
      });
      console.log('response.data: ', response.data);
    }).catch(error => {
      console.error('Error adding data: ', error);
      Toast.show({
        type: 'error',
        text1: `Error adding city: ${error.message}`,
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
        <Text style={styles.userText}>CITIES</Text>
        {userRole !== 'ROLE_USER' && (
          <TouchableOpacity style={styles.addButton} onPress={handleAddNew}>
            <Ionicons name="add" size={20} color={'white'} />
          </TouchableOpacity>
        )}
        <SortPicker
          sortFields={sortFields}
          setSortField={setSortField}
          setSortOrder={setSortOrder}
          sortField={sortField}
          sortOrder={sortOrder}
        />
        <FlatList
          data={rows}
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
          <Text style={styles.modalTitle}>{isEditing ? 'Edit Data' : 'Add Data'}</Text>
          <TextInput
            style={styles.input}
            value={isEditing ? editData.name : newData.name}
            onChangeText={(text) => isEditing ? setEditData({ ...editData, name: text }) : setNewData({ ...newData, name: text })}
            placeholder="Name"
          />
          <View style={styles.buttonContainer}>
            <Button title="Cancel" onPress={() => setModalVisible(false)} />
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
  userText: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
    fontWeight: 'bold'
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
