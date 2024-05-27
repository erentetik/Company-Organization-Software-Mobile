import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal, TextInput, Button } from 'react-native';
import Navbar from '../../../components/navbar';
import tableData from '../../../data/tableData';
import { Ionicons } from '@expo/vector-icons'; // Import Ionicons for the menu icon


export default function Users() {
  const [rows, setRows] = useState(tableData);
  const [selectedRow, setSelectedRow] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [newData, setNewData] = useState({
    id: '',
    name: '',
    role: '',
    email: '',
    department: '',
    company: ''
  });

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
    setRows((prevRows) => prevRows.filter((row) => row.id !== rowId));
  };

  const handleAddNew = () => {
    setNewData({
      id: (rows.length + 1).toString(),
      name: '',
      role: '',
      email: '',
      department: '',
      company: ''
    });
    setIsEditing(false);
    setModalVisible(true);
  };

  const handleAdd = () => {
    setRows([...rows, newData]);
    setModalVisible(false);
  };

  const renderItem = ({ item }) => (
    <View style={styles.row}>
      <Text style={styles.cell}>{item.name}</Text>
      <Text style={styles.cell}>{item.role}</Text>
      <Text style={styles.cell}>{item.email}</Text>
      <Text style={styles.cell}>{item.department}</Text>
      <Text style={styles.cell}>{item.company}</Text>
      <TouchableOpacity style={styles.editButton} onPress={() => handleRowPress(item)}>
          <Ionicons name="pencil-outline" size={20} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item.id)}>
         <Ionicons name="trash-outline" size={20} />
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
          keyExtractor={(item) => item.id}
          ListHeaderComponent={() => (
            <View style={styles.header}>
              <Text style={styles.headerCell}>Name</Text>
              <Text style={styles.headerCell}>Role</Text>
              <Text style={styles.headerCell}>Email</Text>
              <Text style={styles.headerCell}>Department</Text>
              <Text style={styles.headerCell}>Company</Text>
              <Text style={styles.headerCell}>Actions</Text>
            </View>
          )}
        />
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
            value={isEditing ? editData.role : newData.role}
            onChangeText={(text) => isEditing ? setEditData({ ...editData, role: text }) : setNewData({ ...newData, role: text })}
            placeholder="Role"
          />
          <TextInput
            style={styles.input}
            value={isEditing ? editData.email : newData.email}
            onChangeText={(text) => isEditing ? setEditData({ ...editData, email: text }) : setNewData({ ...newData, email: text })}
            placeholder="Email"
          />
          <TextInput
            style={styles.input}
            value={isEditing ? editData.department : newData.department}
            onChangeText={(text) => isEditing ? setEditData({ ...editData, department: text }) : setNewData({ ...newData, department: text })}
            placeholder="Department"
          />
          <TextInput
            style={styles.input}
            value={isEditing ? editData.company : newData.company}
            onChangeText={(text) => isEditing ? setEditData({ ...editData, company: text }) : setNewData({ ...newData, company: text })}
            placeholder="Company"
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
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});