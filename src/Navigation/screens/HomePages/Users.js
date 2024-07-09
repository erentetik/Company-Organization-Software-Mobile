import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal, TextInput, Button, Alert } from 'react-native';
import Navbar from '../../../components/navbar';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../../../constants/api';
import { Ionicons } from '@expo/vector-icons'; // Import Ionicons for the menu icon

const ROWS_PER_PAGE = 5;

export default function Users() {
  const [rows, setRows] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedRow, setSelectedRow] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [errorMessage, setErrorMessage] = useState('');
  const [companyId, setCompanyId] = useState();
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [newData, setNewData] = useState({
    name: '',
    surname: '',
    roleId: '',
    email: '',
    companyID: '',
    departmentID: '',
  });
  const [roles, setRoles] = useState([]);
  const [roleModalVisible, setRoleModalVisible] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [companyModalVisible, setCompanyModalVisible] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [departmentModalVisible, setDepartmentModalVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [userRole, setUserRole] = useState('');

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

      try {
        const response = await axios.get(`${api}/api/users`, {
          params: {
            page: currentPage,
            size: ROWS_PER_PAGE,
            sort: 'id,asc'
          },
          headers: {
            "Content-Type": 'application/json',
            Authorization: `Bearer ${token}`
          }
        });
        setRows(response.data.content);
        setTotalPages(response.data.totalPages);
      } catch (error) {
        console.error('Error fetching data: ', error);
      }
    };
    
    fetchData();
  }, [currentPage]);

  const handleCancel = () => {
    setEditData({});
    setNewData({});
  };

  const handleRowPress = (row) => {
    setSelectedRow(row);
    setEditData({
      ...row,
      roleId: row.roles.length > 0 ? row.roles[0].id : '',
      companyId: row.department.company.id,
      departmentId: row.department.departmentType.id,
    });
    setIsEditing(true);
    setModalVisible(true);
  };
  

  const handleSave = async () => {
    const token = await AsyncStorage.getItem('token');
    try {
      const response = await axios.put(`${api}/api/users/${editData.id}`, {
        name: editData.name,
        surname: editData.surname,
        email: editData.email,
        departmentId: editData.departmentId,
        roleId: editData.roleId,
      },
      {
        headers: {
          "Content-Type": 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
      setRows((prevRows) => prevRows.map((row) => (row.id === editData.id ? editData : row)));
      setModalVisible(false);
      setIsEditing(false);
      setErrorMessage('');
    } catch (error) {
      if (error.response) {
        console.error('Error saving data: ', error.response.data);
        setErrorMessage(`Error: ${error.response.data.message}`);
      } else if (error.request) {
        console.error('Error saving data: No response received', error.request);
        setErrorMessage('Error: No response from server.');
      } else {
        console.error('Error saving data: ', error.message);
        setErrorMessage(`Error: ${error.message}`);
      }
    }
  };

  const handleRoleModal = async () => {
    const token = await AsyncStorage.getItem('token');
    const response = await axios.get(`${api}/api/roles`, {
      headers: {
        "Content-Type": 'application/json',
        Authorization: `Bearer ${token}`
      }
    }).then(response => {
      setRoles(response.data);
    }).catch(error => {
      console.error('Error fetching data: ', error);
    });
  };

  const handleCompanyModal = async () => {
    const token = await AsyncStorage.getItem('token');
    const response = await axios.get(`${api}/api/company/list`, {
      headers: {
        "Content-Type": 'application/json',
        Authorization: `Bearer ${token}`
      }
    }).then(response => {
      setCompanies(response.data);
    }).catch(error => {
      console.error('Error fetching data: ', error);
    });
  };

  const handleCompanySelect = async (company, isEditing) => {
    const token = await AsyncStorage.getItem('token');
  
    axios.get(`${api}/api/department/get-by-company/${company.id}`, {
      headers: {
        "Content-Type": 'application/json',
        Authorization: `Bearer ${token}`
      }
    }).then(response => {
      setDepartments(response.data);
  
      if (isEditing) {
        setEditData({ ...editData, companyId: company.id, companyName: company.name });
      } else {
        setNewData({ ...newData, companyId: company.id, companyName: company.name });
      }
  
      setCompanyModalVisible(false);
    }).catch(error => {
      console.error('Error fetching data: ', error);
    });
  };

  const handleDepartmentModal = async () => {
    const token = await AsyncStorage.getItem('token');
    const companyIdToUse = editData.companyId ? editData.companyId : newData.companyId;

    const response = await axios.get(`${api}/api/department/get-by-company/${companyIdToUse}`, {
      headers: {
        "Content-Type": 'application/json',
        Authorization: `Bearer ${token}`
      }
    }).then(response => {
      setDepartments(response.data);
    }).catch(error => {
      console.error('Error fetching data: ', error);
    });
  };

  const printNewData = () => {
    console.log('newData: ', newData);
  };

  const handleDelete = async (userId) => {
    Alert.alert(
      "Delete",
      "Are you sure you want to delete this user?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          onPress: async () => {
            const token = await AsyncStorage.getItem('token');

            axios.delete(`${api}/api/users/${userId}`, {
              headers: {
                "Content-Type": 'application/json',
                Authorization: `Bearer ${token}`
              }
            }).then(response => {
              setRows((prevRows) => prevRows.filter((row) => row.id !== userId));
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
    console.log(newData);
  
    const token = await AsyncStorage.getItem('token');
    const response = await axios.post(`${api}/api/users/register`, {
      name: newData.name,
      surname: newData.surname,
      email: newData.email,
      roleId: newData.roleId,
      departmentId: newData.departmentId,
      companyId: newData.companyId,
    }, 
    {
      headers: {
        "Content-Type": 'application/json',
        Authorization: `Bearer ${token}`
      }
    }).then(async () => {
      // Fetch the updated user list
      const updatedResponse = await axios.get(`${api}/api/users`, {
        params: {
          page: currentPage,
          size: ROWS_PER_PAGE,
          sort: 'id,asc'
        },
        headers: {
          "Content-Type": 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
      setRows(updatedResponse.data.content);
      setTotalPages(updatedResponse.data.totalPages);
      setModalVisible(false);
      setErrorMessage('');
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

  const handleShowData = (item) => {
    setSelectedItem(item);
    setDetailModalVisible(true);
  };
  
  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.box} onPress={() => handleShowData(item)}>
      <Text style={styles.boxText}>Name: {item.name} {item.surname}</Text>
      <Text style={styles.boxText}>Role: {item.roles && item.roles.length > 0 ? item.roles[0].name : 'No Role'}</Text>
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
        <Text style={styles.userText}>USERS</Text>
        {userRole !== 'ROLE_USER' && (
          <TouchableOpacity style={styles.addButton} onPress={handleAddNew}>
            <Ionicons name="add" size={20} color={'white'} />
          </TouchableOpacity>
        )}
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

      {/* Detail Modal */}
      <Modal visible={detailModalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>User Details</Text>
          {selectedItem && (
            <>
              <Text style={styles.boxText}>Name: {selectedItem.name}</Text>
              <Text style={styles.boxText}>Surname: {selectedItem.surname}</Text>
              <Text style={styles.boxText}>Role: {selectedItem.roles && selectedItem.roles.length > 0 ? selectedItem.roles[0].name : 'No Role'}</Text>
              <Text style={styles.boxText}>Email: {selectedItem.email}</Text>
              <Text style={styles.boxText}>Department: {selectedItem.department.departmentType.name}</Text>
              <Text style={styles.boxText}>Company: {selectedItem.department.company.name}</Text>
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
          <TextInput
            style={styles.input}
            value={isEditing ? editData.surname : newData.surname}
            onChangeText={(text) => isEditing ? setEditData({ ...editData, surname: text }) : setNewData({ ...newData, surname: text })}
            placeholder="Surname"
          />
          <TextInput
            style={styles.input}
            value={isEditing ? editData.email : newData.email}
            onChangeText={(text) => isEditing ? setEditData({ ...editData, email: text }) : setNewData({ ...newData, email: text })}
            placeholder="Email"
          />
          {/* CHOOSE ROLE */}
          <View>
            <TouchableOpacity
              style={styles.input}
              onPress={() => (
                setRoleModalVisible(true),
                handleRoleModal()
              )}
            >
              <Text style={styles.roleText}>
                {isEditing 
                  ? (roles.find(role => role.id === editData.roleId)?.name || 'Role') 
                  : (roles.find(role => role.id === newData.roleId)?.name || 'Role')}
              </Text>

            </TouchableOpacity>
          </View>

          <Modal visible={roleModalVisible} animationType="slide">
            <View style={styles.roleModalContainer}>
              <Text style={styles.roleModalTitle}>Role</Text>
              <FlatList
                data={roles}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.roleButton}
                    onPress={() => {
                      if (isEditing) {
                        setEditData({ ...editData, roleId: item.id });
                      } else {
                        setNewData({ ...newData, roleId: item.id });
                      }
                      setRoleModalVisible(false);
                    }}
                  >
                    <Text style={styles.roleButtonText}>{item.name}</Text>
                  </TouchableOpacity>
                )}
                keyExtractor={(item) => item.id.toString()}
              />
              <Button title="Cancel" onPress={() => setRoleModalVisible(false)} />
            </View>
          </Modal>
          {/* CHOOSE COMPANY--------------- */}
          <View>
            <TouchableOpacity
              style={styles.input}
              onPress={() => {
                setCompanyModalVisible(true);
                handleCompanyModal();
              }}
            >
              <Text style={styles.roleText}>
                {isEditing 
                  ? (editData.companyName || 'Select Company') 
                  : (newData.companyName || 'Select Company')}
              </Text>
            </TouchableOpacity>
          </View>

          <Modal visible={companyModalVisible} animationType="slide">
            <View style={styles.roleModalContainer}>
              <Text style={styles.roleModalTitle}>Select Company</Text>
              <FlatList
                data={companies}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.roleButton}
                    onPress={() => handleCompanySelect(item, isEditing)}
                  >
                    <Text style={styles.roleButtonText}>{item.name}</Text>
                  </TouchableOpacity>
                )}
                keyExtractor={(item) => item.id.toString()}
              />
              <Button title="Cancel" onPress={() => setCompanyModalVisible(false)} />
            </View>
          </Modal>

          {/* CHOOSE DEPARTMENT */}
          <View>
            <TouchableOpacity
              style={[
                styles.input,
                !editData.companyId && !newData.companyId ? styles.disabledInput : null
              ]}
              onPress={() => {
                if (editData.companyId || newData.companyId) {
                  setDepartmentModalVisible(true);
                }
              }}
              disabled={!editData.companyId && !newData.companyId}
            >
              <Text style={styles.roleText}>
                {isEditing 
                  ? (departments.find(department => department.departmentType.id === editData.departmentId)?.departmentType.name || 'Department') 
                  : (departments.find(department => department.departmentType.id === newData.departmentId)?.departmentType.name || 'Department')}
              </Text>

            </TouchableOpacity>
          </View>
          <Modal visible={departmentModalVisible} animationType="slide">
            <View style={styles.roleModalContainer}>
              <Text style={styles.roleModalTitle}>Department</Text>
              <FlatList
                data={departments}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.roleButton}
                    onPress={() => {
                      if (isEditing) {
                        setEditData({ ...editData, departmentId: item.departmentType.id });
                      } else {
                        setNewData({ ...newData, departmentId: item.departmentType.id });
                      }
                      setDepartmentModalVisible(false);
                      printNewData();
                    }}
                  >
                    <Text style={styles.roleButtonText}>{item.departmentType.name || 'Unknown Department'}</Text>
                  </TouchableOpacity>
                )}
                keyExtractor={(item) => item.departmentType.id.toString()}
              />
              <Button title="Cancel" onPress={() => setDepartmentModalVisible(false)} />
            </View>
          </Modal>

          <View style={styles.buttonContainer}>
            <Button title="Cancel" onPress={() => (
              setModalVisible(false),
              handleCancel(),
              setErrorMessage('')
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
  roleText: {
    color: '#000',
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
