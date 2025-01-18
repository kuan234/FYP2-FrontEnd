import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons'; // Import icons
import { Menu, MenuOptions, MenuOption, MenuTrigger, MenuProvider } from 'react-native-popup-menu';
import axios from 'axios';

export default function DashboardScreen() {
  const params = useLocalSearchParams();
  const { name, id } = params; // Get `name` and `id` from route params
  console.log('Dashboard Params:', params); // Debug: Log received params

  const [role, setRole] = useState('');
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [isCheckedOut, setIsCheckedOut] = useState(false);
  const router = useRouter();
  const serverIP = '10.193.27.46';

  const navigateToCamera = () => {
    if (!isCheckedIn) {
      setIsCheckedIn(true);
    } else if (isCheckedIn && !isCheckedOut) {
      setIsCheckedOut(true);
    }
    router.push({
      pathname: '/(screens)/camera',
      params: { id, name },
    });
  };

  const navigateToUserList = () => {
    router.push({
      pathname: '/(screens)/userlist',
      params: { id, name },
    });
  };

  const navigateToAttendance = () => {
    const pathname = (role === 'admin' || role==='superadmin') ? '/(screens)/attendance_admin' : '/(screens)/attendance';
    router.push({
      pathname,
      params: { id, name },
    });
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
    Alert.alert('Logout', 'You have been logged out successfully.');
    router.push('/');
  };

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const response = await axios.get(`http://${serverIP}:8000/get_user_role/${id}/`);
        if (response.data.role) {
          setRole(response.data.role);
          console.log('User Role:', role); // Debug: Log received params
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
          <Text style={styles.username}>{name ? name : 'Welcome!'}</Text>
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

        {/* Main Content */}
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.cardContainer}>
            {/* Check In/Out Card */}
            <TouchableOpacity 
              style={[styles.card, isCheckedIn && !isCheckedOut ? styles.checkOutCard : styles.checkInCard]} 
              onPress={navigateToCamera}>
              <MaterialCommunityIcons name={isCheckedIn && !isCheckedOut ? "exit-to-app" : "clock"} size={50} color="white" />
              <Text style={styles.cardTitle}>{isCheckedIn && !isCheckedOut ? "Check Out" : "Check In"}</Text>
              {/* <Text style={styles.cardDescription}>{isCheckedIn && !isCheckedOut ? "End your work day." : "Start your work day."}</Text> */}
            </TouchableOpacity>

            {/* Attendance History Card */}
            <TouchableOpacity 
              style={[styles.card, styles.attendanceCard]} 
              onPress={navigateToAttendance}>
              <MaterialCommunityIcons name="file-document" size={50} color="white" />
              <Text style={styles.cardTitle}>Attendance History</Text>
              {/* <Text style={styles.cardDescription}>View your attendance log.</Text> */}
            </TouchableOpacity>

            {/* Conditional Cards for Admin */}
            {role !== 'employee' && (
              <>
                <TouchableOpacity 
                  style={[styles.card, styles.userListCard]} 
                  onPress={navigateToUserList}>
                  <MaterialCommunityIcons name="account-multiple" size={50} color="white" />
                  <Text style={styles.cardTitle}>User List</Text>
                  {/* <Text style={styles.cardDescription}>Manage all users.</Text> */}
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.card, styles.updateTimesCard]} 
                  onPress={navigateToUpdateTimes}>
                  <MaterialCommunityIcons name="clock-edit" size={50} color="white" />
                  <Text style={styles.cardTitle}>Update Times</Text>
                  {/* <Text style={styles.cardDescription}>Edit check-in/out times.</Text> */}
                </TouchableOpacity>
              </>
            )}
          </View>
        </ScrollView>
      </View>
    </MenuProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#007AFF',
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
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
  scrollContainer: {
    padding: 20,
    alignItems: 'center',
  },
  cardContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  card: {
    width: '45%',
    aspectRatio: 1,
    borderRadius: 10,
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  checkInCard: {
    backgroundColor: '#4CAF50',
  },
  checkOutCard: {
    backgroundColor: '#f44336',
  },
  attendanceCard: {
    backgroundColor: '#2196F3',
  },
  userListCard: {
    backgroundColor: '#FF9800',
  },
  updateTimesCard: {
    backgroundColor: '#9C27B0',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 10,
  },
  cardDescription: {
    fontSize: 14,
    color: 'white',
    textAlign: 'center',
    marginTop: 5,
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
