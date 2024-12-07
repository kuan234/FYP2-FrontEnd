import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';

const UserList = () => {
  const [users, setUsers] = useState([]); // Store the list of users
  const [modalVisible, setModalVisible] = useState(false); // State for modal visibility
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: '',
    department: '',
  });
  const [faceImage, setFaceImage] = useState(null); // Store the selected image

  // Fetch users from the server (assuming a GET API is set up to retrieve users)
  useEffect(() => {
    fetch('http://10.193.1.102:8000/get/')
      .then((response) => response.json())
      .then((data) => setUsers(data))
      .catch((error) => {
        console.error('Error fetching users:', error);
      });
  }, []);

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleAddEmployee = async () => {
    const data = new FormData();
    data.append('name', formData.name);
    data.append('email', formData.email);
    data.append('password', formData.password);
    data.append('role', formData.role);
    data.append('department', formData.department);

    if (faceImage) {
      data.append('faceImage', {
        uri: faceImage.uri,
        type: faceImage.type,
        name: faceImage.uri.split('/').pop(),
      });
    }
     // Log form data before sending
    console.log('Form Data:', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        department: formData.department,
        faceImage: faceImage ? faceImage.uri : null,
    });

    try {
      const response = await axios.post('http://10.193.1.102:8000/add/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const result = await response.json();

      if (response.ok) {
        Alert.alert('Success', 'Employee added successfully!');
        setModalVisible(false); // Close the modal
        setFormData({ name: '', email: '', password: '', role: '', department: '' });
        setFaceImage(null); // Reset the image
        setUsers([...users, result.data]); // Add new user to the list
      } else {
        Alert.alert('Error', JSON.stringify(result.errors));
      }
    } catch (error) {
      console.error('Error adding employee:', error);
    }
  };

  const handleOpenImagePicker = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert('Permission Denied', 'You need to allow access to your photos.');
      return;
    } 

    const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],      
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
    });

    if (!result.canceled) {
      setFaceImage(result.assets[0]); // Save the selected image
    }else {
        alert('You did not select any image.');
      }
  };

  const renderItem = ({ item }) => (
    <View style={styles.userRow}>
      <Text style={styles.userName}>{item.name}</Text>
      <Text style={styles.userName}>{item.role}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
        <Text style={styles.addButtonText}>Add Employee</Text>
      </TouchableOpacity>

      {/* User List */}
      <FlatList
        data={users}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={<Text>No users available</Text>}
      />

      {/* Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Add New Employee</Text>

            <TextInput
              style={styles.input}
              placeholder="Name"
              value={formData.name}
              onChangeText={(text) => handleInputChange('name', text)}
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={formData.email}
              onChangeText={(text) => handleInputChange('email', text)}
              keyboardType="email-address"
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={formData.password}
              onChangeText={(text) => handleInputChange('password', text)}
              secureTextEntry
            />
            <TextInput
              style={styles.input}
              placeholder="Role"
              value={formData.role}
              onChangeText={(text) => handleInputChange('role', text)}
            />
            <TextInput
              style={styles.input}
              placeholder="Department"
              value={formData.department}
              onChangeText={(text) => handleInputChange('department', text)}
            />

            {/* Image Picker */}
            <TouchableOpacity style={styles.imageButton} onPress={handleOpenImagePicker}>
              <Text style={styles.imageButtonText}>
                {faceImage ? 'Change Image' : 'Upload Face Image'}
              </Text>
            </TouchableOpacity>
            {faceImage && <Image source={{ uri: faceImage.uri }} style={styles.previewImage} />}

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.actionButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.actionText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.saveButton]}
                onPress={handleAddEmployee}
              >
                <Text style={styles.actionText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  addButton: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  userRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    elevation: 1,
  },
  userName: {
    fontSize: 16,
    color: '#333',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
    backgroundColor: '#f9f9f9',
  },
  imageButton: {
    marginBottom: 20,
    backgroundColor: '#e7e7e7',
    padding: 10,
    borderRadius: 5,
  },
  imageButtonText: {
    fontSize: 16,
    color: '#555',
  },
  previewImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginBottom: 15,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 5,
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#ccc',
  },
  saveButton: {
    backgroundColor: '#007bff',
  },
  actionText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default UserList;
