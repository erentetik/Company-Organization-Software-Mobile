import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal, TextInput, Button } from 'react-native';
import tableData from '../data/tableData';

export default function Table() {
  const [rows, setRows] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    setRows(tableData);
  }, []);

  const handleRowPress = (row) => {
    setSelectedRow(row);
    setEditData(row);
    setModalVisible(true);
  };

  const handleSave = () => {
    setRows((prevRows) => prevRows.map((row) => (row.id === editData.id ? editData : row)));
    setModalVisible(false);
  };

  const handleDelete = () => {
    setRows((prevRows) => prevRows.filter((row) => row.id !== selectedRow.id));
    setModalVisible(false);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.row} onPress={() => handleRowPress(item)}>
      <Text style={styles.cell}>{item.name}</Text>
      <Text style={styles.cell}>{item.role}</Text>
      <Text style={styles.cell}>{item.email}</Text>
      <Text style={styles.cell}>{item.department}</Text>
      <Text style={styles.cell}>{item.company}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
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
          </View>
        )}
      />

      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Edit Data</Text>
          <TextInput
            style={styles.input}
            value={editData.name}
            onChangeText={(text) => setEditData({ ...editData, name: text })}
            placeholder="Name"
          />
          <TextInput
            style={styles.input}
            value={editData.role}
            onChangeText={(text) => setEditData({ ...editData, role: text })}
            placeholder="Role"
          />
          <TextInput
            style={styles.input}
            value={editData.email}
            onChangeText={(text) => setEditData({ ...editData, email: text })}
            placeholder="Email"
          />
          <TextInput
            style={styles.input}
            value={editData.department}
            onChangeText={(text) => setEditData({ ...editData, department: text })}
            placeholder="Department"
          />
          <TextInput
            style={styles.input}
            value={editData.company}
            onChangeText={(text) => setEditData({ ...editData, company: text })}
            placeholder="Company"
          />
          <View style={styles.buttonContainer}>
            <Button title="Cancel" onPress={() => setModalVisible(false)} />
            <Button title="Save" onPress={handleSave} />
            <Button title="Delete" onPress={handleDelete} color="red" />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    backgroundColor: '#ccc',
    padding: 10,
  },
  headerCell: {
    flex: 1,
    fontWeight: 'bold',
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
  },
  modalContainer: {
    flex: 1,
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