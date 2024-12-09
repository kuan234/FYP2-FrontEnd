import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Button } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons'; // Import icons

export default function DashboardScreen() {
  // Extract parameters passed via route
  const params = useLocalSearchParams();
  const { name, id } = params; // Get `name` and `id` from route params
  console.log('Dashboard Params:', params); // Debug: Log received params

  const router = useRouter(); // Initialize the router
  const navigateToCamera = () => {
    router.push({
      pathname: '/(screens)/camera',
      params: { id, name },
    });//navigate to camera screen

  };
  const navigateToUserList = () => {
    router.push({
      pathname: '/(screens)/userlist',
      params: { id, name },
    });//navigate to user screen
  };
  const navigateToattendance = () => {
    router.push({
      pathname: '/(screens)/attendance',
      params: { id, name },
    });//navigate to user screen
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.username}>{name ? name : 'Guest'}</Text>
        <Image
          source={{ uri: 'https://via.placeholder.com/50' }} // Replace with profile image URL
          style={styles.profileImage}
        />
      </View>

      {/* Buttons */}
      <View style={styles.buttonContainer}>
          {/* Check In Button */}
          <TouchableOpacity 
            style={[styles.button, styles.checkInButton]} 
            onPress={navigateToCamera} // Navigate to camera screen on press
          >
            <MaterialCommunityIcons name="clock" size={24} color="white" />
            <Text style={styles.buttonText}>Check In</Text>
            <Text style={styles.buttonDescription}>Check in for Attendance</Text>
          </TouchableOpacity>

          {/* Check Out Button */}
          <TouchableOpacity 
            style={[styles.button, styles.checkOutButton]} 
            onPress={() => {}} // Implement check-out action later
          >
            <MaterialCommunityIcons name="exit-to-app" size={24} color="white" />
            <Text style={styles.buttonText}>Check Out</Text>
            <Text style={styles.buttonDescription}>Check Out for Attendance</Text>
          </TouchableOpacity>

          {/* Attendance History Button */}
          <TouchableOpacity 
            style={[styles.button, styles.historyButton]} 
            onPress={navigateToattendance} // Implement attendance history action later
          >
            <MaterialCommunityIcons name="file-document" size={24} color="white" />
            <Text style={styles.buttonText}>Attendance History</Text>
            <Text style={styles.buttonDescription}>Click to view attendance log</Text>
          </TouchableOpacity>

          {/* User List Button */}
          <TouchableOpacity 
            style={[styles.button, styles.historyButton]} 
            onPress={navigateToUserList} // Implement user list action later
          >
            <MaterialCommunityIcons name="account-multiple" size={24} color="white" />
            <Text style={styles.buttonText}>User List </Text>
            <Text style={styles.buttonDescription}>Click to view all user</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f4f4',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  checkInCard: {
    backgroundColor: '#d4f8d4',
  },
  checkOutCard: {
    backgroundColor: '#f8d4d4',
  },
  historyCard: {
    backgroundColor: '#d4e8f8',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 5,
  },
  cardDescription: {
    fontSize: 14,
    color: '#555',
  },
  buttonContainer: {
    flexDirection: 'column', // Stack buttons vertically
    marginVertical: 10,      // Space between buttons
  },
  button: {
    paddingVertical: 20,
    paddingHorizontal: 25,
    borderRadius: 10,
    marginBottom: 15,        // Space between buttons
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',    // Align icon and text in a row
  },
  checkInButton: {
    backgroundColor: '#4CAF50', // Green for check-in
  },
  checkOutButton: {
    backgroundColor: '#f44336', // Red for check-out
  },
  historyButton: {
    backgroundColor: '#2196F3', // Blue for history
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10, // Space between icon and text
  },
  buttonDescription: {
    color: 'white',
    fontSize: 12,
    marginTop: 5, // Space between button text and description
    marginLeft: 10,
  },
});