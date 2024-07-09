import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal, TextInput, Button, Alert } from 'react-native';
import Navbar from '../../../components/navbar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { api } from '../../../constants/api';
import tableData from '../../../data/citydata';
import { Ionicons } from '@expo/vector-icons'; // Import Ionicons for the menu icon

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

  useEffect(() => {
    const fetchData = async () => {
      const token = await AsyncStorage.getItem('token');

      const response = await axios.get(`${api}/api/cities`, {
        params: {
          page: currentPage,
          size: ROWS_PER_PAGE,
          sort: 'id,asc'
        },
        headers: {
          "Content-Type": 'application/json',
          Authorization: `Bearer ${token}`
        }
      }).then(response => {
        setRows(response.data.content);
        setTotalPages(response.data.totalPages);
      }).catch(error => {
        console.error('Error fetching data: ', error);
      });
    };

    fetchData();
  }, [currentPage]);


  const handleRowPress = (row) => {
    setSelectedRow(row);
    setEditData(row);
    setIsEditing(true);
    setModalVisible(true);
  };

  const handleSave = async() => {
    const token = await AsyncStorage.getItem('token');
    const response = await axios.put(`${api}/api/cities/update/${editData.id}`, {
        name: editData.name
      }, 
      {
        headers: {
          "Content-Type": 'application/json',
          Authorization: `Bearer ${token}`
        }
    }).then(response => {
      setRows((prevRows) => prevRows.map((row) => (row.id === editData.id ? editData : row)));
      setModalVisible(false);
      setIsEditing(false);
    }
    ).catch(error => {
      console.error('Error saving data: ', error);
    });
  };

  const handleDelete = async(rowId) => {
    const token = await AsyncStorage.getItem('token');
    const response = await axios.delete(`${api}/api/cities/${rowId}`, {
      headers: {
        "Content-Type": 'application/json',
        Authorization: `Bearer ${token}`
      }
    }).then(response => {
      Alert.alert(
        "Delete",
        "Are you sure you want to delete this town?",
        [
          {
            text: "Cancel",
            style: "cancel"
          },
          {
            text: "Delete",
            onPress: () => {
              setRows((prevRows) => prevRows.filter((row) => row.id !== rowId));
            }
          }
        ],
        { cancelable: false }
      );
    }).catch(error => {
      console.error('Error deleting data: ', error);
    });
    
  };
  const handleAddNew = () => {
    setModalVisible(true);
    setIsEditing(false);

  };
  
  const handleAdd = async () => { //fix it
    const token = await AsyncStorage.getItem('token');
    const response = await axios.post(`${api}/api/cities/create`, {
      name: newData.name,
      headers: {
        "Content-Type": 'application/json',
        Authorization: `Bearer ${token}`
      }
    }).then(response => {
      setRows([...rows, response.data]);
      setModalVisible(false);
      console.log('response.data: ', response.data);
    }).catch(error => {
      console.error('Error adding data: ', error);
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
    <View style={styles.row}>
      <Text style={styles.cell}>{item.name}</Text>
      <TouchableOpacity style={styles.editButton} onPress={() => handleRowPress(item)}>
        <Ionicons name="pencil-outline" size={20} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item.id)}>
        <Ionicons name="trash-outline" size={20} color={'red'} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Navbar />
      <View style={styles.content}>
        <TouchableOpacity style={styles.addButton} onPress={handleAddNew}>
          <Ionicons name="add" size={20} color={'white'} />
        </TouchableOpacity>
        <FlatList
          data={rows}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          ListHeaderComponent={() => (
            <View style={styles.header}>
              <Text style={styles.headerCell}>Name</Text>
              <Text style={styles.headerCell}>Actions</Text>
            </View>
          )}
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
    top: 100,
  },
  header: {
    flexDirection: 'row',
    backgroundColor: '#ccc',
    padding: 10,
  },
  headerCell: {
    flex: 1,
    fontWeight: 'bold',
    padding: 5,
    marginHorizontal: 20,
    
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    display: 'flex',
    backgroundColor: '#fff',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  cell: {
    flex: 1,
    padding: 5,
  },
  editButton: {
    padding: 5,
    margin: 2,
  },
  deleteButton: {
    padding: 5,
    margin: 2,
  },
  addButton: {
    backgroundColor: 'green',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    width: 40,
    height: 40,
    left: 345,
  },
  buttonText: {
    color: '#fff',
  },
  modalContainer: {
    flex: 1,
    top: 100,
    padding: 20,
    backgroundColor: '#fff',
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
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#1c1c1c',
    bottom: 200,
  },
  pageNumber: {
    color: 'white',
    fontSize: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

