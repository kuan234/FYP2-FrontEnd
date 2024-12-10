import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useRouter, useLocalSearchParams } from 'expo-router';
import axios from 'axios';

const AttendanceLog = () => {
    const serverIP = '192.168.0.105';

      // Get today's date in YYYY-MM-DD format
    const getTodayDate = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are zero-based
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const [selectedDate, setSelectedDate] = useState(getTodayDate());
    const [logData, setLogData] = useState([]);
    const [loading, setLoading] = useState(false);
    const params = useLocalSearchParams();
    const { id } = params; // Extract the `id` parameter
    
  // Fetch attendance logs for the selected date
  const fetchLogs = async (date) => {
    setLoading(true);
    try {
        const response = await axios.get(`http://${serverIP}:8000/log`, {
            params: {
              date: date,     // Pass the date parameter
              user_id: id // Pass the user_id parameter
            }
          });
      setLogData(response.data.logs || []);
    } catch (error) {
        // console.error('Error fetching logs:', error);
      setLogData([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch logs when the selected date changes
  useEffect(() => {
    if (selectedDate) fetchLogs(selectedDate);
  }, [selectedDate]);

  // Render log details for each entry
  const renderLog = ({ item }) => (
    <View style={styles.logRow}>
      <Text style={styles.logText}>Check-in: {item.check_in_time}</Text>
      <Text style={styles.logText}>
        Check-out: {item.check_out_time}
      </Text>
      <Text style={styles.logText}>
        Total Hours: {item.total_hours}
      </Text>
    </View>
  ); 
  

  return (
    <View style={styles.container}>
      {/* Calendar to select a date */}
      <Calendar
        onDayPress={(day) => setSelectedDate(day.dateString)}
        markedDates={{
          [selectedDate]: { selected: true, marked: true, selectedColor: 'blue' },
        }}
        style={styles.calendar}
      />
      <Text style={styles.dateText}>Selected Date: {selectedDate || 'None'}</Text>

      {/* Show loading indicator while fetching data */}
      {loading ? (
        <ActivityIndicator size="large" color="blue" style={styles.loader} />
      ) : (
        <FlatList
          data={logData}
          renderItem={renderLog}
          keyExtractor={(item, index) => index.toString()}
          ListEmptyComponent={<Text style={styles.noData}>No Data Available</Text>}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: 'white' },
  calendar: { marginBottom: 20 },
  dateText: { fontSize: 16, marginBottom: 10 },
  logRow: {
    flexDirection: 'column',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  logText: { fontSize: 16, marginBottom: 5 },
  noData: { textAlign: 'center', marginTop: 20, color: 'gray' },
  loader: { marginTop: 20 },
});

export default AttendanceLog;
