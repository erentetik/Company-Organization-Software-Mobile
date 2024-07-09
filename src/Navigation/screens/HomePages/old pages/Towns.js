import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal, TextInput, Button, Alert } from 'react-native';
import Navbar from '../../../components/navbar';
import tableData from '../../../data/TownData';
import { Ionicons } from '@expo/vector-icons'; // Import Ionicons for the menu icon

const ROWS_PER_PAGE = 5;

export default function Towns() {
  const [rows, setRows] = useState(tableData);
  const [selectedRow, setSelectedRow] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [newData, setNewData] = useState({
    id: '',
    name: '',
    region: '',
    city: '',
  });
  const [currentPage, setCurrentPage] = useState(0);

  const handleRowPress = (row) => {
    setSelectedRow(row);
    setEditData(row);
    setIsEditing(true);
    setModalVisible(true);
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
      id: (rows.length + 1).toString(),
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
    <View style={styles.row}>
      <Text style={styles.cell}>{item.name}</Text>
      <Text style={styles.cell}>{item.region}</Text>
      <Text style={styles.cell}>{item.city}</Text>
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
          data={rows.slice(currentPage * ROWS_PER_PAGE, (currentPage + 1) * ROWS_PER_PAGE)}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={() => (
            <View style={styles.header}>
              <Text style={styles.headerCell}>Name</Text>
              <Text style={styles.headerCell}>Region</Text>
              <Text style={styles.headerCell}>City</Text>
              <Text style={styles.headerCell}>Actions</Text>
             
            </View>
          )}
        />
        <View style={styles.pagination} >
          <TouchableOpacity onPress={handlePrevPage} disabled={currentPage === 0}>
            <Ionicons name="arrow-back-outline" size={40} color={currentPage === 0 ? 'gray' : 'white'} />
          </TouchableOpacity>
          <Text style={styles.pageNumber}>{currentPage + 1}</Text>
          <TouchableOpacity onPress={handleNextPage} disabled={(currentPage + 1) * ROWS_PER_PAGE >= rows.length}>
            <Ionicons name="arrow-forward-outline" size={40} color={(currentPage + 1) * ROWS_PER_PAGE >= rows.length ? 'gray' : 'white'} />
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
          <TextInput
            style={styles.input}
            value={isEditing ? editData.region : newData.region}
            onChangeText={(text) => isEditing ? setEditData({ ...editData, region: text }) : setNewData({ ...newData, region: text })}
            placeholder="Region"
          />
          <TextInput
            style={styles.input}
            value={isEditing ? editData.city : newData.city}
            onChangeText={(text) => isEditing ? setEditData({ ...editData, city: text }) : setNewData({ ...newData, city: text })}
            placeholder="City"
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
    left: 360,
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