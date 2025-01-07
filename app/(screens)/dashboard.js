import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons'; // Import icons
import { Menu, MenuOptions, MenuOption, MenuTrigger, MenuProvider } from 'react-native-popup-menu';
import axios from 'axios';

export default function DashboardScreen() {
  // Extract parameters passed via route
  const params = useLocalSearchParams();
  const { name, id } = params; // Get `name` and `id` from route params
  console.log('Dashboard Params:', params); // Debug: Log received params
  
  const [role, setRole] = useState('');
  const [isCheckedIn, setIsCheckedIn] = useState(false); // State to track check-in status
  const [isCheckedOut, setIsCheckedOut] = useState(false); // State to track check-out status
  const router = useRouter(); // Initialize the router
  const serverIP = '192.168.0.105'; // Replace with your server IP

  const navigateToCamera = () => {
    if (!isCheckedIn) {
      setIsCheckedIn(true); // Set check-in status
    } else if (isCheckedIn && !isCheckedOut) {
      setIsCheckedOut(true); // Set check-out status
    }
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

  const navigateToAttendance = () => {
    router.push({
      pathname: '/(screens)/attendance',
      params: { id, name },
    });//navigate to user screen
  };

  const navigateToEditProfile = () => {
    router.push({
      pathname: '/(screens)/editprofile',
      params: { id, name },
    });
  };

  const navigateToUpdateTimes = () => {
    router.push({
      pathname: '/(screens)/updateTimes',
      params: { id, name },
    });
  };

  const handleLogout = () => {
    // Perform any necessary cleanup or state reset here
    Alert.alert('Logout', 'You have been logged out successfully.');
    router.push('/'); // Navigate to login screen
  };

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const response = await axios.get(`http://${serverIP}:8000/get_user_role/${id}/`);
        if (response.data.role) {
          setRole(response.data.role);
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
      }
    };

    const fetchCheckInStatus = async () => {
      try {
        const response = await axios.get(`http://${serverIP}:8000/get_check_in_status/${id}/`);
        if (response.data.checked_in !== undefined) {
          setIsCheckedIn(response.data.checked_in);
          setIsCheckedOut(response.data.checked_out);
        }
      } catch (error) {
        console.error('Error fetching check-in status:', error);
      }
    };

    fetchUserRole();
    fetchCheckInStatus();
  }, [id]);

  return (
    <MenuProvider>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.username}>{name ? name : 'Guest'}</Text>
          <Menu>
            <MenuTrigger>
              <MaterialCommunityIcons name="menu" size={30} color="black" style={styles.menuIcon} />
            </MenuTrigger>
            <MenuOptions customStyles={optionsStyles}>
              <MenuOption onSelect={navigateToEditProfile} text='Edit Profile' />
              <MenuOption onSelect={handleLogout} text='Log Out' />
            </MenuOptions>
          </Menu>
        </View>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          {/* Check In/Out Button */}
          <TouchableOpacity 
            style={[styles.button, isCheckedIn && !isCheckedOut ? styles.checkOutButton : styles.checkInButton]} 
            onPress={navigateToCamera} // Navigate to camera screen on press
          >
            <MaterialCommunityIcons name={isCheckedIn && !isCheckedOut ? "exit-to-app" : "clock"} size={24} color="white" />
            <Text style={styles.buttonText}>{isCheckedIn && !isCheckedOut ? "Check Out" : "Check In"}</Text>
            <Text style={styles.buttonDescription}>{isCheckedIn && !isCheckedOut ? "Check Out for Attendance" : "Check In for Attendance"}</Text>
          </TouchableOpacity>

          {/* Attendance History Button */}
          <TouchableOpacity 
            style={[styles.button, styles.historyButton]} 
            onPress={navigateToAttendance} // Implement attendance history action later
          >
            <MaterialCommunityIcons name="file-document" size={24} color="white" />
            <Text style={styles.buttonText}>Attendance History</Text>
            <Text style={styles.buttonDescription}>Click to view attendance log</Text>
          </TouchableOpacity>

          {role !== 'employee' && (
            <>
              <TouchableOpacity 
                style={[styles.button, styles.userListButton]} 
                onPress={navigateToUserList} // Implement user list action later
              >
                <MaterialCommunityIcons name="account-multiple" size={24} color="white" />
                <Text style={styles.buttonText}>User List</Text>
                <Text style={styles.buttonDescription}>Click to view all users</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.button, styles.changeTimesButton]} 
                onPress={navigateToUpdateTimes}
              >
                <MaterialCommunityIcons name="clock-edit" size={24} color="white" />
                <Text style={styles.buttonText}>Change Times</Text>
                <Text style={styles.buttonDescription}>Change check-in and check-out times</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </MenuProvider>
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
  menuIcon: {
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
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
  userListButton: {
    backgroundColor: '#FF9800', // Orange for user list
  },
  changeTimesButton: {
    backgroundColor: '#9C27B0', // Purple for change times
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

const optionsStyles = {
  optionsContainer: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  optionWrapper: {
    padding: 10,
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
};