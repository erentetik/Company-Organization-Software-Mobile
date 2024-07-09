import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal, TextInput, Button, Alert } from 'react-native';
import Navbar from '../../../components/navbar';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../../../constants/api';
import { Ionicons } from '@expo/vector-icons'; // Import Ionicons for the menu icon

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

  useEffect(() => {
    fetchRegions();
  }, [currentPage]);

  const fetchRegions = async () => {
    const token = await AsyncStorage.getItem('token');

    axios.get(`${api}/api/regions`, {
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
    }).catch(error => {
      console.error('Error saving data: ', error);
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
            }).catch(error => {
              console.error('Error deleting data: ', error);
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

    axios.post(`${api}/api/regions/create`, newData, {
      headers: {
        "Content-Type": 'application/json',
        Authorization: `Bearer ${token}`
      }
    }).then(response => {
      setRegions([...regions, response.data]);
      setModalVisible(false);
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
          data={regions}
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
          <TouchableOpacity onPress={handleNextPage} disabled={(currentPage + 1) * ROWS_PER_PAGE >= regions.length}>
            <Ionicons name="arrow-forward-outline" size={40} color={(currentPage + 1) * ROWS_PER_PAGE >= regions.length ? 'gray' : 'white'} />
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
