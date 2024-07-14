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

export default function Towns() {
  const [towns, setTowns] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedTown, setSelectedTown] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [regionModalVisible, setRegionModalVisible] = useState(false);
  const [cityModalVisible, setCityModalVisible] = useState(false);
  const [editData, setEditData] = useState({});
  const [newData, setNewData] = useState({
    name: '',
    regionId: '',
    regionName: '',
    cityId: '',
    cityName: '',
  });
  const [currentPage, setCurrentPage] = useState(0);

  const [userRole, setUserRole] = useState('');
  const [regions, setRegions] = useState([]);
  const [cities, setCities] = useState([]);

  const [sortField, setSortField] = useState('id');
  const [sortOrder, setSortOrder] = useState('asc');

  const sortFields = [
    { label: 'ID', value: 'id' },
    { label: 'Name', value: 'name' },
    { label: 'Region', value: 'region' },
    { label: 'City', value: 'city' }
  ];

  useEffect(() => {
    const fetchRole = async () => {
      const role = await AsyncStorage.getItem('role');
      setUserRole(role);
    };

    fetchRole();
  }, []);

  useEffect(() => {
    fetchTowns();
  }, [currentPage, sortField, sortOrder]);

  const fetchTowns = async () => {
    const token = await AsyncStorage.getItem('token');

    axios.get(`${api}/api/towns`, {
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
      setTowns(response.data.content);
      setTotalPages(response.data.totalPages);
    }).catch(error => {
      console.error('Error fetching data: ', error);
    });
  };

  const handleCancel = () => {
    setEditData({});
    setNewData({
      name: '',
      regionId: '',
      regionName: '',
      cityId: '',
      cityName: '',
    });
  };

  const handleRowPress = (town) => {
    setSelectedTown(town);
    setEditData({
      id: town.id,
      name: town.name,
      regionId: town.region.id,
      regionName: town.region.name,
      cityId: town.city.id,
      cityName: town.city.name,
    });
    setIsEditing(true);
    setModalVisible(true);
  };

  const handleShowData = (town) => {
    setSelectedTown(town);
    setDetailModalVisible(true);
  };

  const handleSave = async () => {
    const token = await AsyncStorage.getItem('token');
    console.log('Edit data: ', editData)
  
    axios.put(`${api}/api/towns/update/${editData.id}`, editData, {
      headers: {
        "Content-Type": 'application/json',
        Authorization: `Bearer ${token}`
      }
    }).then(response => {
      const updatedTown = response.data;
      setTowns((prevTowns) => prevTowns.map((town) => (town.id === editData.id ? updatedTown : town)));
      setModalVisible(false);
      setIsEditing(false);
      Toast.show({
        type: 'success',
        text1: 'Town updated successfully',
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

  const handleDelete = async (townId) => {
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
          onPress: async () => {
            const token = await AsyncStorage.getItem('token');

            axios.delete(`${api}/api/towns/${townId}`, {
              headers: {
                "Content-Type": 'application/json',
                Authorization: `Bearer ${token}`
              }
            }).then(response => {
              setTowns((prevTowns) => prevTowns.filter((town) => town.id !== townId));
              Toast.show({
                type: 'success',
                text1: 'Town deleted successfully',
                position: 'bottom'
              });
            }).catch(error => {
              console.error('Error deleting data: ', error);
              Toast.show({
                type: 'error',
                text1: `Error deleting town: ${error.message}`,
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
    setNewData({
      name: '',
      regionId: '',
      regionName: '',
      cityId: '',
      cityName: '',
    });
    setIsEditing(false);
    setModalVisible(true);
  };

  const handleAdd = async () => {
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      console.error('No token found');
      return;
    }

    axios.post(`${api}/api/towns/create`, {
      name: newData.name,
      regionId: newData.regionId,
      cityId: newData.cityId
    }, {
      headers: {
        "Content-Type": 'application/json',
        Authorization: `Bearer ${token}`
      }
    }).then(response => {
      setTowns([...towns, response.data]);
      setModalVisible(false);
      Toast.show({
        type: 'success',
        text1: 'Town added successfully',
        position: 'bottom'
      });
    }).catch(error => {
      console.error('Error adding data: ', error);
      Toast.show({
        type: 'error',
        text1: `Error adding town: ${error.message}`,
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
      console.error('Error fetching regions: ', error);
    });
  };

  const handleRegionSelect = (item) => {
    if (isEditing) {
      setEditData({ ...editData, regionId: item.id, regionName: item.name });
    } else {
      setNewData({ ...newData, regionId: item.id, regionName: item.name });
    }
    setRegionModalVisible(false);
  };

  const handleCityModal = async () => {
    const token = await AsyncStorage.getItem('token');
    axios.get(`${api}/api/cities/list`, {
      headers: {
        "Content-Type": 'application/json',
        Authorization: `Bearer ${token}`
      }
    }).then(response => {
      setCities(response.data);
    }).catch(error => {
      console.error('Error fetching cities: ', error);
    });
  };

  const handleCitySelect = (item) => {
    if (isEditing) {
      setEditData({ ...editData, cityId: item.id, cityName: item.name });
    } else {
      setNewData({ ...newData, cityId: item.id, cityName: item.name });
    }
    setCityModalVisible(false);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.box} onPress={() => handleShowData(item)}>
      <Text style={styles.boxText}>Name: {item.name}</Text>
      <Text style={styles.boxText}>City: {item.city.name}</Text>
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
        <SortPicker 
          sortField={sortField} 
          setSortField={setSortField} 
          sortOrder={sortOrder} 
          setSortOrder={setSortOrder} 
          sortFields={sortFields} 
        />
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
          <TouchableOpacity onPress={handleNextPage} disabled={currentPage >= totalPages - 1}>
            <Ionicons name="arrow-forward-outline" size={40} color={currentPage >= totalPages - 1 ? 'gray' : 'white'} />
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
              <Text style={styles.boxText}>Region: {selectedTown.region.name}</Text>
              <Text style={styles.boxText}>City: {selectedTown.city.name}</Text>
            </>
          )}
          <Button title="Close" onPress={() => setDetailModalVisible(false)} />
        </View>
      </Modal>

      {/* Add/Edit Modal */}
      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>{isEditing ? 'Edit Town' : 'Add Town'}</Text>
          <TextInput
            style={styles.input}
            value={isEditing ? editData.name : newData.name}
            onChangeText={(text) => isEditing ? setEditData({ ...editData, name: text }) : setNewData({ ...newData, name: text })}
            placeholder="Name"
          />
          {/* REGION */}
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
                  ? (editData.regionName || 'Region') 
                  : (newData.regionName || 'Region')}
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

          {/* CITY */}
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
                  ? (editData.cityName || 'City') 
                  : (newData.cityName || 'City')}
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
            <Button title="Cancel" onPress={() => {
              setModalVisible(false);
              handleCancel();
            }} />
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
    marginTop: 100,
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
    paddingBottom: 10,
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
    marginTop: 100,
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
    marginTop: 10,
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
    paddingTop: 40,
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
});
