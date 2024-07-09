import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal, TextInput, Button, Alert } from 'react-native';
import Navbar from '../../../components/navbar';
import tableData from '../../../data/TownData';
import { Ionicons } from '@expo/vector-icons'; // Import Ionicons for the menu icon
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { api } from '../../../constants/api';

const ROWS_PER_PAGE = 5;

export default function Towns() {
  const [towns, setTowns] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedTown, setSelectedTown] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [newData, setNewData] = useState({
    name: '',
    region: '',
    city: '',
  });
  const [currentPage, setCurrentPage] = useState(0);

  const [regionModalVisible, setRegionModalVisible] = useState(false);
  const [regions, setRegions] = useState([]);
  const [cityModalVisible, setCityModalVisible] = useState(false);
  const [cities, setCities] = useState([]);

  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    const fetchRole = async () => {
      const role = await AsyncStorage.getItem('role');
      setUserRole(role);
    };

    fetchRole();
  }, []);

  useEffect(() => {
    fetchRegions();
  }, [currentPage]);

  const fetchRegions = async () => {
    const token = await AsyncStorage.getItem('token');

    axios.get(`${api}/api/towns`, {
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
      setTowns(response.data.content);
      setTotalPages(response.data.totalPages);
    }).catch(error => {
      console.error('Error fetching data: ', error);
    });
  };

  const handleRegionModal = async () => {
    const token = await AsyncStorage.getItem('token');
    axios.get(`${api}/api/regions/list`, {
      headers: {
        "Content-Type": 'application/json',
        Authorization: `Bearer ${token}`
      }
    }).then(response => {
      setRegions(response.data);
    }).catch(error => {
      console.error('Error fetching company types: ', error);
    });
  };
  const handleRegionSelect = (item) => {
    if (isEditing) {
      setEditData({ ...editData, regionId: item.id });
    } else {
      setNewData({ ...newData, regionId: item.id });
    }
    setRegionModalVisible(false);
  };
  const handleCityModal = async () => {
    const token = await AsyncStorage.getItem('token');
    axios.get(`${api}/api/city/list`, {
      headers: {
        "Content-Type": 'application/json',
        Authorization: `Bearer ${token}`
      }
    }).then(response => {
      setCities(response.data);
    }).catch(error => {
      console.error('Error fetching towns: ', error);
    });
  };
  const handleCitySelect = (item) => {
    if (isEditing) {
      setEditData({ ...editData, cityId: item.id });
    } else {
      setNewData({ ...newData, cityId: item.id });
    }
    setCityModalVisible(false);
  };

  const handleRowPress = (town) => {
    setSelectedTown(town);
    setEditData(town);
    setIsEditing(true);
    setModalVisible(true);
  };

  const handleShowData = (town) => {
    setSelectedTown(town);
    setDetailModalVisible(true);
  };

  const handleSave = () => {
    setRows((prevRows) => prevRows.map((row) => (row.id === editData.id ? editData : row)));
    setModalVisible(false);
    setIsEditing(false);
  };

  const handleDelete = (rowId) => {
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
  };

  const handleAddNew = () => {
    setNewData({
      name: '',
      region: '',
      city: '',
    });
    setIsEditing(false);
    setModalVisible(true);
  };

  const handleAdd = () => {
    setRows([...rows, newData]);
    setModalVisible(false);
  };

  const handleNextPage = () => {
    if ((currentPage + 1) * ROWS_PER_PAGE < rows.length) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.box} onPress={() => handleShowData(item)}>
      <Text style={styles.boxText}>Name: {item.name}</Text>
      <Text style={styles.boxText}>City: {item.city}</Text>
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
    </TouchableOpacity>
  );
  

  return (
    <View style={styles.container}>
      <Navbar />
      <View style={styles.content}>
        <Text style={styles.userText}>TOWNS</Text>
        {userRole !== 'ROLE_USER' && (
          <TouchableOpacity style={styles.addButton} onPress={handleAddNew}>
            <Ionicons name="add" size={20} color={'white'} />
          </TouchableOpacity>
        )}
        <FlatList
          data={towns}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          numColumns={1} // Ensure one box per row
        />
        <View style={styles.pagination}>
          <TouchableOpacity onPress={handlePrevPage} disabled={currentPage === 0}>
            <Ionicons name="arrow-back-outline" size={40} color={currentPage === 0 ? 'gray' : 'white'} />
          </TouchableOpacity>
          <Text style={styles.pageNumber}>{currentPage + 1}</Text>
          <TouchableOpacity onPress={handleNextPage} disabled={(currentPage + 1) * ROWS_PER_PAGE >= towns.length}>
            <Ionicons name="arrow-forward-outline" size={40} color={(currentPage + 1) * ROWS_PER_PAGE >= towns.length ? 'gray' : 'white'} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Detail Modal */}
      <Modal visible={detailModalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Town Details</Text>
          {selectedTown && (
            <>
              <Text style={styles.boxText}>Name: {selectedTown.name}</Text>
              <Text style={styles.boxText}>Region: {selectedTown.region}</Text>
              <Text style={styles.boxText}>City: {selectedTown.city}</Text>
            </>
          )}
          <Button title="Close" onPress={() => setDetailModalVisible(false)} />
        </View>
      </Modal>

      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>{isEditing ? 'Edit Data' : 'Add Data'}</Text>
          <TextInput
            style={styles.input}
            value={isEditing ? editData.name : newData.name}
            onChangeText={(text) => isEditing ? setEditData({ ...editData, name: text }) : setNewData({ ...newData, name: text })}
            placeholder="Name"
          />
          {/* CHOOSE REGION */}
          <View>
            <TouchableOpacity
              style={styles.input}
              onPress={() => {
                setRegionModalVisible(true);
                handleRegionModal();
              }}
            >
              <Text style={styles.roleText}>
                {isEditing 
                  ? (regions.find(region => region.id === editData.regionId)?.name || 'Region') 
                  : (regions.find(region => region.id === newData.regionId)?.name || 'Region')}
              </Text>
            </TouchableOpacity>
          </View>

          <Modal visible={regionModalVisible} animationType="slide">
            <View style={styles.roleModalContainer}>
              <Text style={styles.roleModalTitle}>Select Region</Text>
              <FlatList
                data={regions}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.roleButton}
                    onPress={() => handleRegionSelect(item)}
                  >
                    <Text style={styles.roleButtonText}>{item.name}</Text>
                  </TouchableOpacity>
                )}
                keyExtractor={(item) => item.id.toString()}
              />
              <Button title="Cancel" onPress={() => setRegionModalVisible(false)} />
            </View>
          </Modal>
          {/* CHOOSE City  */}
          <View>
            <TouchableOpacity
              style={styles.input}
              onPress={() => {
                setCityModalVisible(true);
                handleCityModal();
              }}
            >
              <Text style={styles.roleText}>
                {isEditing 
                  ? (cities.find(city => city.id === editData.cityId)?.name || 'City') 
                  : (cities.find(city => city.id === newData.cityId)?.name || 'City')}
              </Text>
            </TouchableOpacity>
          </View>

          <Modal visible={cityModalVisible} animationType="slide">
            <View style={styles.roleModalContainer}>
              <Text style={styles.roleModalTitle}>Select City</Text>
              <FlatList
                data={cities}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.roleButton}
                    onPress={() => handleCitySelect(item)}
                  >
                    <Text style={styles.roleButtonText}>{item.name}</Text>
                  </TouchableOpacity>
                )}
                keyExtractor={(item) => item.id.toString()}
              />
              <Button title="Cancel" onPress={() => setCityModalVisible(false)} />
            </View>
          </Modal>

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
    padding: 10,
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
    marginHorizontal: 5,
  },
  row: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  cell: {
    flex: 0.31,
    padding: 5,
    marginHorizontal: -2,
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
    top: 100,
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
    bottom: 100,
  },
  pageNumber: {
    color: 'white',
    fontSize: 20,
  },
  roleModalContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  roleModalTitle: {
    fontSize: 20,
    marginBottom: 20,
    textAlign: 'center',
  },
  roleButton: {
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 10,
    alignItems: 'center',
  },
  roleButtonText: {
    fontSize: 16,
  },
  disabledInput: {
    backgroundColor: '#f0f0f0',
    color: '#ccc',
  },
  userText: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
    fontWeight: 'bold'
  },
});
