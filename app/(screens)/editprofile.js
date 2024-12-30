import React, { useEffect, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ActivityIndicator, ScrollView, Modal, TextInput, Button, Image } from 'react-native';
import axios from 'axios';

const EditProfileScreen = () => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [faceModalVisible, setFaceModalVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [croppedFace, setCroppedFace] = useState(null);
  const [newCrop, setNewCrop] = useState(null);
  const params = useLocalSearchParams();
  const { id } = params; // Extract the `id` parameter
  const serverIP = '192.168.0.105'; // Replace with your server IP
  const router = useRouter();

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await axios.get(`http://${serverIP}:8000/get`, {
          params: { user_id: id },
        });
        setProfileData(response.data);
      } catch (error) {
        console.error('Error fetching profile data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [id]);

  const handleChangePassword = async () => {
    try {
      const response = await axios.post(`http://${serverIP}:8000/changePassword/`, {
        user_id: id,
        current_password: currentPassword,
        new_password: newPassword,
      });
      if (response.data.success) {
        alert('Password changed successfully');
        setModalVisible(false);
      } else {
        alert(response.data.error || 'Failed to change password');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      alert('Error changing password');
    }
  };

  const handleOpenCamera = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert('Permission Denied', 'You need to allow access to your camera.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled) {
      handleDetectFace(result.assets[0]);
    } else {
      Alert.alert('Error', 'You did not capture any image.');
    }
  };

  const handleDetectFace = async (image) => {
    try {
      const data = new FormData();
      data.append('image', {
        uri: image.uri,
        type: 'image/jpeg',
        name: image.uri.split('/').pop(),
      });

      const response = await axios.post(`http://${serverIP}:8000/detect_face/`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.face_detected) {
        const annotated_image = response.data.annotated_image;
        const newcrop = response.data.cropped_image;
        setNewCrop(`http://${serverIP}:8000/${newcrop}`);
        setCroppedFace(`http://${serverIP}:8000/${annotated_image}?timestamp=${new Date().getTime()}`);
      } else {
        Alert.alert('No Face Detected', 'Please try another image.');
        setCroppedFace(null);
      }
    } catch (error) {
      console.error('Error detecting face:', error);
      Alert.alert('Error', 'Failed to detect face.');
    }
  };

  const handleUploadFaceData = async () => {
    if (!newCrop) {
      Alert.alert('No Image', 'Please capture a new face image first.');
      return;
    }

    try {
      // Resize the image to 360x360
      const resizedImage = await ImageManipulator.manipulateAsync(
        newCrop,
        [{ resize: { width: 360, height: 360 } }],
        { compress: 1, format: ImageManipulator.SaveFormat.JPEG }
      );

      const data = new FormData();
      data.append('faceImage', {
        uri: resizedImage.uri,
        type: 'image/jpeg',
        name: resizedImage.uri.split('/').pop(),
      });

      const response = await axios.post(`http://${serverIP}:8000/update_face_image/`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        params: { user_id: id },
      });

      if (response.data.success) {
        alert('Face image updated successfully');
        setFaceModalVisible(false);
        setProfileData({ ...profileData, faceImage: response.data.faceImage });
      } else {
        alert(response.data.error || 'Failed to update face image');
      }
    } catch (error) {
      console.error('Error updating face image:', error);
      Alert.alert('Error', 'Failed to update face image.');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </SafeAreaView>
    );
  }

  if (!profileData) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Failed to load profile data.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.header}>
          <Text style={styles.username}>{profileData.name}</Text>
        </View>

        <View style={styles.content}>
          <TouchableOpacity style={styles.item}>
            <Text style={styles.label}>Full Name</Text>
            <Text style={styles.value}>{profileData.name}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.item}>
            <Text style={styles.label}>Role</Text>
            <Text style={styles.value}>{profileData.role.toUpperCase()}</Text>
          </TouchableOpacity>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Login & Security</Text>
          </View>

          <TouchableOpacity style={styles.item}>
            <Text style={styles.label}>Email</Text>
            <Text style={styles.value}>{profileData.email}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.item} onPress={() => setModalVisible(true)}>
            <Text style={styles.label}>Change Password</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.item} onPress={() => setFaceModalVisible(true)}>
            <Text style={styles.label}>Update Face Data</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Change Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Current Password"
              secureTextEntry
              value={currentPassword}
              onChangeText={setCurrentPassword}
            />
            <TextInput
              style={styles.input}
              placeholder="New Password"
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
            />
            <View style={styles.buttonRow}>
              <Button title="Cancel" onPress={() => setModalVisible(false)} />
              <Button title="Change" onPress={handleChangePassword} />
            </View>
          </View>
        </View>
      </Modal>


      <Modal
        animationType="slide"
        transparent={true}
        visible={faceModalVisible}
        onRequestClose={() => {
          setFaceModalVisible(!faceModalVisible);
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Update Face Data</Text>
            {croppedFace ? (
              <Image
                source={{ uri: croppedFace }}
                style={styles.faceImage}
              />
            ) : (
              profileData.faceImage && (
                <Image
                  source={{ uri: `http://${serverIP}:8000/${profileData.faceImage}` }}
                  style={styles.faceImage}
                />
              )
            )}
            <TouchableOpacity style={styles.modalButton} onPress={handleOpenCamera}>
              <Text style={styles.modalButtonText}>Capture New Face Data</Text>
            </TouchableOpacity>
            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.modalButton} onPress={() => setFaceModalVisible(false)}>
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButton} onPress={handleUploadFaceData}>
                <Text style={styles.modalButtonText}>Upload</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollViewContent: {
    padding: 20,
  },
  header: {
    marginBottom: 20,
    alignItems: 'center',
  },
  username: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#343a40',
  },
  content: {
    flex: 1,
  },
  item: {
    paddingVertical: 15,
    paddingHorizontal: 10,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  label: {
    fontSize: 14,
    color: '#6c757d',
  },
  value: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#495057',
  },
  sectionHeader: {
    marginTop: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#343a40',
  },
  errorText: {
    fontSize: 18,
    color: 'red',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginHorizontal: 5,
    flex: 1,
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  faceImage: {
    width: 200,
    height: 200,
    borderRadius: 100,
    marginBottom: 20,
  },
});

export default EditProfileScreen;