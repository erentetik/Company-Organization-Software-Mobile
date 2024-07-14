import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal, TextInput, Button, Alert } from 'react-native';
import Navbar from '../../../components/navbar';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../../../constants/api';
import { Ionicons } from '@expo/vector-icons';
import SortPicker from '../../../components/sortPicker';
import Toast from 'react-native-toast-message'; // Import Toast

const ROWS_PER_PAGE = 5;

export default function Companies() {
  const [companies, setCompanies] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [newData, setNewData] = useState({
    name: '',
    shortName: '',
    companyTypeId: '',
    townId: '',
    addressStreet: '',
  });
  const [companyTypeModalVisible, setCompanyTypeModalVisible] = useState(false);
  const [companyTypes, setCompanyTypes] = useState([]);
  const [townModalVisible, setTownModalVisible] = useState(false);
  const [towns, setTowns] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);

  const [userRole, setUserRole] = useState('');

  const [sortField, setSortField] = useState('id');
  const [sortOrder, setSortOrder] = useState('asc');
  const sortFields = [
    { label: 'ID', value: 'id' },
    { label: 'Name', value: 'name' },
    { label: 'Short Name', value: 'shortName' },
    { label: 'Company Type', value: 'companyType.name' },
    { label: 'Town', value: 'town.name' },
    { label: 'Address Street', value: 'addressStreet' },
  ];

  useEffect(() => {
    const fetchRole = async () => {
      const role = await AsyncStorage.getItem('role');
      setUserRole(role);
    };

    fetchRole();
  }, []);

  useEffect(() => {
    fetchCompanies();
  }, [currentPage, sortField, sortOrder]);

  const fetchCompanies = async () => {
    const token = await AsyncStorage.getItem('token');
    axios.get(`${api}/api/company`, {
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
      setCompanies(response.data.content);
      setTotalPages(response.data.totalPages);
    }).catch(error => {
      console.error('Error fetching data: ', error);
    });
  };

  const handleCancel = () => {
    setEditData({});
    setNewData({});
  };

  const handleRowPress = (company) => {
    setSelectedCompany(company);
    setEditData({
      ...company,
      companyTypeId: company.companyType?.id || '',
      townId: company.town?.id || ''
    });
    setIsEditing(true);
    setModalVisible(true);
  };

  const handleShowData = (company) => {
    setSelectedCompany(company);
    setDetailModalVisible(true);
  };

  const handleSave = async () => {
    const token = await AsyncStorage.getItem('token');

    axios.put(`${api}/api/company/update/${editData.id}`, {
      name: editData.name,
      shortName: editData.shortName,
      companyTypeId: editData.companyTypeId,
      townId: editData.townId,
      addressStreet: editData.addressStreet
    }, {
      headers: {
        "Content-Type": 'application/json',
        Authorization: `Bearer ${token}`
      },
      params: {
        companyId: editData.id
      }
    }).then(response => {
      setCompanies((prevCompanies) => prevCompanies.map((company) => (company.id === editData.id ? editData : company)));
      setModalVisible(false);
      setIsEditing(false);
      Toast.show({
        type: 'success',
        text1: 'Company updated successfully',
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

  const handleDelete = async (companyId) => {
    Alert.alert(
      "Delete",
      "Are you sure you want to delete this company?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          onPress: async () => {
            const token = await AsyncStorage.getItem('token');
            axios.delete(`${api}/api/company/${companyId}`, {
              headers: {
                "Content-Type": 'application/json',
                Authorization: `Bearer ${token}`
              }
            }).then(response => {
              setCompanies((prevCompanies) => prevCompanies.filter((company) => company.id !== companyId));
              Toast.show({
                type: 'success',
                text1: 'Company deleted successfully',
                position: 'bottom'
              });
            }).catch(error => {
              console.error('Error deleting data: ', error);
              Toast.show({
                type: 'error',
                text1: `Error deleting company: ${error.message}`,
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
    axios.post(`${api}/api/company/create`, newData, {
      headers: {
        "Content-Type": 'application/json',
        Authorization: `Bearer ${token}`
      }
    }).then(response => {
      setCompanies([...companies, response.data]);
      setModalVisible(false);
      Toast.show({
        type: 'success',
        text1: 'Company added successfully',
        position: 'bottom'
      });
    }).catch(error => {
      console.error('Error adding data: ', error);
      Toast.show({
        type: 'error',
        text1: `Error adding company: ${error.message}`,
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

  const handleCompanyTypeModal = async () => {
    const token = await AsyncStorage.getItem('token');
    axios.get(`${api}/api/companyTypes`, {
      headers: {
        "Content-Type": 'application/json',
        Authorization: `Bearer ${token}`
      }
    }).then(response => {
      setCompanyTypes(response.data);
    }).catch(error => {
      console.error('Error fetching company types: ', error);
    });
  };

  const handleCompanyTypeSelect = (item) => {
    if (isEditing) {
      setEditData({ ...editData, companyTypeId: item.id, companyType: item });
    } else {
      setNewData({ ...newData, companyTypeId: item.id, companyType: item });
    }
    setCompanyTypeModalVisible(false);
  };

  const handleTownModal = async () => {
    const token = await AsyncStorage.getItem('token');
    axios.get(`${api}/api/towns/list`, {
      headers: {
        "Content-Type": 'application/json',
        Authorization: `Bearer ${token}`
      }
    }).then(response => {
      setTowns(response.data);
      console.log(response.data);
    }).catch(error => {
      console.error('Error fetching towns: ', error);
    });
  };

  const handleTownSelect = (item) => {
    if (isEditing) {
      setEditData({ ...editData, townId: item.id, town: item });
    } else {
      setNewData({ ...newData, townId: item.id, town: item });
    }
    setTownModalVisible(false);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.box} onPress={() => handleShowData(item)}>
      <Text style={styles.boxText}>Name: {item.name}</Text>
      <Text style={styles.boxText}>Type: {item.companyType ? item.companyType.name : 'N/A'}</Text>
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
        <Text style={styles.userText}>COMPANIES</Text>
        {userRole !== 'ROLE_USER' && (
          <TouchableOpacity style={styles.addButton} onPress={handleAddNew}>
            <Ionicons name="add" size={20} color={'white'} />
          </TouchableOpacity>
        )}
        <SortPicker
          sortFields={sortFields}
          setSortField={setSortField}
          setSortOrder={setSortOrder}
          sortOrder={sortOrder}
          sortField={sortField}
        />
        <FlatList
          data={companies}
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
          <Text style={styles.modalTitle}>Company Details</Text>
          {selectedCompany && (
            <>
              <Text style={styles.boxText}>Name: {selectedCompany.name}</Text>
              <Text style={styles.boxText}>Short Name: {selectedCompany.shortName}</Text>
              <Text style={styles.boxText}>Type: {selectedCompany.companyType ? selectedCompany.companyType.name : 'N/A'}</Text>
              <Text style={styles.boxText}>Town: {selectedCompany.town ? selectedCompany.town.name : 'N/A'}</Text>
              <Text style={styles.boxText}>Address: {selectedCompany.addressStreet}</Text>
            </>
          )}
          <Button title="Close" onPress={() => setDetailModalVisible(false)} />
        </View>
      </Modal>

      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>{isEditing ? 'Edit Company' : 'Add Company'}</Text>
          <TextInput
            style={styles.input}
            value={isEditing ? editData.name : newData.name}
            onChangeText={(text) => isEditing ? setEditData({ ...editData, name: text }) : setNewData({ ...newData, name: text })}
            placeholder="Name"
          />
          <TextInput
            style={styles.input}
            value={isEditing ? editData.shortName : newData.shortName}
            onChangeText={(text) => isEditing ? setEditData({ ...editData, shortName: text }) : setNewData({ ...newData, shortName: text })}
            placeholder="Short Name"
          />
          {/* CHOOSE COMPANY TYPE */}
          <View>
            <TouchableOpacity
              style={styles.input}
              onPress={() => {
                setCompanyTypeModalVisible(true);
                handleCompanyTypeModal();
              }}
            >
              <Text style={styles.roleText}>
                {isEditing 
                  ? (companyTypes.find(companyType => companyType.id === editData.companyTypeId)?.name || 'Company Type') 
                  : (companyTypes.find(companyType => companyType.id === newData.companyTypeId)?.name || 'Company Type')}
              </Text>
            </TouchableOpacity>
          </View>

          <Modal visible={companyTypeModalVisible} animationType="slide">
            <View style={styles.roleModalContainer}>
              <Text style={styles.roleModalTitle}>Select Company Type</Text>
              <FlatList
                data={companyTypes}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.roleButton}
                    onPress={() => handleCompanyTypeSelect(item)}
                  >
                    <Text style={styles.roleButtonText}>{item.name}</Text>
                  </TouchableOpacity>
                )}
                keyExtractor={(item) => item.id.toString()}
              />
              <Button title="Cancel" onPress={() => setCompanyTypeModalVisible(false)} />
            </View>
          </Modal>
          {/* CHOOSE TOWN  */}
          <View>
            <TouchableOpacity
              style={styles.input}
              onPress={() => {
                setTownModalVisible(true);
                handleTownModal();
              }}
            >
              <Text style={styles.roleText}>
                {isEditing 
                  ? (towns.find(town => town.id === editData.townId)?.name || 'Town') 
                  : (towns.find(town => town.id === newData.townId)?.name || 'Town')}
              </Text>
            </TouchableOpacity>
          </View>

          <Modal visible={townModalVisible} animationType="slide">
            <View style={styles.roleModalContainer}>
              <Text style={styles.roleModalTitle}>Select Town</Text>
              <FlatList
                data={towns}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.roleButton}
                    onPress={() => handleTownSelect(item)}
                  >
                    <Text style={styles.roleButtonText}>{item.name}</Text>
                  </TouchableOpacity>
                )}
                keyExtractor={(item) => item.id.toString()}
              />
              <Button title="Cancel" onPress={() => setTownModalVisible(false)} />
            </View>
          </Modal>
          <TextInput
            style={styles.input}
            value={isEditing ? editData.addressStreet : newData.addressStreet}
            onChangeText={(text) => isEditing ? setEditData({ ...editData, addressStreet: text }) : setNewData({ ...newData, addressStreet: text })}
            placeholder="Address Street"
          />
          <View style={styles.buttonContainer}>
            <Button title="Cancel" onPress={() => {
              setModalVisible(false);
              handleCancel();
            }}
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
    top: 100
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
    paddingBottom:10,
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
  modalContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  userText: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
    fontWeight: 'bold'
  },
  modalTitle: {
    fontSize: 20,
    marginBottom: 20,
    textAlign: 'center',
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
