import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { Picker } from '@react-native-picker/picker';

const SortPicker = ({ sortField, setSortField, sortOrder, setSortOrder, sortFields }) => {
  const [showSortFieldModal, setShowSortFieldModal] = useState(false);
  const [showSortOrderModal, setShowSortOrderModal] = useState(false);

  return (
    <View style={styles.sortContainer}>
      <Text style={styles.sortText}>Sort By:</Text>
      
      <TouchableOpacity 
        style={styles.pickerContainer} 
        onPress={() => setShowSortFieldModal(true)}
      >
        <Text style={styles.pickerText}>
          {sortFields.find(field => field.value === sortField)?.label || 'Select Field'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.pickerContainer} 
        onPress={() => setShowSortOrderModal(true)}
      >
        <Text style={styles.pickerText}>
          {sortOrder === 'asc' ? 'Ascending' : 'Decreasing'}
        </Text>
      </TouchableOpacity>

      {/* Sort Field Modal */}
      <Modal
        transparent={true}
        visible={showSortFieldModal}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Picker
              selectedValue={sortField}
              onValueChange={(itemValue) => {
                setSortField(itemValue);
                setShowSortFieldModal(false);
              }}
            >
              {sortFields.map((field) => (
                <Picker.Item key={field.value} label={field.label} value={field.value} />
              ))}
            </Picker>
            <TouchableOpacity onPress={() => setShowSortFieldModal(false)}>
              <Text style={styles.modalClose}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Sort Order Modal */}
      <Modal
        transparent={true}
        visible={showSortOrderModal}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Picker
              selectedValue={sortOrder}
              onValueChange={(itemValue) => {
                setSortOrder(itemValue);
                setShowSortOrderModal(false);
              }}
            >
              <Picker.Item label="Ascending" value="asc" />
              <Picker.Item label="Decreasing" value="desc" />
            </Picker>
            <TouchableOpacity onPress={() => setShowSortOrderModal(false)}>
              <Text style={styles.modalClose}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  sortContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingBottom: 10,
  },
  sortText: {
    color: 'white',
    fontSize: 16,
  },
  pickerContainer: {
    flex: 1,
    marginLeft: 10,
  },
  pickerText: {
    color: 'white',
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'white',
    padding: 8,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  modalClose: {
    marginTop: 10,
    textAlign: 'center',
    color: 'blue',
  },
});

export default SortPicker;
